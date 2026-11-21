import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';

export function RootErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main id="main">
      <Section tone="canvas" spacing="md" className="min-h-screen">
        <Container className="flex min-h-[60vh] flex-col justify-center">
          <p className="type-label text-secondary">{notFound ? '404' : 'Unexpected error'}</p>
          <h1 className="type-headline mt-space-md">
            {notFound ? 'This page could not be found.' : 'We could not load this page.'}
          </h1>
          <p className="type-body-lg mt-space-md max-w-xl text-on-surface-variant">
            {notFound
              ? 'The link may be outdated, or the page may have moved.'
              : 'Please try again. If the problem continues, return to the home page.'}
          </p>
          <Link
            to="/"
            className="type-button mt-space-lg inline-flex text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
          >
            Return home
          </Link>
        </Container>
      </Section>
    </main>
  );
}
