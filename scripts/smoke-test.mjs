/**
 * Headless runtime smoke test: loads the built site, collects console
 * errors, exercises the simulator end-to-end, captures screenshots.
 * Dev-only helper, not part of the build.
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
mkdirSync('shots', { recursive: true });

const exe = process.env.CHROME_BIN || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browser = await chromium.launch({
  executablePath: exe,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(3200); // preloader + hero intro
await page.screenshot({ path: 'shots/01-hero.png' });

// teams section
await page.evaluate(() => document.getElementById('teams').scrollIntoView());
await page.waitForTimeout(1600);
await page.screenshot({ path: 'shots/02-teams.png' });

// run the simulator (full)
await page.evaluate(() => document.getElementById('simulator').scrollIntoView());
await page.waitForTimeout(800);
await page.click('#sim-run');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'shots/03-groups.png' });
await page.waitForTimeout(11000); // let all rounds reveal + champion
await page.screenshot({ path: 'shots/04-champion.png', fullPage: false });

const champ = await page.textContent('#sim-champion-info').catch(() => null);
console.log('CHAMPION PANEL:', champ ? champ.replace(/\s+/g, ' ').slice(0, 160) : 'NOT RENDERED');

// atmosphere
await page.evaluate(() => document.getElementById('atmosphere').scrollIntoView());
await page.waitForTimeout(2600);
await page.screenshot({ path: 'shots/05-atmosphere.png' });

// hosts (scroll back up; pinned section)
await page.evaluate(() => document.getElementById('hosts').scrollIntoView());
await page.waitForTimeout(1200);
await page.screenshot({ path: 'shots/06-hosts.png' });

console.log(errors.length ? `CONSOLE ERRORS (${errors.length}):\n${[...new Set(errors)].slice(0, 12).join('\n')}` : 'NO CONSOLE ERRORS');
await browser.close();
process.exit(0);
