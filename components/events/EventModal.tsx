/**
 * Event Modal Component
 * Form for adding and editing calendar events
 */

import { useThemedColors } from '@/constants/colors';
import {
    addEvent,
    selectEditingEventId,
    selectEventById,
    selectEventModalMode,
    updateEvent
} from '@/src/store/eventsSlice';
import {
    EventFormData,
    RECURRENCE_OPTIONS
} from '@/src/types/event';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Box,
    Button,
    FormControl,
    FormControlHelperText,
    FormControlLabel,
    HStack,
    Input,
    InputField,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Pressable,
    Select,
    SelectBackdrop,
    SelectContent,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
    Switch,
    Text,
    Textarea,
    TextareaInput,
    VStack
} from '@gluestack-ui/themed';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({ isOpen, onClose }: EventModalProps) {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  const modalMode = useSelector(selectEventModalMode);
  const editingEventId = useSelector(selectEditingEventId);
  const editingEvent = useSelector(
    editingEventId ? selectEventById(editingEventId) : () => null
  );

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDateTime: new Date().toISOString(),
    endDateTime: undefined,
    isAllDay: false,
    recurrence: 'none',
    createdBy: 'Current User',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  // Parse date/time from ISO string
  const getDateFromISO = (iso: string): string => iso.split('T')[0];
  const getTimeFromISO = (iso: string): string => {
    const time = iso.split('T')[1];
    return time ? time.substring(0, 5) : '09:00';
  };

  useEffect(() => {
    if (modalMode === 'edit' && editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || '',
        startDateTime: editingEvent.startDateTime,
        endDateTime: editingEvent.endDateTime,
        isAllDay: editingEvent.isAllDay,
        recurrence: editingEvent.recurrence,
        createdBy: editingEvent.createdBy,
      });
    } else if (isOpen) {
      // Reset form for add mode
      const now = new Date();
      const hour = now.getHours() + 1;
      const endHour = hour + 1;
      const startISO = new Date(now.setHours(hour, 0, 0, 0)).toISOString();
      const endISO = new Date(now.setHours(endHour, 0, 0, 0)).toISOString();
      
      setFormData({
        title: '',
        description: '',
        startDateTime: startISO,
        endDateTime: endISO,
        isAllDay: false,
        recurrence: 'none',
        createdBy: 'Current User',
      });
    }
    setErrors({});
  }, [modalMode, editingEvent, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.startDateTime) {
      newErrors.startDateTime = 'Start date is required';
    }
    
    if (formData.endDateTime && formData.endDateTime < formData.startDateTime) {
      newErrors.endDateTime = 'End date must be after start date';
    }
    
    if (!formData.createdBy.trim()) {
      newErrors.createdBy = 'Created by is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (modalMode === 'edit' && editingEventId) {
      dispatch(updateEvent({ id: editingEventId, data: formData }));
    } else {
      dispatch(addEvent(formData));
    }
    onClose();
  };

  const handleChange = <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle date/time changes
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const isStart = type === 'start';
    const currentISO = isStart ? formData.startDateTime : formData.endDateTime || formData.startDateTime;
    const timePart = currentISO.split('T')[1] || '09:00:00';
    
    const newISO = `${value}T${timePart}`;
    
    if (isStart) {
      handleChange('startDateTime', newISO);
    } else if (value) {
      handleChange('endDateTime', newISO);
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    const isStart = type === 'start';
    const datePart = (isStart ? formData.startDateTime : formData.endDateTime || formData.startDateTime).split('T')[0];
    const newISO = `${datePart}T${value}:00`;
    
    if (isStart) {
      handleChange('startDateTime', newISO);
    } else if (value) {
      handleChange('endDateTime', newISO);
    }
  };

  const handleAllDayToggle = () => {
    const newIsAllDay = !formData.isAllDay;
    setFormData((prev) => {
      const updated = { ...prev, isAllDay: newIsAllDay };
      // For all-day events, remove end time
      if (newIsAllDay) {
        updated.endDateTime = undefined;
      }
      return updated;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="lg">
      <ModalBackdrop bg="black" opacity={0.5} />
      <ModalContent bg={colors.background.card} borderRadius="$xl">
        <ModalHeader
          borderBottomWidth={1}
          borderColor={colors.border.primary}
          pb="$3"
          pt="$4"
        >
          <HStack alignItems="center" gap="$3">
            <Box
              bg={colors.isDark ? '#312e81' : '#eef2ff'}
              p="$2"
              borderRadius="$md"
            >
              <MaterialCommunityIcons
                name="calendar-plus"
                size={20}
                color={colors.isDark ? '#818cf8' : '#4f46e5'}
              />
            </Box>
            <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
              {modalMode === 'add'
                ? 'Add Event'
                : modalMode === 'edit'
                ? 'Edit Event'
                : 'Event Details'}
            </Text>
          </HStack>
          <ModalCloseButton position="absolute" right="$3" top="$3">
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={colors.text.muted}
            />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody py="$4">
          <VStack gap="$5">
            {/* Title */}
            <FormControl isInvalid={!!errors.title}>
              <FormControlLabel>
                <HStack gap="$1">
                  <MaterialCommunityIcons
                    name="format-title"
                    size={14}
                    color={colors.text.muted}
                  />
                  <Text
                    color={colors.text.secondary}
                    size="sm"
                    fontWeight="$medium"
                  >
                    Title *
                  </Text>
                </HStack>
              </FormControlLabel>
              <Input
                bg={colors.background.input}
                borderColor={colors.border.primary}
                borderRadius="$md"
              >
                <InputField
                  value={formData.title}
                  onChangeText={(v: string) => handleChange('title', v)}
                  placeholder="Event title"
                  placeholderTextColor={colors.text.muted}
                />
              </Input>
              {errors.title && (
                <FormControlHelperText color="$error500">
                  {errors.title}
                </FormControlHelperText>
              )}
            </FormControl>

            {/* All-Day Toggle */}
            <FormControl>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name={formData.isAllDay ? 'calendar-clock' : 'clock-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                  <Text color={colors.text.secondary} size="sm">
                    All-day event
                  </Text>
                </HStack>
                <Pressable
                  onPress={handleAllDayToggle}
                  hitSlop={8}
                >
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor="#f4f3f4"
                    value={formData.isAllDay}
                  />
                </Pressable>
              </HStack>
            </FormControl>

            {/* Date and Time */}
            <HStack gap="$4" flexWrap="wrap">
              {/* Start Date */}
              <FormControl flex={1} minWidth={140} isInvalid={!!errors.startDateTime}>
                <FormControlLabel>
                  <HStack gap="$1">
                    <MaterialCommunityIcons
                      name="calendar-start"
                      size={14}
                      color={colors.text.muted}
                    />
                    <Text
                      color={colors.text.secondary}
                      size="sm"
                      fontWeight="$medium"
                    >
                      {formData.isAllDay ? 'Date *' : 'Start Date *'}
                    </Text>
                  </HStack>
                </FormControlLabel>
                <Input
                  bg={colors.background.input}
                  borderColor={colors.border.primary}
                  borderRadius="$md"
                >
                  <InputField
                    type="date"
                    value={getDateFromISO(formData.startDateTime)}
                    onChangeText={(v: string) => handleDateChange('start', v)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.text.muted}
                  />
                </Input>
              </FormControl>

              {/* Start Time (only for non-all-day) */}
              {!formData.isAllDay && (
                <FormControl flex={1} minWidth={120}>
                  <FormControlLabel>
                    <HStack gap="$1">
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={colors.text.muted}
                      />
                      <Text
                        color={colors.text.secondary}
                        size="sm"
                        fontWeight="$medium"
                      >
                        Start Time
                      </Text>
                    </HStack>
                  </FormControlLabel>
                  <Input
                    bg={colors.background.input}
                    borderColor={colors.border.primary}
                    borderRadius="$md"
                  >
                    <InputField
                      type="time"
                      value={getTimeFromISO(formData.startDateTime)}
                      onChangeText={(v: string) => handleTimeChange('start', v)}
                      placeholder="09:00"
                      placeholderTextColor={colors.text.muted}
                    />
                  </Input>
                </FormControl>
              )}

              {/* End Date (optional) */}
              {formData.isAllDay && (
                <FormControl flex={1} minWidth={140}>
                  <FormControlLabel>
                    <HStack gap="$1">
                      <MaterialCommunityIcons
                        name="calendar-end"
                        size={14}
                        color={colors.text.muted}
                      />
                      <Text
                        color={colors.text.secondary}
                        size="sm"
                        fontWeight="$medium"
                      >
                        End Date
                      </Text>
                    </HStack>
                  </FormControlLabel>
                  <Input
                    bg={colors.background.input}
                    borderColor={colors.border.primary}
                    borderRadius="$md"
                  >
                    <InputField
                      type="date"
                      value={formData.endDateTime ? getDateFromISO(formData.endDateTime) : ''}
                      onChangeText={(v: string) => handleDateChange('end', v)}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.text.muted}
                    />
                  </Input>
                </FormControl>
              )}

              {/* End Time (only for non-all-day) */}
              {!formData.isAllDay && (
                <FormControl flex={1} minWidth={120}>
                  <FormControlLabel>
                    <HStack gap="$1">
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={colors.text.muted}
                      />
                      <Text
                        color={colors.text.secondary}
                        size="sm"
                        fontWeight="$medium"
                      >
                        End Time
                      </Text>
                    </HStack>
                  </FormControlLabel>
                  <Input
                    bg={colors.background.input}
                    borderColor={colors.border.primary}
                    borderRadius="$md"
                  >
                    <InputField
                      type="time"
                      value={formData.endDateTime ? getTimeFromISO(formData.endDateTime) : ''}
                      onChangeText={(v: string) => handleTimeChange('end', v)}
                      placeholder="10:00"
                      placeholderTextColor={colors.text.muted}
                    />
                  </Input>
                </FormControl>
              )}
            </HStack>

            {/* Recurrence */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1">
                  <MaterialCommunityIcons
                    name="calendar-sync"
                    size={14}
                    color={colors.text.muted}
                  />
                  <Text
                    color={colors.text.secondary}
                    size="sm"
                    fontWeight="$medium"
                  >
                    Repeat
                  </Text>
                </HStack>
              </FormControlLabel>
              <Select
                selectedValue={formData.recurrence}
                onValueChange={(v: any) => handleChange('recurrence', v)}
              >
                <SelectTrigger
                  bg={colors.background.input}
                  borderColor={colors.border.primary}
                  borderRadius="$md"
                >
                  <SelectInput />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1">
                  <MaterialCommunityIcons
                    name="text-box-outline"
                    size={14}
                    color={colors.text.muted}
                  />
                  <Text
                    color={colors.text.secondary}
                    size="sm"
                    fontWeight="$medium"
                  >
                    Description (Optional)
                  </Text>
                </HStack>
              </FormControlLabel>
              <Box
                bg={colors.background.input}
                borderRadius="$md"
                borderWidth={1}
                borderColor={colors.border.primary}
              >
                <Textarea
                  bg="transparent"
                >
                  <TextareaInput
                    value={formData.description}
                    onChangeText={(v: string) => handleChange('description', v)}
                    placeholder="Add a description..."
                    placeholderTextColor={colors.text.muted}
                    numberOfLines={3}
                  />
                </Textarea>
              </Box>
            </FormControl>

            {/* Created By */}
            <FormControl isInvalid={!!errors.createdBy}>
              <FormControlLabel>
                <HStack gap="$1">
                  <MaterialCommunityIcons
                    name="account"
                    size={14}
                    color={colors.text.muted}
                  />
                  <Text
                    color={colors.text.secondary}
                    size="sm"
                    fontWeight="$medium"
                  >
                    Created By *
                  </Text>
                </HStack>
              </FormControlLabel>
              <Input
                bg={colors.background.input}
                borderColor={colors.border.primary}
                borderRadius="$md"
              >
                <InputField
                  value={formData.createdBy}
                  onChangeText={(v: string) => handleChange('createdBy', v)}
                  placeholder="Your name"
                  placeholderTextColor={colors.text.muted}
                />
              </Input>
              {errors.createdBy && (
                <FormControlHelperText color="$error500">
                  {errors.createdBy}
                </FormControlHelperText>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTopWidth={1}
          borderColor={colors.border.primary}
          pt="$4"
          pb="$4"
        >
          <HStack gap="$3" w="100%" justifyContent="flex-end">
            <Button
              variant="outline"
              onPress={onClose}
              borderColor={colors.border.primary}
              borderRadius="$md"
            >
              <Text color={colors.text.secondary}>
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </Text>
            </Button>
            {modalMode !== 'view' && (
              <Button
                onPress={handleSubmit}
                bg={colors.isDark ? '$primary500' : '$primary600'}
                borderRadius="$md"
                px="$6"
              >
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name={modalMode === 'add' ? 'plus' : 'check'}
                    size={16}
                    color="white"
                  />
                  <Text color="white" fontWeight="$semibold">
                    {modalMode === 'add' ? 'Add Event' : 'Save Changes'}
                  </Text>
                </HStack>
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

