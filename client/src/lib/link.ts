import type { AnchorHTMLAttributes, ElementType } from 'react';

export interface LayoutLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export type LayoutLinkComponent = ElementType<LayoutLinkProps>;
