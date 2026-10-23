// shop/shopify.js – Shopify Storefront API: ceny i stany z Shopify, kasa i płatności w Shopify Checkout.
// Opisy, specyfikacje, zdjęcia i rekomendacje zostają w shop/products.js – produkty łączymy po „handle”
// (w Shopify = pole `id` produktu z products.js, chyba że produkt ma własne `shopifyHandle`).

window.AGW_SHOP = (() => {
  const cfg = window.AGW_SHOPIFY_CONFIG || {};
  const enabled = Boolean(cfg.domain || cfg.endpoint);
  const endpoint = cfg.endpoint || `https://${cfg.domain}/api/${cfg.apiVersion}/graphql.json`;
  const CACHE_KEY = 'agw_shopify_catalog';
  const PENDING_KEY = 'agw_shopify_pending';
  const CACHE_MS = 5 * 60 * 1000;
  const TIMEOUT_MS = 6000;

  const state = { synced: false, error: null };

  const gql = async (query, variables = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (cfg.token) headers['X-Shopify-Storefront-Access-Token'] = cfg.token;
    const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
    if (!res.ok) throw new Error(`Shopify HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
    return json.data;
  };

  const session = {
    get(key) {
      try { return JSON.parse(sessionStorage.getItem(key)); } catch (e) { return null; }
    },
    set(key, value) {
      try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* brak zapisu – pobierzemy ponownie */ }
    }
  };
  const local = {
    get(key) {
      try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
    },
    set(key, value) {
      try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
      } catch (e) { /* tryb prywatny */ }
    }
  };

  const handleOf = (p) => p.shopifyHandle || p.id;

  // Jedno zapytanie po wszystkie produkty (aliasy p0, p1, …). quantityAvailable wymaga uprawnienia
  // „unauthenticated_read_product_inventory” – bez niego pytamy tylko o dostępność.
  const catalogQuery = (products, withQty) => `{
    ${products.map((p, i) => `p${i}: product(handle: ${JSON.stringify(handleOf(p))}) {
      variants(first: 1) { nodes { id availableForSale ${withQty ? 'quantityAvailable' : ''} price { amount } compareAtPrice { amount } } }
      lowest: metafield(namespace: "custom", key: "najnizsza_cena_30") { value }
    }`).join('\n')}
  }`;

  const fetchCatalog = async (products) => {
    try {
      return await gql(catalogQuery(products, true));
    } catch (e) {
      if (!/quantityAvailable|access|scope/i.test(e.message)) throw e;
      return gql(catalogQuery(products, false));
    }
  };

  const apply = (products, data) => {
    products.forEach((p, i) => {
      const node = data[`p${i}`];
      const v = node?.variants?.nodes?.[0];
      if (!v) {
        // brak produktu w Shopify – nie da się go kupić online, zostaje „zapytaj o termin”
        p.variantId = null;
        p.stock = 0;
        return;
      }
      const price = Number(v.price.amount);
      const compare = v.compareAtPrice ? Number(v.compareAtPrice.amount) : 0;
      const localPromoMatches = p.oldPrice === compare && p.price === price;
      p.variantId = v.id;
      p.price = price;
      p.oldPrice = compare > price ? compare : undefined;
      // Omnibus: najniższa cena z 30 dni – z metapola w Shopify albo z products.js, jeśli promocja się zgadza
      p.lowest30 = p.oldPrice ? (node.lowest?.value ? Number(node.lowest.value) : (localPromoMatches ? p.lowest30 : undefined)) : undefined;
      if (!v.availableForSale) p.stock = 0;
      else if (typeof v.quantityAvailable === 'number' && v.quantityAvailable > 0) p.stock = v.quantityAvailable;
      else p.stock = 99; // dostępny, ale stan nieznany / sprzedaż bez śledzenia stanów
    });
  };

  const sync = async () => {
    const products = window.AGW_PRODUCTS;
    const cached = session.get(CACHE_KEY);
    const data = cached && Date.now() - cached.at < CACHE_MS ? cached.data : await fetchCatalog(products);
    if (!cached || cached.data !== data) session.set(CACHE_KEY, { at: Date.now(), data });
    apply(products, data);
    state.synced = true;
  };

  const withTimeout = (promise) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Shopify nie odpowiada')), TIMEOUT_MS))
  ]);

  const ready = enabled
    ? withTimeout(sync()).catch((e) => {
      state.error = e.message;
      console.error('[AgroWil] Synchronizacja z Shopify nie powiodła się:', e);
    })
    : Promise.resolve();

  // Tworzy koszyk w Shopify i zwraca adres kasy (płatność, dostawa, potwierdzenie mailowe – po stronie Shopify)
  const checkout = async (items, note = '') => {
    if (!state.synced) throw new Error(state.error || 'Brak połączenia ze sklepem Shopify');
    const byId = (id) => window.AGW_PRODUCTS.find((p) => p.id === id);
    const missing = items.filter((i) => !byId(i.id)?.variantId);
    if (missing.length) throw new Error(`Niedostępne online: ${missing.map((i) => byId(i.id)?.name || i.id).join(', ')}`);

    const data = await gql(`mutation($input: CartInput!) {
      cartCreate(input: $input) { cart { id checkoutUrl } userErrors { field message } }
    }`, {
      input: {
        lines: items.map((i) => ({ merchandiseId: byId(i.id).variantId, quantity: i.qty })),
        note: note.trim() || undefined,
        attributes: [{ key: 'Źródło', value: 'Sklep www AgroWil' }]
      }
    });
    const { cart, userErrors } = data.cartCreate;
    if (userErrors.length) throw new Error(userErrors.map((e) => e.message).join('; '));
    local.set(PENDING_KEY, { id: cart.id, at: Date.now() });
    return cart.checkoutUrl;
  };

  // Po złożeniu zamówienia Shopify usuwa koszyk – wtedy czyścimy nasz koszyk w przeglądarce.
  const checkPending = async () => {
    const pending = local.get(PENDING_KEY);
    if (!enabled || !pending) return false;
    const data = await gql('query($id: ID!) { cart(id: $id) { id } }', { id: pending.id });
    if (data.cart) return false;
    local.set(PENDING_KEY, null);
    return true;
  };

  return { enabled, ready, state, checkout, checkPending };
})();
