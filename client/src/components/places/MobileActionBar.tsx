import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { cn } from '../../lib/cn';
import type { DraftTripPlaceResult } from '../../hooks/useDraftTripPlace';
import { AddToTripButton, AddToTripFeedback } from './AddToTripButton';

export interface MobileActionBarProps {
  draft: DraftTripPlaceResult;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export function MobileActionBar({ draft, sentinelRef }: MobileActionBarProps) {
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearFooter(Boolean(entry?.isIntersecting));
      },
      { rootMargin: '0px 0px 96px 0px', threshold: 0 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [sentinelRef]);

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 px-gutter-sm pt-space-sm shadow-[0_-12px_32px_-16px_rgba(31,31,31,0.25)] backdrop-blur-xl transition-transform duration-300 md:hidden',
        nearFooter && 'pointer-events-none translate-y-full',
      )}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto w-full max-w-page">
        <AddToTripButton draft={draft} fullWidth />
        <AddToTripFeedback draft={draft} compact className="mt-space-xs" />
      </div>
    </div>
  );
}
