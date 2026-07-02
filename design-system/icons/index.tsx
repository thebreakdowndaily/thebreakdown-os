/**
 * THE BREAKDOWN — Icon System
 *
 * All SVG icons used across the site.
 * Every icon is a created via createIcon() for consistent sizing/api.
 * Icons use Feather-style 24x24 viewBox with stroke-based rendering.
 */

import { createIcon } from '../components/Icon/createIcon';

export const Search = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </>
);

export const Menu = createIcon(
  <>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </>
);

export const Close = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);

export const ArrowRight = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>
);

export const ArrowLeft = createIcon(
  <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>
);

export const ExternalLink = createIcon(
  <>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </>
);

export const Clock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

export const Star = createIcon(
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
);

export const Share = createIcon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>
);

export const Bookmark = createIcon(
  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
);

export const Download = createIcon(
  <>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>
);

export const Filter = createIcon(
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
);

export const ChevronDown = createIcon(
  <polyline points="6 9 12 15 18 9" />
);

export const ChevronUp = createIcon(
  <polyline points="18 15 12 9 6 15" />
);

export const ChevronRight = createIcon(
  <polyline points="9 18 15 12 9 6" />
);

export const ChevronLeft = createIcon(
  <polyline points="15 18 9 12 15 6" />
);

export const Check = createIcon(
  <polyline points="20 6 9 17 4 12" />
);

export const AlertTriangle = createIcon(
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>
);

export const Info = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>
);

export const Mail = createIcon(
  <>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </>
);

export const Globe = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </>
);

export const Home = createIcon(
  <>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>
);

export const TrendingUp = createIcon(
  <>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </>
);

export const Shield = createIcon(
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
);

export const TheBreakdownLogo = createIcon(
  <>
    {/* Simplified logo mark — a stylized 'B' with bolt */}
    <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth="1.5" />
    <path d="M8 8h5a2.5 2.5 0 010 5H8z" strokeWidth="1.5" />
    <path d="M13 13l3 6" strokeWidth="2" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
  </>
);

// Default export for dynamic icon resolution
export const iconMap = {
  search: Search,
  menu: Menu,
  close: Close,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'external-link': ExternalLink,
  clock: Clock,
  star: Star,
  share: Share,
  bookmark: Bookmark,
  download: Download,
  filter: Filter,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  check: Check,
  'alert-triangle': AlertTriangle,
  info: Info,
  mail: Mail,
  globe: Globe,
  home: Home,
  'trending-up': TrendingUp,
  shield: Shield,
  logo: TheBreakdownLogo,
} as const;

export type IconName = keyof typeof iconMap;
