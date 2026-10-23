// shop/shopify-config.js – połączenie sklepu z Shopify (instrukcja: SHOPIFY.md)
//
// domain – adres sklepu w Shopify, np. 'agrowil.myshopify.com'
// token  – PUBLICZNY token Storefront API z kanału „Headless” (nie token Admin API!).
//          Publiczny token jest przeznaczony do użycia w przeglądarce, więc może być w tym pliku.
//
// Dopóki `domain` jest puste, sklep działa w trybie pokazowym (zamówienia nie są wysyłane).

window.AGW_SHOPIFY_CONFIG = Object.assign({
  domain: '',
  token: '',
  apiVersion: '2026-07'
}, window.AGW_SHOPIFY_CONFIG);
