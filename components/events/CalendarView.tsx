/**
 * Calendar View Component
 * Month-first calendar grid with event blocks
 */

import { useThemedColors } from '@/constants/colors';
import {
    goToToday,
    navigateMonth,
    openViewModal,
    selectCurrentMonth,
    selectEvents,
    selectMultiDayEvents,
    selectSelectedDate,
    selectWeekStart,
    setSelectedDate
} from '@/src/store/eventsSlice';
import { DayCellData, Event, WeekCellData } from '@/src/types/event';
import {
    formatDate,
    generateWeekCells,
    getMultiDayEventPosition,
    isMultiDayEvent
} from '@/src/utils/eventHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Box,
    HStack,
    Pressable,
    ScrollView,
    Text,
    VStack
} from '@gluestack-ui/themed';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface CalendarViewProps {
  onEventPress?: (eventId: string) => void;
}

export function CalendarView({ onEventPress }: CalendarViewProps) {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  
  const events = useSelector(selectEvents);
  const multiDayEvents = useSelector(selectMultiDayEvents);
  const selectedDate = useSelector(selectSelectedDate);
  const currentMonth = useSelector(selectCurrentMonth);
  const weekStart = useSelector(selectWeekStart);
  
  // Parse current month
  const [year, month] = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    return [y, m - 1]; // JavaScript months are 0-indexed
  }, [currentMonth]);
  
  // Generate calendar data
  const weeks = useMemo(() => {
    return generateWeekCells(year, month, selectedDate, events, weekStart);
  }, [year, month, selectedDate, events, weekStart]);
  
  // Navigation handlers
  const handlePrevMonth = () => dispatch(navigateMonth(-1));
  const handleNextMonth = () => dispatch(navigateMonth(1));
  const handleToday = () => dispatch(goToToday());
  const handleDateSelect = (dateString: string) => dispatch(setSelectedDate(dateString));
  const handleEventPress = (eventId: string) => {
    dispatch(openViewModal(eventId));
    onEventPress?.(eventId);
  };
  
  // Get month label
  const monthLabel = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  
  // Get weekday headers based on week start preference
  const weekdayHeaders = weekStart === 'monday'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Box
      bg={colors.background.card}
      borderRadius="$xl"
      borderWidth={1}
      borderColor={colors.border.primary}
      overflow="hidden"
    >
      {/* Header */}
      <Box
        p="$4"
        borderBottomWidth={1}
        borderColor={colors.border.primary}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center" gap="$3">
            <Pressable onPress={handlePrevMonth} hitSlop={8}>
              <Box
                p="$2"
                borderRadius="$md"
                bg={colors.background.input}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={colors.text.primary}
                />
              </Box>
            </Pressable>
            
            <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
              {monthLabel}
            </Text>
            
            <Pressable onPress={handleNextMonth} hitSlop={8}>
              <Box
                p="$2"
                borderRadius="$md"
                bg={colors.background.input}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={colors.text.primary}
                />
              </Box>
            </Pressable>
          </HStack>
          
          <Pressable onPress={handleToday} hitSlop={8}>
            <Box
              px="$4"
              py="$2"
              borderRadius="$md"
              bg={colors.isDark ? '$primary600' : '$primary100'}
            >
              <Text
                size="sm"
                fontWeight="$semibold"
                color={colors.isDark ? 'white' : '$primary600'}
              >
                Today
              </Text>
            </Box>
          </Pressable>
        </HStack>
      </Box>
      
      {/* Weekday Headers */}
      <HStack borderBottomWidth={1} borderColor={colors.border.primary}>
        {weekdayHeaders.map((day, index) => (
          <Box
            key={day}
            flex={1}
            py="$2"
            alignItems="center"
            bg={colors.background.input}
          >
            <Text
              size="sm"
              fontWeight="$medium"
              color={colors.text.secondary}
            >
              {day}
            </Text>
          </Box>
        ))}
      </HStack>
      
      {/* Calendar Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack>
          {weeks.map((week: WeekCellData, weekIndex: number) => (
            <HStack key={weekIndex} borderBottomWidth={weekIndex < weeks.length - 1 ? 1 : 0} borderColor={colors.border.primary}>
              {week.days.map((day: DayCellData, dayIndex: number) => (
                <DayCell
                  key={day.dateString}
                  day={day}
                  multiDayEvents={multiDayEvents}
                  onDateSelect={handleDateSelect}
                  onEventPress={handleEventPress}
                  weekStart={weekStart}
                />
              ))}
            </HStack>
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
}

// ============================================================================
// Day Cell Component
// ============================================================================

interface DayCellProps {
  day: DayCellData;
  multiDayEvents: Event[];
  onDateSelect: (dateString: string) => void;
  onEventPress: (eventId: string) => void;
  weekStart: 'monday' | 'sunday';
}

function DayCell({
  day,
  multiDayEvents,
  onDateSelect,
  onEventPress,
  weekStart
}: DayCellProps) {
  const colors = useThemedColors();
  
  // Get multi-day events that span this date
  const spanningEvents = useMemo(() => {
    return multiDayEvents.filter(event => {
      if (!event.endDateTime) return false;
      const eventStart = formatDate(new Date(event.startDateTime));
      const eventEnd = formatDate(new Date(event.endDateTime));
      return day.dateString >= eventStart && day.dateString <= eventEnd;
    });
  }, [multiDayEvents, day.dateString]);
  
  // Get regular events for this date
  const regularEvents = useMemo(() => {
    return day.events.filter(event => !isMultiDayEvent(event));
  }, [day.events]);
  
  // Combine events for display (show max 2 in cell + overflow)
  const displayEvents = [...spanningEvents, ...regularEvents].slice(0, 2);
  const overflowCount = day.events.length - displayEvents.length;
  
  return (
    <Pressable
      onPress={() => onDateSelect(day.dateString)}
      flex={1}
      minHeight={100}
      maxHeight={120}
      p="$1"
      bg={
        day.isSelected
          ? colors.isDark
            ? '$primary900'
            : '$primary100'
          : day.isToday
            ? colors.isDark
              ? '$primary800'
              : '#e8f4fd'
            : 'transparent'
      }
      borderWidth={day.isSelected ? 1 : 0}
      borderColor="$primary500"
      borderRadius="$md"
    >
      <VStack flex={1} gap={1}>
        {/* Day number */}
        <Box
          alignItems="center"
          justifyContent="center"
          width={24}
          height={24}
          borderRadius="$full"
          bg={
            day.isToday
              ? colors.isDark
                ? '$primary500'
                : '$primary600'
              : day.isCurrentMonth
                ? 'transparent'
                : 'transparent'
          }
        >
          <Text
            size="sm"
            fontWeight={day.isToday ? '$bold' : day.isCurrentMonth ? '$medium' : '$normal'}
            color={
              day.isToday
                ? 'white'
                : !day.isCurrentMonth
                  ? colors.text.muted
                  : day.isWeekend
                    ? colors.text.secondary
                    : colors.text.primary
            }
          >
            {day.date.getDate()}
          </Text>
        </Box>
        
        {/* Events */}
        <VStack gap={1} flex={1}>
          {displayEvents.map((event) => {
            const position = getMultiDayEventPosition(event, day.dateString);
            const isSpanning = isMultiDayEvent(event);
            
            return (
              <EventBlock
                key={event.id}
                event={event}
                isCompact
                showConnector={isSpanning && (position.isStart || position.isMiddle)}
                onPress={() => onEventPress(event.id)}
              />
            );
          })}
          
          {overflowCount > 0 && (
            <Text
              size="xs"
              color={colors.text.muted}
              fontWeight="$medium"
            >
              +{overflowCount} more
            </Text>
          )}
        </VStack>
      </VStack>
    </Pressable>
  );
}

