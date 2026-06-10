import { gsap } from 'gsap';
import { GROUPS, byId } from '../data/teams.js';
import { flagSVG } from '../lib/flags.js';
import { icon } from '../lib/icons.js';
import { el, mulberry32, prefersReducedMotion } from '../lib/utils.js';
import { lenis } from '../lib/scroll.js';

/* ================================================================== */
/* Engine                                                             */
/* ================================================================== */
function poisson(lambda, rng) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

const expectedGoals = (atk, def, rng) => {
  const lambda = 1.32 * Math.exp((atk - def) * 0.045) * (0.9 + rng() * 0.2);
  return Math.min(4.2, Math.max(0.22, lambda));
};

function shootout(a, b, rng) {
  const pk = (t) => Math.min(0.92, 0.74 + (t.ovr - 78) * 0.004);
  const seq = [];
  let sa = 0, sb = 0, round = 0;
  while (round < 5 || sa === sb) {
    round++;
    if (round > 11) { // sudden-death stalemate breaker
      if (rng() < 0.5) { sa++; seq.push([true, false]); } else { sb++; seq.push([false, true]); }
      break;
    }
    const ka = rng() < pk(a); if (ka) sa++;
    const kb = rng() < pk(b); if (kb) sb++;
    seq.push([ka, kb]);
  }
  return { sa, sb, seq, winner: sa > sb ? a : b };
}

function simMatch(a, b, { knockout = false, rng, scorers }) {
  const la = expectedGoals(a.atk, b.def, rng);
  const lb = expectedGoals(b.atk, a.def, rng);
  let ga = poisson(la, rng);
  let gb = poisson(lb, rng);
  let et = false, pens = null;

  if (knockout && ga === gb) {
    et = true;
    ga += poisson(la * 0.3, rng);
    gb += poisson(lb * 0.3, rng);
    if (ga === gb) pens = shootout(a, b, rng);
  }
  if (scorers) {
    // share of team goals credited to the star, by role
    const share = (t) => ({ striker: 0.52, winger: 0.42, keeper: 0.015 }[t.star.pose] ?? 0.4);
    for (let i = 0; i < ga; i++) if (rng() < share(a)) scorers.set(a.id, (scorers.get(a.id) || 0) + 1);
    for (let i = 0; i < gb; i++) if (rng() < share(b)) scorers.set(b.id, (scorers.get(b.id) || 0) + 1);
  }
  const winner = pens ? pens.winner : ga > gb ? a : gb > ga ? b : null;
  return { a, b, ga, gb, et, pens, winner };
}

function playGroups(rng, scorers) {
  return GROUPS.map(({ letter, teams }) => {
    const table = new Map(teams.map((t) => [t.id, { team: t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }]));
    const fixtures = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
    const matches = fixtures.map(([i, j]) => {
      const m = simMatch(teams[i], teams[j], { rng, scorers });
      const ra = table.get(m.a.id), rb = table.get(m.b.id);
      ra.p++; rb.p++;
      ra.gf += m.ga; ra.ga += m.gb;
      rb.gf += m.gb; rb.ga += m.ga;
      if (m.ga > m.gb) { ra.w++; rb.l++; ra.pts += 3; }
      else if (m.gb > m.ga) { rb.w++; ra.l++; rb.pts += 3; }
      else { ra.d++; rb.d++; ra.pts++; rb.pts++; }
      return m;
    });
    const standings = [...table.values()].sort((x, y) =>
      y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || y.team.ovr - x.team.ovr || rng() - 0.5);
    return { letter, standings, matches };
  });
}

const rankRows = (rows, rng) => [...rows].sort((x, y) =>
  y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || y.team.ovr - x.team.ovr || rng() - 0.5);

