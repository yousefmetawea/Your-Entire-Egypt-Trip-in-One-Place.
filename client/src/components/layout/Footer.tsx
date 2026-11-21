import type { FormEvent, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { LayoutLinkComponent } from '../../lib/link';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: readonly FooterLink[];
}

export interface FooterNewsletter {
  heading: string;
  description?: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  onSubmit: (email: string) => void;
  status?: ReactNode;
}

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  brandLabel: string;
  brandHref: string;
  description?: ReactNode;
  note?: ReactNode;
  columns?: readonly FooterColumn[];
  newsletter?: FooterNewsletter;
  legal?: ReactNode;
  metaLinks?: readonly FooterLink[];
  linkComponent?: LayoutLinkComponent;
}

export function Footer({
  brandLabel,
  brandHref,
  description,
  note,
  columns = [],
  newsletter,
  legal,
  metaLinks = [],
  linkComponent,
  className,
  ...rest
}: FooterProps) {
  const Link: LayoutLinkComponent = linkComponent ?? 'a';

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!newsletter) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '');

    if (!email) {
      return;
    }

    newsletter.onSubmit(email);
    form.reset();
  }

  const hasBottomBar = Boolean(legal) || metaLinks.length > 0;

  return (
    <footer
      className={cn(
        'w-full bg-surface pt-space-2xl pb-space-xl text-on-surface shadow-[0_-1px_12px_rgba(0,0,0,0.02)]',
        className,
      )}
      {...rest}
    >
      <div className="mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
        <div className="grid grid-cols-1 gap-gutter-lg pb-space-2xl md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-4">
            <Link
              href={brandHref}
              className="w-fit font-display text-headline-md leading-none tracking-tight text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
            >
              {brandLabel}
            </Link>

            {description ? (
              <p className="max-w-sm font-sans text-body-md text-on-surface-variant">
                {description}
              </p>
            ) : null}

            {note ? (
              <div className="flex items-center gap-space-sm pt-space-sm">
                <span className="size-2 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                <span className="font-sans text-label-md uppercase tracking-wider text-secondary">
                  {note}
                </span>
              </div>
            ) : null}
          </div>

          {columns.length > 0 ? (
            <div
              className={cn(
                'grid grid-cols-2 gap-space-lg',
                newsletter ? 'lg:col-span-4' : 'md:col-span-1 lg:col-span-8',
              )}
            >
              {columns.map((column) => (
                <div key={column.heading} className="flex flex-col gap-space-sm">
                  <h3 className="font-sans text-label-caps uppercase text-secondary">
                    {column.heading}
                  </h3>
                  <ul className="flex flex-col gap-space-xs">
                    {column.links.map((link) => (
                      <li key={`${link.href}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="font-sans text-body-sm text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}

          {newsletter ? (
            <div className="flex flex-col gap-space-md md:col-span-2 lg:col-span-4">
              <h3 className="font-sans text-label-caps uppercase text-secondary">
                {newsletter.heading}
              </h3>

              {newsletter.description ? (
                <p className="font-sans text-body-sm text-on-surface-variant">
                  {newsletter.description}
                </p>
              ) : null}

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex items-center gap-space-xs rounded-full bg-surface-container-low p-space-xs focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-secondary"
              >
                <Input
                  label={newsletter.emailLabel}
                  hideLabel
                  variant="bare"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder={newsletter.emailPlaceholder}
                  containerClassName="min-w-0 flex-1"
                />
                <Button type="submit" variant="bronze" size="sm">
                  {newsletter.submitLabel}
                </Button>
              </form>

              {newsletter.status ? (
                <p role="status" className="font-sans text-body-sm text-on-surface-variant">
                  {newsletter.status}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {hasBottomBar ? (
          <div className="flex flex-col items-start justify-between gap-space-md pt-space-lg font-sans text-body-sm text-on-surface-variant md:flex-row md:items-center">
            {legal ? <div>{legal}</div> : null}

            {metaLinks.length > 0 ? (
              <div className="flex flex-wrap items-center gap-space-lg font-sans text-label-caps uppercase">
                {metaLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
