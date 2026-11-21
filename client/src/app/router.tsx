import { lazy, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import type { RouteObject } from 'react-router';
import { RootErrorBoundary } from './RootErrorBoundary';
import { RootLayout } from './RootLayout';
import { SiteLayout } from './SiteLayout';

const HomePage = lazy(() => import('../pages/HomePage'));
const DiscoverPage = lazy(() => import('../pages/DiscoverPage'));
const PlaceDetailsPage = lazy(() => import('../pages/PlaceDetailsPage'));
const TripCreatorPage = lazy(() => import('../pages/TripCreatorPage'));
const TripPage = lazy(() => import('../pages/TripPage'));
const StayTransportPage = lazy(() => import('../pages/StayTransportPage'));
const MyTripPage = lazy(() => import('../pages/MyTripPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
            handle: { title: 'Home' },
          },
          {
            path: 'discover',
            element: <DiscoverPage />,
            handle: { title: 'Discover' },
          },
          {
            path: 'places/:slug',
            element: <PlaceDetailsPage />,
            handle: { title: 'Place details' },
          },
          {
            path: 'plan',
            element: <TripCreatorPage />,
            handle: { title: 'Plan a trip' },
          },
          {
            path: 'trip/:id',
            element: <TripPage />,
            handle: { title: 'Your trip' },
          },
          {
            path: 'stay-transport',
            element: <StayTransportPage />,
            handle: { title: 'Stay & transport' },
          },
          {
            path: 'my-trip',
            element: <MyTripPage />,
            handle: { title: 'My trip' },
          },
          {
            path: 'login',
            element: <LoginPage />,
            handle: { title: 'Sign in' },
          },
          {
            path: 'register',
            element: <RegisterPage />,
            handle: { title: 'Create an account' },
          },
          {
            path: '*',
            element: <NotFoundPage />,
            handle: { title: 'Page not found' },
          },
        ],
      },
    ],
  },
];

if (import.meta.env.DEV) {
  routes.push({
    path: '/design-system',
    lazy: async () => {
      const { default: Component } = await import('../pages/DesignSystemPage');
      return { Component };
    },
    handle: { title: 'Design system' },
  });
}

export function AppRouter() {
  const [router] = useState(() => createBrowserRouter(routes));

  return <RouterProvider router={router} />;
}
