/**
 * Item Modal Component
 * Form for adding and editing medical inventory items
 */
import { useThemedColors } from '@/constants/colors';
import { addItem, deleteItem, selectEditingItemId, selectItemById, selectModalMode, updateItem } from '@/src/store/inventorySlice';
import { DEFAULT_LOW_STOCK_THRESHOLD, DEFAULT_USERS, ITEM_UNITS, ItemFormData } from '@/src/types/inventory';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, Button, FormControl, FormControlHelperText, FormControlLabel, HStack, Input, InputField, Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Select, SelectBackdrop, SelectContent, SelectInput, SelectItem, SelectPortal, SelectTrigger, Text, VStack } from '@gluestack-ui/themed';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface ItemModalProps { isOpen: boolean; onClose: () => void; }

export function ItemModal({ isOpen, onClose }: ItemModalProps) {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  const modalMode = useSelector(selectModalMode);
  const editingItemId = useSelector(selectEditingItemId);
  const editingItem = useSelector(editingItemId ? selectItemById(editingItemId) : () => null);
  
  const [formData, setFormData] = useState<ItemFormData>({
    name: '', type: 'medicine', category: '', quantity: 0, unit: 'tablets', 
    tabletsPerStrip: undefined, expiryDate: '', lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD, 
    assignedTo: '', notes: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});
  const [numStrips, setNumStrips] = useState('0');
  const [tabletsPerStripInput, setTabletsPerStripInput] = useState('10');

  useEffect(() => {
    if (modalMode === 'edit' && editingItem) {
      setFormData({
        name: editingItem.name, type: 'medicine', category: editingItem.category,
        quantity: editingItem.quantity, unit: editingItem.unit,
        tabletsPerStrip: editingItem.tabletsPerStrip, expiryDate: editingItem.expiryDate || '',
        lowStockThreshold: editingItem.lowStockThreshold, assignedTo: editingItem.assignedTo || '', notes: editingItem.notes || ''
      });
      if (editingItem.unit === 'strips' && editingItem.tabletsPerStrip) {
        setNumStrips(String(editingItem.quantity));
        setTabletsPerStripInput(String(editingItem.tabletsPerStrip));
      }
    } else if (isOpen) {
      setFormData({ name: '', type: 'medicine', category: '', quantity: 0, unit: 'tablets', tabletsPerStrip: undefined, expiryDate: '', lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD, assignedTo: '', notes: '' });
      setNumStrips('0');
      setTabletsPerStripInput('10');
    }
    setErrors({});
  }, [modalMode, editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ItemFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (formData.lowStockThreshold < 0) newErrors.lowStockThreshold = 'Threshold cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const itemData: ItemFormData = { ...formData };
    if (modalMode === 'edit' && editingItemId) dispatch(updateItem({ id: editingItemId, data: itemData }));
    else dispatch(addItem(itemData));
    onClose();
  };

  // Handle delete
  const handleDelete = () => {
    if (editingItemId) {
      dispatch(deleteItem(editingItemId));
      onClose();
    }
  };

  const handleChange = (field: keyof ItemFormData, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleUnitChange = (value: string) => {
    const unit = value as 'tablets' | 'bottles' | 'strips';
    setFormData((prev) => ({ ...prev, unit, tabletsPerStrip: unit === 'strips' ? prev.tabletsPerStrip : undefined }));
    if (unit !== 'strips') { setNumStrips('0'); setTabletsPerStripInput('10'); }
  };

  const handleStripsChange = (strips: string, tabletsPerStrip: string) => {
    setNumStrips(strips);
    setTabletsPerStripInput(tabletsPerStrip);
    const stripsNum = parseInt(strips, 10) || 0;
    const tppNum = parseInt(tabletsPerStrip, 10) || 0;
    setFormData((prev) => ({ ...prev, quantity: stripsNum, tabletsPerStrip: tppNum }));
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    handleChange('quantity', isNaN(num) ? 0 : Math.max(0, num));
  };

  const isStrips = formData.unit === 'strips';
  const isEditMode = modalMode === 'edit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="lg">
      <ModalBackdrop bg="black" opacity={0.5} />
      <ModalContent bg={colors.background.card} borderRadius="$xl">
        <ModalHeader borderBottomWidth={1} borderColor={colors.border.primary} pb="$3" pt="$4">
          <HStack alignItems="center" gap="$3">
            <Box bg={colors.isDark ? '#312e81' : '#eef2ff'} p="$2" borderRadius="$md">
              <MaterialCommunityIcons name="pill" size={20} color={colors.isDark ? '#818cf8' : '#4f46e5'} />
            </Box>
            <Text size="xl" fontWeight="$bold" color={colors.text.primary}>{!isEditMode ? 'Add Medication' : 'Edit Medication'}</Text>
          </HStack>
          <ModalCloseButton position="absolute" right="$3" top="$3"><MaterialCommunityIcons name="close" size={20} color={colors.text.muted} /></ModalCloseButton>
        </ModalHeader>
        <ModalBody py="$4">
          <VStack gap="$5">
            <FormControl isInvalid={!!errors.name}>
              <FormControlLabel><HStack gap="$1"><MaterialCommunityIcons name="label-outline" size={14} color={colors.text.muted} /><Text color={colors.text.secondary} size="sm" fontWeight="$medium">Medication Name *</Text></HStack></FormControlLabel>
              <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md"><InputField value={formData.name} onChangeText={(v: string) => handleChange('name', v)} placeholder="e.g., Paracetamol 500mg" placeholderTextColor={colors.text.muted} /></Input>
              {errors.name && <FormControlHelperText color="$error500">{errors.name}</FormControlHelperText>}
            </FormControl>
            <FormControl isInvalid={!!errors.category}>
              <FormControlLabel><HStack gap="$1"><MaterialCommunityIcons name="tag-outline" size={14} color={colors.text.muted} /><Text color={colors.text.secondary} size="sm" fontWeight="$medium">Category *</Text></HStack></FormControlLabel>
              <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md"><InputField value={formData.category} onChangeText={(v: string) => handleChange('category', v)} placeholder="e.g., Pain Relief, Antibiotics, Vitamins" placeholderTextColor={colors.text.muted} /></Input>
              {errors.category && <FormControlHelperText color="$error500">{errors.category}</FormControlHelperText>}
            </FormControl>
            <HStack gap="$4" flexWrap="wrap">
              <FormControl flex={1} minWidth={140} isInvalid={!!errors.quantity}>
                <FormControlLabel><HStack gap="$1"><MaterialCommunityIcons name="numeric" size={14} color={colors.text.muted} /><Text color={colors.text.secondary} size="sm" fontWeight="$medium">Quantity *</Text></HStack></FormControlLabel>
                {isStrips ? (
                  <HStack gap="$2">
                    <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md" flex={1}><InputField value={numStrips} onChangeText={(v: string) => handleStripsChange(v, tabletsPerStripInput)} keyboardType="numeric" placeholderTextColor={colors.text.muted} /></Input>
                    <Box alignItems="center" justifyContent="center"><Text size="sm" color={colors.text.muted}>×</Text></Box>
                    <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md" flex={1}><InputField value={tabletsPerStripInput} onChangeText={(v: string) => handleStripsChange(numStrips, v)} keyboardType="numeric" placeholderTextColor={colors.text.muted} /></Input>
                  </HStack>
                ) : (
                  <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md"><InputField value={String(formData.quantity)} onChangeText={handleQuantityChange} keyboardType="numeric" placeholderTextColor={colors.text.muted} /></Input>
                )}
                {errors.quantity && <FormControlHelperText color="$error500">{errors.quantity}</FormControlHelperText>}
              </FormControl>
              <FormControl flex={1} minWidth={140}>
                <FormControlLabel><HStack gap="$1"><MaterialCommunityIcons name="scale-bathroom" size={14} color={colors.text.muted} /><Text color={colors.text.secondary} size="sm" fontWeight="$medium">Unit</Text></HStack></FormControlLabel>
                <Select selectedValue={formData.unit} onValueChange={handleUnitChange}>
                  <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md"><SelectInput /></SelectTrigger>
                  <SelectPortal><SelectBackdrop /><SelectContent>{ITEM_UNITS.map((u) => (<SelectItem key={u.value} label={u.label} value={u.value} />))}</SelectContent></SelectPortal>
                </Select>
              </FormControl>
            </HStack>
            <FormControl>
              <FormControlLabel><HStack gap="$1"><MaterialCommunityIcons name="account-outline" size={14} color={colors.text.muted} /><Text color={colors.text.secondary} size="sm" fontWeight="$medium">Assigned To</Text></HStack></FormControlLabel>
              <Select selectedValue={formData.assignedTo} onValueChange={(v: string) => handleChange('assignedTo', v === 'none' ? '' : v)}>
                <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md"><SelectInput placeholder="Unassigned" /></SelectTrigger>
                <SelectPortal><SelectBackdrop /><SelectContent><SelectItem label="Unassigned" value="none" />{DEFAULT_USERS.map((u) => (<SelectItem key={u} label={u} value={u} />))}</SelectContent></SelectPortal>
              </Select>
            </FormControl>
            <FormControl>
              <FormControlLabel><HStack gap="$1"><MaterialCommunityIcons name="calendar-clock" size={14} color={colors.text.muted} /><Text color={colors.text.secondary} size="sm" fontWeight="$medium">Expiry Date (Optional)</Text></HStack></FormControlLabel>
              <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md"><InputField value={formData.expiryDate} onChangeText={(v: string) => handleChange('expiryDate', v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.text.muted} /></Input>
              <FormControlHelperText color={colors.text.muted}>Leave blank if not applicable</FormControlHelperText>
            </FormControl>
            <FormControl isInvalid={!!errors.lowStockThreshold}>
              <FormControlLabel><HStack gap="$1"><MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.text.muted} /><Text color={colors.text.secondary} size="sm" fontWeight="$medium">Low Stock Threshold</Text></HStack></FormControlLabel>
              <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md"><InputField value={String(formData.lowStockThreshold)} onChangeText={(v: string) => { const n = parseInt(v, 10); handleChange('lowStockThreshold', isNaN(n) ? 0 : Math.max(0, n)); }} keyboardType="numeric" placeholderTextColor={colors.text.muted} /></Input>
              <FormControlHelperText color={colors.text.muted}>Alert when stock falls below this number</FormControlHelperText>
            </FormControl>
            <FormControl>
              <FormControlLabel><HStack gap="$1"><MaterialCommunityIcons name="note-text-outline" size={14} color={colors.text.muted} /><Text color={colors.text.secondary} size="sm" fontWeight="$medium">Notes (Optional)</Text></HStack></FormControlLabel>
              <Input bg={colors.background.input} borderColor={colors.border.primary} borderRadius="$md"><InputField value={formData.notes} onChangeText={(v: string) => handleChange('notes', v)} placeholder="Additional notes..." placeholderTextColor={colors.text.muted} textAlignVertical="top" numberOfLines={3} multiline /></Input>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth={1} borderColor={colors.border.primary} pt="$4" pb="$4">
          <HStack gap="$3" w="100%" justifyContent="space-between" alignItems="center">
            {isEditMode ? (
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
              <Button variant="outline" onPress={onClose} borderColor={colors.border.primary} borderRadius="$md"><Text color={colors.text.secondary}>Cancel</Text></Button>
              <Button onPress={handleSubmit} bg={colors.isDark ? '$primary500' : '$primary600'} borderRadius="$md" px="$6">
                <HStack gap="$2" alignItems="center">
                  <MaterialCommunityIcons name={!isEditMode ? 'plus' : 'check'} size={16} color="white" />
                  <Text color="white" fontWeight="$semibold">{!isEditMode ? 'Add Medication' : 'Save Changes'}</Text>
                </HStack>
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

