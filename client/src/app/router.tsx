import { lazy, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import type { RouteObject } from 'react-router';
import { RootErrorBoundary } from './RootErrorBoundary';
import { RootLayout } from './RootLayout';
import { SiteLayout } from './SiteLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const DiscoverPage = lazy(() => import('../pages/DiscoverPage'));
const PlaceDetailsPage = lazy(() => import('../pages/PlaceDetailsPage'));
const TripCreatorPage = lazy(() => import('../pages/TripCreatorPage'));
const AiPlannerPage = lazy(() => import('../pages/AiPlannerPage'));
const TripPage = lazy(() => import('../pages/TripPage'));
const StayTransportPage = lazy(() => import('../pages/StayTransportPage'));
const AdminBookingsPage = lazy(() => import('../pages/AdminBookingsPage'));
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
            handle: {
              title: 'Cairo & Giza travel companion',
              description:
                'Explore the stories, landmarks, and culture that make Cairo unforgettable, with a catalog of places across Cairo and Giza.',
            },
          },
          {
            path: 'discover',
            element: <DiscoverPage />,
            handle: {
              title: 'Discover places',
              description:
                'Search and filter places across Cairo and Giza by name, area, category, and visit length.',
            },
          },
          {
            path: 'places/:slug',
            element: <PlaceDetailsPage />,
            handle: { title: 'Place details' },
          },
          {
            path: 'plan',
            element: <TripCreatorPage />,
            handle: {
              title: 'Plan a trip',
              description:
                'Shape a Cairo itinerary in six short steps, from dates and travelers to interests and preferences.',
            },
          },
          {
            path: 'ai-planner',
            element: <AiPlannerPage />,
            handle: {
              title: 'AI trip planner',
              description:
                'Get a day-by-day Egypt itinerary built only from the places in Discover. AI by Google Gemini, with a standard planner as backup.',
            },
          },
          {
            path: 'trip/:id',
            element: <TripPage />,
            handle: {
              title: 'Your trip',
              description:
                'Edit your itinerary built from the Cairo and Giza catalog. Changes save in this browser; no live prices or bookings.',
            },
          },
          {
            path: 'stay-transport',
            element: <StayTransportPage />,
            handle: { title: 'Stay & transport' },
          },
          {
            path: 'my-trip',
            element: (
              <ProtectedRoute>
                <MyTripPage />
              </ProtectedRoute>
            ),
            handle: {
              title: 'My trip',
              description:
                'Manage your Cairo expedition: upcoming countdown, schedule preview, selected stay, transfer requests, and travel budget.',
            },
          },
          {
            path: 'admin',
            element: (
              <ProtectedRoute>
                <AdminBookingsPage />
              </ProtectedRoute>
            ),
            handle: { title: 'Booking requests' },
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
