"use client";

import { format, getMinutes, isPast } from "date-fns";
import { useMemo } from "react";

import {
  type CalendarEvent,
  getBorderRadiusClasses,
  getEventColorClasses,
} from "@/components/event-calendar";

import { cn } from "@/lib/utils";

const formatTimeWithOptionalMinutes = (date: Date) => {
  return format(date, getMinutes(date) === 0 ? "ha" : "h:mma").toLowerCase();
};

function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  onClick,
  className,
  children,
  currentTime,
}: {
  event: CalendarEvent;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  currentTime?: Date;
}) {
  const displayEnd = currentTime
    ? new Date(
        new Date(currentTime).getTime() +
          (new Date(event.end).getTime() - new Date(event.start).getTime()),
      )
    : new Date(event.end);

  const isEventInPast = isPast(displayEnd);

  return (
    <button
      className={cn(
        "flex size-full select-none overflow-hidden px-1 text-left font-medium outline-none backdrop-blur-md transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-past-event:line-through",
        getEventColorClasses(event.color),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        className,
      )}
      data-past-event={isEventInPast || undefined}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

interface EventItemProps {
  event: CalendarEvent;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  currentTime?: Date;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function EventItem({
  event,
  isDragging,
  onClick,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
}: EventItemProps) {
  const displayStart = useMemo(() => {
    return currentTime || new Date(event.start);
  }, [currentTime, event.start]);

  return (
    <EventWrapper
      className={cn(
        "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
        className,
      )}
      currentTime={currentTime}
      event={event}
      isDragging={isDragging}
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
      onClick={onClick}
    >
      {children || (
        <span className="truncate">
          {!event.allDay && (
            <span className="truncate font-normal opacity-70 sm:text-[11px]">
              {formatTimeWithOptionalMinutes(displayStart)}{" "}
            </span>
          )}
          {event.title}
        </span>
      )}
    </EventWrapper>
  );
}
