/**
 * Events Calendar Screen
 * Main calendar view combining month calendar and timeline panel
 */

import { CalendarView } from '@/components/events/CalendarView';
import { EventModal } from '@/components/events/EventModal';
import { TimelinePanel } from '@/components/events/TimelinePanel';
import { useThemedColors } from '@/constants/colors';
import {
  closeModal,
  openAddModal,
  selectIsEventModalOpen,
  selectTimelineTab
} from '@/src/store/eventsSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Text,
  VStack
} from '@gluestack-ui/themed';
import React from 'react';
import {
  useWindowDimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function Calendar() {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  const { width } = useWindowDimensions();
  
  const isModalOpen = useSelector(selectIsEventModalOpen);
  const timelineTab = useSelector(selectTimelineTab);
  
  // Responsive breakpoints
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  
  const handleAddEvent = () => dispatch(openAddModal());
  const handleCloseModal = () => dispatch(closeModal());
  
  // Mobile layout: Stack vertically
  if (isMobile) {
    return (
      <Box flex={1} bg={colors.background.primary}>
        {/* Header */}
        <Box
          p="$4"
          borderBottomWidth={1}
          borderColor={colors.border.primary}
          bg={colors.background.card}
        >
          <VStack gap="$2">
            <Text
              size="2xl"
              fontWeight="$bold"
              color={colors.text.primary}
            >
              Events Calendar
            </Text>
            <Text size="sm" color={colors.text.muted}>
              Workspace events and shared planning
            </Text>
          </VStack>
          
          {/* Add Event Button */}
          <Button
            mt="$3"
            w="100%"
            onPress={handleAddEvent}
            bg={colors.isDark ? '$primary500' : '$primary600'}
          >
            <HStack gap="$2" alignItems="center">
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color="white"
              />
              <ButtonText color="white" fontWeight="$semibold">
                Add Event
              </ButtonText>
            </HStack>
          </Button>
        </Box>
        
        {/* Main Content - Stacked */}
        <VStack flex={1} p="$4" gap="$4">
          {/* Calendar */}
          <Box flex={1}>
            <CalendarView />
          </Box>
          
          {/* Timeline Panel */}
          <Box flex={1} minHeight={300}>
            <TimelinePanel />
          </Box>
        </VStack>
        
        {/* Event Modal */}
        <EventModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </Box>
    );
  }
  
  // Desktop/Tablet layout: Side by side
  return (
    <Box flex={1} bg={colors.background.primary} p="$4">
      {/* Header */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        mb="$4"
      >
        <VStack>
          <Text
            size="2xl"
            fontWeight="$bold"
            color={colors.text.primary}
          >
            Events Calendar
          </Text>
          <Text size="sm" color={colors.text.muted}>
            Workspace events and shared planning
          </Text>
        </VStack>
        
        <Button
          onPress={handleAddEvent}
          bg={colors.isDark ? '$primary500' : '$primary600'}
        >
          <HStack gap="$2" alignItems="center">
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="white"
            />
            <ButtonText color="white" fontWeight="$semibold">
              Add Event
            </ButtonText>
          </HStack>
        </Button>
      </HStack>
      
      {/* Main Content - Split View */}
      <HStack
        gap="$4"
        flex={1}
        alignItems="flex-start"
      >
        {/* Left Side - Calendar */}
        <Box flex={1.5} minWidth={0}>
          <CalendarView />
        </Box>
        
        {/* Right Side - Timeline Panel */}
        <Box
          flex={1}
          minWidth={300}
          maxWidth={400}
          height="100%"
        >
          <TimelinePanel />
        </Box>
      </HStack>
      
      {/* Event Modal */}
      <EventModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </Box>
  );
}

