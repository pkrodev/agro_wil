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

  const rails = document.querySelector('[data-home-rails]');
  if (rails) {
    const bySale = PRODUCTS.filter((p) => p.oldPrice).sort((a, b) => A.discount(b) - A.discount(a));
    const best = PRODUCTS.slice().sort((a, b) => b.popularity - a.popularity).slice(0, 10);
    rails.innerHTML =
      A.carousel('Promocje', bySale, { action: '<a class="link-btn" href="sklep.html?promo=1">Wszystkie promocje</a>' }) +
      A.carousel('Najczęściej kupowane', best, { action: '<a class="link-btn" href="sklep.html">Zobacz cały sklep</a>' });
  }

  const recent = document.querySelector('[data-home-recent]');
  if (recent) recent.innerHTML = A.recentRail();
});
