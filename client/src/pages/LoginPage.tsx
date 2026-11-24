import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SplitText } from '../components/motion/SplitText';

export default function LoginPage() {
  const { t } = useTranslation();
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
    <div className="min-h-[calc(100vh-16rem)] py-space-xl md:py-space-2xl">
      <Container className="max-w-5xl">
        <div className="grid grid-cols-1 items-center gap-gutter-lg lg:grid-cols-12">
          {/* Visual Showcase Side (Editorial Clean Photography) */}
          <div className="hidden lg:col-span-6 lg:block">
            <div className="overflow-hidden rounded-2xl border border-hairline shadow-floating bg-surface">
              <div className="aspect-[4/5] w-full overflow-hidden bg-surface-container">
                <img
                  src="https://images.unsplash.com/photo-1781624617165-1058040d1906?auto=format&fit=crop&w=1200&q=80"
                  alt={t('auth.login.imageAlt')}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-space-md border-t border-hairline bg-surface">
                <div className="flex items-center gap-space-xs text-xs text-on-surface-variant">
                  <span className="size-1.5 rounded-full bg-secondary" aria-hidden="true" />
                  <span className="font-serif italic text-primary">
                    {t('auth.login.imageCaption')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-6">
            <Card className="border border-hairline p-space-xl md:p-space-2xl shadow-floating bg-surface">
              <div className="mb-space-lg">
                <span className="type-label uppercase tracking-widest text-secondary font-medium block mb-space-xs">
                  {t('auth.login.eyebrow')}
                </span>
                <h1 className="font-serif text-3xl md:text-4xl text-primary tracking-tight">
                  <SplitText as="span">{t('auth.login.title')}</SplitText>
                </h1>
                <p className="type-body text-on-surface-variant mt-space-xs">
                  {t('auth.login.subtitle')}
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-space-lg p-space-md rounded-xl bg-error-container/70 border border-error/30 text-error type-small"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-space-md">
                <div>
                  <Input
                    id="login-email"
                    label={t('auth.login.email')}
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
                    label={t('auth.login.password')}
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
                  className="w-full mt-space-xs py-space-sm type-button"
                >
                  {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
                </Button>
              </form>

              <div className="mt-space-xl pt-space-lg border-t border-hairline/80 text-center type-small text-on-surface-variant">
                {t('auth.login.noAccount')}{' '}
                <Link
                  to="/register"
                  state={{ from }}
                  className="text-secondary font-semibold hover:underline ms-1"
                >
                  {t('auth.login.createAccount')}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
