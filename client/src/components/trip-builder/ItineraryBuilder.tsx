import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Place, PlaceId, Trip, TripActivity, TripDay } from '../../types';
import { useTripEditor } from '../../hooks/useTripEditor';
import { getActivityTitle } from '../../lib/builder/display';
import { summarizeItinerary } from '../../lib/builder/summary';
import { formatIsoDate } from '../../lib/date';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { Modal } from '../ui/Modal';
import { Section } from '../ui/Section';
import { AddActivityDialog } from './AddActivityDialog';
import { BuilderDayPanel } from './BuilderDayPanel';
import { BuilderHeader } from './BuilderHeader';
import { BuilderMap } from './BuilderMap';
import { BuilderSummary } from './BuilderSummary';
import { BuilderTitleDialog } from './BuilderTitleDialog';
import { DayTabs } from './DayTabs';
import { DAY_DROP_PREFIX } from './dndIds';

export interface ItineraryBuilderProps {
  trip: Trip;
  places: Place[];
}

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const dayTabCollisions = pointerWithin(args).filter((collision) =>
    String(collision.id).startsWith(DAY_DROP_PREFIX),
  );

  return dayTabCollisions.length > 0 ? dayTabCollisions : closestCenter(args);
};

type PendingRemoval =
  | {
      kind: 'activity';
      dayId: string;
      dayNumber: number;
      activityId: string;
      title: string;
    }
  | {
      kind: 'lastDay';
      dayNumber: number;
      activityCount: number;
    };