function buildR32(groupResults, rng) {
  const winners = rankRows(groupResults.map((g) => g.standings[0]), rng);
  const runners = rankRows(groupResults.map((g) => g.standings[1]), rng);
  const thirds = rankRows(groupResults.map((g) => g.standings[2]), rng).slice(0, 8);

  const W = winners.map((r) => r.team);
  const R = runners.map((r) => r.team);
  const T = thirds.map((r) => r.team);

  const avoid = (a, pool, i) => {
    if (a.group !== pool[i].group) return i;
    for (let j = 0; j < pool.length; j++) if (j !== i && pool[j].group !== a.group) return j;
    return i;
  };
  const takeT = (w) => { const i = avoid(w, T, T.length - 1); return T.splice(i, 1)[0]; };
  const lowR = R.slice(8);          // four weakest runners face winners 9-12
  const takeR = (w) => { const i = avoid(w, lowR, lowR.length - 1); return lowR.splice(i, 1)[0]; };

  const ties = [
    [W[0], takeT(W[0])], [W[8], takeR(W[8])], [W[4], takeT(W[4])], [R[1], R[6]],
    [W[2], takeT(W[2])], [W[10], takeR(W[10])], [W[6], takeT(W[6])], [R[3], R[4]],
    [W[1], takeT(W[1])], [W[9], takeR(W[9])], [W[5], takeT(W[5])], [R[2], R[5]],
    [W[3], takeT(W[3])], [W[11], takeR(W[11])], [W[7], takeT(W[7])], [R[0], R[7]],
  ];
  return { ties, qualified: { thirds: thirds.map((r) => r.team.id) } };
}

function playRound(pairs, rng, scorers) {
  return pairs.map(([a, b]) => simMatch(a, b, { knockout: true, rng, scorers }));
}

export function simulateTournament(seed) {
  const rng = mulberry32(seed);
  const scorers = new Map();
  const groups = playGroups(rng, scorers);
  const { ties, qualified } = buildR32(groups, rng);

  const r32 = playRound(ties, rng, scorers);
  const next = (ms) => {
    const out = [];
    for (let i = 0; i < ms.length; i += 2) out.push([ms[i].winner, ms[i + 1].winner]);
    return out;
  };
  const r16 = playRound(next(r32), rng, scorers);
  const qf = playRound(next(r16), rng, scorers);
  const sf = playRound(next(qf), rng, scorers);
  const bronze = playRound([[
    sf[0].winner === sf[0].a ? sf[0].b : sf[0].a,
    sf[1].winner === sf[1].a ? sf[1].b : sf[1].a,
  ]], rng, scorers)[0];
  const final = playRound([[sf[0].winner, sf[1].winner]], rng, scorers)[0];

  return { groups, qualified, rounds: { r32, r16, qf, sf }, bronze, final, champion: final.winner, scorers };
}

/* ================================================================== */
/* UI                                                                 */
/* ================================================================== */
const ROUND_DEFS = [
  ['r32', 'Round of 32', 16],
  ['r16', 'Round of 16', 8],
  ['qf', 'Quarter-finals', 4],
  ['sf', 'Semi-finals', 2],
  ['final', 'Final', 1],
];
const STAGE_ORDER = ['groups', 'r32', 'r16', 'qf', 'sf', 'final'];

