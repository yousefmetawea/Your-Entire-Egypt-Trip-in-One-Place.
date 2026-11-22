import type {
  CairoArea,
  GenerateItineraryInput,
  ItineraryGenerationResult,
  Place,
  PlaceCategory,
  PlannerWarning,
  Trip,
  TripActivity,
  TripDay,
} from '../../types';
import { CAIRO_AREAS } from '../catalog';
import { enumerateDates } from '../date';
import { MAX_ACTIVITIES_PER_DAY, SUGGESTED_START_TIMES } from './options';

interface AreaEntry {
  area: CairoArea;
  areaIndex: number;
  places: Place[];
  savedCount: number;
  matchCount: number;
}

interface AreaAllocation extends AreaEntry {
  days: number;
}

function compareText(left: string, right: string): number {
  const normalizedLeft = left.toLowerCase();
  const normalizedRight = right.toLowerCase();

  if (normalizedLeft < normalizedRight) {
    return -1;
  }

  if (normalizedLeft > normalizedRight) {
    return 1;
  }

  return 0;
}

function matchesInterest(place: Place, interests: readonly PlaceCategory[]): boolean {
  return interests.some((interest) => place.category === interest || place.tags.includes(interest));
}

function comparePlaces(
  left: Place,
  right: Place,
  interests: readonly PlaceCategory[],
  savedIds: ReadonlySet<string>,
  includeSavedPlaces: boolean,
): number {
  const leftSaved = includeSavedPlaces && savedIds.has(left.id) ? 1 : 0;
  const rightSaved = includeSavedPlaces && savedIds.has(right.id) ? 1 : 0;

  if (leftSaved !== rightSaved) {
    return rightSaved - leftSaved;
  }

  const leftMatch = matchesInterest(left, interests) ? 1 : 0;
  const rightMatch = matchesInterest(right, interests) ? 1 : 0;

  if (leftMatch !== rightMatch) {
    return rightMatch - leftMatch;
  }

  const nameOrder = compareText(left.name.en, right.name.en);

  if (nameOrder !== 0) {
    return nameOrder;
  }

  return compareText(left.id, right.id);
}

function createActivity(place: Place, date: string, index: number): TripActivity {
  return {
    id: `activity-${date}-${place.id}`,
    source: { type: 'place', placeId: place.id },
    startTime: SUGGESTED_START_TIMES[index] ?? SUGGESTED_START_TIMES[0],
    durationMin: place.avgVisitMinutes,
    travelMin: null,
    estimatedCost: place.ticketPrice,
    order: index,
  };
}

function getUnmatchedInterests(
  interests: readonly PlaceCategory[],
  places: readonly Place[],
): PlaceCategory[] {
  return interests.filter(
    (interest) => !places.some((place) => matchesInterest(place, [interest])),
  );
}

function getFailureWarnings(
  unmatchedInterests: readonly PlaceCategory[],
  savedPlaces: readonly Place[],
  missingSavedIds: readonly string[],
  includeSavedPlaces: boolean,
): PlannerWarning[] {
  const warnings: PlannerWarning[] = [{ code: 'no-matches' }];

  if (unmatchedInterests.length > 0) {
    warnings.push({ code: 'unmatched-interests', categories: [...unmatchedInterests] });
  }

  if (!includeSavedPlaces && savedPlaces.length > 0) {
    warnings.push({ code: 'saved-places-excluded', count: savedPlaces.length });
  }

  if (missingSavedIds.length > 0) {
    warnings.push({
      code: 'saved-places-missing',
      count: missingSavedIds.length,
      placeIds: [...missingSavedIds],
    });
  }

  return warnings;
}

