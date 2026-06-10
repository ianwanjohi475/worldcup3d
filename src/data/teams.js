/**
 * Projected 2026 field — 12 groups of 4 (fan-concept draw).
 * Ratings drive the Poisson simulator. `star.img` maps to
 * /assets/player-{img}.png; missing files fall back to the
 * procedural concept card automatically.
 */
export const TEAMS = [
  // GROUP A
  { id: 'mex', name: 'Mexico',        code: 'MEX', group: 'A', ovr: 81, atk: 81, def: 79, star: { name: 'Santiago Giménez', img: 'gimenez',  no: 9,  pose: 'striker' } },
  { id: 'sui', name: 'Switzerland',   code: 'SUI', group: 'A', ovr: 80, atk: 78, def: 82, star: { name: 'Granit Xhaka',     img: 'xhaka',    no: 10, pose: 'winger' } },
  { id: 'egy', name: 'Egypt',         code: 'EGY', group: 'A', ovr: 78, atk: 80, def: 75, star: { name: 'Mohamed Salah',    img: 'salah',    no: 11, pose: 'winger' }, featured: true },
  { id: 'nzl', name: 'New Zealand',   code: 'NZL', group: 'A', ovr: 69, atk: 68, def: 70, star: { name: 'Chris Wood',       img: 'wood',     no: 9,  pose: 'striker' } },
  // GROUP B
  { id: 'can', name: 'Canada',        code: 'CAN', group: 'B', ovr: 78, atk: 78, def: 76, star: { name: 'Alphonso Davies',  img: 'davies',   no: 19, pose: 'winger' } },
  { id: 'cro', name: 'Croatia',       code: 'CRO', group: 'B', ovr: 83, atk: 82, def: 83, star: { name: 'Luka Modrić',      img: 'modric',   no: 10, pose: 'winger' } },
  { id: 'civ', name: 'Ivory Coast',   code: 'CIV', group: 'B', ovr: 78, atk: 78, def: 77, star: { name: 'Franck Kessié',    img: 'kessie',   no: 8,  pose: 'striker' } },
  { id: 'qat', name: 'Qatar',         code: 'QAT', group: 'B', ovr: 71, atk: 71, def: 69, star: { name: 'Akram Afif',       img: 'afif',     no: 11, pose: 'winger' } },
  // GROUP C
  { id: 'bra', name: 'Brazil',        code: 'BRA', group: 'C', ovr: 89, atk: 91, def: 85, star: { name: 'Vinícius Júnior',  img: 'vini',     no: 7,  pose: 'winger' } },
  { id: 'aut', name: 'Austria',       code: 'AUT', group: 'C', ovr: 81, atk: 81, def: 80, star: { name: 'Marcel Sabitzer',  img: 'sabitzer', no: 9,  pose: 'striker' } },
  { id: 'tun', name: 'Tunisia',       code: 'TUN', group: 'C', ovr: 74, atk: 72, def: 76, star: { name: 'Youssef Msakni',   img: 'msakni',   no: 7,  pose: 'winger' } },
  { id: 'jor', name: 'Jordan',        code: 'JOR', group: 'C', ovr: 70, atk: 69, def: 70, star: { name: 'Musa Al-Taamari',  img: 'tamari',   no: 10, pose: 'winger' } },
  // GROUP D
  { id: 'usa', name: 'United States', code: 'USA', group: 'D', ovr: 80, atk: 79, def: 79, star: { name: 'Christian Pulisic', img: 'pulisic', no: 10, pose: 'winger' } },
  { id: 'ita', name: 'Italy',         code: 'ITA', group: 'D', ovr: 84, atk: 82, def: 86, star: { name: 'G. Donnarumma',    img: 'donnarumma', no: 1, pose: 'keeper' } },
  { id: 'alg', name: 'Algeria',       code: 'ALG', group: 'D', ovr: 77, atk: 78, def: 75, star: { name: 'Riyad Mahrez',     img: 'mahrez',   no: 7,  pose: 'winger' } },
  { id: 'cuw', name: 'Curaçao',       code: 'CUW', group: 'D', ovr: 68, atk: 66, def: 69, star: { name: 'Leandro Bacuna',   img: 'bacuna',   no: 7,  pose: 'striker' } },
  // GROUP E
  { id: 'esp', name: 'Spain',         code: 'ESP', group: 'E', ovr: 93, atk: 94, def: 90, star: { name: 'Lamine Yamal',     img: 'yamal',    no: 19, pose: 'winger' }, featured: true },
  { id: 'uru', name: 'Uruguay',       code: 'URU', group: 'E', ovr: 83, atk: 82, def: 84, star: { name: 'Federico Valverde', img: 'valverde', no: 15, pose: 'striker' } },
  { id: 'gha', name: 'Ghana',         code: 'GHA', group: 'E', ovr: 75, atk: 76, def: 73, star: { name: 'Mohammed Kudus',   img: 'kudus',    no: 20, pose: 'winger' } },
  { id: 'irq', name: 'Iraq',          code: 'IRQ', group: 'E', ovr: 70, atk: 69, def: 70, star: { name: 'Ali Al-Hamadi',    img: 'alhamadi', no: 9,  pose: 'striker' } },
  // GROUP F
  { id: 'fra', name: 'France',        code: 'FRA', group: 'F', ovr: 92, atk: 93, def: 89, star: { name: 'Kylian Mbappé',    img: 'mbappe',   no: 10, pose: 'striker' } },
  { id: 'kor', name: 'South Korea',   code: 'KOR', group: 'F', ovr: 78, atk: 80, def: 76, star: { name: 'Son Heung-min',    img: 'son',      no: 7,  pose: 'winger' } },
  { id: 'sco', name: 'Scotland',      code: 'SCO', group: 'F', ovr: 75, atk: 74, def: 76, star: { name: 'Scott McTominay',  img: 'mctominay', no: 8, pose: 'striker' } },
  { id: 'cpv', name: 'Cape Verde',    code: 'CPV', group: 'F', ovr: 70, atk: 69, def: 71, star: { name: 'Ryan Mendes',      img: 'mendes',   no: 10, pose: 'winger' } },
  // GROUP G
  { id: 'eng', name: 'England',       code: 'ENG', group: 'G', ovr: 90, atk: 91, def: 87, star: { name: 'Jude Bellingham',  img: 'bellingham', no: 10, pose: 'striker' } },
  { id: 'ecu', name: 'Ecuador',       code: 'ECU', group: 'G', ovr: 79, atk: 77, def: 81, star: { name: 'Moisés Caicedo',   img: 'caicedo',  no: 23, pose: 'striker' } },
  { id: 'nor', name: 'Norway',        code: 'NOR', group: 'G', ovr: 84, atk: 89, def: 78, star: { name: 'Erling Haaland',   img: 'haaland',  no: 9,  pose: 'striker' } },
  { id: 'hai', name: 'Haiti',         code: 'HAI', group: 'G', ovr: 68, atk: 68, def: 67, star: { name: 'Duckens Nazon',    img: 'nazon',    no: 9,  pose: 'striker' } },
  // GROUP H
  { id: 'arg', name: 'Argentina',     code: 'ARG', group: 'H', ovr: 92, atk: 92, def: 89, star: { name: 'Lionel Messi',     img: 'messi',    no: 10, pose: 'winger' } },
  { id: 'den', name: 'Denmark',       code: 'DEN', group: 'H', ovr: 81, atk: 80, def: 82, star: { name: 'Rasmus Højlund',   img: 'hojlund',  no: 9,  pose: 'striker' } },
  { id: 'rsa', name: 'South Africa',  code: 'RSA', group: 'H', ovr: 73, atk: 73, def: 72, star: { name: 'Lyle Foster',      img: 'foster',   no: 9,  pose: 'striker' } },
  { id: 'uzb', name: 'Uzbekistan',    code: 'UZB', group: 'H', ovr: 72, atk: 71, def: 73, star: { name: 'E. Shomurodov',    img: 'shomurodov', no: 9, pose: 'striker' } },
  // GROUP I
  { id: 'por', name: 'Portugal',      code: 'POR', group: 'I', ovr: 89, atk: 90, def: 85, star: { name: 'Cristiano Ronaldo', img: 'cr7',     no: 7,  pose: 'striker' } },
  { id: 'col', name: 'Colombia',      code: 'COL', group: 'I', ovr: 83, atk: 84, def: 82, star: { name: 'Luis Díaz',        img: 'diaz',     no: 7,  pose: 'winger' } },
  { id: 'tur', name: 'Türkiye',       code: 'TUR', group: 'I', ovr: 80, atk: 82, def: 77, star: { name: 'Arda Güler',       img: 'guler',    no: 10, pose: 'winger' } },
  { id: 'pan', name: 'Panama',        code: 'PAN', group: 'I', ovr: 71, atk: 70, def: 72, star: { name: 'A. Carrasquilla',  img: 'carrasquilla', no: 10, pose: 'winger' } },
  // GROUP J
  { id: 'ned', name: 'Netherlands',   code: 'NED', group: 'J', ovr: 87, atk: 86, def: 86, star: { name: 'Cody Gakpo',       img: 'gakpo',    no: 11, pose: 'winger' } },
  { id: 'jpn', name: 'Japan',         code: 'JPN', group: 'J', ovr: 81, atk: 82, def: 80, star: { name: 'Takefusa Kubo',    img: 'kubo',     no: 11, pose: 'winger' } },
  { id: 'pol', name: 'Poland',        code: 'POL', group: 'J', ovr: 78, atk: 79, def: 76, star: { name: 'R. Lewandowski',   img: 'lewandowski', no: 9, pose: 'striker' } },
  { id: 'cod', name: 'DR Congo',      code: 'COD', group: 'J', ovr: 72, atk: 72, def: 71, star: { name: 'Yoane Wissa',      img: 'wissa',    no: 9,  pose: 'striker' } },
  // GROUP K
  { id: 'ger', name: 'Germany',       code: 'GER', group: 'K', ovr: 87, atk: 88, def: 84, star: { name: 'Jamal Musiala',    img: 'musiala',  no: 10, pose: 'winger' } },
  { id: 'mar', name: 'Morocco',       code: 'MAR', group: 'K', ovr: 84, atk: 83, def: 86, star: { name: 'Achraf Hakimi',    img: 'hakimi',   no: 2,  pose: 'winger' } },
  { id: 'aus', name: 'Australia',     code: 'AUS', group: 'K', ovr: 75, atk: 73, def: 76, star: { name: 'Jackson Irvine',   img: 'irvine',   no: 22, pose: 'striker' } },
  { id: 'ksa', name: 'Saudi Arabia',  code: 'KSA', group: 'K', ovr: 73, atk: 72, def: 73, star: { name: 'Salem Al-Dawsari', img: 'aldawsari', no: 10, pose: 'winger' } },
  // GROUP L
  { id: 'bel', name: 'Belgium',       code: 'BEL', group: 'L', ovr: 84, atk: 85, def: 82, star: { name: 'Kevin De Bruyne',  img: 'debruyne', no: 7,  pose: 'winger' } },
  { id: 'sen', name: 'Senegal',       code: 'SEN', group: 'L', ovr: 80, atk: 81, def: 79, star: { name: 'Sadio Mané',       img: 'mane',     no: 10, pose: 'winger' } },
  { id: 'irn', name: 'Iran',          code: 'IRN', group: 'L', ovr: 76, atk: 76, def: 75, star: { name: 'Mehdi Taremi',     img: 'taremi',   no: 9,  pose: 'striker' } },
  { id: 'par', name: 'Paraguay',      code: 'PAR', group: 'L', ovr: 76, atk: 74, def: 78, star: { name: 'Miguel Almirón',   img: 'almiron',  no: 10, pose: 'winger' } },
];

export const GROUPS = 'ABCDEFGHIJKL'.split('').map((letter) => ({
  letter,
  teams: TEAMS.filter((t) => t.group === letter),
}));

export const byId = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

export const HOSTS = [
  {
    id: 'usa', name: 'United States', img: '/assets/host-usa.png',
    tag: 'The grand stage', venues: 11, matches: 78, marquee: 'Final · New York / New Jersey · July 19',
  },
  {
    id: 'mex', name: 'Mexico', img: '/assets/host-mexico.png',
    tag: 'Where it begins', venues: 3, matches: 13, marquee: 'Opening match · Estadio Azteca · June 11',
  },
  {
    id: 'can', name: 'Canada', img: '/assets/host-canada.png',
    tag: 'The northern lights', venues: 2, matches: 13, marquee: 'Vancouver & Toronto under the lights',
  },
];
