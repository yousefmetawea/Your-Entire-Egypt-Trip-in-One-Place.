import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BedIcon, CarIcon } from '../ui/icons';

type Tab = 'accommodation' | 'transportation';

/** Segmented control whose pill glides between tabs. */
export function TabSwitch({
  tab,
  onChange,
  labels,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  labels: { stay: string; transport: string };
}) {
  const items: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'accommodation', label: labels.stay, icon: <BedIcon className="size-4" /> },
    { id: 'transportation', label: labels.transport, icon: <CarIcon className="size-4" /> },
  ];
  return (
    <div
      role="tablist"
      aria-label="Stay and transport categories"
      className="inline-flex gap-1 rounded-full border border-white/10 bg-[#101C15]/90 p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl"
    >
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            role="tab"
            id={`tab-${it.id}`}
            aria-selected={active}
            aria-controls={`panel-${it.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(it.id)}
            className={`relative flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
              active ? 'text-[#101C15]' : 'text-white/70 hover:text-white'
            }`}
          >
            {active ? (
              <motion.span
                layoutId="stay-tab-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D9E6A0] to-[#B6CE67]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-2">
              {it.icon}
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