export function generateItinerary(input: GenerateItineraryInput): ItineraryGenerationResult {
  const includeSavedPlaces = input.includeSavedPlaces ?? true;
  const savedPlaceIds = [...new Set(input.savedPlaceIds ?? [])];
  const savedIdSet = new Set(savedPlaceIds);
  const placesById = new Map(input.places.map((place) => [place.id, place] as const));

  const matchingPlaces = input.places.filter((place) =>
    matchesInterest(place, input.answers.interests),
  );
  const savedPlaces = savedPlaceIds
    .map((id) => placesById.get(id))
    .filter((place): place is Place => Boolean(place));
  const missingSavedIds = savedPlaceIds.filter((id) => !placesById.has(id));

  const candidateMap = new Map<string, Place>();

  if (includeSavedPlaces) {
    for (const place of savedPlaces) {
      candidateMap.set(place.id, place);
    }
  }

  for (const place of matchingPlaces) {
    candidateMap.set(place.id, place);
  }

  const candidates = [...candidateMap.values()];
  const unmatchedInterests = getUnmatchedInterests(input.answers.interests, input.places);

  if (candidates.length === 0) {
    return {
      ok: false,
      warnings: getFailureWarnings(
        unmatchedInterests,
        savedPlaces,
        missingSavedIds,
        includeSavedPlaces,
      ),
    };
  }

  const dates = enumerateDates(input.answers.startDate, input.answers.endDate);
  const dayCount = dates.length;
  const placesByArea = new Map<CairoArea, Place[]>();

  for (const place of candidates) {
    const group = placesByArea.get(place.area);

    if (group) {
      group.push(place);
    } else {
      placesByArea.set(place.area, [place]);
    }
  }

  const areaEntries: AreaEntry[] = CAIRO_AREAS.flatMap((area, areaIndex) => {
    const areaPlaces = placesByArea.get(area);

    if (!areaPlaces || areaPlaces.length === 0) {
      return [];
    }

    return [
      {
        area,
        areaIndex,
        places: [...areaPlaces].sort((left, right) =>
          comparePlaces(left, right, input.answers.interests, savedIdSet, includeSavedPlaces),
        ),
        savedCount: areaPlaces.filter((place) => includeSavedPlaces && savedIdSet.has(place.id))
          .length,
        matchCount: areaPlaces.filter((place) => matchesInterest(place, input.answers.interests))
          .length,
      },
    ];
  }).sort((left, right) => {
    if (left.savedCount !== right.savedCount) {
      return right.savedCount - left.savedCount;
    }

    if (left.matchCount !== right.matchCount) {
      return right.matchCount - left.matchCount;
    }

    return left.areaIndex - right.areaIndex;
  });

  const selectedAreas = areaEntries.slice(0, dayCount);
  const omittedAreaEntries = areaEntries.slice(dayCount);
  const omittedPlaces: Place[] = [];
  const warnings: PlannerWarning[] = [];

  if (unmatchedInterests.length > 0) {
    warnings.push({ code: 'unmatched-interests', categories: [...unmatchedInterests] });
  }

  if (omittedAreaEntries.length > 0) {
    const omittedAreaPlaceIds = omittedAreaEntries.flatMap((entry) =>
      entry.places.map((place) => place.id),
    );

    for (const entry of omittedAreaEntries) {
      omittedPlaces.push(...entry.places);
    }

    warnings.push({
      code: 'omitted-areas',
      count: omittedAreaEntries.length,
      areas: omittedAreaEntries.map((entry) => entry.area),
      placeIds: omittedAreaPlaceIds,
    });
  }

  const allocations: AreaAllocation[] = selectedAreas.map((entry) => ({
    ...entry,
    days: 1,
  }));
  let remainingDays = dayCount - allocations.length;

  while (remainingDays > 0) {
    let best: AreaAllocation | null = null;

    for (const allocation of allocations) {
      if (allocation.days >= allocation.places.length) {
        continue;
      }

      if (!best || allocation.places.length - allocation.days > best.places.length - best.days) {
        best = allocation;
      }
    }

    if (!best) {
      break;
    }

    best.days += 1;
    remainingDays -= 1;
  }

  const dayPlans: Array<{ area: CairoArea; places: Place[] } | null> = [];

  for (const allocation of allocations) {
    const buckets = Array.from({ length: allocation.days }, () => [] as Place[]);

    for (const place of allocation.places) {
      let target: Place[] | null = null;

      for (const bucket of buckets) {
        if (bucket.length >= MAX_ACTIVITIES_PER_DAY) {
          continue;
        }

        if (!target || bucket.length < target.length) {
          target = bucket;
        }
      }

      if (!target) {
        omittedPlaces.push(place);
        continue;
      }

      target.push(place);
    }

    for (const bucket of buckets) {
      dayPlans.push({ area: allocation.area, places: bucket });
    }
  }

  while (dayPlans.length < dayCount) {
    dayPlans.push(null);
  }

  const days: TripDay[] = dates.map((date, index) => {
    const plan = dayPlans[index] ?? null;

    return {
      id: `day-${date}`,
      date,
      activities: plan
        ? plan.places.map((place, activityIndex) => createActivity(place, date, activityIndex))
        : [],
    };
  });

  const activities = days.flatMap((day) => day.activities);
  const matchedPlaceIds = [
    ...new Set(
      activities.flatMap((activity) =>
        activity.source.type === 'place' ? [activity.source.placeId] : [],
      ),
    ),
  ];
  const omittedPlaceIds = [...new Set(omittedPlaces.map((place) => place.id))];
  const emptyDayDates = days.filter((day) => day.activities.length === 0).map((day) => day.date);
  const missingDurations = activities.filter((activity) => activity.durationMin === null).length;
  const missingPrices = activities.filter((activity) => activity.estimatedCost === null).length;

  if (omittedPlaceIds.length > 0) {
    warnings.push({
      code: 'omitted-places',
      count: omittedPlaceIds.length,
      placeIds: omittedPlaceIds,
    });
  }

  if (emptyDayDates.length > 0) {
    warnings.push({
      code: 'empty-days',
      count: emptyDayDates.length,
      dates: emptyDayDates,
    });
  }

  if (missingDurations > 0) {
    warnings.push({ code: 'missing-durations', count: missingDurations });
  }

  if (activities.length > 0) {
    warnings.push({ code: 'missing-travel-times', count: activities.length });
  }

  if (missingPrices > 0) {
    warnings.push({ code: 'missing-prices', count: missingPrices });
  }

  if (includeSavedPlaces && savedPlaces.length > 0) {
    warnings.push({ code: 'saved-places-included', count: savedPlaces.length });
  }

  if (!includeSavedPlaces && savedPlaces.length > 0) {
    warnings.push({ code: 'saved-places-excluded', count: savedPlaces.length });
  }

  if (missingSavedIds.length > 0) {
    warnings.push({
      code: 'saved-places-missing',
      count: missingSavedIds.length,
      placeIds: [...missingSavedIds],
    });
  }

  const preferences: Trip['preferences'] = {};

  if (input.answers.accommodationType !== 'any') {
    preferences.accommodationType = input.answers.accommodationType;
  }

  if (input.answers.transportType !== 'any') {
    preferences.transportType = input.answers.transportType;
  }

  const trip: Trip = {
    id: input.tripId,
    userId: input.userId,
    title: input.title,
    startDate: input.answers.startDate,
    endDate: input.answers.endDate,
    travelers: input.answers.travelers,
    budget: null,
    budgetTier: input.answers.budgetTier,
    interests: [...input.answers.interests],
    preferences,
    status: 'draft',
    days,
    accommodationId: null,
    savedPlaceIds: includeSavedPlaces ? savedPlaces.map((place) => place.id) : [],
    isDemo: true,
  };

  return {
    ok: true,
    itinerary: {
      trip,
      warnings,
      matchedPlaceIds,
      omittedPlaceIds,
      candidateCount: candidates.length,
    },
  };
}
