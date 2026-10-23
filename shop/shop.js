// shop/shop.js – wspólna logika sklepu: koszyk, ulubione, ostatnio oglądane, rekomendacje, nagłówek

window.AGW = (() => {
  const PRODUCTS = window.AGW_PRODUCTS;
  const CATEGORIES = window.AGW_CATEGORIES;

  const FREE_SHIPPING_FROM = 500;
  const RECENT_LIMIT = 12;
  const KEYS = { cart: 'agw_cart', recent: 'agw_recent', fav: 'agw_fav', orders: 'agw_orders' };

  // ---------- Pomocnicze ----------

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) { /* tryb prywatny / brak miejsca – sklep działa dalej bez zapisu */ }
    }
  };

  const money = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });
  const fmt = (v) => money.format(v);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const category = (id) => CATEGORIES.find((c) => c.id === id);
  const productUrl = (p) => `produkt.html?id=${encodeURIComponent(p.id)}`;
  const categoryUrl = (id) => `sklep.html?kat=${encodeURIComponent(id)}`;
  const discount = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

  // Wyszukiwanie bez polskich znaków i wielkości liter: „lozysko” znajdzie „Łożysko”
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');

  const search = (q) => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return PRODUCTS
      .map((p) => {
        const hay = norm(`${p.name} ${p.sku} ${category(p.category).name} ${p.short}`);
        if (!words.every((w) => hay.includes(w))) return null;
        // trafienie w numer katalogowy lub nazwę liczy się mocniej niż w opisie
        const score = words.reduce((s, w) => s + (norm(p.sku).includes(w) ? 5 : 0) + (norm(p.name).includes(w) ? 2 : 0), 0);
        return { p, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || b.p.popularity - a.p.popularity)
      .map((r) => r.p);
  };

  const emit = (name) => document.dispatchEvent(new CustomEvent(name));

  // ---------- Koszyk ----------

  const cart = {
    items() {
      return store.get(KEYS.cart, []).filter((i) => byId(i.id));
    },
    save(items) {
      store.set(KEYS.cart, items);
      emit('agw:cart');
    },
    add(id, qty = 1) {
      const p = byId(id);
      if (!p || p.stock <= 0) return false;
      const items = cart.items();
      const row = items.find((i) => i.id === id);
      if (row) row.qty = Math.min(p.stock, row.qty + qty);
      else items.push({ id, qty: Math.min(p.stock, qty) });
      cart.save(items);
      return true;
    },
    setQty(id, qty) {
      const p = byId(id);
      const items = cart.items()
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(p.stock, qty)) } : i));
      cart.save(items);
    },
    remove(id) {
      cart.save(cart.items().filter((i) => i.id !== id));
    },
    clear() {
      cart.save([]);
    },
    count() {
      return cart.items().reduce((s, i) => s + i.qty, 0);
    },
    total() {
      return cart.items().reduce((s, i) => s + byId(i.id).price * i.qty, 0);
    }
  };

  // ---------- Ulubione ----------

  const fav = {
    ids() {
      return store.get(KEYS.fav, []).filter(byId);
    },
    has(id) {
      return fav.ids().includes(id);
    },
    toggle(id) {
      const ids = fav.ids();
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
      store.set(KEYS.fav, next);
      emit('agw:fav');
      return next.includes(id);
    }
  };

  // ---------- Ostatnio oglądane ----------

  const recent = {
    push(id) {
      const ids = store.get(KEYS.recent, []).filter((x) => x !== id);
      ids.unshift(id);
      store.set(KEYS.recent, ids.slice(0, RECENT_LIMIT));
    },
    list(exclude = []) {
      return store.get(KEYS.recent, []).filter((id) => !exclude.includes(id)).map(byId).filter(Boolean);
    },
    clear() {
      store.set(KEYS.recent, []);
    }
  };

  // ---------- Zamówienia (zapis lokalny – dane do „często kupowane razem”) ----------

  const orders = {
    list() {
      return store.get(KEYS.orders, []);
    },
    add(order) {
      store.set(KEYS.orders, [order, ...orders.list()].slice(0, 50));
    }
  };

  // ---------- Rekomendacje ----------

  // „Często kupowane razem”: ręcznie zdefiniowane powiązania + to, co faktycznie kupowano razem
  // w złożonych zamówieniach. Gdy brakuje propozycji – dobieramy popularne produkty z tej samej kategorii.
  const boughtTogether = (id, limit = 3) => {
    const p = byId(id);
    if (!p) return [];
    const score = new Map();
    const bump = (otherId, pts) => {
      if (otherId === id || !byId(otherId)) return;
      score.set(otherId, (score.get(otherId) || 0) + pts);
    };

    (p.boughtWith || []).forEach((other, i) => bump(other, 10 - i));
    orders.list().forEach((o) => {
      if (o.items.some((i) => i.id === id)) o.items.forEach((i) => bump(i.id, 4));
    });

    let result = [...score.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([otherId]) => byId(otherId))
      .filter((x) => x.stock > 0);

    if (result.length < limit) {
      const fill = PRODUCTS
        .filter((x) => x.category === p.category && x.id !== id && x.stock > 0 && !result.includes(x))
        .sort((a, b) => b.popularity - a.popularity);
      result = result.concat(fill);
    }
    return result.slice(0, limit);
  };

  const sameCategory = (id, limit = 10) => {
    const p = byId(id);
    return PRODUCTS
      .filter((x) => x.category === p.category && x.id !== id)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  };

  // Propozycje do całego koszyka – zbiera „kupowane razem” dla każdej pozycji
  const forCart = (limit = 8) => {
    const inCart = cart.items().map((i) => i.id);
    const score = new Map();
    inCart.forEach((id) => {
      boughtTogether(id, 5).forEach((p, i) => {
        if (!inCart.includes(p.id)) score.set(p.id, (score.get(p.id) || 0) + 5 - i);
      });
    });
    return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => byId(id)).slice(0, limit);
  };

  // ---------- Elementy UI ----------

  const icon = {
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1.6" fill="currentColor"/><circle cx="17" cy="20" r="1.6" fill="currentColor"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.3 0 5.6 3.1 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" fill="currentColor"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h11v9H2zM13 9h4l4 3.5V15h-8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="6.5" cy="17" r="1.8" fill="currentColor"/><circle cx="17" cy="17" r="1.8" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3h3l1.5 4.5-2 1.3a12 12 0 0 0 6.1 6.1l1.3-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };

  const stars = (rating, reviews) => {
    const pct = Math.round((rating / 5) * 100);
    return `<span class="stars" title="Ocena ${rating.toFixed(1)} / 5">
      <span class="stars__bg">★★★★★</span><span class="stars__fg" style="width:${pct}%">★★★★★</span>
    </span>${reviews != null ? `<span class="stars__count">(${reviews})</span>` : ''}`;
  };

  const stockInfo = (p) => {
    if (p.stock <= 0) return '<span class="stock stock--out">Na zamówienie (do 7 dni)</span>';
    if (p.stock <= 5) return `<span class="stock stock--low">Ostatnie sztuki (${p.stock})</span>`;
    return '<span class="stock stock--ok">Dostępny – wysyłka w 24 h</span>';
  };

  const badges = (p) => {
    const list = [];
    if (p.oldPrice) list.push(`<span class="badge badge--sale">-${discount(p)}%</span>`);
    if (p.badges.includes('nowość')) list.push('<span class="badge badge--new">Nowość</span>');
    if (p.badges.includes('bestseller')) list.push('<span class="badge badge--hit">Bestseller</span>');
    return list.length ? `<div class="badges">${list.join('')}</div>` : '';
  };

  const priceBlock = (p) => `<div class="price">
      <span class="price__now${p.oldPrice ? ' price__now--sale' : ''}">${fmt(p.price)}</span>
      ${p.oldPrice ? `<s class="price__old">${fmt(p.oldPrice)}</s>` : ''}
    </div>`;

  const favButton = (p) => `<button type="button" class="fav-btn${fav.has(p.id) ? ' is-on' : ''}" data-fav="${p.id}"
      aria-pressed="${fav.has(p.id)}" aria-label="Dodaj do ulubionych: ${esc(p.name)}">${icon.heart}</button>`;

  const addButton = (p, label = 'Do koszyka') => p.stock > 0
    ? `<button type="button" class="btn-cart" data-add="${p.id}">${icon.cart}<span>${label}</span></button>`
    : `<a class="btn-cart btn-cart--ghost" href="${productUrl(p)}">Zapytaj o termin</a>`;

  const card = (p) => `<article class="pcard">
      <a class="pcard__img" href="${productUrl(p)}">${window.AGW_IMG(p)}${badges(p)}</a>
      ${favButton(p)}
      <div class="pcard__body">
        <span class="pcard__sku">Nr kat. ${esc(p.sku)}</span>
        <h3 class="pcard__name"><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
        <div class="pcard__rating">${stars(p.rating, p.reviews)}</div>
        <p class="pcard__short">${esc(p.short)}</p>
        <div class="pcard__foot">
          ${priceBlock(p)}
          ${stockInfo(p)}
          ${addButton(p)}
        </div>
      </div>
    </article>`;

  const categoryTiles = () => `<div class="cat-tiles">
      ${CATEGORIES.map((c) => {
        const items = PRODUCTS.filter((p) => p.category === c.id);
        const hero = items.slice().sort((a, b) => b.popularity - a.popularity)[0];
        return `<a class="cat-tile" href="${categoryUrl(c.id)}">
          <span class="cat-tile__img">${window.AGW_IMG(hero)}</span>
          <b>${c.name}</b><small>${items.length} produktów</small>
        </a>`;
      }).join('')}
    </div>`;

  // Karuzela produktów z przewijaniem i strzałkami
  const carousel = (title, products, opts = {}) => {
    if (!products.length) return '';
    return `<section class="rail" ${opts.id ? `id="${opts.id}"` : ''}>
      <div class="rail__head">
        <h2>${title}</h2>
        ${opts.action || ''}
        <div class="rail__nav">
          <button type="button" class="rail__btn" data-rail="-1" aria-label="Przewiń w lewo">${icon.chevL}</button>
          <button type="button" class="rail__btn" data-rail="1" aria-label="Przewiń w prawo">${icon.chevR}</button>
        </div>
      </div>
      <div class="rail__track">${products.map(card).join('')}</div>
    </section>`;
  };

  const recentRail = (exclude = []) => carousel('Ostatnio oglądane', recent.list(exclude), {
    id: 'ostatnio-ogladane',
    action: '<button type="button" class="link-btn" data-clear-recent>Wyczyść historię</button>'
  });

  // ---------- Nagłówek i stopka ----------

  const renderHeader = () => {
    const host = document.querySelector('[data-shop-header]');
    if (!host) return;
    const params = new URLSearchParams(location.search);
    const activeCat = params.get('kat');
    host.outerHTML = `
      <div class="topbar">
        <div class="wrap topbar__inner">
          <span>${icon.truck} Darmowa dostawa od ${fmt(FREE_SHIPPING_FROM)}</span>
          <span class="hide-sm">Wysyłka w 24 h · odbiór osobisty w Popowie Północ</span>
          <a href="tel:+48666605101">${icon.phone} 666 605 101 – pomożemy dobrać część</a>
        </div>
      </div>
      <header class="shop-header">
        <div class="wrap shop-header__row">
          <button type="button" class="icon-btn shop-burger" aria-label="Kategorie" aria-expanded="false">${icon.menu}</button>
          <a class="shop-logo" href="index.html" aria-label="AgroWil – strona główna">
            <img src="logo_agrowil.png" alt="AgroWil"/>
            <span>sklep</span>
          </a>
          <form class="shop-search" action="sklep.html" role="search" autocomplete="off">
            <input type="search" name="q" placeholder="Szukaj po nazwie lub numerze katalogowym, np. RE504836" value="${esc(params.get('q') || '')}" aria-label="Szukaj produktów"/>
            <button type="submit" aria-label="Szukaj">${icon.search}<span class="hide-sm">Szukaj</span></button>
            <div class="suggest" role="listbox" hidden></div>
          </form>
          <nav class="shop-actions" aria-label="Konto">
            <a class="shop-action" href="sklep.html?fav=1">${icon.heart}<span class="hide-sm">Ulubione</span><b class="bubble" data-fav-count></b></a>
            <a class="shop-action shop-action--cart" href="koszyk.html">${icon.cart}<span class="shop-action__txt"><span class="hide-sm">Koszyk</span><small data-cart-total></small></span><b class="bubble" data-cart-count></b></a>
          </nav>
        </div>
        <nav class="cats" aria-label="Kategorie produktów">
          <div class="wrap cats__inner">
            <a href="sklep.html" class="${!activeCat && location.pathname.endsWith('sklep.html') && !params.get('q') && !params.get('fav') ? 'is-active' : ''}">Wszystkie</a>
            ${CATEGORIES.map((c) => `<a href="${categoryUrl(c.id)}" class="${activeCat === c.id ? 'is-active' : ''}">${c.name}</a>`).join('')}
            <a href="sklep.html?promo=1" class="cats__promo">Promocje</a>
            <span class="cats__sep" aria-hidden="true"></span>
            <a href="index.html#oferta" class="cats__info">Usługi</a>
            <a href="index.html#fjd" class="cats__info">Nawigacje FJD</a>
            <a href="index.html#kontakt" class="cats__info">Kontakt</a>
          </div>
        </nav>
      </header>`;

    const burger = document.querySelector('.shop-burger');
    const cats = document.querySelector('.cats');
    burger.addEventListener('click', () => {
      const open = cats.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
    });

    initSuggest();
    updateCounters();
  };

  const renderFooter = () => {
    const host = document.querySelector('[data-shop-footer]');
    if (!host) return;
    host.outerHTML = `
      ${host.dataset.shopFooter === 'no-perks' ? '' : `<section class="perks">
        <div class="wrap perks__grid">
          <div><b>Oryginalne części</b><span>John Deere i sprawdzone zamienniki</span></div>
          <div><b>Wysyłka w 24 h</b><span>dla produktów dostępnych od ręki</span></div>
          <div><b>Dobór po VIN</b><span>zadzwoń – sprawdzimy, czy pasuje</span></div>
          <div><b>14 dni na zwrot</b><span>bez podawania przyczyny</span></div>
        </div>
      </section>`}
      <footer class="shop-footer">
        <div class="wrap shop-footer__grid">
          <div>
            <img src="logo_agrowil.png" alt="AgroWil" class="shop-footer__logo"/>
            <p>AgroWil, Popowo Północ (gm. Nasielsk)<br/>Części John Deere, nawigacje FJDynamics, zakuwanie węży.</p>
          </div>
          <div>
            <h4>Kategorie</h4>
            <ul>${CATEGORIES.map((c) => `<li><a href="${categoryUrl(c.id)}">${c.name}</a></li>`).join('')}</ul>
          </div>
          <div>
            <h4>Zakupy</h4>
            <ul>
              <li><a href="koszyk.html">Koszyk</a></li>
              <li><a href="sklep.html?fav=1">Ulubione</a></li>
              <li><a href="sklep.html#ostatnio-ogladane">Ostatnio oglądane</a></li>
              <li><a href="index.html#weze">Węże na wymiar</a></li>
            </ul>
          </div>
          <div>
            <h4>Kontakt</h4>
            <p><a href="tel:+48666605101">666 605 101</a><br/>damianwilski@wp.pl</p>
          </div>
        </div>
        <p class="wrap shop-footer__copy">© ${new Date().getFullYear()} AgroWil. Ceny brutto, zawierają VAT.</p>
      </footer>`;
  };

  const updateCounters = () => {
    const count = cart.count();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
    document.querySelectorAll('[data-cart-total]').forEach((el) => {
      el.textContent = count ? fmt(cart.total()) : '';
    });
    const favCount = fav.ids().length;
    document.querySelectorAll('[data-fav-count]').forEach((el) => {
      el.textContent = favCount;
      el.hidden = favCount === 0;
    });
  };

  // ---------- Podpowiedzi wyszukiwarki ----------

  const initSuggest = () => {
    const form = document.querySelector('.shop-search');
    const input = form.querySelector('input');
    const box = form.querySelector('.suggest');
    let active = -1;

    const close = () => {
      box.hidden = true;
      active = -1;
    };

    const render = () => {
      const q = input.value.trim();
      if (q.length < 2) return close();
      const hits = search(q);
      const cats = CATEGORIES.filter((c) => norm(c.name).includes(norm(q)));
      if (!hits.length && !cats.length) {
        box.innerHTML = `<div class="suggest__empty">Brak wyników dla „${esc(q)}”. Zadzwoń – sprawdzimy dostępność u dostawcy.</div>`;
      } else {
        box.innerHTML = `
          ${cats.map((c) => `<a class="suggest__cat" href="${categoryUrl(c.id)}">Kategoria: <b>${c.name}</b></a>`).join('')}
          ${hits.slice(0, 6).map((p) => `<a class="suggest__item" role="option" href="${productUrl(p)}">
            <span class="suggest__img">${window.AGW_IMG(p)}</span>
            <span class="suggest__txt"><b>${esc(p.name)}</b><small>Nr kat. ${esc(p.sku)}</small></span>
            <span class="suggest__price">${fmt(p.price)}</span>
          </a>`).join('')}
          ${hits.length > 6 ? `<a class="suggest__all" href="sklep.html?q=${encodeURIComponent(q)}">Pokaż wszystkie wyniki (${hits.length})</a>` : ''}`;
      }
      box.hidden = false;
    };

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', (e) => {
      const items = [...box.querySelectorAll('a')];
      if (box.hidden || !items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle('is-active', i === active));
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault();
        location.href = items[active].href;
      } else if (e.key === 'Escape') {
        close();
      }
    });
    document.addEventListener('click', (e) => {
      if (!form.contains(e.target)) close();
    });
  };

  // ---------- Modal „Dodano do koszyka” ----------

  const showAdded = (id, qty = 1) => {
    const p = byId(id);
    const recs = boughtTogether(id, 3).filter((x) => !cart.items().some((i) => i.id === x.id));
    document.querySelector('.added-modal')?.remove();

    const modal = document.createElement('div');
    modal.className = 'added-modal';
    modal.innerHTML = `
      <div class="added-modal__backdrop" data-close></div>
      <div class="added-modal__box" role="dialog" aria-modal="true" aria-labelledby="added-title">
        <button type="button" class="icon-btn added-modal__close" data-close aria-label="Zamknij">${icon.close}</button>
        <h2 id="added-title"><span class="ok-dot">${icon.check}</span> Dodano do koszyka</h2>
        <div class="added-modal__item">
          <span class="added-modal__img">${window.AGW_IMG(p)}</span>
          <div>
            <b>${esc(p.name)}</b>
            <span>${qty} szt. × ${fmt(p.price)}</span>
          </div>
        </div>
        ${freeShippingBar(cart.total())}
        <div class="added-modal__actions">
          <button type="button" class="btn btn--ghost" data-close>Kontynuuj zakupy</button>
          <a class="btn btn--primary" href="koszyk.html">Przejdź do koszyka (${cart.count()})</a>
        </div>
        ${recs.length ? `<h3>Klienci kupujący ten produkt wybierali też</h3>
          <div class="mini-list">${recs.map(miniCard).join('')}</div>` : ''}
      </div>`;
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');
    modal.querySelector('.btn--primary').focus();

    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    const closeModal = () => {
      modal.remove();
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
    };
    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) closeModal();
    });
    document.addEventListener('keydown', onKey);
  };

  const miniCard = (p) => `<div class="mini">
      <a href="${productUrl(p)}" class="mini__img">${window.AGW_IMG(p)}</a>
      <div class="mini__body">
        <a href="${productUrl(p)}" class="mini__name">${esc(p.name)}</a>
        <b>${fmt(p.price)}</b>
      </div>
      <button type="button" class="icon-btn icon-btn--add" data-add="${p.id}" aria-label="Dodaj do koszyka: ${esc(p.name)}">${icon.cart}</button>
    </div>`;

  const freeShippingBar = (total) => {
    const missing = FREE_SHIPPING_FROM - total;
    const pct = Math.min(100, Math.round((total / FREE_SHIPPING_FROM) * 100));
    return `<div class="ship-bar${missing <= 0 ? ' is-done' : ''}">
      <p>${missing > 0
        ? `Brakuje <b>${fmt(missing)}</b> do darmowej dostawy`
        : `${icon.check} Masz <b>darmową dostawę</b>`}</p>
      <div class="ship-bar__track"><span style="width:${pct}%"></span></div>
    </div>`;
  };

  const toast = (msg) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-on'));
    setTimeout(() => {
      el.classList.remove('is-on');
      setTimeout(() => el.remove(), 300);
    }, 2200);
  };

  // ---------- Globalne zdarzenia (delegacja) ----------

  const bindGlobal = () => {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) {
        e.preventDefault();
        const id = add.dataset.add;
        const qtyInput = add.dataset.qtyFrom ? document.querySelector(add.dataset.qtyFrom) : null;
        const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
        if (cart.add(id, qty)) showAdded(id, qty);
        return;
      }

      const favBtn = e.target.closest('[data-fav]');
      if (favBtn) {
        e.preventDefault();
        const on = fav.toggle(favBtn.dataset.fav);
        document.querySelectorAll(`[data-fav="${favBtn.dataset.fav}"]`).forEach((b) => {
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on);
        });
        toast(on ? 'Dodano do ulubionych' : 'Usunięto z ulubionych');
        return;
      }

      const railBtn = e.target.closest('[data-rail]');
      if (railBtn) {
        const track = railBtn.closest('.rail').querySelector('.rail__track');
        track.scrollBy({ left: Number(railBtn.dataset.rail) * track.clientWidth * 0.85, behavior: 'smooth' });
        return;
      }

      if (e.target.closest('[data-clear-recent]')) {
        recent.clear();
        document.getElementById('ostatnio-ogladane')?.remove();
      }
    });

    document.addEventListener('agw:cart', updateCounters);
    document.addEventListener('agw:fav', updateCounters);
    // synchronizacja między kartami przeglądarki
    window.addEventListener('storage', updateCounters);
  };

  const init = () => {
    renderHeader();
    renderFooter();
    bindGlobal();
  };

  return {
    PRODUCTS, CATEGORIES, FREE_SHIPPING_FROM,
    fmt, esc, norm, byId, category, productUrl, categoryUrl, discount, search,
    cart, fav, recent, orders,
    boughtTogether, sameCategory, forCart,
    icon, stars, stockInfo, badges, priceBlock, favButton, addButton, card, miniCard, categoryTiles, carousel, recentRail, freeShippingBar, toast,
    init
  };
})();

document.addEventListener('DOMContentLoaded', () => window.AGW.init());
