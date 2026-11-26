import type { DiscoverCardVariant } from './DiscoverCard';

export interface GridSlot {
  variant: DiscoverCardVariant;
  /** Tailwind classes for the wrapping grid cell (literal strings so Tailwind can see them). */
  cell: string;
}

const T = {
  big: 'lg:col-span-7 lg:row-span-2',
  five: 'lg:col-span-5',
  tall: 'lg:col-span-4 lg:row-span-2',
  four: 'lg:col-span-4',
  full: 'lg:col-span-12',
  half: 'lg:col-span-6',
} as const;

const WIDE = 'md:col-span-2';

type Pattern = readonly { variant: DiscoverCardVariant; cell: string }[];

// 12-column desktop patterns. Each tiles exactly with in-order placement,
// so no card is moved or hidden.
const A: Pattern = [
  { variant: 'featured', cell: T.big },
  { variant: 'standard', cell: T.five },
  { variant: 'standard', cell: T.five },
];
const B: Pattern = [
  { variant: 'editorial', cell: T.tall },
  { variant: 'standard', cell: T.four },
  { variant: 'standard', cell: T.four },
  { variant: 'standard', cell: T.four },
  { variant: 'standard', cell: T.four },
];
const C: Pattern = [
  { variant: 'standard', cell: T.five },
  { variant: 'featured', cell: T.big },
  { variant: 'standard', cell: T.five },
];
const CYCLE: Pattern[] = [A, B, C];

/**
 * Maps result positions to slots, preserving order. Full patterns are used
 * while enough items remain; the tail is filled with rows that always close.
 */
export function buildEditorialLayout(count: number, hasFilters: boolean): GridSlot[] {
  const slots: { variant: DiscoverCardVariant; cell: string }[] = [];
  let remaining = count;
  let p = 0;

  while (remaining > 0) {
    const pattern = CYCLE[p % CYCLE.length];
    if (remaining >= pattern.length && !(hasFilters && count < 6)) {
      slots.push(...pattern);
      remaining -= pattern.length;
      p += 1;
    } else {
      // Tail: rows of three; leftover 1 or 2 stretch to close the row.
      const rows = remaining % 3;
      const full = remaining - rows;
      for (let i = 0; i < full; i += 1) slots.push({ variant: 'standard', cell: T.four });
      if (rows === 1) slots.push({ variant: 'featured', cell: T.full });
      if (rows === 2) {
        slots.push({ variant: 'standard', cell: T.half }, { variant: 'standard', cell: T.half });
      }
      remaining = 0;
    }
  }

  // Tablet (2 columns): a wide card every fifth item, and a lone last item
  // spans the row so there is never a gap.
  let col = 0;
  return slots.map((slot, i) => {
    let wide = i % 5 === 0 || (i === slots.length - 1 && col === 0);
    if (col === 1 && i % 5 === 0) wide = false;
    const span = wide && col === 0;
    col = span ? 0 : (col + 1) % 2;
    return { variant: slot.variant, cell: span ? `${WIDE} ${slot.cell}` : slot.cell };
  });
}
