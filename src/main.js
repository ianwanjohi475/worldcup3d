import './styles/base.css';
import './styles/sections.css';
import './styles/components.css';

import { mountIcons } from './lib/icons.js';
import { prefersReducedMotion } from './lib/utils.js';
import { initScroll } from './lib/scroll.js';
import { initCursor, initMagnetic } from './lib/cursor.js';
import { runPreloader } from './sections/preloader.js';
import { initHero } from './sections/hero.js';
import { initHosts } from './sections/hosts.js';
import { initTeams } from './sections/teams.js';
import { initSimulator } from './sections/simulator.js';
import { initAtmosphere } from './sections/atmosphere.js';
import { initFooter } from './sections/footer.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (prefersReducedMotion()) document.documentElement.classList.add('reduced-motion');

mountIcons();

const preloaderDone = runPreloader();

const hero = initHero();
initScroll();
initCursor();
initMagnetic();
initHosts();
initSimulator();
initAtmosphere();
initFooter();

initTeams().then(() => ScrollTrigger.refresh());

preloaderDone.then(() => {
  hero.enter();
  ScrollTrigger.refresh();
});
