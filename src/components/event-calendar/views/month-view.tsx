"use client";

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

import {
  type CalendarEvent,
  EventItem,
  getAllEventsForDay,
  getEventsForDay,
  getSpanningEventsForDay,
  sortEvents,
  useEventVisibility,
  EventGap,
  EventHeight,
} from "@/components/event-calendar";

import { DefaultStartHour } from "@/components/event-calendar/utility/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ end: calendarEnd, start: calendarStart });
  }, [currentDate]);

  const weekdays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startOfWeek(new Date()), i);
      return format(date, "EEE");
    });
  }, []);

  const weeks = useMemo(() => {
    const result = [];
    let buffer = [];

    for (let i = 0; i < days.length; i++) {
      buffer.push(days[i]);
      if (buffer.length === 7 || i === days.length - 1) {
        result.push(buffer);
        buffer = [];
      }
    }

    return result;
  }, [days]);

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const [isMounted, setIsMounted] = useState(false);
  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventGap: EventGap,
    eventHeight: EventHeight,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="contents" data-slot="month-view">

      <div className="grid grid-cols-7 border-border/70 border-b">
        {weekdays.map((day) => (
          <div
            className="py-2 text-center text-muted-foreground/70 text-sm"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid flex-1 auto-rows-fr">
        {weeks.map((week, weekIndex) => (
          <div className="grid grid-cols-7 [&:last-child>*]:border-b-0" key={weekIndex}>
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(events, day);
              const spanning = getSpanningEventsForDay(events, day);
              const allEvents = getAllEventsForDay(events, day);

              const allDayEvents = [...spanning, ...dayEvents];

              const isCurrentMonth = isSameMonth(day, currentDate);
              const isReferenceCell = weekIndex === 0 && dayIndex === 0;

              const visibleCount = isMounted
                ? getVisibleEventCount(allDayEvents.length)
                : undefined;

              const hasMore =
                visibleCount !== undefined && allDayEvents.length > visibleCount;

              const remainingCount =
                hasMore && visibleCount
                  ? allDayEvents.length - visibleCount
                  : 0;

              return (
                <div
                  key={day.toISOString()}
                  className="group border-border/70 border-r border-b last:border-r-0 p-1 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70"
                  data-outside-cell={!isCurrentMonth || undefined}
                  data-today={isToday(day) || undefined}
                  onClick={() => {
                    const startTime = new Date(day);
                    startTime.setHours(DefaultStartHour, 0, 0);
                    onEventCreate(startTime);
                  }}
                >
                  <div className="mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm group-data-today:bg-primary group-data-today:text-primary-foreground">
                    {format(day, "d")}
                  </div>

                  <div
                    className="min-h-[calc((var(--event-height)+var(--event-gap))*3)]"
                    ref={isReferenceCell ? contentRef : null}
                  >
                    {sortEvents(allDayEvents).map((event, index) => {
                      const isHidden =
                        isMounted && visibleCount && index >= visibleCount;

                      if (!visibleCount) return null;

                      return (
                        <div
                          key={event.id + day.toISOString()}
                          aria-hidden={isHidden ? "true" : undefined}
                          className="aria-hidden:hidden"
                        >
                          <EventItem
                            event={event}
                            isFirstDay={true}
                            isLastDay={true}
                            onClick={(e) => handleEventClick(event, e)}
                          />
                        </div>
                      );
                    })}

                    {hasMore && (
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <button
                            className="mt-[var(--event-gap)] h-[var(--event-height)] w-full text-xs text-muted-foreground underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            + {remainingCount} more
                          </button>
                        </PopoverTrigger>

                        <PopoverContent className="max-w-52 p-3">
                          <div className="space-y-2">
                            <div className="font-medium text-sm">
                              {format(day, "EEE d")}
                            </div>

                            <div className="space-y-1">
                              {sortEvents(allEvents).map((event) => (
                                <EventItem
                                  key={event.id}
                                  event={event}
                                  isFirstDay={true}
                                  isLastDay={true}
                                  onClick={(e) => handleEventClick(event, e)}
                                />
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
