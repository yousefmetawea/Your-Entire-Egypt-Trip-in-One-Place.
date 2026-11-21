import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ButtonLink } from '../ui/Button';

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
  actions?: ReactNode;
  ariaLabel: string;
  position?: NavbarPosition;
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
  actions,
  ariaLabel,
  position = 'fixed',
  className,
}: NavbarProps) {
  return (
    <header
      className={cn(
        'z-50 px-gutter-sm pt-space-sm lg:px-margin-lg',
        positionClasses[position],
        className,
      )}
    >
      <div className="mx-auto flex h-20 max-w-page items-center justify-between gap-space-md rounded-full bg-surface/85 px-space-md shadow-floating backdrop-blur-xl sm:px-space-lg">
        <a
          href={brandHref}
          className="inline-flex min-w-0 shrink items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
        >
          <span className="truncate font-display text-[1.55rem] leading-none tracking-tight text-primary">
            {brandLabel}
          </span>
        </a>

        <nav aria-label={ariaLabel} className="hidden items-center gap-space-xl lg:flex">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              className={cn(
                'font-sans text-title-md transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary',
                link.active ? 'text-primary' : 'text-on-surface-variant',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-space-md">
          {actions ? (
            <div className="hidden items-center gap-space-md md:flex">{actions}</div>
          ) : null}

          {cta ? (
            <>
              <span className="shrink-0 sm:hidden">
                <ButtonLink href={cta.href} size="sm">
                  {cta.label}
                </ButtonLink>
              </span>
              <span className="hidden shrink-0 sm:block">
                <ButtonLink href={cta.href} size="md">
                  {cta.label}
                </ButtonLink>
              </span>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
