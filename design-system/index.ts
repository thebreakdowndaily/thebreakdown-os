/**
 * THE BREAKDOWN — Design System
 *
 * Single import point for the entire design system.
 *
 * Usage:
 *   import { Button, Card, Badge, Heading, Text, Container, Stack, Grid } from '@/design-system';
 *   import { tokens, colors, spacing, typography, animations, icons } from '@/design-system';
 *
 * Every component and token is exported from here.
 * No component should import from individual files — always use this barrel.
 */

// ── Tokens ──────────────────────────────────────────────────────────────
export {
  palette,
  semantic,
  fonts,
  typeScale,
  headingScale,
  fontWeight,
  spacingScale,
  spacingLayout,
  borderRadius,
  borderWidth,
  borders,
  shadows,
  motionDuration,
  motionEasing,
  motionKeyframes,
  motionTransitions,
  breakpoints,
  mediaQuery,
  zIndex,
  opacity,
} from './tokens';

// ── Tokens CSS (side-effect import) ─────────────────────────────────────
import './tokens.css';

// ── Components ──────────────────────────────────────────────────────────
export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';

export { Card } from './components/Card';
export type { CardProps, CardVariant, CardPadding } from './components/Card';

export { Badge } from './components/Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './components/Badge';

export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';

export { Link } from './components/Link';
export type { LinkProps, LinkVariant } from './components/Link';

export { Heading } from './components/Heading';
export type { HeadingProps, HeadingLevel, HeadingVariant } from './components/Heading';

export { Text } from './components/Text';
export type { TextProps, TextSize } from './components/Text';

export { Container } from './components/Container';
export type { ContainerProps, ContainerSize } from './components/Container';

export { Stack } from './components/Stack';
export type { StackProps, StackDirection, StackGap } from './components/Stack';

export { Grid } from './components/Grid';
export type { GridProps, GridColumns } from './components/Grid';

export { Divider } from './components/Divider';
export type { DividerProps } from './components/Divider';

export { Skeleton } from './components/Skeleton';
export type { SkeletonProps, SkeletonVariant } from './components/Skeleton';

export { Icon } from './components/Icon';
export type { IconProps, IconSize } from './components/Icon';

// ── Icons ───────────────────────────────────────────────────────────────
export {
  Search,
  Menu,
  Close,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Clock,
  Star,
  Share,
  Bookmark,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Info,
  Mail,
  Globe,
  Home,
  TrendingUp,
  Shield,
  TheBreakdownLogo,
  iconMap,
} from './icons';
export type { IconName } from './icons';
