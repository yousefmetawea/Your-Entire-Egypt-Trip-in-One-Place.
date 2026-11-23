import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../context/useAuth';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string })?.from || '/my-trip';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 md:py-24 min-h-[calc(100vh-16rem)] flex items-center justify-center">
      <Container className="max-w-md w-full px-4">
        <Card className="p-8 border border-neutral-200/80 shadow-md">
          <div className="mb-8 text-center">
            <span className="text-xs uppercase tracking-widest text-[#775928] font-medium block mb-2">
              Welcome back
            </span>
            <h1 className="text-3xl font-serif text-neutral-900 tracking-tight">
              Sign in to your journey
            </h1>
            <p className="text-sm text-neutral-600 mt-2">
              Access your personalized itineraries, bookings, and saved places.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full"
              />
            </div>

            <div>
              <Input
                id="login-password"
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 text-sm font-semibold tracking-wide"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-sm text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              state={{ from }}
              className="text-[#775928] font-semibold hover:underline"
            >
              Create one now
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
