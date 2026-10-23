// shop/images.js – ilustracje produktów (SVG) do czasu wgrania prawdziwych zdjęć.
// Jeśli produkt ma zdjęcie w shop/photos.js, sklep pokaże zdjęcie zamiast ilustracji.

(() => {
  const STEEL = '#b9c0c4';
  const STEEL_D = '#7d878d';
  const DARK = '#1d1f1c';

  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
    const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };

  const label = (x, y, w, txt, size = 15) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${size + 16}" rx="4" fill="#fff" opacity=".92"/>` +
    `<text x="${x + w / 2}" y="${y + size + 4}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${size}" fill="${DARK}">${txt}</text>`;

  const draw = {
    filter(p) {
      const c = p.img.c || '#2f7a27';
      const h = p.img.h || 190;
      const top = 300 - h;
      return `
        <rect x="128" y="${top}" width="144" height="${h}" rx="16" fill="${c}"/>
        <rect x="128" y="${top}" width="40" height="${h}" rx="16" fill="${shade(c, 0.12)}" opacity=".7"/>
        <rect x="244" y="${top}" width="28" height="${h}" rx="14" fill="${shade(c, -0.18)}" opacity=".8"/>
        <rect x="122" y="${top - 12}" width="156" height="26" rx="10" fill="${shade(c, -0.25)}"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${130 + i * 18}" y="${top - 10}" width="6" height="22" fill="${shade(c, -0.38)}"/>`).join('')}
        ${label(140, top + h / 2 - 16, 120, p.sku, 14)}`;
    },
    airfilter(p) {
      const inner = p.img.inner;
      const w = inner ? 120 : 190;
      const x = 200 - w / 2;
      const pleats = Math.floor(w / 9);
      return `
        <rect x="${x}" y="78" width="${w}" height="232" rx="8" fill="${inner ? '#e6e9e1' : '#f1e6bf'}"/>
        ${Array.from({ length: pleats }, (_, i) => `<line x1="${x + 6 + i * 9}" y1="96" x2="${x + 6 + i * 9}" y2="292" stroke="${inner ? '#c3c9bd' : '#d6c588'}" stroke-width="3"/>`).join('')}
        <rect x="${x - 8}" y="62" width="${w + 16}" height="30" rx="8" fill="${DARK}"/>
        <rect x="${x - 8}" y="296" width="${w + 16}" height="30" rx="8" fill="${DARK}"/>
        <rect x="${x - 8}" y="62" width="${w + 16}" height="8" rx="4" fill="#3a3d38"/>
        ${label(200 - 58, 176, 116, p.sku, 14)}`;
    },
    cabin(p) {
      const zig = Array.from({ length: 15 }, (_, i) => `${92 + i * 15},${i % 2 ? 150 : 128}`).join(' ');
      const zig2 = Array.from({ length: 15 }, (_, i) => `${92 + i * 15},${i % 2 ? 276 : 254}`).join(' ');
      return `
        <path d="M80 140 L320 140 L320 286 L80 286 Z" fill="#2c2f2b"/>
        <path d="M88 148 L312 148 L312 278 L88 278 Z" fill="#4b4f49"/>
        ${Array.from({ length: 15 }, (_, i) => `<rect x="${90 + i * 15}" y="150" width="8" height="126" fill="#353834"/>`).join('')}
        <polyline points="${zig}" fill="none" stroke="#6b7068" stroke-width="3"/>
        <polyline points="${zig2}" fill="none" stroke="#6b7068" stroke-width="3"/>
        <rect x="70" y="128" width="260" height="14" rx="4" fill="#1b1c1a"/>
        ${label(140, 198, 120, p.sku, 14)}`;
    },
    jug(p) {
      const c = p.img.c;
      const s = p.img.small ? 0.82 : 1;
      const cap = p.img.cap || shade(c, -0.3);
      const txt = (c === '#f2c200' || c === '#e9e4d6') ? DARK : '#fff';
      return `<g transform="translate(200 210) scale(${s}) translate(-200 -210)">
        <path d="M118 108 L226 108 L246 84 L282 84 L282 330 Q282 340 272 340 L128 340 Q118 340 118 330 Z" fill="${c}"/>
        <path d="M118 108 L150 108 L150 340 L128 340 Q118 340 118 330 Z" fill="${shade(c, 0.1)}" opacity=".6"/>
        <path d="M226 108 L246 84 L282 84 L282 130 L262 130 L262 112 L240 112 Z" fill="${shade(c, -0.15)}"/>
        <rect x="150" y="80" width="46" height="30" rx="6" fill="${cap}"/>
        <rect x="136" y="170" width="128" height="120" rx="8" fill="${txt === '#fff' ? '#ffffff' : DARK}" opacity=".92"/>
        <text x="200" y="215" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${p.img.label.length > 10 ? 15 : 19}" fill="${txt === '#fff' ? DARK : '#fff'}">${p.img.label}</text>
        <rect x="160" y="232" width="80" height="8" rx="4" fill="${c}"/>
        <text x="200" y="272" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${txt === '#fff' ? '#555' : '#ddd'}">${p.specs['Pojemność'] || ''}</text>
      </g>`;
    },
    cartridge() {
      return `<g transform="rotate(-28 200 210)">
        <rect x="78" y="168" width="230" height="84" rx="10" fill="#2f7a27"/>
        <rect x="78" y="168" width="230" height="22" rx="10" fill="#3f9434"/>
        <rect x="302" y="176" width="22" height="68" rx="6" fill="#1f4f1a"/>
        <rect x="56" y="186" width="26" height="48" rx="6" fill="${STEEL_D}"/>
        <path d="M324 196 L362 204 L362 216 L324 224 Z" fill="${STEEL_D}"/>
        <rect x="120" y="182" width="140" height="56" rx="6" fill="#f2c200"/>
        <text x="190" y="216" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="16" fill="${DARK}">GREASE-GARD</text>
      </g>`;
    },
    belt() {
      const ribs = Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return `<line x1="${200 + Math.cos(a) * 128}" y1="${205 + Math.sin(a) * 74}" x2="${200 + Math.cos(a) * 146}" y2="${205 + Math.sin(a) * 90}" stroke="#3b3d3a" stroke-width="3"/>`;
      }).join('');
      return `
        <ellipse cx="200" cy="205" rx="150" ry="94" fill="none" stroke="#1d1f1c" stroke-width="26"/>
        ${ribs}
        <ellipse cx="200" cy="205" rx="124" ry="70" fill="none" stroke="#2c2e2b" stroke-width="4"/>
        <text x="200" y="212" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="15" fill="${STEEL_D}">8PK 2010</text>`;
    },
    bearing() {
      const balls = Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return `<circle cx="${200 + Math.cos(a) * 62}" cy="${200 + Math.sin(a) * 62}" r="15" fill="#e3e7ea" stroke="${STEEL_D}" stroke-width="2"/>`;
      }).join('');
      return `
        <rect x="70" y="150" width="260" height="100" rx="18" fill="#3a3d39"/>
        <circle cx="96" cy="200" r="12" fill="#1d1f1c"/><circle cx="304" cy="200" r="12" fill="#1d1f1c"/>
        <circle cx="200" cy="200" r="98" fill="#4a4e48"/>
        <circle cx="200" cy="200" r="84" fill="${STEEL}"/>
        <circle cx="200" cy="200" r="62" fill="none" stroke="#6d767b" stroke-width="30"/>
        ${balls}
        <circle cx="200" cy="200" r="44" fill="${STEEL}"/>
        <circle cx="200" cy="200" r="28" fill="#f4f6f2"/>`;
    },
    tensioner() {
      return `
        <path d="M118 270 L230 162 L256 188 L144 296 Z" fill="${DARK}"/>
        <circle cx="130" cy="283" r="30" fill="#2f3230"/><circle cx="130" cy="283" r="12" fill="${STEEL}"/>
        <circle cx="250" cy="170" r="84" fill="${STEEL}"/>
        <circle cx="250" cy="170" r="70" fill="#d7dcdf"/>
        ${[0, 1, 2, 3, 4].map(i => `<circle cx="250" cy="170" r="${66 - i * 4}" fill="none" stroke="#c3c9cd" stroke-width="1.5"/>`).join('')}
        <circle cx="250" cy="170" r="26" fill="${STEEL_D}"/>
        <circle cx="250" cy="170" r="11" fill="${DARK}"/>
        <path d="M150 230 q20 -40 50 -30 q-30 20 -20 50z" fill="#f2c200"/>`;
    },
    knife() {
      const secs = Array.from({ length: 5 }, (_, i) => {
        const x = 70 + i * 54;
        return `<path d="M${x} 230 L${x + 54} 230 L${x + 40} 150 L${x + 14} 150 Z" fill="${STEEL}" stroke="${STEEL_D}" stroke-width="2"/>
          <path d="M${x + 4} 226 L${x + 16} 156" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>
          <circle cx="${x + 20}" cy="214" r="4" fill="${STEEL_D}"/><circle cx="${x + 34}" cy="214" r="4" fill="${STEEL_D}"/>`;
      }).join('');
      return `<rect x="50" y="226" width="300" height="20" rx="3" fill="#3d403c"/>${secs}
        <text x="200" y="290" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="16" fill="${STEEL_D}">× 25</text>`;
    },
    guard() {
      const g = (x) => `<path d="M${x} 250 L${x + 60} 250 L${x + 52} 200 L${x + 38} 96 Q${x + 30} 80 ${x + 22} 96 L${x + 8} 200 Z" fill="#2b2e2a"/>
        <path d="M${x + 20} 200 L${x + 40} 200 L${x + 34} 120 L${x + 26} 120 Z" fill="#4a4e48"/>
        <circle cx="${x + 30}" cy="232" r="6" fill="${STEEL}"/>`;
      return `${[80, 150, 220].map(g).join('')}
        <rect x="70" y="250" width="232" height="16" rx="3" fill="#565a54"/>`;
    },
    netroll() {
      const lines = Array.from({ length: 12 }, (_, i) => `<line x1="${110 + i * 18}" y1="128" x2="${128 + i * 18}" y2="292" stroke="#d8f0c8" stroke-width="2" opacity=".7"/>`).join('');
      return `
        <rect x="100" y="120" width="220" height="180" fill="#4a9a2f"/>
        ${lines}
        <rect x="100" y="120" width="220" height="40" fill="#5bb33a" opacity=".6"/>
        <ellipse cx="100" cy="210" rx="30" ry="90" fill="#3b7f25"/>
        <ellipse cx="100" cy="210" rx="14" ry="42" fill="#f2c200"/>
        <ellipse cx="320" cy="210" rx="30" ry="90" fill="#3b7f25" opacity=".0"/>
        <rect x="180" y="190" width="120" height="40" rx="6" fill="#fff" opacity=".93"/>
        <text x="240" y="216" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="${DARK}">COVEREDGE</text>`;
    },
    coupler() {
      return `
        <rect x="96" y="176" width="58" height="48" rx="4" fill="${STEEL_D}"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="${100 + i * 11}" y="176" width="3" height="48" fill="#5c656a"/>`).join('')}
        <path d="M154 166 L190 152 L230 152 L230 248 L190 248 L154 234 Z" fill="${STEEL}"/>
        <path d="M154 166 L190 152 L230 152 L230 172 L154 180 Z" fill="#dfe3e6"/>
        <rect x="230" y="168" width="70" height="64" rx="6" fill="#c9cfd3"/>
        <rect x="296" y="180" width="30" height="40" rx="4" fill="${STEEL_D}"/>
        <rect x="314" y="170" width="44" height="60" rx="10" fill="#f2c200"/>
        <rect x="250" y="168" width="4" height="64" fill="${STEEL_D}"/>`;
    },
    hose() {
      return `
        <path d="M110 120 C 110 300, 290 110, 290 290" fill="none" stroke="#1d1f1c" stroke-width="34" stroke-linecap="round"/>
        <path d="M110 120 C 110 300, 290 110, 290 290" fill="none" stroke="#3a3d39" stroke-width="6" stroke-dasharray="10 12"/>
        <rect x="88" y="72" width="44" height="58" rx="6" fill="${STEEL}"/>
        <path d="M84 52 L136 52 L140 76 L80 76 Z" fill="${STEEL_D}"/>
        <rect x="268" y="270" width="44" height="58" rx="6" fill="${STEEL}"/>
        <path d="M264 328 L316 328 L320 352 L260 352 Z" fill="${STEEL_D}"/>
        <rect x="186" y="186" width="96" height="30" rx="5" fill="#fff" opacity=".9"/>
        <text x="234" y="206" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="${DARK}">2SN 1/2"</text>`;
    },
    lamp() {
      const dots = Array.from({ length: 8 }, (_, i) => `<circle cx="${132 + (i % 4) * 46}" cy="${178 + Math.floor(i / 4) * 52}" r="16" fill="#fffbe6" stroke="#f2c200" stroke-width="4"/>`).join('');
      return `
        <path d="M190 300 L210 300 L222 344 L178 344 Z" fill="${STEEL_D}"/>
        <rect x="150" y="336" width="100" height="12" rx="4" fill="#5c656a"/>
        <rect x="96" y="132" width="208" height="150" rx="22" fill="#1d1f1c"/>
        ${Array.from({ length: 9 }, (_, i) => `<rect x="${100 + i * 22}" y="126" width="10" height="10" rx="2" fill="#2f322e"/>`).join('')}
        <rect x="108" y="146" width="184" height="122" rx="14" fill="#e9eef0"/>
        ${dots}`;
    },
    sensor() {
      return `
        <rect x="186" y="250" width="28" height="50" fill="${STEEL}"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="186" y="${256 + i * 9}" width="28" height="3" fill="${STEEL_D}"/>`).join('')}
        <path d="M162 214 L176 196 L224 196 L238 214 L224 232 L176 232 Z" fill="${STEEL}"/>
        <rect x="174" y="250" width="52" height="0" fill="none"/>
        <rect x="170" y="230" width="60" height="22" fill="#a8b0b4"/>
        <rect x="176" y="120" width="48" height="80" rx="8" fill="#1d1f1c"/>
        <rect x="168" y="96" width="64" height="34" rx="6" fill="#2f322e"/>
        <path d="M232 112 C 290 112, 300 60, 340 70" fill="none" stroke="#1d1f1c" stroke-width="10" stroke-linecap="round"/>`;
    }
  };

  window.AGW_IMG = (p, variant = 'main') => {
    const photo = (window.AGW_PHOTOS || {})[p.id];
    if (photo) {
      return `<img src="${photo.src}" alt="${p.name.replace(/"/g, '&quot;')}" loading="lazy"${variant === 'zoom' ? ' class="img-zoom"' : ''}/>`;
    }
    const body = (draw[p.img.t] || draw.filter)(p);
    const zoom = variant === 'zoom' ? 'transform="translate(200 200) scale(1.55) translate(-200 -200)"' : '';
    const bg = variant === 'zoom' ? '#eef2ea' : '#f4f6f1';
    return `<svg viewBox="0 0 400 400" role="img" aria-label="${p.name.replace(/"/g, '&quot;')}" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="${bg}"/>
      <circle cx="200" cy="190" r="170" fill="#ffffff" opacity=".7"/>
      <ellipse cx="200" cy="360" rx="130" ry="14" fill="#000" opacity=".08"/>
      <g ${zoom}>${body}</g>
    </svg>`;
  };
})();