export function ItineraryBuilder({ trip: initialTrip, places }: ItineraryBuilderProps) {
  const { t } = useTranslation();
  const editor = useTripEditor(initialTrip);
  const trip = editor.trip;
  const [selectedDayId, setSelectedDayId] = useState(initialTrip.days[0]?.id ?? '');
  const [addOpen, setAddOpen] = useState(false);
  const [titleOpen, setTitleOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const placesById = useMemo(
    () => new Map<PlaceId, Place>(places.map((place) => [place.id, place])),
    [places],
  );
  const usedPlaceIds = useMemo(
    () =>
      new Set(
        trip.days.flatMap((day) =>
          day.activities.flatMap((activity) =>
            activity.source.type === 'place' ? [activity.source.placeId] : [],
          ),
        ),
      ),
    [trip.days],
  );
  const summary = useMemo(() => summarizeItinerary(trip), [trip]);
  const selectedDay = trip.days.find((day) => day.id === selectedDayId) ?? trip.days[0];
  const selectedDayNumber = selectedDay
    ? trip.days.findIndex((day) => day.id === selectedDay.id) + 1
    : 1;

  function handleAddDay(): void {
    const newDayId = editor.addDay();

    if (newDayId) {
      setSelectedDayId(newDayId);
    }
  }

  function handleRequestRemoveLastDay(): void {
    const lastDay = trip.days[trip.days.length - 1];

    if (!lastDay || trip.days.length <= 1) {
      return;
    }

    setPendingRemoval({
      kind: 'lastDay',
      dayNumber: trip.days.length,
      activityCount: lastDay.activities.length,
    });
  }

  function handleRequestRemoveActivity(day: TripDay, activity: TripActivity): void {
    const place =
      activity.source.type === 'place' ? placesById.get(activity.source.placeId) : undefined;
    const title =
      getActivityTitle(activity, place) ??
      (activity.source.type === 'place'
        ? t('trip.activity.placeUnavailable')
        : t('trip.builder.activities.untitled'));
    const dayNumber = trip.days.findIndex((item) => item.id === day.id) + 1;

    setPendingRemoval({
      kind: 'activity',
      dayId: day.id,
      dayNumber,
      activityId: activity.id,
      title,
    });
  }

  function handleConfirmRemoval(): void {
    if (!pendingRemoval) {
      return;
    }

    if (pendingRemoval.kind === 'activity') {
      editor.removeActivity(pendingRemoval.dayId, pendingRemoval.activityId);
    } else {
      const lastDay = trip.days[trip.days.length - 1];

      if (lastDay && selectedDayId === lastDay.id) {
        const previousDay = trip.days[trip.days.length - 2];

        if (previousDay) {
          setSelectedDayId(previousDay.id);
        }
      }

      editor.removeLastDay();
    }

    setPendingRemoval(null);
  }

  function handleDragStart(event: DragStartEvent): void {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveId(null);
    const overId = event.over ? String(event.over.id) : null;

    if (!overId) {
      return;
    }

    const activityId = String(event.active.id);
    const sourceDay = trip.days.find((day) =>
      day.activities.some((activity) => activity.id === activityId),
    );

    if (!sourceDay) {
      return;
    }

    if (overId.startsWith(DAY_DROP_PREFIX)) {
      const targetDayId = overId.slice(DAY_DROP_PREFIX.length);
      const targetDay = trip.days.find((day) => day.id === targetDayId);

      if (targetDay) {
        editor.moveActivity(activityId, sourceDay.id, targetDay.id, targetDay.activities.length);
      }

      return;
    }

    const targetDay = trip.days.find((day) =>
      day.activities.some((activity) => activity.id === overId),
    );
    const targetIndex = targetDay?.activities.findIndex((activity) => activity.id === overId) ?? -1;

    if (targetDay && targetIndex >= 0) {
      editor.moveActivity(activityId, sourceDay.id, targetDay.id, targetIndex);
    }
  }

  const removalTitle =
    pendingRemoval?.kind === 'activity'
      ? t('trip.builder.removeActivity.title')
      : t('trip.builder.removeLastDay.title');
  const removalDescription = (() => {
    if (!pendingRemoval) {
      return null;
    }

    if (pendingRemoval.kind === 'activity') {
      return t('trip.builder.removeActivity.description', {
        title: pendingRemoval.title,
        day: pendingRemoval.dayNumber,
      });
    }

    return pendingRemoval.activityCount > 0
      ? t('trip.builder.removeLastDay.descriptionWithActivities', {
          day: pendingRemoval.dayNumber,
          count: pendingRemoval.activityCount,
        })
      : t('trip.builder.removeLastDay.description', {
          day: pendingRemoval.dayNumber,
        });
  })();

  return (
    <Section
      tone="canvas"
      spacing="none"
      className="min-h-screen py-space-2xl"
      aria-labelledby="trip-heading"
    >
      <Container>
        <BuilderHeader
          trip={trip}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          saveStatus={editor.saveStatus}
          onRetrySave={editor.retrySave}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onEditTitle={() => setTitleOpen(true)}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="mt-space-xl">
            <DayTabs
              days={trip.days}
              selectedDayId={selectedDay?.id ?? ''}
              onSelect={setSelectedDayId}
              onAddDay={handleAddDay}
              onRequestRemoveLastDay={handleRequestRemoveLastDay}
              atDayLimit={editor.atDayLimit}
              isDragging={activeId !== null}
            />
          </div>

          {selectedDay ? (
            <div className="mt-space-lg grid grid-cols-1 items-start gap-gutter-lg lg:grid-cols-12">
              <div className="lg:col-span-7 xl:col-span-6">
                <BuilderDayPanel
                  day={selectedDay}
                  dayNumber={selectedDayNumber}
                  days={trip.days}
                  placesById={placesById}
                  onAddActivity={() => setAddOpen(true)}
                  onUpdateActivity={editor.updateActivity}
                  onMoveActivity={editor.moveActivity}
                  onRequestRemoveActivity={handleRequestRemoveActivity}
                />
              </div>

              <div className="lg:col-span-5 xl:col-span-6">
                <div className="grid grid-cols-1 items-start gap-gutter-lg xl:grid-cols-2">
                  <div className="xl:sticky xl:top-24">
                    <BuilderMap
                      day={selectedDay}
                      dayNumber={selectedDayNumber}
                      placesById={placesById}
                    />
                  </div>
                  <div className="xl:sticky xl:top-24">
                    <BuilderSummary trip={trip} summary={summary} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DndContext>
      </Container>

      {selectedDay ? (
        <AddActivityDialog
          open={addOpen}
          day={selectedDay}
          dayNumber={selectedDayNumber}
          places={places}
          usedPlaceIds={usedPlaceIds}
          onClose={() => setAddOpen(false)}
          onAddPlace={editor.addPlace}
          onAddCustom={editor.addCustomActivity}
        />
      ) : null}

      {titleOpen ? (
        <BuilderTitleDialog
          title={trip.title}
          onClose={() => setTitleOpen(false)}
          onSave={editor.renameTrip}
        />
      ) : null}

      <Modal
        open={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
        title={removalTitle}
        description={removalDescription}
        closeLabel={t('common.close')}
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPendingRemoval(null)}
            >
              {t('trip.builder.cancel')}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleConfirmRemoval}>
              {pendingRemoval?.kind === 'activity'
                ? t('trip.builder.removeActivity.action')
                : t('trip.builder.removeLastDay.action')}
            </Button>
          </>
        }
      />

      <p className="sr-only" role="status" aria-live="polite">
        {t('trip.builder.dayStatus', {
          day: selectedDayNumber,
          date: selectedDay ? (formatIsoDate(selectedDay.date) ?? selectedDay.date) : '',
        })}
      </p>
    </Section>
  );
}
