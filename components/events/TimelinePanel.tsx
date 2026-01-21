/**
 * Timeline Panel Component
 * Side panel showing events by time periods (Today/Week/Month)
 */

import { useThemedColors } from '@/constants/colors';
import {
    openEditModal,
    selectEventsByTimelineTab,
    selectTimelineTab,
    setTimelineTab
} from '@/src/store/eventsSlice';
import { Event, TimePeriod } from '@/src/types/event';
import { formatTime, isEventOngoing } from '@/src/utils/eventHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Box,
    HStack,
    Pressable,
    ScrollView,
    Text,
    VStack
} from '@gluestack-ui/themed';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface TimelinePanelProps {
  onEventPress?: (eventId: string) => void;
}

const TIME_PERIOD_TABS: { key: TimePeriod; label: string; icon: string }[] = [
  { key: 'today', label: 'Today', icon: 'calendar-today' },
  { key: 'week', label: 'This Week', icon: 'calendar-week' },
  { key: 'month', label: 'This Month', icon: 'calendar-month' },
];

export function TimelinePanel({ onEventPress }: TimelinePanelProps) {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  
  const events = useSelector(selectEventsByTimelineTab);
  const currentTab = useSelector(selectTimelineTab);
  
  const handleTabChange = (tab: TimePeriod) => {
    dispatch(setTimelineTab(tab));
  };
  
  const handleEventPress = (eventId: string) => {
    dispatch(openEditModal(eventId));
    onEventPress?.(eventId);
  };
  
  return (
    <Box
      bg={colors.background.card}
      borderRadius="$xl"
      borderWidth={1}
      borderColor={colors.border.primary}
      overflow="hidden"
      height="100%"
    >
      {/* Header */}
      <Box
        p="$4"
        borderBottomWidth={1}
        borderColor={colors.border.primary}
      >
        <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
          Timeline
        </Text>
        <Text size="sm" color={colors.text.muted} mt="$1">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </Text>
      </Box>
      
      {/* Tabs */}
      <HStack
        borderBottomWidth={1}
        borderColor={colors.border.primary}
        px="$2"
      >
        {TIME_PERIOD_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => handleTabChange(tab.key)}
            flex={1}
            py="$3"
            borderBottomWidth={2}
            borderColor={
              currentTab === tab.key
                ? colors.toggle.on
                : 'transparent'
            }
          >
            <VStack alignItems="center" gap="$1">
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={20}
                color={
                  currentTab === tab.key
                    ? colors.toggle.on
                    : colors.text.muted
                }
              />
              <Text
                size="xs"
                fontWeight={currentTab === tab.key ? '$semibold' : '$normal'}
                color={
                  currentTab === tab.key
                    ? colors.toggle.on
                    : colors.text.secondary
                }
              >
                {tab.label}
              </Text>
            </VStack>
          </Pressable>
        ))}
      </HStack>
      
      {/* Events List */}
      <ScrollView flex={1} showsVerticalScrollIndicator={true}>
        {events.length === 0 ? (
          <Box
            flex={1}
            alignItems="center"
            justifyContent="center"
            py="$12"
          >
            <MaterialCommunityIcons
              name="calendar-blank"
              size={48}
              color={colors.text.muted}
            />
            <Text
              size="md"
              color={colors.text.secondary}
              mt="$4"
              textAlign="center"
            >
              No events
            </Text>
            <Text
              size="sm"
              color={colors.text.muted}
              mt="$1"
              textAlign="center"
            >
              {currentTab === 'today'
                ? 'Nothing scheduled for today'
                : currentTab === 'week'
                  ? 'No events this week'
                  : 'No events this month'}
            </Text>
          </Box>
        ) : (
          <VStack p="$3" gap="$2">
            {events.map((event) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event.id)}
              />
            ))}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}

// ============================================================================
// Timeline Event Card Component
// ============================================================================

interface TimelineEventCardProps {
  event: Event;
  onPress?: () => void;
}

function TimelineEventCard({ event, onPress }: TimelineEventCardProps) {
  const colors = useThemedColors();
  const isOngoing = isEventOngoing(event);
  
  // Get event color
  const getEventColor = () => {
    if (isOngoing) {
      return colors.isDark ? '#22c55e' : '#22c55e'; // Green for ongoing
    }
    if (event.recurrence !== 'none') {
      return colors.isDark ? '#7c3aed' : '#8b5cf6'; // Purple for recurring
    }
    if (event.isAllDay) {
      return colors.isDark ? '#059669' : '#10b981'; // Green for all-day
    }
    return colors.isDark ? '#2563eb' : '#3b82f6'; // Blue for regular
  };
  
  const eventColor = getEventColor();
  
  // Format time display
  const formatEventTime = () => {
    if (event.isAllDay) {
      if (event.endDateTime) {
        const start = new Date(event.startDateTime).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        const end = new Date(event.endDateTime).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        return `${start} - ${end}`;
      }
      return 'All day';
    }
    const start = formatTime(event.startDateTime);
    if (event.endDateTime) {
      const end = formatTime(event.endDateTime);
      return `${start} - ${end}`;
    }
    return start;
  };
  
  return (
    <Pressable onPress={onPress}>
      <Box
        bg={colors.background.input}
        borderRadius="$lg"
        borderWidth={1}
        borderColor={colors.border.primary}
        p="$3"
        borderLeftWidth={4}
        borderLeftColor={eventColor}
        opacity={isOngoing ? 1 : 0.9}
      >
        <VStack gap="$2">
          {/* Event Title */}
          <HStack alignItems="center" justifyContent="space-between">
            <Text
              size="md"
              fontWeight="$semibold"
              color={colors.text.primary}
              numberOfLines={1}
              flex={1}
            >
              {event.title}
            </Text>
            {isOngoing && (
              <Box
                px="$2"
                py="$0.5"
                borderRadius="$full"
                bg={colors.isDark ? '#166534' : '#dcfce7'}
              >
                <Text
                  size="xs"
                  fontWeight="$medium"
                  color={colors.isDark ? '#86efac' : '#16a34a'}
                >
                  Now
                </Text>
              </Box>
            )}
          </HStack>
          
          {/* Time */}
          <HStack alignItems="center" gap="$2">
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={colors.text.muted}
            />
            <Text size="sm" color={colors.text.secondary}>
              {formatEventTime()}
            </Text>
          </HStack>
          
          {/* Recurrence badge */}
          {event.recurrence !== 'none' && (
            <HStack alignItems="center" gap="$1">
              <MaterialCommunityIcons
                name="calendar-sync"
                size={12}
                color={colors.text.muted}
              />
              <Text size="xs" color={colors.text.muted} fontWeight="$medium">
                {event.recurrence.charAt(0).toUpperCase() + event.recurrence.slice(1)}
              </Text>
            </HStack>
          )}
          
          {/* Description preview */}
          {event.description && (
            <Text
              size="sm"
              color={colors.text.muted}
              numberOfLines={2}
              mt="$1"
            >
              {event.description}
            </Text>
          )}
          
          {/* Created by */}
          <HStack alignItems="center" gap="$1" mt="$1">
            <MaterialCommunityIcons
              name="account-outline"
              size={12}
              color={colors.text.muted}
            />
            <Text size="xs" color={colors.text.muted}>
              by {event.createdBy}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );
}

