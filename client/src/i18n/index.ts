import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const supportedLanguages = ['en', 'ar'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const primaryLanguageStorageKey = 'yourtrip.language';
const legacyLanguageStorageKey = 'discover-cairo.language';
const defaultLanguage: SupportedLanguage = 'en';

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === 'en' || value === 'ar';
}

function readStoredLanguage(): SupportedLanguage {
  const urlLang =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('lang')
      : null;
  if (isSupportedLanguage(urlLang)) return urlLang;

  const stored =
    window.localStorage.getItem(primaryLanguageStorageKey) ??
    window.localStorage.getItem(legacyLanguageStorageKey);
  return isSupportedLanguage(stored) ? stored : defaultLanguage;
}

function updateDocumentLanguage(language: SupportedLanguage): void {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
}

const initialLanguage = readStoredLanguage();
updateDocumentLanguage(initialLanguage);

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: [...supportedLanguages],
  interpolation: { escapeValue: false },
});

export function setLanguage(language: SupportedLanguage): Promise<unknown> {
  window.localStorage.setItem(primaryLanguageStorageKey, language);
  window.localStorage.setItem(legacyLanguageStorageKey, language);
  updateDocumentLanguage(language);
  return i18n.changeLanguage(language);
}

export default i18n;
