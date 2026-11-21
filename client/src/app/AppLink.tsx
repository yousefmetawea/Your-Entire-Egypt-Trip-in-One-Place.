import { Link } from 'react-router';
import type { LayoutLinkProps } from '../lib/link';

export function AppLink({ href, ...rest }: LayoutLinkProps) {
  return <Link to={href} {...rest} />;
}
