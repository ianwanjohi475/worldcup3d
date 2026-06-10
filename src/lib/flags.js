/**
 * Stylized inline SVG flags for all 48 nations (60x40 viewBox).
 * Deliberately simplified marks that read at chip size.
 */
const W = 60, H = 40;

const star = (cx, cy, r, fill = '#fff', rot = 0) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5 + rot;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
};
const crescent = (cx, cy, r, fill = '#fff') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><circle cx="${cx + r * 0.42}" cy="${cy}" r="${r * 0.82}" fill="var(--flag-bg)"/>`;

const hStripes = (colors, widths) => {
  const ws = widths || colors.map(() => 1);
  const total = ws.reduce((a, b) => a + b, 0);
  let y = 0, out = '';
  colors.forEach((c, i) => {
    const hh = (ws[i] / total) * H;
    out += `<rect y="${y.toFixed(2)}" width="${W}" height="${(hh + 0.5).toFixed(2)}" fill="${c}"/>`;
    y += hh;
  });
  return out;
};
const vStripes = (colors, widths) => {
  const ws = widths || colors.map(() => 1);
  const total = ws.reduce((a, b) => a + b, 0);
  let x = 0, out = '';
  colors.forEach((c, i) => {
    const ww = (ws[i] / total) * W;
    out += `<rect x="${x.toFixed(2)}" width="${(ww + 0.5).toFixed(2)}" height="${H}" fill="${c}"/>`;
    x += ww;
  });
  return out;
};
const nordic = (bg, cross, inner) => {
  const c = `<rect x="16" width="${inner ? 11 : 9}" height="${H}" fill="${cross}"/><rect y="${inner ? 14.5 : 15.5}" width="${W}" height="${inner ? 11 : 9}" fill="${cross}"/>`;
  const ic = inner ? `<rect x="18.5" width="6" height="${H}" fill="${inner}"/><rect y="17" width="${W}" height="6" fill="${inner}"/>` : '';
  return `<rect width="${W}" height="${H}" fill="${bg}"/>${c}${ic}`;
};
const ukCanton = () => `
  <rect width="30" height="20" fill="#1F356E"/>
  <path d="M0 0 L30 20 M30 0 L0 20" stroke="#fff" stroke-width="4"/>
  <path d="M0 0 L30 20 M30 0 L0 20" stroke="#C8102E" stroke-width="1.8"/>
  <rect x="12.5" width="5" height="20" fill="#fff"/><rect y="7.5" width="30" height="5" fill="#fff"/>
  <rect x="13.6" width="2.8" height="20" fill="#C8102E"/><rect y="8.6" width="30" height="2.8" fill="#C8102E"/>`;

const F = {
  usa: () => {
    let s = '';
    for (let i = 0; i < 13; i++) s += `<rect y="${(i * H / 13).toFixed(2)}" width="${W}" height="${(H / 13 + 0.3).toFixed(2)}" fill="${i % 2 ? '#fff' : '#B22234'}"/>`;
    s += `<rect width="27" height="21.6" fill="#3C3B6E"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++)
      s += `<circle cx="${3.5 + c * 5}" cy="${3 + r * 5.2}" r="1.1" fill="#fff"/>`;
    return s;
  },
  mex: () => vStripes(['#006847', '#fff', '#CE1126']) +
    `<circle cx="30" cy="20" r="5.6" fill="none" stroke="#6B4A1B" stroke-width="1.4"/><circle cx="30" cy="20" r="2.4" fill="#6B4A1B"/>`,
  can: () => vStripes(['#D80621', '#fff', '#D80621'], [1, 2, 1]) +
    `<path transform="translate(30,20) scale(0.62)" d="M0,-13 L2.5,-6.5 L7.5,-8.5 L5.5,-3 L11,-1 L6.5,2.5 L8.5,7.5 L3,6 L2,12 L0,7.5 L-2,12 L-3,6 L-8.5,7.5 L-6.5,2.5 L-11,-1 L-5.5,-3 L-7.5,-8.5 L-2.5,-6.5 Z" fill="#D80621"/>`,
  bra: () => `<rect width="${W}" height="${H}" fill="#009C3B"/><path d="M30 5 L55 20 L30 35 L5 20 Z" fill="#FFDF00"/><circle cx="30" cy="20" r="8.6" fill="#002776"/><path d="M21.8 18 A 10 10 0 0 1 38.2 22" stroke="#fff" stroke-width="1.7" fill="none"/>`,
  arg: () => hStripes(['#74ACDF', '#fff', '#74ACDF']) + `<circle cx="30" cy="20" r="4.4" fill="#F6B40E"/><circle cx="30" cy="20" r="2.6" fill="#E8A33D"/>`,
  esp: () => hStripes(['#AA151B', '#F1BF00', '#AA151B'], [1, 2, 1]) + `<rect x="14" y="16" width="6" height="8" rx="1.2" fill="#AA151B" opacity="0.85"/>`,
  fra: () => vStripes(['#002395', '#fff', '#ED2939']),
  eng: () => `<rect width="${W}" height="${H}" fill="#fff"/><rect x="26" width="8" height="${H}" fill="#CE1124"/><rect y="16" width="${W}" height="8" fill="#CE1124"/>`,
  ger: () => hStripes(['#000', '#DD0000', '#FFCE00']),
  ned: () => hStripes(['#AE1C28', '#fff', '#21468B']),
  por: () => vStripes(['#046A38', '#DA291C'], [2, 3]) + `<circle cx="24" cy="20" r="6" fill="#FFE900" opacity="0.95"/><circle cx="24" cy="20" r="3.4" fill="#DA291C"/>`,
  bel: () => vStripes(['#000', '#FDDA24', '#EF3340']),
  cro: () => {
    let ch = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
      ch += `<rect x="${23 + c * 3.5}" y="${10 + r * 3.5}" width="3.5" height="3.5" fill="${(r + c) % 2 ? '#fff' : '#C8102E'}"/>`;
    return hStripes(['#C8102E', '#fff', '#012169']) + ch;
  },
  ita: () => vStripes(['#008C45', '#F4F9FF', '#CD212A']),
  sui: () => `<rect width="${W}" height="${H}" fill="#DA291C"/><rect x="26.5" y="9" width="7" height="22" fill="#fff"/><rect x="19" y="16.5" width="22" height="7" fill="#fff"/>`,
  aut: () => hStripes(['#ED2939', '#fff', '#ED2939']),
  pol: () => hStripes(['#fff', '#DC143C']),
  den: () => nordic('#C8102E', '#fff'),
  nor: () => nordic('#BA0C2F', '#fff', '#00205B'),
  sco: () => `<rect width="${W}" height="${H}" fill="#005EB8"/><path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" stroke-width="7"/>`,
  tur: () => `<rect width="${W}" height="${H}" fill="#E30A17"/><g style="--flag-bg:#E30A17">${crescent(25, 20, 8.4, '#fff')}</g>${star(36.5, 20, 4, '#fff', Math.PI / 10)}`,
  jpn: () => `<rect width="${W}" height="${H}" fill="#fff"/><circle cx="30" cy="20" r="9" fill="#BC002D"/>`,
  kor: () => `<rect width="${W}" height="${H}" fill="#fff"/><path d="M30 12 A8 8 0 0 1 30 28 A4 4 0 0 1 30 20 A4 4 0 0 0 30 12" fill="#CD2E3A"/><path d="M30 28 A8 8 0 0 1 30 12 A4 4 0 0 1 30 20 A4 4 0 0 0 30 28" fill="#0047A0"/><g stroke="#000" stroke-width="1.6"><path d="M12 9 L19 14 M11 11.5 L18 16.5 M10 14 L17 19"/><path d="M48 9 L41 14 M49 11.5 L42 16.5 M50 14 L43 19" transform="translate(0,12) scale(1,-1) translate(0,-31)"/></g>`,
  irn: () => hStripes(['#239F40', '#fff', '#DA0000']) + `<circle cx="30" cy="20" r="3.6" fill="none" stroke="#DA0000" stroke-width="1.6"/>`,
  irq: () => hStripes(['#CE1126', '#fff', '#000']) + `<path d="M20 21.5 Q23 16.5 26 20 Q28.5 23 31 19.5 Q33.5 16.5 36.5 20 Q38.5 22.5 40.5 19" stroke="#007A3D" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  ksa: () => `<rect width="${W}" height="${H}" fill="#165B33"/><path d="M14 17 Q30 13 46 17" stroke="#fff" stroke-width="2.4" fill="none"/><path d="M16 24 L44 24" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`,
  qat: () => {
    let serr = 'M22 0 ';
    for (let i = 0; i < 9; i++) serr += `L${i % 2 ? 22 : 15} ${((i + 1) * H / 9).toFixed(1)} `;
    return `<rect width="${W}" height="${H}" fill="#8A1538"/><path d="${serr} L0 ${H} L0 0 Z" fill="#fff"/>`;
  },
  uzb: () => hStripes(['#0099B5', '#CE1126', '#fff', '#CE1126', '#1EB53A'], [9, 1, 6, 1, 9]) +
    `<g style="--flag-bg:#0099B5">${crescent(10, 6, 4, '#fff')}</g>${star(20, 4, 1.6)}${star(25, 6.5, 1.6)}${star(30, 4, 1.6)}`,
  jor: () => hStripes(['#000', '#fff', '#007A3D']) + `<path d="M0 0 L26 20 L0 40 Z" fill="#CE1126"/>${star(9, 20, 3.4, '#fff')}`,
  aus: () => `<rect width="${W}" height="${H}" fill="#00247D"/>${ukCanton()}${star(45, 10, 4.4)}${star(40, 25, 2.6)}${star(50, 20, 2.6)}${star(45, 33, 2.6)}${star(15, 30, 3.6)}`,
  nzl: () => `<rect width="${W}" height="${H}" fill="#00247D"/>${ukCanton()}${star(45, 10, 3.4, '#CC142B')}${star(40, 22, 3, '#CC142B')}${star(50, 22, 3, '#CC142B')}${star(45, 32, 3, '#CC142B')}`,
  mar: () => `<rect width="${W}" height="${H}" fill="#C1272D"/><path d="M30 12 L32.4 18.5 L39.5 18.5 L33.8 22.8 L36 29.5 L30 25.4 L24 29.5 L26.2 22.8 L20.5 18.5 L27.6 18.5 Z" fill="none" stroke="#006233" stroke-width="1.7"/>`,
  sen: () => vStripes(['#00853F', '#FDEF42', '#E31B23']) + star(30, 20, 5.4, '#00853F'),
  egy: () => hStripes(['#CE1126', '#fff', '#000']) + `<circle cx="30" cy="20" r="3.8" fill="none" stroke="#C09300" stroke-width="1.5"/><circle cx="30" cy="20" r="1.4" fill="#C09300"/>`,
  alg: () => vStripes(['#006233', '#fff']) + `<g style="--flag-bg:#fff">${crescent(28, 20, 7.4, '#D21034')}</g>${star(34, 20, 3.4, '#D21034', Math.PI / 10)}`,
  tun: () => `<rect width="${W}" height="${H}" fill="#E70013"/><circle cx="30" cy="20" r="10" fill="#fff"/><g style="--flag-bg:#fff">${crescent(29, 20, 6.6, '#E70013')}</g>${star(32.5, 20, 3, '#E70013', Math.PI / 10)}`,
  civ: () => vStripes(['#FF8200', '#fff', '#009A44']),
  gha: () => hStripes(['#CE1126', '#FCD116', '#006B3F']) + star(30, 20, 5, '#000'),
  cpv: () => {
    let ring = '';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ring += star(22 + 7.5 * Math.cos(a), 26 + 7.5 * Math.sin(a), 1.5, '#FFCE00');
    }
    return hStripes(['#003893', '#fff', '#CF2027', '#fff', '#003893'], [22, 2, 2, 2, 12]) + ring;
  },
  rsa: () => `<rect width="${W}" height="20" fill="#E03C31"/><rect y="20" width="${W}" height="20" fill="#001489"/>
    <path d="M0 1 L26 20 L0 39" fill="none" stroke="#fff" stroke-width="13"/>
    <path d="M22 20 L${W} 20" stroke="#fff" stroke-width="14"/>
    <path d="M24 20 L${W} 20" stroke="#007749" stroke-width="8.5"/>
    <path d="M0 3.5 L23 20 L0 36.5" fill="none" stroke="#007749" stroke-width="8.5"/>
    <path d="M0 10 L14 20 L0 30 Z" fill="#000"/>
    <path d="M0 9 L14.5 20 L0 31" fill="none" stroke="#FFB81C" stroke-width="2.2"/>`,
  cod: () => `<rect width="${W}" height="${H}" fill="#007FFF"/><path d="M0 40 L60 8 L60 22 L0 54 Z" fill="#CE1021" stroke="#F7D618" stroke-width="3"/>${star(10, 8, 5, '#F7D618')}`,
  ecu: () => hStripes(['#FFDD00', '#034EA2', '#ED1C24'], [2, 1, 1]) + `<circle cx="30" cy="20" r="5" fill="#6B4A1B" opacity="0.9"/><circle cx="30" cy="20" r="5" fill="none" stroke="#FFDD00" stroke-width="1.2"/>`,
  col: () => hStripes(['#FCD116', '#003893', '#CE1126'], [2, 1, 1]),
  uru: () => {
    let s = '';
    for (let i = 0; i < 9; i++) s += `<rect y="${(i * H / 9).toFixed(2)}" width="${W}" height="${(H / 9 + 0.3).toFixed(2)}" fill="${i % 2 ? '#7B9FD4' : '#fff'}"/>`;
    return s + `<rect width="26" height="22.3" fill="#fff"/><circle cx="13" cy="11" r="5.6" fill="#F6B40E"/><circle cx="13" cy="11" r="3" fill="#E8A33D"/>`;
  },
  par: () => hStripes(['#D52B1E', '#fff', '#0038A8']) + `<circle cx="30" cy="20" r="4.6" fill="none" stroke="#6B8E23" stroke-width="1.3"/>${star(30, 20, 2.2, '#F6B40E')}`,
  pan: () => `<rect width="${W}" height="${H}" fill="#fff"/><rect x="30" width="30" height="20" fill="#DA121A"/><rect y="20" width="30" height="20" fill="#072357"/>${star(15, 10, 5, '#072357')}${star(45, 30, 5, '#DA121A')}`,
  cuw: () => `<rect width="${W}" height="${H}" fill="#002B7F"/><rect y="25" width="${W}" height="6.6" fill="#F9E814"/>${star(10, 8, 3.2)}${star(17, 13, 4.6)}`,
  hai: () => hStripes(['#00209F', '#D21034']) + `<rect x="23" y="14" width="14" height="12" rx="1.5" fill="#fff"/><path d="M27 23 L30 16.5 L33 23 Z" fill="#016A16"/>`,
};

export function flagSVG(code, cls = 'flag') {
  const draw = F[code];
  const inner = draw ? draw() : `<rect width="${W}" height="${H}" fill="#1A2030"/>`;
  return `<span class="${cls}" style="--flag-bg:#0B1020"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${code.toUpperCase()} flag"><defs><clipPath id="fc-${code}"><rect width="${W}" height="${H}" rx="2"/></clipPath></defs><g clip-path="url(#fc-${code})">${inner}</g><rect width="${W}" height="${H}" rx="2" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1"/></svg></span>`;
}