// ============================================================================
// Event Block Component
// ============================================================================

interface EventBlockProps {
  event: Event;
  isCompact?: boolean;
  showConnector?: boolean;
  onPress?: () => void;
}

function EventBlock({
  event,
  isCompact = false,
  showConnector = false,
  onPress
}: EventBlockProps) {
  const colors = useThemedColors();
  
  // Get event color based on type
  const getEventColor = () => {
    if (event.recurrence !== 'none') {
      return colors.isDark ? '#7c3aed' : '#8b5cf6'; // Purple for recurring
    }
    if (event.isAllDay) {
      return colors.isDark ? '#059669' : '#10b981'; // Green for all-day
    }
    return colors.isDark ? '#2563eb' : '#3b82f6'; // Blue for regular
  };
  
  const eventColor = getEventColor();
  
  return (
    <Pressable onPress={onPress} hitSlop={4}>
      <Box
        bg={eventColor}
        borderRadius="$sm"
        px={isCompact ? "$1" : "$2"}
        py={isCompact ? "$0.5" : "$1"}
        opacity={0.9}
        flex={1}
        overflow="hidden"
      >
        <HStack alignItems="center" gap={2}>
          {showConnector && (
            <Box
              width={4}
              height={4}
              borderRadius="$full"
              bg={eventColor}
            />
          )}
          <Text
            size={isCompact ? "xs" : "sm"}
            color="white"
            fontWeight="$medium"
            numberOfLines={1}
          >
            {event.title}
          </Text>
        </HStack>
        {!isCompact && event.description && (
          <Text
            size="xs"
            color="white"
            opacity={0.8}
            numberOfLines={1}
          >
            {event.description}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}

