// shop/product.js – karta produktu

document.addEventListener('DOMContentLoaded', () => {
  const A = window.AGW;
  const { fmt, esc, byId, category, categoryUrl, productUrl, icon } = A;
  const root = document.getElementById('product');

  const id = new URLSearchParams(location.search).get('id');
  const p = byId(id);

  if (!p) {
    root.innerHTML = `<div class="empty">
      <h1>Nie znaleźliśmy tego produktu</h1>
      <p>Mógł zostać wycofany ze sprzedaży. Zadzwoń – sprawdzimy zamiennik: <a href="tel:+48666605101">666 605 101</a>.</p>
      <a class="btn btn--primary" href="sklep.html">Wróć do sklepu</a>
    </div>${A.recentRail()}`;
    return;
  }

  const cat = category(p.category);
  document.title = `${p.name} – Sklep AgroWil`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', p.short);

  // „Ostatnio oglądane” pokazuje to, co klient widział PRZED tym produktem
  const recentBefore = A.recentRail([p.id]);
  A.recent.push(p.id);

  const credit = (window.AGW_PHOTOS || {})[p.id]?.credit;
  const together = A.boughtTogether(p.id, 2);
  const bundle = [p, ...together];

  const fitsHtml = p.fits.includes('*')
    ? '<p>Produkt uniwersalny – pasuje do ciągników, kombajnów i maszyn wszystkich serii John Deere (sprawdź specyfikację).</p>'
    : `<p>Produkt pasuje do maszyn z serii:</p><ul class="fits">${p.fits.map((m) => `<li><a href="sklep.html?model=${encodeURIComponent(m)}">${m}</a></li>`).join('')}</ul>`;

  root.innerHTML = `
    <nav class="crumbs" aria-label="Okruszki">
      <a href="index.html">AgroWil</a><span>/</span><a href="sklep.html">Sklep</a><span>/</span>
      <a href="${categoryUrl(cat.id)}">${cat.name}</a><span>/</span><span>${esc(p.name)}</span>
    </nav>

    <div class="pd">
      <div class="pd__gallery">
        <div class="pd__main" data-main>${window.AGW_IMG(p)}${A.badges(p)}</div>
        <div class="pd__thumbs" role="tablist" aria-label="Zdjęcia produktu">
          <button type="button" class="is-active" data-thumb="main" aria-label="Widok ogólny">${window.AGW_IMG(p)}</button>
          <button type="button" data-thumb="zoom" aria-label="Zbliżenie">${window.AGW_IMG(p, 'zoom')}</button>
        </div>
        ${credit ? `<p class="pd__credit">Zdjęcie poglądowe: ${esc(credit.author)}, <a href="${credit.source}" target="_blank" rel="noopener">${esc(credit.license)}</a>, Wikimedia Commons</p>` : ''}
      </div>

      <div class="pd__info">
        <h1>${esc(p.name)}</h1>
        <div class="pd__meta">
          <span>Nr katalogowy: <b>${esc(p.sku)}</b></span>
          <span>${A.stars(p.rating)} <a href="#opinie">${p.rating.toFixed(1)} (${p.reviews} opinii)</a></span>
        </div>
        <p class="pd__short">${esc(p.short)}</p>

        <div class="buybox">
          <div class="buybox__price">
            ${A.priceBlock(p)}
            ${p.oldPrice ? `<span class="badge badge--sale">Oszczędzasz ${fmt(p.oldPrice - p.price)}</span>` : ''}
          </div>
          ${p.lowest30 ? `<p class="omnibus">Najniższa cena z 30 dni przed obniżką: ${fmt(p.lowest30)}</p>` : ''}
          <p class="buybox__vat">Cena brutto (z 23% VAT) · ${fmt(p.price / 1.23)} netto</p>
          ${A.stockInfo(p)}

          ${p.stock > 0 ? `
          <div class="buybox__row">
            <div class="qty">
              <button type="button" data-step="-1" aria-label="Mniej">−</button>
              <input type="number" id="qty" value="1" min="1" max="${p.stock}" aria-label="Ilość"/>
              <button type="button" data-step="1" aria-label="Więcej">+</button>
            </div>
            <button type="button" class="btn-cart btn-cart--big" data-add="${p.id}" data-qty-from="#qty">${icon.cart}<span>Dodaj do koszyka</span></button>
            ${A.favButton(p)}
          </div>` : `
          <div class="buybox__row">
            <a class="btn btn--primary" href="tel:+48666605101">${icon.phone} Zadzwoń i zamów</a>
            ${A.favButton(p)}
          </div>`}

          <ul class="buybox__perks">
            <li>${icon.truck} Kurier ${fmt(19.99)} · <b>darmowa dostawa od ${fmt(A.FREE_SHIPPING_FROM)}</b></li>
            <li>${icon.check} Odbiór osobisty w Popowie Północ – 0 zł</li>
            <li>${icon.check} 14 dni na zwrot</li>
            <li>${icon.phone} Nie wiesz, czy pasuje? <a href="tel:+48666605101">Zadzwoń z numerem VIN</a></li>
          </ul>
        </div>
      </div>
    </div>

    ${together.length ? `
    <section class="bundle" aria-labelledby="bundle-title">
      <h2 id="bundle-title">Często kupowane razem</h2>
      <div class="bundle__body">
        <div class="bundle__imgs">
          ${bundle.map((b, i) => `${i ? '<span class="bundle__plus">+</span>' : ''}
            <a href="${productUrl(b)}" class="bundle__img" data-bundle-img="${b.id}">${window.AGW_IMG(b)}</a>`).join('')}
        </div>
        <div class="bundle__list">
          ${bundle.map((b, i) => `<label class="bundle__item">
            <input type="checkbox" data-bundle="${b.id}" checked/>
            <span>${i === 0 ? '<b>Ten produkt:</b> ' : ''}${i === 0 ? esc(b.name) : `<a href="${productUrl(b)}">${esc(b.name)}</a>`}</span>
            <b class="bundle__price">${fmt(b.price)}</b>
          </label>`).join('')}
          <div class="bundle__sum">
            <span>Razem: <b data-bundle-total></b></span>
            <button type="button" class="btn btn--primary" data-bundle-add>${icon.cart} <span data-bundle-label></span></button>
          </div>
        </div>
      </div>
    </section>` : ''}

    <section class="tabs" aria-label="Szczegóły produktu">
      <div class="tabs__nav" role="tablist">
        <button type="button" role="tab" class="is-active" data-tab="opis">Opis</button>
        <button type="button" role="tab" data-tab="spec">Specyfikacja</button>
        <button type="button" role="tab" data-tab="fits">Pasuje do</button>
        <button type="button" role="tab" data-tab="opinie" id="opinie">Opinie (${p.reviews})</button>
        <button type="button" role="tab" data-tab="dostawa">Dostawa i zwroty</button>
      </div>
      <div class="tabs__panel is-active" data-panel="opis">${p.desc.map((d) => `<p>${esc(d)}</p>`).join('')}</div>
      <div class="tabs__panel" data-panel="spec">
        <table class="spec"><tbody>
          <tr><th>Nr katalogowy</th><td>${esc(p.sku)}</td></tr>
          <tr><th>Kategoria</th><td><a href="${categoryUrl(cat.id)}">${cat.name}</a></td></tr>
          ${Object.entries(p.specs).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}
        </tbody></table>
      </div>
      <div class="tabs__panel" data-panel="fits">
        ${fitsHtml}
        <p class="fhint">Numery katalogowe John Deere bywają zastępowane nowszymi. Podaj numer VIN maszyny w uwagach do zamówienia – zweryfikujemy dopasowanie przed wysyłką.</p>
      </div>
      <div class="tabs__panel" data-panel="opinie">
        <div class="reviews-sum">
          <b>${p.rating.toFixed(1)}</b>
          <div>${A.stars(p.rating)}<span>na podstawie ${p.reviews} opinii</span></div>
        </div>
        <p class="fhint">Opinie pochodzą od klientów, którzy kupili produkt. Po otrzymaniu zamówienia wyślemy Ci prośbę o ocenę.</p>
      </div>
      <div class="tabs__panel" data-panel="dostawa">
        <ul>
          <li>Kurier DPD – ${fmt(19.99)}, darmowa dostawa od ${fmt(A.FREE_SHIPPING_FROM)}.</li>
          <li>Paczkomat InPost – ${fmt(14.99)} (produkty do 25 kg).</li>
          <li>Odbiór osobisty – Popowo Północ, gm. Nasielsk – 0 zł. Zadzwoń przed przyjazdem.</li>
          <li>Zwrot w ciągu 14 dni od otrzymania – produkt nieużywany, w oryginalnym opakowaniu.</li>
        </ul>
      </div>
    </section>

    ${A.carousel(`Inne produkty z kategorii ${cat.name}`, A.sameCategory(p.id), {
      action: `<a class="link-btn" href="${categoryUrl(cat.id)}">Zobacz wszystkie</a>`
    })}
    ${recentBefore}
  `;

  // ---------- Galeria ----------
  const main = root.querySelector('[data-main]');
  root.querySelectorAll('[data-thumb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('[data-thumb]').forEach((b) => b.classList.toggle('is-active', b === btn));
      main.innerHTML = window.AGW_IMG(p, btn.dataset.thumb) + A.badges(p);
    });
  });

  // ---------- Ilość ----------
  const qty = root.querySelector('#qty');
  root.querySelectorAll('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      qty.value = Math.max(1, Math.min(p.stock, (parseInt(qty.value, 10) || 1) + Number(btn.dataset.step)));
    });
  });
  qty?.addEventListener('change', () => {
    qty.value = Math.max(1, Math.min(p.stock, parseInt(qty.value, 10) || 1));
  });

  // ---------- Zakładki ----------
  const openTab = (name) => {
    root.querySelectorAll('[data-tab]').forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
    root.querySelectorAll('[data-panel]').forEach((t) => t.classList.toggle('is-active', t.dataset.panel === name));
  };
  root.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => openTab(t.dataset.tab)));
  root.querySelector('a[href="#opinie"]').addEventListener('click', () => openTab('opinie'));

  // ---------- Zestaw „Często kupowane razem” ----------
  const bundleBox = root.querySelector('.bundle');
  if (bundleBox) {
    const update = () => {
      const checked = [...bundleBox.querySelectorAll('[data-bundle]:checked')].map((c) => byId(c.dataset.bundle));
      const total = checked.reduce((s, x) => s + x.price, 0);
      bundleBox.querySelector('[data-bundle-total]').textContent = fmt(total);
      bundleBox.querySelector('[data-bundle-label]').textContent =
        checked.length === bundle.length ? `Dodaj wszystkie ${checked.length} do koszyka` : `Dodaj zaznaczone (${checked.length}) do koszyka`;
      bundleBox.querySelector('[data-bundle-add]').disabled = !checked.length;
      bundleBox.querySelectorAll('[data-bundle-img]').forEach((img) => {
        img.classList.toggle('is-off', !checked.some((x) => x.id === img.dataset.bundleImg));
      });
    };
    bundleBox.addEventListener('change', update);
    bundleBox.querySelector('[data-bundle-add]').addEventListener('click', () => {
      const ids = [...bundleBox.querySelectorAll('[data-bundle]:checked')].map((c) => c.dataset.bundle);
      ids.forEach((x) => A.cart.add(x, 1));
      A.toast(`Dodano do koszyka: ${ids.length} ${ids.length === 1 ? 'produkt' : 'produkty'}`);
    });
    update();
  }
});
