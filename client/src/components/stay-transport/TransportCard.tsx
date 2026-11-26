import { useTranslation } from 'react-i18next';
import type { TransportOption } from '../../types';
import { COPY, TYPE_IMAGE } from './copy';

export interface TransportCardProps {
  option: TransportOption;
  onRequestTransfer?: () => void;
  onOpenExternalModal?: (url: string) => void;
}

export function TransportCard({
  option,
  onRequestTransfer,
  onOpenExternalModal,
}: TransportCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const name = isAr && option.name.ar ? option.name.ar : option.name.en;
  const description =
    isAr && option.description?.ar ? option.description.ar : option.description?.en;
  const isInternal = option.bookable === 'internal';

  const typeLabel = option.type.replace('-', ' ');
  const cta = isInternal
    ? t('stayTransport.transport.requestCta', 'Request Transfer')
    : t('stayTransport.transport.viewProviderCta', 'View on provider ↗');
  const act = isInternal ? onRequestTransfer : () => onOpenExternalModal?.(option.externalUrl!);
  const hasAction = isInternal || !!option.externalUrl;

  return (
    <article className="group relative isolate flex h-full min-h-[27rem] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#101C15] text-white shadow-[0_30px_60px_-30px_rgba(11,21,16,0.7)] ring-1 ring-white/10">
      <img
        src={TYPE_IMAGE[option.type] ?? TYPE_IMAGE.transfer}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101C15] via-[#101C15]/70 to-[#101C15]/5" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div className="flex items-start justify-between gap-3 p-5">
        <span className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] backdrop-blur-md">
          {typeLabel}
        </span>
        <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[0.68rem] font-medium tracking-wide text-white/85 backdrop-blur-md">
          <span
            className={`size-1.5 rounded-full ${isInternal ? 'bg-[#B6CE67]' : 'bg-white/60'}`}
            aria-hidden
          />
          {isInternal
            ? t('stayTransport.transport.managedBadge', 'Managed Request')
            : t('stayTransport.transport.externalBadge', 'External booking')}
        </span>
      </div>

      <div className="flex flex-col gap-4 p-6 pt-0">
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-[1.65rem] font-semibold leading-tight">{name}</h3>
          {description ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-white/70">{description}</p>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-white/15 pt-4">
          <div className="flex flex-col">
            {option.estimatedPrice ? (
              <>
                <span className="text-[0.65rem] uppercase tracking-[0.22em] text-white/50">
                  {COPY[isAr ? 'ar' : 'en'].est}
                </span>
                <span className="text-xl font-semibold tabular-nums">
                  {option.estimatedPrice.amount}{' '}
                  <span className="text-sm font-medium text-white/70">
                    {option.estimatedPrice.currency}
                  </span>
                </span>
              </>
            ) : (
              <span className="text-sm text-white/70">{isAr ? 'السعر متغير' : 'Price varies'}</span>
            )}
          </div>
          {hasAction ? (
            <button
              type="button"
              onClick={act}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                isInternal
                  ? 'bg-white text-[#101C15] hover:bg-[#B6CE67]'
                  : 'border border-white/40 bg-white/5 text-white backdrop-blur-md hover:bg-white/15'
              }`}
            >
              {cta}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
