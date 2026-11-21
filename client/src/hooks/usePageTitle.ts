import { useEffect } from 'react';
import { useMatches } from 'react-router';
import { APP_NAME, DEFAULT_META_DESCRIPTION } from '../lib/app';

interface RouteHandle {
  title?: string;
  description?: string;
}

export function usePageTitle(): void {
  const matches = useMatches();
  const { title, description } = matches.reduce<RouteHandle>((current, match) => {
    const handle = match.handle as RouteHandle | undefined;

    return {
      title: handle?.title ?? current.title,
      description: handle?.description ?? current.description,
    };
  }, {});

  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }

    meta.content = description ?? DEFAULT_META_DESCRIPTION;
  }, [description, title]);
}
