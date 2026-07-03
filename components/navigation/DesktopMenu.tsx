'use client';

import NavItem from './NavItem';

export interface NavLink {
  label: string;
  href: string;
}

interface DesktopMenuProps {
  links: NavLink[];
  currentPath: string;
}

export default function DesktopMenu({ links, currentPath }: DesktopMenuProps) {
  return (
    <nav className="hidden md:flex items-center h-full gap-1" aria-label="Main navigation">
      {links.map((link) => (
        <NavItem
          key={link.href}
          href={link.href}
          label={link.label}
          isActive={currentPath === link.href || currentPath.startsWith(link.href + '/')}
        />
      ))}
    </nav>
  );
}
