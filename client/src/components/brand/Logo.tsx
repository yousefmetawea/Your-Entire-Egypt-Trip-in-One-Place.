import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn';
import { LOGO_ARABIC, LOGO_LATIN, LOGO_MARK_SIZE } from './logoPaths';

export type LogoTone = 'onLight' | 'onDark';

const WORDMARK: Record<LogoTone, string> = {
  onLight: '#12301f',
  onDark: '#b5e35a',
};

/** The obelisk mark: lime disc with a forest-green obelisk. */
function Mark() {
  return (
    <>
      <circle cx="32" cy="32" r="31" fill="#b5e35a" />
      <g transform="translate(32 33) skewX(-9) translate(-32 -33)">
        <path d="M23 52 L26 22 L32 11 L38 22 L41 52 Z" fill="#12301f" />
        <path d="M26 22 H38" stroke="#b5e35a" strokeWidth="2.4" />
      </g>
    </>
  );
}

export interface LogoProps {
  /** Rendered height of the logo in px. */
  height?: number;
  /** Use "onDark" on dark backgrounds. */
  tone?: LogoTone;
  /** Show only the round mark. */
  markOnly?: boolean;
  /** Accessible name. Falls back to the brand name. */
  label?: string;
  className?: string;
}

/**
 * Brand logo. Shows the Latin wordmark in English and the Arabic wordmark
 * (رحلتك) when the page language is Arabic. The mark sits at the start of the
 * reading direction: left in English, right in Arabic.
 */
export function Logo({
  height = 36,
  tone = 'onLight',
  markOnly = false,
  label = 'YourTrip',
  className,
}: LogoProps) {
  const { i18n } = useTranslation();
  const isArabic = (i18n.resolvedLanguage ?? i18n.language ?? '').startsWith('ar');

  if (markOnly) {
    return (
      <svg
        viewBox="0 0 64 64"
        height={height}
        width={height}
        role="img"
        aria-label={label}
        className={cn('shrink-0', className)}
      >
        <Mark />
      </svg>
    );
  }

  const g = isArabic ? LOGO_ARABIC : LOGO_LATIN;
  const scale = height / LOGO_MARK_SIZE;
  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      height={height}
      width={g.width * scale}
      role="img"
      aria-label={label}
      className={cn('shrink-0', className)}
    >
      <g transform={`translate(${g.markX} 0) scale(${LOGO_MARK_SIZE / 64})`}>
        <Mark />
      </g>
      <path d={g.path} fill={WORDMARK[tone]} transform={`translate(${g.textX} ${g.textY})`} />
    </svg>
  );
}
