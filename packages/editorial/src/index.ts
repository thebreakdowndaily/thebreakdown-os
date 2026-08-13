/**
 * THE BREAKDOWN — Editorial Foundation Capability
 * 
 * Provides common page structures, headers, navigation rails, and shortcuts.
 */

export { default as EditorialLayout } from './layout/EditorialLayout';
export { default as EditorialHeader } from './header/EditorialHeader';
export { default as ReadingProgress } from './progress/ReadingProgress';
export { default as SkipLink } from './accessibility/SkipLink';

export { default as Breadcrumb } from './navigation/Breadcrumb';
export type { BreadcrumbItem } from './navigation/Breadcrumb';

export { default as CommandPalette } from './navigation/CommandPalette';
