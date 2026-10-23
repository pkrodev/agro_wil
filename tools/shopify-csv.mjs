// tools/shopify-csv.mjs – plik importu produktów do Shopify z shop/products.js
// Użycie:  node tools/shopify-csv.mjs  →  shopify/produkty-shopify.csv
// Format kolumn zgodny z oficjalnym wzorem Shopify (help.shopify.com/csv/product_template.csv).
// „URL handle” = id produktu – po nim sklep łączy nasze opisy z cenami i stanami z Shopify.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://pkrodev.github.io/agro_wil/'; // zdjęcia muszą być publicznie dostępne dla Shopify

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['shop/products.js', 'shop/photos.js']) vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), ctx);
const { AGW_PRODUCTS: products, AGW_CATEGORIES: categories, AGW_PHOTOS: photos } = ctx.window;

// Szacunkowa waga z opakowaniem (g) – potrzebna do stawek wysyłki; sprawdź przed startem.
const WEIGHT = {
  'filtr-oleju-re504836': 900, 'filtr-paliwa-re509036': 700, 'filtr-powietrza-re587793': 3500,
  'filtr-powietrza-re587794': 1200, 'filtr-hydrauliki-al221066': 1500, 'filtr-kabinowy-al176218': 600,
  'olej-plus-50-ii-20l': 18500, 'olej-hy-gard-20l': 18500, 'smar-grease-gard-400g': 450, 'plyn-cool-gard-ii-5l': 5600,
  'pasek-wielorowkowy-r520378': 400, 'lozysko-ah128208': 1500, 'napinacz-paska-re545004': 1800,
  'nozyki-listwy-h213174': 2500, 'palce-listwy-h153212': 1600, 'siatka-coveredge-123': 30000,
  'szybkozlacze-iso-12': 250, 'waz-hydrauliczny-12-15m': 900, 'lampa-led-2400': 1100, 'czujnik-cisnienia-re537665': 150
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const imageUrl = (p) => {
  if (photos[p.id]) return SITE_URL + photos[p.id].src;
  const png = `img/sklep/${p.id}.png`; // ilustracje wyrenderowane z SVG dla produktów bez zdjęcia
  return existsSync(join(ROOT, png)) ? SITE_URL + png : '';
};

const description = (p) => [
  `<p><strong>${esc(p.short)}</strong></p>`,
  ...p.desc.map((d) => `<p>${esc(d)}</p>`),
  '<table>',
  `<tr><th>Nr katalogowy</th><td>${esc(p.sku)}</td></tr>`,
  ...Object.entries(p.specs).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`),
  `<tr><th>Pasuje do</th><td>${p.fits.includes('*') ? 'uniwersalne' : esc(p.fits.join(', '))}</td></tr>`,
  '</table>'
].join('');

const HEADERS = [
  'Title', 'URL handle', 'Description', 'Vendor', 'Product category', 'Type', 'Tags', 'Published on online store', 'Status',
  'SKU', 'Option1 name', 'Option1 value', 'Price', 'Compare-at price', 'Charge tax',
  'Inventory tracker', 'Inventory quantity', 'Continue selling when out of stock',
  'Weight value (grams)', 'Weight unit for display', 'Requires shipping', 'Fulfillment service',
  'Product image URL', 'Image position', 'Image alt text', 'Gift card', 'SEO title', 'SEO description'
];

const rows = products.map((p) => {
  const cat = categories.find((c) => c.id === p.category);
  const img = imageUrl(p);
  return {
    'Title': p.name,
    'URL handle': p.shopifyHandle || p.id,
    'Description': description(p),
    'Vendor': p.sku.startsWith('AGW-') ? 'AgroWil' : 'John Deere',
    'Product category': '',
    'Type': cat.name,
    'Tags': [cat.name, ...(p.fits.includes('*') ? ['Uniwersalne'] : p.fits)].join(', '),
    'Published on online store': 'FALSE',
    'Status': 'Active',
    'SKU': p.sku,
    'Option1 name': 'Title',
    'Option1 value': 'Default Title',
    'Price': p.price.toFixed(2),
    'Compare-at price': p.oldPrice ? p.oldPrice.toFixed(2) : '',
    'Charge tax': 'TRUE',
    'Inventory tracker': 'shopify',
    'Inventory quantity': p.stock,
    'Continue selling when out of stock': 'DENY',
    'Weight value (grams)': WEIGHT[p.id] || 0,
    'Weight unit for display': 'kg',
    'Requires shipping': 'TRUE',
    'Fulfillment service': 'manual',
    'Product image URL': img,
    'Image position': img ? 1 : '',
    'Image alt text': img ? p.name : '',
    'Gift card': 'FALSE',
    'SEO title': `${p.name} | AgroWil`,
    'SEO description': p.short
  };
});

mkdirSync(join(ROOT, 'shopify'), { recursive: true });
const out = join(ROOT, 'shopify', 'produkty-shopify.csv');
writeFileSync(out, [HEADERS.join(','), ...rows.map((r) => HEADERS.map((h) => csvCell(r[h])).join(','))].join('\r\n') + '\r\n', 'utf8');
console.log(`Zapisano ${rows.length} produktów → ${out}`);
const noImg = rows.filter((r) => !r['Product image URL']).map((r) => r['URL handle']);
if (noImg.length) console.log('Bez zdjęcia:', noImg.join(', '));
