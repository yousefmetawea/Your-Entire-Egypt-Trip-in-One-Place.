import { useEffect } from 'react';
import { useMatches } from 'react-router';
import { APP_NAME } from '../lib/app';

interface RouteHandle {
  title?: string;
}

export function usePageTitle(): void {
  const matches = useMatches();
  const title = matches.reduce<string | undefined>((current, match) => {
    const handle = match.handle as RouteHandle | undefined;
    return handle?.title ?? current;
  }, undefined);

  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
}
