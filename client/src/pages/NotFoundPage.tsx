import { Link } from 'react-router';
import { Container } from '../components/ui/Container';
import { Section } from '../components/ui/Section';

export default function NotFoundPage() {
  return (
    <Section tone="canvas" spacing="md" className="min-h-screen">
      <Container className="flex min-h-[60vh] flex-col justify-center">
        <p className="type-label text-secondary">404</p>
        <h1 className="type-headline mt-space-md">This page could not be found.</h1>
        <p className="type-body-lg mt-space-md max-w-xl text-on-surface-variant">
          The link may be outdated, or the page may have moved.
        </p>
        <Link
          to="/"
          className="type-button mt-space-lg inline-flex text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
        >
          Return home
        </Link>
      </Container>
    </Section>
  );
}
