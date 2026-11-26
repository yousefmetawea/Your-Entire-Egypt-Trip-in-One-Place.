import './tripStage.css';

/** A single real photo behind the header, fading into the page. Decorative only. */
export function TripBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden"
      aria-hidden="true"
    >
      <img
        src="/images/places/karnak-temple.jpg"
        alt=""
        className="trip-photo absolute inset-0 size-full object-cover"
        style={{ objectPosition: '50% 40%' }}
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#101C15] via-[#101C15]/75 to-[#101C15]/30 rtl:bg-gradient-to-l" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#101C15] via-[#101C15]/90 to-transparent" />
      <div className="trip-grain absolute inset-0" />
    </div>
  );
}
