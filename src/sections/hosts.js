import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HOSTS } from '../data/teams.js';
import { icon } from '../lib/icons.js';
import { el, isMobile, prefersReducedMotion, asset } from '../lib/utils.js';

/** GSAP horizontally-pinned host nation cards (stacked on mobile). */
export function initHosts() {
  const track = document.getElementById('hosts-track');
  const reduced = prefersReducedMotion();

  for (const host of HOSTS) {
    track.appendChild(el(`
      <article class="host-card" data-host="${host.id}">
        <div class="host-card__media"><img src="${asset(host.img)}" alt="${host.name} host stadium artwork" loading="lazy" /></div>
        <div class="host-card__veil"></div>
        <span class="host-card__tag">${icon('map-pin', { size: 13 })}${host.tag}</span>
        <div class="host-card__body">
          <h3 class="host-card__name">${host.name}</h3>
          <div class="host-card__stats">
            <span class="host-card__stat">${icon('map-pin', { size: 16 })}<b>${host.venues}</b>&nbsp;stadiums</span>
            <span class="host-card__stat">${icon('calendar', { size: 16 })}<b>${host.matches}</b>&nbsp;matches</span>
            <span class="host-card__stat">${icon('users', { size: 16 })}${host.marquee}</span>
          </div>
        </div>
      </article>
    `));
  }

  if (reduced || isMobile()) return;

  const pin = document.getElementById('hosts-pin');
  const getDistance = () => track.scrollWidth - innerWidth;

  gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  /* parallax inside each card while the track slides */
  track.querySelectorAll('.host-card img').forEach((img) => {
    gsap.fromTo(img, { xPercent: -7 }, {
      xPercent: 7,
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        scrub: true,
      },
    });
  });
}