export function initSimulator() {
  const reduced = prefersReducedMotion();
  const groupsEl = document.getElementById('sim-groups');
  const bracketWrap = document.getElementById('sim-bracket-wrap');
  const bracketEl = document.getElementById('sim-bracket');
  const championEl = document.getElementById('sim-champion');
  const championInfo = document.getElementById('sim-champion-info');
  const placeholder = document.getElementById('sim-placeholder');
  const stageChips = [...document.querySelectorAll('#sim-stages li')];

  const btnRun = document.getElementById('sim-run');
  const btnStep = document.getElementById('sim-step');
  const btnNext = document.getElementById('sim-next');
  const btnRerun = document.getElementById('sim-rerun');

  let result = null;
  let revealed = -1;          // index into STAGE_ORDER
  let stepping = false;
  let timeline = null;        // pending delayed calls for full-run mode
  let trophy = null;
  let trophyMod = null;

  /* ---------- builders ---------- */
  const tieEl = (roundKey, i) => el(`
    <div class="tie glass ${roundKey === 'final' ? 'tie--final' : ''}" data-round="${roundKey}" data-i="${i}">
      <div class="tie__row is-tbd"><span class="flag flag--ph"></span><span class="name">To be decided</span><span class="score">–</span></div>
      <div class="tie__row is-tbd"><span class="flag flag--ph"></span><span class="name">To be decided</span><span class="score">–</span></div>
    </div>`);

  function buildBracketSkeleton() {
    bracketEl.innerHTML = '';
    for (const [key, title, count] of ROUND_DEFS) {
      const col = el(`<div class="round" data-round="${key}"><div class="round__title">${title}</div><div class="round__ties"></div></div>`);
      const wrap = col.querySelector('.round__ties');
      for (let i = 0; i < count; i++) wrap.appendChild(tieEl(key, i));
      if (key === 'final') {
        const bronze = tieEl('bronze', 0);
        bronze.classList.add('tie--bronze');
        bronze.insertAdjacentHTML('afterbegin', '<div class="round__title" style="margin-bottom:6px">Bronze final</div>');
        wrap.appendChild(bronze);
      }
      bracketEl.appendChild(col);
    }
  }

  const rowHTML = (team, goals, isWinner, pens) => `
    <div class="tie__row ${isWinner ? 'is-winner' : ''}">
      ${flagSVG(team.id)}
      <span class="name">${team.name}</span>
      <span class="score">${goals}${pens != null ? ` <small>(${pens})</small>` : ''}</span>
    </div>`;

  function fillTie(node, match) {
    const pens = match.pens;
    node.innerHTML = `
      ${node.querySelector('.round__title')?.outerHTML || ''}
      ${rowHTML(match.a, match.ga, match.winner === match.a, pens ? pens.sa : null)}
      ${rowHTML(match.b, match.gb, match.winner === match.b, pens ? pens.sb : null)}
      ${pens ? `<div class="tie__note">${match.et ? 'AET · ' : ''}Pens<span class="tie__pens">${pens.seq.map(([ka, kb]) =>
        `<i class="${ka ? 'scored' : 'missed'}"></i>${kb === null ? '' : `<i class="${kb ? 'scored' : 'missed'}"></i>`}`).join('')}</span></div>`
        : match.et ? '<div class="tie__note">After extra time</div>' : ''}`;
    node.classList.add('is-filled');
  }

  function renderGroups() {
    groupsEl.innerHTML = '';
    for (const g of result.groups) {
      const card = el(`
        <div class="group-card glass">
          <div class="group-card__name">GROUP ${g.letter}<small>P · GD · PTS</small></div>
          <table>
            <thead><tr><th>Team</th><th>P</th><th>GD</th><th>Pts</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>`);
      const tbody = card.querySelector('tbody');
      g.standings.forEach((row, i) => {
        const qDirect = i < 2;
        const qThird = i === 2 && result.qualified.thirds.includes(row.team.id);
        const gd = row.gf - row.ga;
        tbody.insertAdjacentHTML('beforeend', `
          <tr class="${qDirect ? 'q-direct' : ''} ${qThird ? 'q-third' : ''}">
            <td><span class="t-team"><span class="t-pos">${i + 1}</span>${flagSVG(row.team.id)}${row.team.code}</span></td>
            <td>${row.p}</td>
            <td>${gd > 0 ? '+' : ''}${gd}</td>
            <td class="t-pts" data-pts="${row.pts}">0</td>
          </tr>`);
      });
      groupsEl.appendChild(card);
    }
    /* count the points up + stagger the cards in */
    const cards = groupsEl.querySelectorAll('.group-card');
    if (!reduced) {
      gsap.fromTo(cards, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.6, ease: 'power3.out' });
    }
    groupsEl.querySelectorAll('.t-pts').forEach((cell) => {
      const target = +cell.dataset.pts;
      if (reduced) { cell.textContent = target; return; }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.1, delay: 0.35, ease: 'power2.out',
        onUpdate: () => { cell.textContent = Math.round(obj.v); },
      });
    });
  }

  function revealRound(key) {
    const matches = key === 'final' ? [result.final] : result.rounds[key];
    const nodes = bracketEl.querySelectorAll(`.tie[data-round="${key}"]`);
    nodes.forEach((node, i) => fillTie(node, matches[i]));
    if (key === 'final') {
      const bronzeNode = bracketEl.querySelector('.tie[data-round="bronze"]');
      fillTie(bronzeNode, result.bronze);
    }
    if (!reduced) {
      gsap.fromTo(nodes, { autoAlpha: 0.2, x: -14 }, { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out' });
      bracketEl.querySelectorAll(`.tie[data-round="${key}"] .tie__pens i`).forEach((dot, i) => {
        gsap.to(dot, { scale: 1, duration: 0.3, delay: 0.6 + i * 0.14, ease: 'back.out(2.5)' });
      });
    } else {
      bracketEl.querySelectorAll('.tie__pens i').forEach((d) => (d.style.transform = 'scale(1)'));
    }
    /* keep the active round in view inside the horizontal scroller */
    const col = bracketEl.querySelector(`.round[data-round="${key}"]`);
    if (col) bracketWrap.scrollTo({ left: col.offsetLeft - 40, behavior: reduced ? 'auto' : 'smooth' });
  }

  async function revealChampion() {
    championEl.classList.remove('is-hidden');
    const team = result.champion;
    const boot = [...result.scorers.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 4);
    championInfo.innerHTML = `
      <span class="champ-label">${icon('crown', { size: 16 })}World champions</span>
      <div class="champ-name">${team.name}</div>
      ${flagSVG(team.id)}
      <div class="champ-meta">${result.final.a.name} ${result.final.ga}–${result.final.gb} ${result.final.b.name}${result.final.pens ? ` · ${result.final.pens.sa}–${result.final.pens.sb} on penalties` : result.final.et ? ' · after extra time' : ''}</div>
      <div class="champ-boot">${icon('trophy', { size: 14 })}Golden Boot —
        ${boot.map(([id, g]) => `<span><b>${byId[id].star.name}</b> ${g}</span>`).join(' ')}
      </div>`;
    if (!reduced) {
      gsap.fromTo(championEl, { clipPath: 'inset(8% 4% 8% 4% round 20px)', autoAlpha: 0 },
        { clipPath: 'inset(0% 0% 0% 0% round 20px)', autoAlpha: 1, duration: 1, ease: 'power4.out' });
    }
    if (!trophyMod) trophyMod = await import('../three/trophy.js');
    if (!trophy) trophy = trophyMod.initTrophy(document.getElementById('trophy-canvas'));
    setTimeout(() => trophy.burst(), reduced ? 0 : 900);
    if (lenis) lenis.scrollTo(championEl, { offset: -90, duration: 1.4 });
    else championEl.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  }

  /* ---------- stage sequencing ---------- */
  function setStageChip(idx) {
    stageChips.forEach((chip, i) => {
      chip.classList.toggle('is-done', i < idx);
      chip.classList.toggle('is-active', i === idx);
    });
  }

  function showStage(idx) {
    const key = STAGE_ORDER[idx];
    setStageChip(idx);
    if (key === 'groups') {
      placeholder.classList.add('is-hidden');
      groupsEl.classList.remove('is-hidden');
      bracketWrap.classList.add('is-hidden');
      championEl.classList.add('is-hidden');
      renderGroups();
    } else {
      if (bracketWrap.classList.contains('is-hidden')) {
        bracketWrap.classList.remove('is-hidden');
        if (!reduced) gsap.fromTo(bracketWrap, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      }
      revealRound(key);
      if (key === 'final') {
        stageChips.forEach((c) => c.classList.add('is-done'));
        setTimeout(() => revealChampion(), reduced ? 0 : 1100);
      }
    }
    revealed = idx;
  }

  function resetBoards() {
    timeline?.forEach((t) => t.kill());
    timeline = null;
    revealed = -1;
    groupsEl.classList.add('is-hidden');
    bracketWrap.classList.add('is-hidden');
    championEl.classList.add('is-hidden');
    placeholder.classList.remove('is-hidden');
    setStageChip(-1);
    buildBracketSkeleton();
  }

  function newSim() {
    result = simulateTournament((Math.random() * 2 ** 31) | 0);
  }

  function runFull() {
    resetBoards();
    newSim();
    stepping = false;
    btnNext.classList.add('is-hidden');
    btnRerun.classList.remove('is-hidden');
    const delays = reduced ? [0, 0.1, 0.2, 0.3, 0.4, 0.5] : [0, 2.6, 2.2, 2.0, 1.9, 2.0];
    let at = 0;
    timeline = STAGE_ORDER.map((_, i) => {
      at += delays[i];
      return gsap.delayedCall(at, () => showStage(i));
    });
    scrollToBoard();
  }

  function startStepping() {
    resetBoards();
    newSim();
    stepping = true;
    btnNext.classList.remove('is-hidden');
    btnRerun.classList.remove('is-hidden');
    showStage(0);
    scrollToBoard();
  }

  function scrollToBoard() {
    const target = document.getElementById('sim-stages');
    if (lenis) lenis.scrollTo(target, { offset: -110, duration: 1.1 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  btnRun.addEventListener('click', runFull);
  btnStep.addEventListener('click', startStepping);
  btnNext.addEventListener('click', () => {
    if (!result || revealed >= STAGE_ORDER.length - 1) return;
    showStage(revealed + 1);
  });
  btnRerun.addEventListener('click', () => (stepping ? startStepping() : runFull()));

  buildBracketSkeleton();
}
