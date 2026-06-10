/**
 * Lucide icon helper — official lucide SVG icon nodes rendered inline.
 * Usage: icon('arrow-right') → svg string, or mountIcons(root) to hydrate
 * every [data-icon] placeholder.
 */
import {
  createElement,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsRight,
  Crown,
  Github,
  Globe,
  Instagram,
  MapPin,
  Play,
  RotateCcw,
  Shield,
  Shuffle,
  Sparkles,
  Star,
  Swords,
  Timer,
  Trophy,
  Users,
  Youtube,
} from 'lucide';

const REGISTRY = {
  'arrow-right': ArrowRight,
  calendar: Calendar,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevrons-right': ChevronsRight,
  crown: Crown,
  github: Github,
  globe: Globe,
  instagram: Instagram,
  'map-pin': MapPin,
  play: Play,
  'rotate-ccw': RotateCcw,
  shield: Shield,
  shuffle: Shuffle,
  sparkles: Sparkles,
  star: Star,
  swords: Swords,
  timer: Timer,
  trophy: Trophy,
  users: Users,
  youtube: Youtube,
};

export function icon(name, { size = 24, strokeWidth = 1.8, cls = '' } = {}) {
  const node = REGISTRY[name];
  if (!node) return '';
  const svg = createElement(node);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('stroke-width', strokeWidth);
  svg.setAttribute('aria-hidden', 'true');
  if (cls) svg.setAttribute('class', cls);
  return svg.outerHTML;
}

/** Replace every <span data-icon="name"> placeholder with the inline SVG. */
export function mountIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((holder) => {
    const html = icon(holder.dataset.icon, { strokeWidth: 1.8 });
    if (html) holder.innerHTML = html;
  });
}
