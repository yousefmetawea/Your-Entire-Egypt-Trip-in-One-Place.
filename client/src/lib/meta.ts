import { APP_NAME, DEFAULT_META_DESCRIPTION } from './app';

export function setDocumentMeta(title: string | null, description?: string | null): void {
  document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;

  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');

  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }

  meta.content = description?.trim() || DEFAULT_META_DESCRIPTION;
}
