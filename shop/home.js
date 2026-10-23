// shop/home.js – strona główna: produkt w promocji, kategorie, karuzele

document.addEventListener('DOMContentLoaded', () => {
  const A = window.AGW;
  const { PRODUCTS, fmt, esc, productUrl } = A;

  // Kafelek „Hit tygodnia” – produkt z największym rabatem
  const promoTile = document.querySelector('[data-home-promo]');
  const promo = PRODUCTS.filter((p) => p.oldPrice && p.stock > 0).sort((a, b) => A.discount(b) - A.discount(a))[0];
  if (promoTile && promo) {
    promoTile.href = productUrl(promo);
    promoTile.innerHTML = `${window.AGW_IMG(promo)}
      <span class="promo-tile__badge">-${A.discount(promo)}%</span>
      <span class="promo-tile__txt">
        <small>Hit tygodnia</small>
        <b>${esc(promo.name)}</b>
        <span class="price"><span class="price__now price__now--sale">${fmt(promo.price)}</span><s class="price__old">${fmt(promo.oldPrice)}</s></span>
      </span>`;
  }

  const cats = document.querySelector('[data-home-cats]');
  if (cats) cats.outerHTML = A.categoryTiles();

  const bySale = PRODUCTS.filter((p) => p.oldPrice).sort((a, b) => A.discount(b) - A.discount(a));
  const best = PRODUCTS.slice().sort((a, b) => b.popularity - a.popularity).slice(0, 10);
  const promoRail = document.querySelector('[data-home-promo-rail]');
  if (promoRail) promoRail.innerHTML = A.carousel('Promocje', bySale, { action: '<a class="link-btn" href="sklep.html?promo=1">Wszystkie promocje</a>' });
  const bestRail = document.querySelector('[data-home-best-rail]');
  if (bestRail) bestRail.innerHTML = A.carousel('Najczęściej kupowane', best, { action: '<a class="link-btn" href="sklep.html">Zobacz cały sklep</a>' });

  // ikony w pasku korzyści
  const pin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9.8" r="2.4" fill="currentColor"/></svg>';
  document.querySelectorAll('[data-ico]').forEach((el) => {
    el.innerHTML = el.dataset.ico === 'pin' ? pin : A.icon[el.dataset.ico];
  });

  const recent = document.querySelector('[data-home-recent]');
  const recentHtml = A.recentRail();
  if (recent && recentHtml) recent.innerHTML = recentHtml;
  else recent?.closest('.band')?.remove();
});
