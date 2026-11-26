import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import '../components/ui/ivory-theme.css';

export default function NotFoundPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');

  return (
    <div className="yt-ivory -mt-24 flex min-h-screen items-center pt-24 pb-space-2xl md:-mt-28 md:pt-28">
      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-10">
        <p
          aria-hidden="true"
          className="font-display text-[clamp(7rem,24vw,18rem)] font-bold leading-[0.85] tracking-tighter text-transparent"
          style={{ WebkitTextStroke: '2px rgba(16,28,21,0.35)' }}
        >
          404
        </p>
        <h1 className="type-headline mt-space-md max-w-2xl text-[#101C15]">
          {isAr ? 'تعذر العثور على هذه الصفحة.' : 'This page could not be found.'}
        </h1>
        <p className="type-body-lg mt-space-md max-w-xl text-[#3b4a3f]">
          {isAr
            ? 'قد يكون الرابط قديمًا أو أن الصفحة انتقلت إلى مكان آخر.'
            : 'The link may be outdated, or the page may have moved.'}
        </p>
        <div className="mt-space-lg flex flex-wrap gap-3">
          <Link
            to="/"
            className="type-button inline-flex min-h-12 items-center rounded-full bg-[#B6CE67] px-8 font-semibold text-[#101C15] transition-colors hover:bg-[#c8dd7e]"
          >
            {isAr ? 'العودة للرئيسية' : 'Return home'}
          </Link>
          <Link
            to="/discover"
            className="type-button inline-flex min-h-12 items-center rounded-full border border-[#101C15]/30 px-8 font-semibold text-[#101C15] transition-colors hover:border-[#101C15]"
          >
            {isAr ? 'استكشف الوجهات' : 'Explore destinations'}
          </Link>
        </div>
      </div>
    </div>
  );
}
