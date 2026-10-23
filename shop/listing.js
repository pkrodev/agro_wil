// shop/listing.js – lista produktów: kategorie, wyszukiwanie, filtry, sortowanie, paginacja

document.addEventListener('DOMContentLoaded', () => window.AGW.ready.then(() => {
  const { PRODUCTS, CATEGORIES, esc, search, category, categoryUrl, fav, card, carousel, recentRail } = window.AGW;
  const MODELS = window.AGW_MODELS;
  const PER_PAGE = 12;

  const root = document.getElementById('listing');
  const SORTS = {
    pop: { label: 'Najpopularniejsze', fn: (a, b) => b.popularity - a.popularity },
    priceAsc: { label: 'Cena: od najniższej', fn: (a, b) => a.price - b.price },
    priceDesc: { label: 'Cena: od najwyższej', fn: (a, b) => b.price - a.price },
    rating: { label: 'Najlepiej oceniane', fn: (a, b) => b.rating - a.rating || b.reviews - a.reviews },
    name: { label: 'Nazwa A–Z', fn: (a, b) => a.name.localeCompare(b.name, 'pl') }
  };

  const readState = () => {
    const q = new URLSearchParams(location.search);
    return {
      kat: q.get('kat') || '',
      q: q.get('q') || '',
      fav: q.get('fav') === '1',
      promo: q.get('promo') === '1',
      avail: q.get('avail') === '1',
      min: q.get('min') || '',
      max: q.get('max') || '',
      models: (q.get('model') || '').split(',').filter((m) => MODELS.includes(m)),
      sort: SORTS[q.get('sort')] ? q.get('sort') : 'pop',
      view: q.get('view') === 'list' ? 'list' : 'grid',
      page: Math.max(1, parseInt(q.get('page'), 10) || 1)
    };
  };

  const writeState = (s, replace = false) => {
    const q = new URLSearchParams();
    if (s.kat) q.set('kat', s.kat);
    if (s.q) q.set('q', s.q);
    if (s.fav) q.set('fav', '1');
    if (s.promo) q.set('promo', '1');
    if (s.avail) q.set('avail', '1');
    if (s.min) q.set('min', s.min);
    if (s.max) q.set('max', s.max);
    if (s.models.length) q.set('model', s.models.join(','));
    if (s.sort !== 'pop') q.set('sort', s.sort);
    if (s.view !== 'grid') q.set('view', s.view);
    if (s.page > 1) q.set('page', s.page);
    const url = `sklep.html${q.toString() ? '?' + q : ''}`;
    history[replace ? 'replaceState' : 'pushState'](null, '', url);
    render();
  };

  // Produkty po zawężeniu „zakresu” (kategoria / wyszukiwanie / ulubione), przed filtrami z panelu
  const scope = (s) => {
    let list = s.q ? search(s.q) : PRODUCTS.slice();
    if (s.kat) list = list.filter((p) => p.category === s.kat);
    if (s.fav) {
      const ids = fav.ids();
      list = list.filter((p) => ids.includes(p.id));
    }
    return list;
  };

  const fitsModel = (p, models) => !models.length || p.fits.includes('*') || models.some((m) => p.fits.includes(m));

  const applyFilters = (list, s) => list.filter((p) =>
    (!s.promo || p.oldPrice) &&
    (!s.avail || p.stock > 0) &&
    (!s.min || p.price >= Number(s.min)) &&
    (!s.max || p.price <= Number(s.max)) &&
    fitsModel(p, s.models));

  const title = (s) => {
    if (s.fav) return 'Ulubione produkty';
    if (s.q) return `Wyniki wyszukiwania: „${esc(s.q)}”`;
    if (s.promo && !s.kat) return 'Promocje';
    if (s.kat) return category(s.kat).name;
    return 'Wszystkie produkty';
  };

  const breadcrumb = (s) => `<nav class="crumbs" aria-label="Okruszki">
      <a href="index.html">AgroWil</a><span>/</span><a href="sklep.html">Sklep</a>
      ${s.kat ? `<span>/</span><span>${category(s.kat).name}</span>` : ''}
      ${s.fav ? '<span>/</span><span>Ulubione</span>' : ''}
    </nav>`;

  const sidebar = (s, scoped) => {
    const catCounts = (s.q || s.fav ? scoped : PRODUCTS);
    const countModel = (m) => applyFilters(scoped, { ...s, models: [m] }).length;
    return `<aside class="filters" id="filters" aria-label="Filtry">
      <div class="filters__head">
        <h2>Filtry</h2>
        <button type="button" class="icon-btn filters__close" data-filters-close aria-label="Zamknij filtry">${window.AGW.icon.close}</button>
      </div>

      <div class="fgroup">
        <h3>Kategorie</h3>
        <ul class="fcats">
          <li><a href="#" data-cat="" class="${!s.kat ? 'is-active' : ''}">Wszystkie <small>${catCounts.length}</small></a></li>
          ${CATEGORIES.map((c) => {
            const n = catCounts.filter((p) => p.category === c.id).length;
            return `<li><a href="${categoryUrl(c.id)}" data-cat="${c.id}" class="${s.kat === c.id ? 'is-active' : ''}">${c.name} <small>${n}</small></a></li>`;
          }).join('')}
        </ul>
      </div>

      <div class="fgroup">
        <h3>Cena (zł)</h3>
        <form class="fprice" data-price>
          <input type="number" min="0" name="min" placeholder="od" value="${esc(s.min)}" aria-label="Cena od"/>
          <span>–</span>
          <input type="number" min="0" name="max" placeholder="do" value="${esc(s.max)}" aria-label="Cena do"/>
          <button type="submit" class="btn btn--small">OK</button>
        </form>
      </div>

      <div class="fgroup">
        <h3>Dostępność i oferta</h3>
        <label class="check"><input type="checkbox" data-flag="avail" ${s.avail ? 'checked' : ''}/> Tylko dostępne od ręki</label>
        <label class="check"><input type="checkbox" data-flag="promo" ${s.promo ? 'checked' : ''}/> Tylko promocje</label>
      </div>

      <div class="fgroup">
        <h3>Pasuje do maszyny</h3>
        ${MODELS.map((m) => `<label class="check"><input type="checkbox" data-model="${m}" ${s.models.includes(m) ? 'checked' : ''}/> ${m} <small>${countModel(m)}</small></label>`).join('')}
        <p class="fhint">Nie jesteś pewien? Zadzwoń z numerem VIN – sprawdzimy.</p>
      </div>
    </aside>`;
  };

  const activeChips = (s) => {
    const chips = [];
    if (s.min || s.max) chips.push(['price', `Cena: ${s.min || 0} – ${s.max || '∞'} zł`]);
    if (s.avail) chips.push(['avail', 'Dostępne od ręki']);
    if (s.promo) chips.push(['promo', 'Promocje']);
    s.models.forEach((m) => chips.push([`model:${m}`, m]));
    if (!chips.length) return '';
    return `<div class="chips">${chips.map(([k, l]) => `<button type="button" class="chip" data-chip="${k}">${l} ✕</button>`).join('')}
      <button type="button" class="link-btn" data-chip="all">Wyczyść filtry</button></div>`;
  };

  const pagination = (page, pages) => {
    if (pages <= 1) return '';
    const btn = (p, label = p) => `<button type="button" class="${p === page ? 'is-active' : ''}" data-page="${p}" ${p === page ? 'aria-current="page"' : ''}>${label}</button>`;
    return `<nav class="pager" aria-label="Strony">
      ${page > 1 ? btn(page - 1, '‹') : ''}
      ${Array.from({ length: pages }, (_, i) => btn(i + 1)).join('')}
      ${page < pages ? btn(page + 1, '›') : ''}
    </nav>`;
  };

  const emptyState = (s) => {
    if (s.fav) {
      return `<div class="empty"><h3>Nie masz jeszcze ulubionych produktów</h3>
        <p>Kliknij serduszko przy produkcie, żeby zapisać go na później.</p>
        <a class="btn btn--primary" href="sklep.html">Przeglądaj sklep</a></div>`;
    }
    return `<div class="empty"><h3>Nic nie znaleźliśmy</h3>
      <p>Spróbuj innej frazy lub wyczyść filtry. Nie ma części, której szukasz? Mamy dostęp do pełnego katalogu John Deere –
      <a href="tel:+48666605101">zadzwoń: 666 605 101</a>.</p></div>`;
  };

  const render = () => {
    const s = readState();
    const scoped = scope(s);
    const filtered = applyFilters(scoped, s).sort(SORTS[s.sort].fn);
    const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const page = Math.min(s.page, pages);
    const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const isHome = !s.kat && !s.q && !s.fav && !s.promo;
    const cat = s.kat ? category(s.kat) : null;

    document.title = `${s.q ? `Szukaj: ${s.q}` : title(s).replace(/&[^;]+;/g, '')} – Sklep AgroWil`;

    root.innerHTML = `
      ${breadcrumb(s)}
      ${isHome ? `<section class="shop-hero">
        <div>
          <h1>Części i materiały do maszyn John Deere</h1>
          <p>Filtry, oleje, paski, łożyska i części żniwne – wysyłamy w 24 h, a jeśli nie wiesz, co pasuje, dobierzemy część po numerze VIN.</p>
        </div>
        <a class="btn btn--primary" href="sklep.html?promo=1">Zobacz promocje</a>
      </section>${window.AGW.categoryTiles()}` : `<header class="list-head"><h1>${title(s)}</h1>${cat ? `<p>${cat.desc}</p>` : ''}</header>`}

      <div class="list-layout">
        ${sidebar(s, scoped)}
        <div class="list-main">
          <div class="toolbar">
            <button type="button" class="btn btn--ghost btn--small toolbar__filters" data-filters-open>Filtry</button>
            <span class="toolbar__count"><b>${filtered.length}</b> ${filtered.length === 1 ? 'produkt' : (filtered.length % 10 >= 2 && filtered.length % 10 <= 4 && (filtered.length % 100 < 10 || filtered.length % 100 >= 20) ? 'produkty' : 'produktów')}</span>
            <label class="toolbar__sort">Sortuj:
              <select data-sort>${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${k === s.sort ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
            </label>
            <div class="toolbar__view" role="group" aria-label="Widok">
              <button type="button" data-view="grid" class="${s.view === 'grid' ? 'is-active' : ''}" aria-label="Siatka">▦</button>
              <button type="button" data-view="list" class="${s.view === 'list' ? 'is-active' : ''}" aria-label="Lista">☰</button>
            </div>
          </div>
          ${activeChips(s)}
          ${visible.length ? `<div class="grid grid--${s.view}">${visible.map(card).join('')}</div>` : emptyState(s)}
          ${pagination(page, pages)}
        </div>
      </div>

      ${isHome ? carousel('Bestsellery', PRODUCTS.slice().sort((a, b) => b.popularity - a.popularity).slice(0, 10)) : ''}
      ${recentRail()}
    `;
  };

  // ---------- Zdarzenia ----------

  root.addEventListener('click', (e) => {
    const s = readState();

    const catLink = e.target.closest('[data-cat]');
    if (catLink) {
      e.preventDefault();
      writeState({ ...s, kat: catLink.dataset.cat, page: 1 });
      document.body.classList.remove('filters-open');
      return;
    }

    const pageBtn = e.target.closest('[data-page]');
    if (pageBtn) {
      writeState({ ...s, page: Number(pageBtn.dataset.page) });
      root.querySelector('.list-layout').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const viewBtn = e.target.closest('[data-view]');
    if (viewBtn) {
      writeState({ ...s, view: viewBtn.dataset.view }, true);
      return;
    }

    const chip = e.target.closest('[data-chip]');
    if (chip) {
      const k = chip.dataset.chip;
      if (k === 'all') writeState({ ...s, min: '', max: '', avail: false, promo: false, models: [], page: 1 });
      else if (k === 'price') writeState({ ...s, min: '', max: '', page: 1 });
      else if (k.startsWith('model:')) writeState({ ...s, models: s.models.filter((m) => m !== k.slice(6)), page: 1 });
      else writeState({ ...s, [k]: false, page: 1 });
      return;
    }

    if (e.target.closest('[data-filters-open]')) document.body.classList.add('filters-open');
    if (e.target.closest('[data-filters-close]')) document.body.classList.remove('filters-open');
  });

  root.addEventListener('change', (e) => {
    const s = readState();
    const t = e.target;
    if (t.matches('[data-sort]')) writeState({ ...s, sort: t.value, page: 1 });
    else if (t.matches('[data-flag]')) writeState({ ...s, [t.dataset.flag]: t.checked, page: 1 });
    else if (t.matches('[data-model]')) {
      const models = t.checked ? [...s.models, t.dataset.model] : s.models.filter((m) => m !== t.dataset.model);
      writeState({ ...s, models, page: 1 });
    }
  });

  root.addEventListener('submit', (e) => {
    if (!e.target.matches('[data-price]')) return;
    e.preventDefault();
    const f = new FormData(e.target);
    writeState({ ...readState(), min: f.get('min'), max: f.get('max'), page: 1 });
  });

  // ulubione: odśwież listę, gdy ktoś usunie serduszko na stronie ulubionych
  document.addEventListener('agw:fav', () => {
    if (readState().fav) render();
  });

  window.addEventListener('popstate', render);
  render();

  // przewiń do sekcji z linku w stopce (#ostatnio-ogladane) po wyrenderowaniu
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
}));
