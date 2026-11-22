import type { CurrencyCode } from '../../types';

export const currencyOptions = [
  { value: 'EGP' satisfies CurrencyCode, label: 'EGP' },
  { value: 'USD' satisfies CurrencyCode, label: 'USD' },
] as const;
