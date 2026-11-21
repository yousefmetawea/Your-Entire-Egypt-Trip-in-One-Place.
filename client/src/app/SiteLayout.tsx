import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { APP_NAME } from '../lib/app';
import { AppLink } from './AppLink';
import { RouteLoading } from './RouteLoading';

const footerColumns = [
  {
    heading: 'Explore',
    links: [
      { label: 'Discover', href: '/discover' },
      { label: 'Stay & Transport', href: '/stay-transport' },
    ],
  },
  {
    heading: 'Plan',
    links: [
      { label: 'Plan a Trip', href: '/plan' },
      { label: 'My Trip', href: '/my-trip' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
    ],
  },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === '/discover') {
    return pathname === '/discover' || pathname.startsWith('/places/');
  }

  if (href === '/plan') {
    return pathname === '/plan' || pathname.startsWith('/trip/');
  }

  return pathname === href;
}

export function SiteLayout() {
  const { pathname } = useLocation();
  const links = [
    {
      label: 'Discover',
      href: '/discover',
      active: isActive(pathname, '/discover'),
    },
    {
      label: 'Plan a Trip',
      href: '/plan',
      active: isActive(pathname, '/plan'),
    },
    {
      label: 'Stay & Transport',
      href: '/stay-transport',
      active: isActive(pathname, '/stay-transport'),
    },
    {
      label: 'My Trip',
      href: '/my-trip',
      active: isActive(pathname, '/my-trip'),
    },
  ];

  return (
    <>
      <Navbar
        brandLabel={APP_NAME}
        brandHref="/"
        links={links}
        cta={{ label: 'Plan My Trip', href: '/plan' }}
        ariaLabel="Main navigation"
        linkComponent={AppLink}
        ctaLinkComponent={AppLink}
      />

      <main id="main" className="pt-24 md:pt-28">
        <Suspense fallback={<RouteLoading fullScreen={false} />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer
        brandLabel={APP_NAME}
        brandHref="/"
        description="Discover places, shape a thoughtful itinerary, and keep the details of your Egypt trip together."
        note="Demo experience · No live bookings"
        columns={footerColumns}
        legal="© 2026 Discover Cairo. Demo experience; no live prices or availability."
        linkComponent={AppLink}
      />
    </>
  );
}
