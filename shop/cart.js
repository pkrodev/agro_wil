// shop/cart.js – strona koszyka

document.addEventListener('DOMContentLoaded', () => {
  const A = window.AGW;
  const { fmt, esc, byId, productUrl, icon } = A;
  const root = document.getElementById('cart');

  const steps = (n) => `<ol class="steps">
      ${['Koszyk', 'Dostawa i płatność', 'Potwierdzenie'].map((s, i) => `<li class="${i + 1 === n ? 'is-active' : ''}${i + 1 < n ? ' is-done' : ''}"><span>${i + 1}</span>${s}</li>`).join('')}
    </ol>`;

  const render = () => {
    const items = A.cart.items();
    const total = A.cart.total();

    if (!items.length) {
      root.innerHTML = `${steps(1)}
        <div class="empty">
          <h1>Twój koszyk jest pusty</h1>
          <p>Szukasz konkretnej części? Wpisz numer katalogowy w wyszukiwarkę albo zadzwoń – dobierzemy ją po numerze VIN.</p>
          <a class="btn btn--primary" href="sklep.html">Przejdź do sklepu</a>
        </div>
        ${A.carousel('Bestsellery', A.PRODUCTS.slice().sort((a, b) => b.popularity - a.popularity).slice(0, 10))}
        ${A.recentRail()}`;
      return;
    }

    root.innerHTML = `${steps(1)}
      <h1 class="page-title">Koszyk <small>(${A.cart.count()} szt.)</small></h1>
      <div class="cart-layout">
        <div class="cart-items">
          ${items.map(({ id, qty }) => {
            const p = byId(id);
            return `<div class="cart-row" data-id="${p.id}">
              <a class="cart-row__img" href="${productUrl(p)}">${window.AGW_IMG(p)}</a>
              <div class="cart-row__info">
                <a href="${productUrl(p)}" class="cart-row__name">${esc(p.name)}</a>
                <small>Nr kat. ${esc(p.sku)}</small>
                ${A.stockInfo(p)}
              </div>
              <div class="cart-row__unit">${fmt(p.price)}<small>/ szt.</small></div>
              <div class="qty qty--small">
                <button type="button" data-step="-1" aria-label="Mniej" ${qty <= 1 ? 'disabled' : ''}>−</button>
                <input type="number" value="${qty}" min="1" max="${p.stock}" data-qty aria-label="Ilość: ${esc(p.name)}"/>
                <button type="button" data-step="1" aria-label="Więcej" ${qty >= p.stock ? 'disabled' : ''}>+</button>
              </div>
              <b class="cart-row__sum">${fmt(p.price * qty)}</b>
              <button type="button" class="icon-btn cart-row__del" data-remove aria-label="Usuń z koszyka: ${esc(p.name)}">${icon.close}</button>
            </div>`;
          }).join('')}
          <a class="link-btn" href="sklep.html">← Kontynuuj zakupy</a>
        </div>

        <aside class="summary">
          <h2>Podsumowanie</h2>
          ${A.freeShippingBar(total)}
          <dl>
            <dt>Wartość produktów</dt><dd>${fmt(total)}</dd>
            <dt>Dostawa</dt><dd>${total >= A.FREE_SHIPPING_FROM ? 'Gratis' : `od ${fmt(0)} (odbiór) / ${fmt(14.99)}`}</dd>
          </dl>
          <div class="summary__total"><span>Do zapłaty</span><b>${fmt(total)}</b></div>
          <a class="btn btn--primary btn--block" href="zamowienie.html">Przejdź do dostawy i płatności</a>
          <p class="fhint">Koszt dostawy wybierzesz w następnym kroku.</p>
        </aside>
      </div>

      ${A.carousel('Często kupowane z produktami w Twoim koszyku', A.forCart())}
      ${A.recentRail(items.map((i) => i.id))}`;
  };

  root.addEventListener('click', (e) => {
    const row = e.target.closest('.cart-row');
    if (!row) return;
    const id = row.dataset.id;
    if (e.target.closest('[data-remove]')) {
      A.cart.remove(id);
      A.toast('Usunięto produkt z koszyka');
    }
    const step = e.target.closest('[data-step]');
    if (step) {
      const current = A.cart.items().find((i) => i.id === id).qty;
      A.cart.setQty(id, current + Number(step.dataset.step));
    }
  });

  root.addEventListener('change', (e) => {
    if (!e.target.matches('[data-qty]')) return;
    A.cart.setQty(e.target.closest('.cart-row').dataset.id, parseInt(e.target.value, 10) || 1);
  });

  document.addEventListener('agw:cart', render);
  render();
});
