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
  headline?: ReactNode;
  cta?: FooterLink;
  ghost?: string;
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
  headline,
  cta,
  ghost,
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
  const linkClass =
    'font-sans text-base font-medium text-on-primary transition-colors hover:text-[#b5e35a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-primary';

  return (
    <footer className={cn('relative w-full text-on-primary', className)} {...rest}>
      {/* Dunes and pyramids. Mirrors in RTL. The drawing keeps its own aspect ratio (never cropped
          from the top) and its ends run on flat, so any width shows the full pyramid tips. */}
      <div
        className="pointer-events-none relative w-full overflow-hidden pt-[72px] leading-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 320"
          overflow="visible"
          className="relative left-1/2 -mb-px block h-auto w-[clamp(720px,100%,1500px)] -translate-x-1/2 rtl:left-auto rtl:right-1/2 rtl:translate-x-1/2 rtl:-scale-x-100"
        >
          <path
            fill="currentColor"
            className="text-primary"
            d="M-2000 320V300H-600C-400 300 -200 286 0 250C120 214 230 176 340 196C430 212 500 246 600 236C700 226 760 190 860 180C980 168 1090 214 1180 226C1280 240 1360 222 1440 196C1520 170 1640 150 1800 160C1960 170 2200 200 2440 190H3440V320Z"
          />
          <path fill="currentColor" className="text-primary" d="M590 280L760 66L930 280Z" />
          <path fill="currentColor" className="text-primary" d="M430 280L548 142L690 280Z" />
          <path
            fill="currentColor"
            className="text-primary"
            d="M-2000 320V300H-500C-300 300 -150 296 0 282C160 252 300 262 440 276C600 292 700 262 860 258C1040 254 1240 286 1440 262C1600 248 1800 250 2000 262H3440V320Z"
          />
        </svg>

        {/* A small bird that glides across on its own. Motion lives in styles/base.css. */}
        <div className="footer-bird">
          <div className="footer-bird__bob">
            <svg viewBox="0 0 64 36" className="footer-bird__svg">
              <g className="footer-bird__wing footer-bird__wing--far">
                <path fill="currentColor" d="M35 19C34 10 29 2 19 -3C21 6 22 14 26 21Z" />
              </g>
              <path
                fill="currentColor"
                d="M3 17L13 20C20 18.5 27 18 33 17.5C38 16 42 14 46 14.5C48.5 12.5 52 13.5 52.5 16L62 18.5L52.5 20C51.5 22.5 46 25.5 38 25.5C30 26.5 20 25 13 22L3 24L6 20.5Z"
              />
              <g className="footer-bird__wing">
                <path fill="currentColor" d="M37 19C37 8 30 -3 13 -8C17 3 20 14 26 22Z" />
              </g>
              <circle cx="48.2" cy="16" r="0.9" fill="#f2f2f2" />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative -mt-px overflow-hidden bg-primary pt-space-xl pb-space-lg">
        <div className="relative z-10 mx-auto w-full max-w-page px-gutter-sm md:px-margin-md lg:px-margin-lg">
          {headline || cta ? (
            <div className="flex flex-col items-start justify-between gap-space-lg border-b border-hairline/40 pb-space-xl md:flex-row md:items-center">
              {headline ? (
                <p className="max-w-[18ch] font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.15] tracking-tight rtl:max-w-none rtl:tracking-normal">
                  {headline}
                </p>
              ) : null}
              {cta ? (
                <Link
                  href={cta.href}
                  className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-surface px-7 py-3.5 font-sans text-sm font-semibold text-primary transition-colors hover:bg-hairline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-primary"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-[#b5e35a]"
                    aria-hidden="true"
                  />
                  {cta.label}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0"
                  >
                    →
                  </span>
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-gutter-lg pt-space-xl pb-space-2xl lg:grid-cols-12">
            <div className="flex flex-col gap-space-md lg:col-span-5">
              <Link
                href={brandHref}
                className="group flex w-fit items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-primary"
              >
                <span className="font-display text-4xl font-bold tracking-tight text-on-primary transition-opacity group-hover:opacity-80 rtl:tracking-normal">
                  {brandLabel}
                </span>
              </Link>

              {description ? (
                <p className="max-w-sm font-sans text-body-md leading-relaxed text-hairline">
                  {description}
                </p>
              ) : null}

              {note ? (
                <div className="flex items-center gap-space-sm pt-space-xs">
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-[#b5e35a]"
                    aria-hidden="true"
                  />
                  <span className="font-sans text-xs font-semibold uppercase tracking-widest text-hairline rtl:tracking-normal">
                    {note}
                  </span>
                </div>
              ) : null}
            </div>

            {columns.length > 0 ? (
              <div
                className={cn(
                  'grid grid-cols-2 gap-space-lg sm:grid-cols-3',
                  newsletter ? 'lg:col-span-4' : 'lg:col-span-7',
                )}
              >
                {columns.map((column) => (
                  <div key={column.heading} className="flex flex-col gap-space-sm">
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-hairline rtl:tracking-normal">
                      {column.heading}
                    </h3>
                    <ul className="flex flex-col gap-space-sm">
                      {column.links.map((link) => (
                        <li key={`${link.href}-${link.label}`}>
                          <Link href={link.href} className={linkClass}>
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
              <div className="flex flex-col gap-space-md lg:col-span-3">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-hairline rtl:tracking-normal">
                  {newsletter.heading}
                </h3>

                {newsletter.description ? (
                  <p className="font-sans text-sm leading-relaxed text-hairline">
                    {newsletter.description}
                  </p>
                ) : null}

                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex items-center gap-space-xs rounded-full border border-hairline/50 bg-white p-1 focus-within:ring-2 focus-within:ring-white/40"
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
                    containerClassName="min-w-0 flex-1 px-3"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="rounded-full shrink-0"
                  >
                    {newsletter.submitLabel}
                  </Button>
                </form>

                {newsletter.status ? (
                  <p role="status" className="font-sans text-xs text-hairline">
                    {newsletter.status}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {hasBottomBar ? (
            <div className="flex flex-col items-start justify-between gap-space-md font-sans text-xs text-hairline md:flex-row md:items-center">
              {legal ? <div>{legal}</div> : null}

              {metaLinks.length > 0 ? (
                <div className="flex flex-wrap items-center gap-space-lg font-sans text-xs uppercase tracking-wider rtl:tracking-normal">
                  {metaLinks.map((link) => (
                    <Link
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      className="transition-colors hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {ghost ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[5vw] -end-[3vw] z-0 select-none whitespace-nowrap font-display text-[clamp(10rem,27vw,26rem)] font-bold leading-[0.8] tracking-tighter text-[#1a1a1a] rtl:tracking-normal"
          >
            {ghost}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
