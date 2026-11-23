import { Link } from 'react-router';
import { Card } from '../ui/Card';

export function DashboardEmptyState() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-gutter-sm md:px-margin-md lg:px-margin-lg py-space-2xl">
      <Card
        variant="surface"
        className="max-w-2xl mx-auto p-space-xl md:p-space-2xl rounded-[24px] text-center flex flex-col items-center justify-center gap-space-md border border-hairline/60 shadow-sm"
      >
        <span className="type-label-sm uppercase tracking-widest text-secondary font-semibold">
          Your Expedition Hub
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl text-primary font-normal tracking-tight">
          No Trips Created Yet
        </h1>

        <p className="type-body text-on-surface-variant max-w-lg leading-relaxed">
          Your personalized itinerary, selected accommodation, transfer requests, and travel budget
          will appear here once you create a trip.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-md">
          <Link
            to="/plan"
            className="inline-flex items-center justify-center px-space-lg py-space-xs rounded-full bg-primary hover:bg-secondary text-on-primary transition-all type-label font-medium shadow-md"
          >
            Plan Your Cairo Trip
          </Link>

          <Link
            to="/discover"
            className="inline-flex items-center justify-center px-space-lg py-space-xs rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary transition-all type-label font-medium"
          >
            Explore Destinations
          </Link>
        </div>
      </Card>
    </div>
  );
}
