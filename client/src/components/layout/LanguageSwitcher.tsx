import { useTranslation } from 'react-i18next';
import { setLanguage, type SupportedLanguage } from '../../i18n';
import { cn } from '../../lib/cn';

export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'subtle';
}

export function LanguageSwitcher({ className, variant = 'pill' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.slice(0, 2) === 'ar' ? 'ar' : 'en') as SupportedLanguage;

  const handleToggle = (lang: SupportedLanguage) => {
    if (lang === currentLang) return;
    void setLanguage(lang);
  };

  if (variant === 'subtle') {
    return (
      <div
        role="group"
        aria-label="Language selection"
        className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}
      >
        <button
          type="button"
          onClick={() => handleToggle('en')}
          className={cn(
            'px-2 py-1 rounded transition-colors',
            currentLang === 'en'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-primary',
          )}
          aria-pressed={currentLang === 'en'}
        >
          English
        </button>
        <span className="text-hairline-strong" aria-hidden="true">
          |
        </span>
        <button
          type="button"
          onClick={() => handleToggle('ar')}
          className={cn(
            'px-2 py-1 rounded transition-colors font-sans',
            currentLang === 'ar'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-primary',
          )}
          aria-pressed={currentLang === 'ar'}
        >
          العربية
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={cn(
        'relative inline-flex items-center rounded-full border border-hairline/80 bg-surface-container-lowest/80 p-0.5 shadow-sm backdrop-blur-md',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => handleToggle('en')}
        className={cn(
          'relative z-10 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer',
          currentLang === 'en'
            ? 'bg-primary text-on-primary shadow-xs'
            : 'text-on-surface-variant hover:text-primary',
        )}
        aria-pressed={currentLang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => handleToggle('ar')}
        className={cn(
          'relative z-10 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer font-sans',
          currentLang === 'ar'
            ? 'bg-primary text-on-primary shadow-xs'
            : 'text-on-surface-variant hover:text-primary',
        )}
        aria-pressed={currentLang === 'ar'}
      >
        عربي
      </button>
    </div>
  );
}
