import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
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
        'z-50 px-gutter-sm pt-space-sm lg:px-margin-lg',
        positionClasses[position],
        className,
      )}
    >
      <div className="mx-auto flex h-20 max-w-page items-center justify-between gap-space-md rounded-full bg-surface/85 px-space-md shadow-floating backdrop-blur-xl sm:px-space-lg">
        <Link
          href={brandHref}
          onClick={() => setMenuOpen(false)}
          className="inline-flex min-w-0 shrink items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
        >
          <span className="truncate font-display text-[1.55rem] leading-none tracking-tight text-primary">
            {brandLabel}
          </span>
        </Link>

        <nav aria-label={ariaLabel} className="hidden items-center gap-space-lg lg:flex">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              className={cn(
                'group relative py-1 font-sans text-title-md transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary',
                link.active ? 'font-semibold text-primary' : 'text-on-surface-variant',
              )}
            >
              {link.label}
              {link.active ? (
                <span
                  className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-secondary transition-all"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="absolute inset-x-0 -bottom-1 h-0.5 scale-x-0 rounded-full bg-secondary/70 transition-transform duration-200 group-hover:scale-x-100"
                  aria-hidden="true"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-space-sm">
          {actions ? <div className="flex items-center gap-space-sm">{actions}</div> : null}

          {cta ? (
            <span className="hidden shrink-0 lg:block">
              <ButtonLink as={ctaLinkComponent} href={cta.href} size="md">
                {cta.label}
              </ButtonLink>
            </span>
          ) : null}

          <span ref={toggleWrapperRef} className="lg:hidden">
            <Button
              variant="ghost"
              size="md"
              aria-label={menuOpen ? closeMenuLabel : menuLabel}
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? menuId : undefined}
              startIcon={menuOpen ? <CloseIcon /> : <MenuIcon />}
              onClick={() => setMenuOpen((current) => !current)}
            />
          </span>
        </div>
      </div>

      {menuOpen ? (
        <div
          id={menuId}
          className="mx-auto mt-space-sm max-w-page rounded-card border border-hairline bg-surface/95 p-space-md shadow-floating backdrop-blur-xl lg:hidden"
        >
          <nav aria-label={ariaLabel} className="flex flex-col">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                aria-current={link.active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex min-h-12 items-center rounded-xl px-space-sm py-space-sm font-sans text-title-md transition-colors hover:bg-surface-container-low hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                  link.active
                    ? 'bg-secondary/10 text-primary font-semibold'
                    : 'text-on-surface-variant',
                )}
              >
                {link.label}
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
        </div>
      ) : null}
    </header>
  );
}
