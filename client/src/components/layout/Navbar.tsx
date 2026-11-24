import { Link } from 'react-router';
import { cn } from '../../lib/cn';
import { useState, useId, useRef, useEffect } from 'react';

export interface SimpleNavbarProps {
  brandLabel?: string;
  brandHref?: string;
  links?: { label: string; to: string }[];
  className?: string;
}

export const SimpleNavbar = ({
  brandLabel = 'YourTrip',
  brandHref = '/',
  links = [
    { label: 'Discover', to: '/discover' },
    { label: 'My Trip', to: '/my-trip' },
    { label: 'Login', to: '/login' },
  ],
  className,
}: SimpleNavbarProps) => {
  return (
    <nav className={cn('bg-ovo-bg-base text-ovo-primary py-4 px-6 flex items-center justify-between', className)}>
      <Link to={brandHref} className="text-2xl font-bold">
        {brandLabel}
      </Link>
      <div className="space-x-4">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="hover:text-ovo-accent transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LayoutLinkComponent } from '../../lib/link';
import { Button, ButtonLink } from '../ui/Button';
import { CloseIcon, MenuIcon } from '../ui/icons';

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarCta {
  label: string;
  href: string;
}

export type NavbarPosition = 'fixed' | 'sticky' | 'static';

export interface NavbarProps {
  brandLabel: string;
  brandHref: string;
  links: readonly NavLink[];
  cta?: NavbarCta;
  ctaLinkComponent?: LayoutLinkComponent;
  actions?: ReactNode;
  ariaLabel: string;
  menuLabel: string;
  closeMenuLabel: string;
  position?: NavbarPosition;
  linkComponent?: LayoutLinkComponent;
  className?: string;
}

const positionClasses: Record<NavbarPosition, string> = {
  fixed: 'fixed inset-x-0 top-0',
  sticky: 'sticky top-0',
  static: '',
};

export function Navbar({
  brandLabel,
  brandHref,
  links,
  cta,
  ctaLinkComponent,
  actions,
  ariaLabel,
  menuLabel,
  closeMenuLabel,
  position = 'fixed',
  linkComponent,
  className,
}: NavbarProps) {
  const Link: LayoutLinkComponent = linkComponent ?? 'a';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const toggleWrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') {
        return;
      }

      setMenuOpen(false);
      toggleWrapperRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }

    function handlePointerDown(event: PointerEvent): void {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const handleChange = (): void => {
      if (desktop.matches) {
        setMenuOpen(false);
      }
    };

    desktop.addEventListener('change', handleChange);

    return () => {
      desktop.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        'z-50 pointer-events-none px-gutter-sm pt-space-sm lg:px-margin-lg',
        positionClasses[position],
        className,
      )}
    >
      <div className="pointer-events-auto mx-auto flex h-16 max-w-page items-center justify-between gap-space-md rounded-full border border-hairline bg-surface/90 px-space-md shadow-floating backdrop-blur-2xl transition-all duration-300 sm:px-space-lg">
        <Link
          href={brandHref}
          onClick={() => setMenuOpen(false)}
          className="group inline-flex min-w-0 shrink items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
        >
          <span className="truncate font-display text-[1.45rem] font-bold leading-none tracking-tight text-primary transition-colors group-hover:text-secondary">
            {brandLabel}
          </span>
          <span className="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
        </Link>

        <nav
          aria-label={ariaLabel}
          className="hidden items-center gap-1 rounded-full border border-hairline bg-surface-container-low/70 p-1 lg:flex"
        >
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              className={cn(
                'relative rounded-full px-space-md py-1.5 font-sans text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                link.active
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-primary',
              )}
            >
              {link.active && (
                <motion.span
                  layoutId="navbar-active-indicator"
                  className="absolute inset-0 rounded-full border border-hairline bg-surface shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {link.label}
                {link.active && (
                  <span className="size-1 rounded-full bg-secondary" aria-hidden="true" />
                )}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-space-sm">
          {actions ? (
            <div className="flex items-center gap-space-xs sm:gap-space-sm">{actions}</div>
          ) : null}

          {cta ? (
            <span className="hidden shrink-0 lg:block">
              <ButtonLink as={ctaLinkComponent} href={cta.href} size="sm">
                {cta.label}
              </ButtonLink>
            </span>
          ) : null}

          <span ref={toggleWrapperRef} className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              aria-label={menuOpen ? closeMenuLabel : menuLabel}
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? menuId : undefined}
              startIcon={menuOpen ? <CloseIcon /> : <MenuIcon />}
              onClick={() => setMenuOpen((current) => !current)}
            />
          </span>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mx-auto mt-space-sm max-w-page rounded-card border border-hairline bg-surface/95 p-space-md shadow-floating backdrop-blur-2xl lg:hidden"
          >
            <nav aria-label={ariaLabel} className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  aria-current={link.active ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex min-h-11 items-center justify-between rounded-xl px-space-md py-space-xs font-sans text-sm font-medium transition-colors hover:bg-surface-container-low hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                    link.active
                      ? 'bg-secondary/10 font-semibold text-primary'
                      : 'text-on-surface-variant',
                  )}
                >
                  <span>{link.label}</span>
                  {link.active && (
                    <span className="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
                  )}
                </Link>
              ))}
            </nav>

            {actions ? (
              <div className="mt-space-md flex items-center justify-between border-t border-hairline pt-space-md">
                {actions}
              </div>
            ) : null}

            {cta ? (
              <div className="mt-space-md border-t border-hairline pt-space-md">
                <ButtonLink
                  as={ctaLinkComponent}
                  href={cta.href}
                  size="md"
                  fullWidth
                  onClick={() => setMenuOpen(false)}
                >
                  {cta.label}
                </ButtonLink>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
