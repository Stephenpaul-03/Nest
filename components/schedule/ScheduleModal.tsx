/**
 * Schedule Modal Component
 * Form for adding and editing medical schedule items
 */

import { useThemedColors } from '@/constants/colors';
import {
  addItem,
  selectEditingScheduleItemId,
  selectScheduleItemById,
  selectScheduleModalMode,
  updateItem
} from '@/src/store/scheduleSlice';
import {
  DEFAULT_USERS,
  DOSAGE_UNITS,
  FREQUENCY_OPTIONS,
  ScheduleFormData
} from '@/src/types/schedule';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
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
  Select,
  SelectBackdrop,
  SelectContent,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  const modalMode = useSelector(selectScheduleModalMode);
  const editingItemId = useSelector(selectEditingScheduleItemId);
  const editingItem = useSelector(
    editingItemId ? selectScheduleItemById(editingItemId) : () => null
  );

  const [formData, setFormData] = useState<ScheduleFormData>({
    medicineName: '',
    personId: '',
    personName: '',
    dosageAmount: '1',
    dosageUnit: 'tablet',
    times: ['09:00'],
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
    notes: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ScheduleFormData, string>>
  >({});

  // Time editing state
  const [newTime, setNewTime] = useState('09:00');

  useEffect(() => {
    if (modalMode === 'edit' && editingItem) {
      setFormData({
        medicineName: editingItem.medicineName,
        personId: editingItem.personId,
        personName: editingItem.personName,
        dosageAmount: editingItem.dosageAmount,
        dosageUnit: editingItem.dosageUnit,
        times: editingItem.times,
        frequency: editingItem.frequency,
        startDate: editingItem.startDate,
        isActive: editingItem.isActive,
        notes: editingItem.notes || '',
      });
    } else if (isOpen) {
      setFormData({
        medicineName: '',
        personId: '',
        personName: '',
        dosageAmount: '1',
        dosageUnit: 'tablet',
        times: ['09:00'],
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        isActive: true,
        notes: '',
      });
      setNewTime('09:00');
    }
    setErrors({});
  }, [modalMode, editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ScheduleFormData, string>> = {};
    if (!formData.medicineName.trim())
      newErrors.medicineName = 'Medicine name is required';
    if (!formData.personId) newErrors.personId = 'Please select a person';
    if (!formData.dosageAmount.trim())
      newErrors.dosageAmount = 'Dosage amount is required';
    if (formData.times.length === 0)
      newErrors.times = 'At least one time is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (modalMode === 'edit' && editingItemId) {
      dispatch(updateItem({ id: editingItemId, data: formData }));
    } else {
      dispatch(addItem(formData));
    }
    onClose();
  };

  // Handle delete
  const handleDelete = () => {
    if (editingItemId) {
      dispatch(deleteItem(editingItemId));
      onClose();
    }
  };

  const handleChange = (
    field: keyof ScheduleFormData,
    value: string | string[] | boolean | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePersonChange = (value: string) => {
    const person = DEFAULT_USERS.find((p) => p.id === value);
    if (person) {
      setFormData((prev) => ({
        ...prev,
        personId: value,
        personName: person.name,
      }));
    }
    if (errors.personId) setErrors((prev) => ({ ...prev, personId: undefined }));
  };

  const handleAddTime = () => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTime)) {
      setErrors((prev) => ({ ...prev, times: 'Invalid time format (HH:MM)' }));
      return;
    }
    if (!formData.times.includes(newTime)) {
      handleChange('times', [...formData.times, newTime].sort());
    }
    setNewTime('09:00');
  };

  const handleRemoveTime = (timeToRemove: string) => {
    handleChange(
      'times',
      formData.times.filter((t) => t !== timeToRemove)
    );
  };

  const getTimeLabel = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getPeriodForTime = (time: string): string => {
    const [hours] = time.split(':').map(Number);
    if (hours >= 5 && hours < 12) return 'Morning';
    if (hours >= 12 && hours < 17) return 'Afternoon';
    if (hours >= 17 && hours < 20) return 'Evening';
    return 'Night';
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
                name="pill"
                size={20}
                color={colors.isDark ? '#818cf8' : '#4f46e5'}
              />
            </Box>
            <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
              {modalMode === 'add'
                ? 'Add Medicine Schedule'
                : 'Edit Medicine Schedule'}
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
            {/* Medicine Name */}
            <FormControl isInvalid={!!errors.medicineName}>
              <FormControlLabel>
                <HStack gap="$1">
                  <MaterialCommunityIcons
                    name="pill"
                    size={14}
                    color={colors.text.muted}
                  />
                  <Text
                    color={colors.text.secondary}
                    size="sm"
                    fontWeight="$medium"
                  >
                    Medicine Name *
                  </Text>
                </HStack>
              </FormControlLabel>
              <Input
                bg={colors.background.input}
                borderColor={colors.border.primary}
                borderRadius="$md"
              >
                <InputField
                  value={formData.medicineName}
                  onChangeText={(v: string) => handleChange('medicineName', v)}
                  placeholder="e.g., Metformin 500mg"
                  placeholderTextColor={colors.text.muted}
                />
              </Input>
              {errors.medicineName && (
                <FormControlHelperText color="$error500">
                  {errors.medicineName}
                </FormControlHelperText>
              )}
            </FormControl>

            {/* Person Selection */}
            <FormControl isInvalid={!!errors.personId}>
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
                    Person *
                  </Text>
                </HStack>
              </FormControlLabel>
              <Select
                selectedValue={formData.personId}
                onValueChange={handlePersonChange}
              >
                <SelectTrigger
                  bg={colors.background.input}
                  borderColor={colors.border.primary}
                  borderRadius="$md"
                >
                  <SelectInput placeholder="Select person" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    {DEFAULT_USERS.map((user) => (
                      <SelectItem
                        key={user.id}
                        label={user.name}
                        value={user.id}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
              {errors.personId && (
                <FormControlHelperText color="$error500">
                  {errors.personId}
                </FormControlHelperText>
              )}
            </FormControl>

            {/* Dosage Amount and Unit */}
            <HStack gap="$4" flexWrap="wrap">
              <FormControl flex={1} minWidth={140} isInvalid={!!errors.dosageAmount}>
                <FormControlLabel>
                  <HStack gap="$1">
                    <MaterialCommunityIcons
                      name="scale-bathroom"
                      size={14}
                      color={colors.text.muted}
                    />
                    <Text
                      color={colors.text.secondary}
                      size="sm"
                      fontWeight="$medium"
                    >
                      Dosage *
                    </Text>
                  </HStack>
                </FormControlLabel>
                <Input
                  bg={colors.background.input}
                  borderColor={colors.border.primary}
                  borderRadius="$md"
                >
                  <InputField
                    value={formData.dosageAmount}
                    onChangeText={(v: string) => handleChange('dosageAmount', v)}
                    placeholder="e.g., 1, 1/2, 2"
                    placeholderTextColor={colors.text.muted}
                  />
                </Input>
              </FormControl>
              <FormControl flex={1} minWidth={140}>
                <FormControlLabel>
                  <HStack gap="$1">
                    <MaterialCommunityIcons
                      name="format-list-bulleted"
                      size={14}
                      color={colors.text.muted}
                    />
                    <Text
                      color={colors.text.secondary}
                      size="sm"
                      fontWeight="$medium"
                    >
                      Unit
                    </Text>
                  </HStack>
                </FormControlLabel>
                <Select
                  selectedValue={formData.dosageUnit}
                  onValueChange={(v: string) =>
                    handleChange('dosageUnit', v)
                  }
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
                      {DOSAGE_UNITS.map((unit) => (
                        <SelectItem
                          key={unit.value}
                          label={unit.label}
                          value={unit.value}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </FormControl>
            </HStack>

            {/* Times */}
            <FormControl isInvalid={!!errors.times}>
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
                    Times *
                  </Text>
                </HStack>
              </FormControlLabel>

              {/* Existing times chips */}
              {formData.times.length > 0 && (
                <HStack gap="$2" flexWrap="wrap" mb="$2">
                  {formData.times.map((time) => (
                    <HStack
                      key={time}
                      bg={colors.isDark ? '$primary500' : '$primary100'}
                      borderRadius="$md"
                      px="$2"
                      py="$1"
                      alignItems="center"
                      gap="$1"
                    >
                      <Text
                        size="sm"
                        color={
                          colors.isDark
                            ? '$textLight50'
                            : '$textDark900'
                        }
                      >
                        {getTimeLabel(time)}
                      </Text>
                      <Text
                        size="xs"
                        color={
                          colors.isDark
                            ? '$textLight200'
                            : '$textDark700'
                        }
                      >
                        {getPeriodForTime(time)}
                      </Text>
                      <Pressable
                        onPress={() => handleRemoveTime(time)}
                        hitSlop={8}
                      >
                        <MaterialCommunityIcons
                          name="close"
                          size={14}
                          color={
                            colors.isDark
                              ? '$textLight200'
                              : '$textDark700'
                          }
                        />
                      </Pressable>
                    </HStack>
                  ))}
                </HStack>
              )}

              {/* Add time input */}
              <HStack gap="$2">
                <Input
                  bg={colors.background.input}
                  borderColor={colors.border.primary}
                  borderRadius="$md"
                  flex={1}
                >
                  <InputField
                    value={newTime}
                    onChangeText={setNewTime}
                    placeholder="HH:MM (24h)"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="numeric"
                  />
                </Input>
                <Button
                  variant="outline"
                  onPress={handleAddTime}
                  borderColor={colors.border.primary}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={18}
                    color={colors.text.secondary}
                  />
                  <ButtonText color={colors.text.secondary}>Add</ButtonText>
                </Button>
              </HStack>
              {errors.times && (
                <FormControlHelperText color="$error500">
                  {errors.times}
                </FormControlHelperText>
              )}
            </FormControl>

            {/* Frequency */}
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
                    Frequency
                  </Text>
                </HStack>
              </FormControlLabel>
              <Select
                selectedValue={formData.frequency}
                onValueChange={(v: string) => handleChange('frequency', v)}
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
                    {FREQUENCY_OPTIONS.map((option) => (
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

            {/* Start Date */}
            <FormControl isInvalid={!!errors.startDate}>
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
                    Start Date *
                  </Text>
                </HStack>
              </FormControlLabel>
              <Input
                bg={colors.background.input}
                borderColor={colors.border.primary}
                borderRadius="$md"
              >
                <InputField
                  value={formData.startDate}
                  onChangeText={(v: string) => handleChange('startDate', v)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text.muted}
                />
              </Input>
              {errors.startDate && (
                <FormControlHelperText color="$error500">
                  {errors.startDate}
                </FormControlHelperText>
              )}
            </FormControl>

            {/* Active Status */}
            <FormControl>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons
                    name={formData.isActive ? 'play-circle' : 'pause-circle'}
                    size={20}
                    color={
                      formData.isActive
                        ? colors.toggle.on
                        : colors.text.muted
                    }
                  />
                  <Text color={colors.text.secondary} size="sm">
                    {formData.isActive ? 'Active' : 'Paused'}
                  </Text>
                </HStack>
                <Pressable
                  onPress={() => handleChange('isActive', !formData.isActive)}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons
                    name={
                      formData.isActive
                        ? 'toggle-switch'
                        : 'toggle-switch-off'
                    }
                    size={28}
                    color={
                      formData.isActive
                        ? colors.toggle.on
                        : colors.toggle.off
                    }
                  />
                </Pressable>
              </HStack>
            </FormControl>

            {/* Notes */}
            <FormControl>
              <FormControlLabel>
                <HStack gap="$1">
                  <MaterialCommunityIcons
                    name="note-text-outline"
                    size={14}
                    color={colors.text.muted}
                  />
                  <Text
                    color={colors.text.secondary}
                    size="sm"
                    fontWeight="$medium"
                  >
                    Notes (Optional)
                  </Text>
                </HStack>
              </FormControlLabel>
              <Input
                bg={colors.background.input}
                borderColor={colors.border.primary}
                borderRadius="$md"
              >
                <InputField
                  value={formData.notes}
                  onChangeText={(v: string) => handleChange('notes', v)}
                  placeholder="Additional notes..."
                  placeholderTextColor={colors.text.muted}
                  textAlignVertical="top"
                  numberOfLines={2}
                  multiline
                />
              </Input>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter
          borderTopWidth={1}
          borderColor={colors.border.primary}
          pt="$4"
          pb="$4"
        >
          <HStack gap="$3" w="100%" justifyContent="space-between" alignItems="center">
            {modalMode === 'edit' ? (
              <Button
                variant="outline"
                onPress={handleDelete}
                borderColor="$error500"
                borderRadius="$md"
              >
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons name="delete" size={16} color="#ef4444" />
                  <Text color="$error500" fontWeight="$medium">Delete</Text>
                </HStack>
              </Button>
            ) : (
              <Box />
            )}
            <HStack gap="$3">
              <Button
                variant="outline"
                onPress={onClose}
                borderColor={colors.border.primary}
                borderRadius="$md"
              >
                <Text color={colors.text.secondary}>Cancel</Text>
              </Button>
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
                    {modalMode === 'add' ? 'Add Schedule' : 'Save Changes'}
                  </Text>
                </HStack>
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


