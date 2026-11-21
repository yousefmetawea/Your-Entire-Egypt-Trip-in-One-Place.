import { useEffect } from 'react';
import { useMatches } from 'react-router';
import { setDocumentMeta } from '../lib/meta';

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
    setDocumentMeta(title ?? null, description);
  }, [description, title]);
}
