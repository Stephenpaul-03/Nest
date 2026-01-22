/**
 * Medical Schedule Screen
 * Timetable-style medicine schedule with person-based view
 */

import { ScheduleModal } from '@/components/schedule/ScheduleModal';
import { useThemedColors } from '@/constants/colors';
import {
  closeModal,
  deleteItem,
  openAddModal,
  openEditModal,
  selectFilteredItems,
  selectIsEditMode,
  selectIsScheduleModalOpen,
  selectScheduleFilters,
  selectScheduleItems,
  selectScheduleVisibilityOptions,
  selectUniquePeople,
  toggleActive,
  toggleEditMode
} from '@/src/store/scheduleSlice';
import { TIME_PERIOD_RANGES, TIME_PERIODS, TimePeriod } from '@/src/types/schedule';
import {
  formatTime,
  getPersonScheduleSummary,
  getTimetableData
} from '@/src/utils/scheduleHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack
} from '@gluestack-ui/themed';
import React, { useMemo, useState } from 'react';
import {
  useWindowDimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function Schedule() {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  const items = useSelector(selectScheduleItems);
  const filteredItems = useSelector(selectFilteredItems);
  const people = useSelector(selectUniquePeople);
  const filters = useSelector(selectScheduleFilters);
  const visibilityOptions = useSelector(selectScheduleVisibilityOptions);
  const isEditMode = useSelector(selectIsEditMode);
  const isModalOpen = useSelector(selectIsScheduleModalOpen);

  const [selectedPersonId, setSelectedPersonId] = useState<string>('all');

  // Get items for selected person
  const personItems = useMemo(() => {
    if (selectedPersonId === 'all') {
      return filteredItems;
    }
    return filteredItems.filter((item) => item.personId === selectedPersonId);
  }, [filteredItems, selectedPersonId]);

  // Get timetable data grouped by time periods
  const timetableData = useMemo(() => {
    return getTimetableData(personItems);
  }, [personItems]);

  // Get person summary
  const personSummary = useMemo(() => {
    return getPersonScheduleSummary(personItems);
  }, [personItems]);

  // Get all people including from items (in case some don't have schedules)
  const allPeople = useMemo(() => {
    const peopleSet = new Map<string, string>();
    people.forEach((p) => peopleSet.set(p.id, p.name));
    items.forEach((item) => {
      if (!peopleSet.has(item.personId)) {
        peopleSet.set(item.personId, item.personName);
      }
    });
    return Array.from(peopleSet.entries()).map(([id, name]) => ({ id, name }));
  }, [people, items]);

  const handleAddItem = () => dispatch(openAddModal());
  const handleEditItem = (id: string) => dispatch(openEditModal(id));
  const handleDeleteItem = (id: string) => dispatch(deleteItem(id));
  const handleToggleActive = (id: string) => dispatch(toggleActive(id));
  const handleToggleEditMode = () => dispatch(toggleEditMode());
  const handleCloseModal = () => dispatch(closeModal());

  const handlePersonChange = (personId: string) => {
    setSelectedPersonId(personId);
  };

  // Render person tabs for mobile/tablet
  const renderPersonTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      mb="$4"
      py="$1"
    >
      <HStack gap="$2">
        <Pressable
          onPress={() => setSelectedPersonId('all')}
          hitSlop={8}
        >
          <Box
            bg={
              selectedPersonId === 'all'
                ? colors.isDark
                  ? '$primary600'
                  : '$primary500'
                : colors.background.input
            }
            borderRadius="$lg"
            px="$4"
            py="$2"
            borderWidth={1}
            borderColor={
              selectedPersonId === 'all'
                ? colors.isDark
                  ? '$primary500'
                  : '$primary500'
                : colors.border.primary
            }
          >
            <Text
              size="sm"
              fontWeight="$semibold"
              color={
                selectedPersonId === 'all'
                  ? 'white'
                  : colors.text.primary
              }
            >
              All People
            </Text>
          </Box>
        </Pressable>
        {allPeople.map((person) => (
          <Pressable
            key={person.id}
            onPress={() => setSelectedPersonId(person.id)}
            hitSlop={8}
          >
            <Box
              bg={
                selectedPersonId === person.id
                  ? colors.isDark
                    ? '$primary600'
                    : '$primary500'
                  : colors.background.input
              }
              borderRadius="$lg"
              px="$4"
              py="$2"
              borderWidth={1}
              borderColor={
                selectedPersonId === person.id
                  ? colors.isDark
                    ? '$primary500'
                    : '$primary500'
                  : colors.border.primary
              }
            >
              <Text
                size="sm"
                fontWeight="$semibold"
                color={
                  selectedPersonId === person.id
                    ? 'white'
                    : colors.text.primary
                }
              >
                {person.name}
              </Text>
            </Box>
          </Pressable>
        ))}
      </HStack>
    </ScrollView>
  );

  // Render overview panel
  const renderOverview = () => (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p={isMobile ? '$3' : '$4'}
    >
      <HStack gap="$2" alignItems="center" mb="$3">
        <MaterialCommunityIcons
          name="chart-donut"
          size={isMobile ? 18 : 20}
          color={colors.text.secondary}
        />
        <Text
          size={isMobile ? 'sm' : 'md'}
          fontWeight="$semibold"
          color={colors.text.primary}
        >
          Overview
        </Text>
      </HStack>
      {items.length === 0 ? (
        <Text size="sm" color={colors.text.muted} textAlign="center" py="$4">
          Add schedules to see overview
        </Text>
      ) : (
        <VStack gap="$2">
          <HStack justifyContent="space-between">
            <Text size="sm" color={colors.text.secondary}>
              Active Schedules
            </Text>
            <Text
              size="sm"
              fontWeight="$semibold"
              color={colors.toggle.on}
            >
              {personSummary.activeSchedules}
            </Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text size="sm" color={colors.text.secondary}>
              Paused
            </Text>
            <Text
              size="sm"
              fontWeight="$semibold"
              color={colors.text.secondary}
            >
              {personSummary.pausedSchedules}
            </Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text size="sm" color={colors.text.secondary}>
              Total Daily Doses
            </Text>
            <Text
              size="sm"
              fontWeight="$bold"
              color={colors.text.primary}
            >
              {personSummary.totalDailyDoses}
            </Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text size="sm" color={colors.text.secondary}>
              Unique Medicines
            </Text>
            <Text
              size="sm"
              fontWeight="$semibold"
              color={colors.text.primary}
            >
              {personSummary.uniqueMedicines}
            </Text>
          </HStack>
        </VStack>
      )}
    </Box>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      p="$12"
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor={colors.border.primary}
    >
      <MaterialCommunityIcons
        name="pill"
        size={64}
        color={colors.text.muted}
      />
      <Text
        size="xl"
        fontWeight="$semibold"
        color={colors.text.secondary}
        mt="$4"
        textAlign="center"
      >
        No schedules yet
      </Text>
      <Text
        size="sm"
        color={colors.text.muted}
        mt="$1"
        textAlign="center"
        mb="$4"
      >
        Add a medicine schedule to start tracking medication times
      </Text>
      <Button
        onPress={handleAddItem}
        bg={colors.isDark ? '$primary500' : '$primary600'}
      >
        <HStack gap="$2" alignItems="center">
          <MaterialCommunityIcons
            name="plus"
            size={18}
            color="white"
          />
          <ButtonText color="white" fontWeight="$semibold">
            Add Schedule
          </ButtonText>
        </HStack>
      </Button>
    </Box>
  );

  // Render a single time period column
  const renderTimePeriod = (period: TimePeriod) => {
    const periodData = timetableData.get(period) || [];
    const periodInfo = TIME_PERIOD_RANGES[period];

    if (periodData.length === 0) {
      return (
        <VStack
          flex={1}
          minWidth={isMobile ? '100%' : 180}
          bg={colors.background.card}
          borderRadius="$lg"
          borderWidth={1}
          borderColor={colors.border.primary}
          p="$3"
          m={isMobile ? '$2' : '$1'}
        >
          <HStack gap="$2" alignItems="center" mb="$2">
            <MaterialCommunityIcons
              name={periodInfo.icon as any}
              size={18}
              color={colors.text.secondary}
            />
            <Text
              size="md"
              fontWeight="$semibold"
              color={colors.text.primary}
            >
              {periodInfo.label}
            </Text>
          </HStack>
          <Text
            size="sm"
            color={colors.text.muted}
            textAlign="center"
            mt="$4"
            mb="$4"
          >
            No medicines scheduled
          </Text>
        </VStack>
      );
    }

    return (
      <VStack
        flex={1}
        minWidth={isMobile ? '100%' : 180}
        bg={colors.background.card}
        borderRadius="$lg"
        borderWidth={1}
        borderColor={colors.border.primary}
        p="$3"
        m={isMobile ? '$2' : '$1'}
      >
        <HStack gap="$2" alignItems="center" mb="$3">
          <MaterialCommunityIcons
            name={periodInfo.icon as any}
            size={18}
            color={colors.text.secondary}
          />
          <Text
            size="md"
            fontWeight="$semibold"
            color={colors.text.primary}
          >
            {periodInfo.label}
          </Text>
        </HStack>
        <VStack gap="$2">
          {periodData.map(({ item, time }) => (
            <Box
              key={`${item.id}-${time}`}
              bg={colors.background.input}
              borderRadius="$md"
              p="$2"
              borderLeftWidth={3}
              borderLeftColor={
                item.isActive
                  ? colors.toggle.on
                  : colors.toggle.off
              }
              opacity={item.isActive ? 1 : 0.6}
            >
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack flex={1}>
                  <Text
                    size="sm"
                    fontWeight="$semibold"
                    color={colors.text.primary}
                    numberOfLines={1}
                  >
                    {item.medicineName}
                  </Text>
                  <Text size="xs" color={colors.text.muted}>
                    {item.dosageAmount} {item.dosageUnit}
                    {item.notes && ` • ${item.notes}`}
                  </Text>
                </VStack>
                <Text size="sm" color={colors.text.secondary}>
                  {formatTime(time)}
                </Text>
              </HStack>
              {isEditMode && (
                <HStack gap="$1" mt="$2">
                  <Button
                    size="xs"
                    variant="outline"
                    onPress={() => handleEditItem(item.id)}
                    flex={1}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={12}
                      color={colors.text.secondary}
                    />
                    <ButtonText size="xs">Edit</ButtonText>
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onPress={() => handleToggleActive(item.id)}
                    flex={1}
                  >
                    <MaterialCommunityIcons
                      name={item.isActive ? 'pause' : 'play'}
                      size={12}
                      color={colors.text.secondary}
                    />
                    <ButtonText size="xs">
                      {item.isActive ? 'Pause' : 'Resume'}
                    </ButtonText>
                  </Button>
                </HStack>
              )}
            </Box>
          ))}
        </VStack>
      </VStack>
    );
  };

  // Render mobile view
  const renderMobileView = () => (
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
            size="xl"
            fontWeight="$bold"
            color={colors.text.primary}
          >
            Medicine Schedule
          </Text>
          <Text size="sm" color={colors.text.muted}>
            {personSummary.activeSchedules} active •{' '}
            {personSummary.totalDailyDoses} doses today
          </Text>
        </VStack>
        <Button
          mt="$3"
          w="100%"
          onPress={handleAddItem}
          bg={colors.isDark ? '$primary500' : '$primary600'}
        >
          <HStack gap="$2" alignItems="center">
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="white"
            />
            <ButtonText color="white" fontWeight="$semibold">
              Add Schedule
            </ButtonText>
          </HStack>
        </Button>
      </Box>

      <ScrollView flex={1} p="$4" showsVerticalScrollIndicator={true}>
        {/* Person Selector */}
        {items.length > 0 && renderPersonTabs()}

        {/* Overview */}
        {renderOverview()}

        {/* Timetable */}
        {items.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Text
              size="lg"
              fontWeight="$bold"
              color={colors.text.primary}
              mb="$3"
              mt="$2"
            >
              Today's Schedule
            </Text>
            <VStack gap="$4">
              {TIME_PERIODS.map((period) => (
                <Box key={period}>
                  {renderTimePeriod(period)}
                </Box>
              ))}
            </VStack>
          </>
        )}
      </ScrollView>

      {/* Edit Mode FAB */}
      <Pressable
        onPress={handleToggleEditMode}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
        }}
      >
        <Box
          bg={isEditMode ? colors.toggle.on : colors.background.card}
          borderRadius="$full"
          p="$3"
          borderWidth={2}
          borderColor={isEditMode ? colors.toggle.on : colors.border.primary}
        >
          <MaterialCommunityIcons
            name={isEditMode ? 'check' : 'pencil'}
            size={24}
            color={isEditMode ? 'white' : colors.text.primary}
          />
        </Box>
      </Pressable>

      <ScheduleModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </Box>
  );

  // Render desktop/tablet view
  const renderDesktopView = () => (
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
            Medicine Schedule
          </Text>
          <Text size="sm" color={colors.text.muted}>
            {personSummary.activeSchedules} active •{' '}
            {personSummary.totalDailyDoses} doses today
          </Text>
        </VStack>
        <HStack gap="$3">
          <Button
            variant="outline"
            onPress={handleToggleEditMode}
            borderColor={
              isEditMode ? colors.toggle.on : colors.border.primary
            }
          >
            <HStack gap="$2" alignItems="center">
              <MaterialCommunityIcons
                name={isEditMode ? 'check' : 'pencil'}
                size={18}
                color={isEditMode ? colors.toggle.on : colors.text.secondary}
              />
              <ButtonText
                color={isEditMode ? colors.toggle.on : colors.text.secondary}
              >
                {isEditMode ? 'Done Editing' : 'Edit Mode'}
              </ButtonText>
            </HStack>
          </Button>
          <Button
            onPress={handleAddItem}
            bg={colors.isDark ? '$primary500' : '$primary600'}
          >
            <HStack gap="$2" alignItems="center">
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color="white"
              />
              <ButtonText color="white" fontWeight="$semibold">
                Add Schedule
              </ButtonText>
            </HStack>
          </Button>
        </HStack>
      </HStack>

      <HStack gap="$4" flex={1} alignItems="flex-start">
        {/* Left Sidebar - Person Selector & Filters */}
        {items.length > 0 && (
          <VStack
            gap="$4"
            minWidth={220}
            maxWidth={280}
            mr="$2"
          >
            {/* Person Selector */}
            <Box
              bg={colors.background.card}
              borderRadius="$lg"
              borderWidth={1}
              borderColor={colors.border.primary}
              p="$4"
            >
              <Text
                size="md"
                fontWeight="$semibold"
                color={colors.text.primary}
                mb="$3"
              >
                Select Person
              </Text>
              <VStack gap="$2">
                <Pressable
                  onPress={() => setSelectedPersonId('all')}
                  hitSlop={8}
                >
                  <Box
                    bg={
                      selectedPersonId === 'all'
                        ? colors.isDark
                          ? '$primary600'
                          : '$primary100'
                      : colors.background.input
                    }
                    borderRadius="$md"
                    p="$2"
                    borderWidth={1}
                    borderColor={
                      selectedPersonId === 'all'
                        ? colors.toggle.on
                        : colors.border.primary
                    }
                  >
                    <HStack alignItems="center" gap="$2">
                      <MaterialCommunityIcons
                        name="account-group"
                        size={18}
                        color={
                          selectedPersonId === 'all'
                            ? colors.toggle.on
                            : colors.text.secondary
                        }
                      />
                      <Text
                        size="sm"
                        fontWeight="$medium"
                        color={colors.text.primary}
                      >
                        All People
                      </Text>
                    </HStack>
                  </Box>
                </Pressable>
                {allPeople.map((person) => (
                  <Pressable
                    key={person.id}
                    onPress={() => setSelectedPersonId(person.id)}
                    hitSlop={8}
                  >
                    <Box
                      bg={
                        selectedPersonId === person.id
                          ? colors.isDark
                            ? '$primary600'
                            : '$primary100'
                          : colors.background.input
                      }
                      borderRadius="$md"
                      p="$2"
                      borderWidth={1}
                      borderColor={
                        selectedPersonId === person.id
                          ? colors.toggle.on
                          : colors.border.primary
                      }
                    >
                      <HStack alignItems="center" gap="$2">
                        <MaterialCommunityIcons
                          name="account"
                          size={18}
                          color={
                            selectedPersonId === person.id
                              ? colors.toggle.on
                              : colors.text.secondary
                          }
                        />
                        <Text
                          size="sm"
                          fontWeight="$medium"
                          color={colors.text.primary}
                        >
                          {person.name}
                        </Text>
                      </HStack>
                    </Box>
                  </Pressable>
                ))}
              </VStack>
            </Box>

            {/* Overview */}
            {renderOverview()}
          </VStack>
        )}

        {/* Main Content - Timetable */}
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={true}
        >
          {items.length === 0 ? (
            renderEmptyState()
          ) : (
            <HStack
              gap="$2"
              flexWrap={isTablet ? 'wrap' : 'nowrap'}
              alignItems="flex-start"
            >
              {TIME_PERIODS.map((period) => (
                <Box
                  key={period}
                  flex={1}
                  minWidth={180}
                  maxWidth={isTablet ? '45%' : undefined}
                >
                  {renderTimePeriod(period)}
                </Box>
              ))}
            </HStack>
          )}
        </ScrollView>
      </HStack>

      <ScheduleModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </Box>
  );

  // Return appropriate view based on screen size
  if (isMobile) {
    return renderMobileView();
  }

  return renderDesktopView();
}

