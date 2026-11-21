import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { APP_NAME } from '../lib/app';
import { AppLink } from './AppLink';
import { RouteLoading } from './RouteLoading';

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
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const links = [
    {
      label: t('nav.discover'),
      href: '/discover',
      active: isActive(pathname, '/discover'),
    },
    {
      label: t('nav.plan'),
      href: '/plan',
      active: isActive(pathname, '/plan'),
    },
    {
      label: t('nav.stayTransport'),
      href: '/stay-transport',
      active: isActive(pathname, '/stay-transport'),
    },
    {
      label: t('nav.myTrip'),
      href: '/my-trip',
      active: isActive(pathname, '/my-trip'),
    },
  ];

  const footerColumns = [
    {
      heading: t('footer.exploreHeading'),
      links: [
        { label: t('footer.discover'), href: '/discover' },
        { label: t('footer.stayTransport'), href: '/stay-transport' },
      ],
    },
    {
      heading: t('footer.planHeading'),
      links: [
        { label: t('footer.plan'), href: '/plan' },
        { label: t('footer.myTrip'), href: '/my-trip' },
      ],
    },
    {
      heading: t('footer.accountHeading'),
      links: [
        { label: t('footer.signIn'), href: '/login' },
        { label: t('footer.createAccount'), href: '/register' },
      ],
    },
  ] as const;

  return (
    <>
      <Navbar
        brandLabel={APP_NAME}
        brandHref="/"
        links={links}
        cta={{ label: t('nav.planCta'), href: '/plan' }}
        ariaLabel={t('nav.mainLabel')}
        menuLabel={t('nav.openMenu')}
        closeMenuLabel={t('nav.closeMenu')}
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
        description={t('footer.description')}
        note={t('footer.note')}
        columns={footerColumns}
        legal={t('footer.legal')}
        linkComponent={AppLink}
      />
    </>
  );
}
