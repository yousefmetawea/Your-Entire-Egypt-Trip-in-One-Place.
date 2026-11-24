import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { usePageTitle } from '../hooks/usePageTitle';
import { RouteLoading } from './RouteLoading';
import { AuthProvider } from '../context/AuthContext';
import { CurtainTransition } from '../components/motion/CurtainTransition';

export function RootLayout() {
  usePageTitle();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface-container-low">
        <CurtainTransition />
        <a
          href="#main"
          className="sr-only fixed start-space-sm top-space-sm z-[60] rounded-full bg-primary px-space-md py-space-sm font-sans text-title-md text-on-primary focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-secondary"
        >
          Skip to content
        </a>

        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>

        <ScrollRestoration />
      </div>
    </AuthProvider>
  );
}
