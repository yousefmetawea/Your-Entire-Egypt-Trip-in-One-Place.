import { useEffect } from 'react';
import { setDocumentMeta } from '../lib/meta';

export function usePageMeta(title: string | null, description?: string | null): void {
  useEffect(() => {
    if (!title) {
      return;
    }

    setDocumentMeta(title, description);
  }, [description, title]);
}
