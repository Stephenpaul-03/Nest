/**
 * Medical Inventory Screen
 * Main inventory management interface with responsive layout
 */

import { ExpiredAlertCard, ExpiringSoonAlertCard, LowStockAlertCard, OutOfStockAlertCard } from '@/components/inventory/AlertCard';
import { InventoryItemRow } from '@/components/inventory/InventoryItemRow';
import { ItemModal } from '@/components/inventory/ItemModal';
import { useThemedColors } from '@/constants/colors';
import { closeModal, decrementQuantity, deleteItem, incrementQuantity, openAddModal, openEditModal, selectExpiryConfig, selectFilters, selectIsModalOpen, selectItems, selectVisibilityOptions, setFilters, setVisibilityOptions } from '@/src/store/inventorySlice';
import { calculateAlerts, getUniqueAssignedTo, getUniqueCategories, matchesFilters, matchesVisibilityOptions } from '@/src/utils/inventoryHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Box, Button, ButtonText, HStack, Input, InputField, InputSlot, Pressable, ScrollView, Select, SelectBackdrop, SelectContent, SelectInput, SelectItem, SelectPortal, SelectTrigger, Text, VStack } from '@gluestack-ui/themed';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function Inventory() {
  const dispatch = useDispatch();
  const colors = useThemedColors();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  const items = useSelector(selectItems);
  const filters = useSelector(selectFilters);
  const visibilityOptions = useSelector(selectVisibilityOptions);
  const expiryConfig = useSelector(selectExpiryConfig);
  const isModalOpen = useSelector(selectIsModalOpen);

  const filteredItems = useMemo(() => items.filter((item) => matchesFilters(item, filters) && matchesVisibilityOptions(item, visibilityOptions)), [items, filters, visibilityOptions]);
  const alerts = useMemo(() => calculateAlerts(items, expiryConfig.warningDays), [items, expiryConfig.warningDays]);
  const categories = useMemo(() => getUniqueCategories(items), [items]);
  const assignedToList = useMemo(() => getUniqueAssignedTo(items), [items]);

  const handleAddItem = () => dispatch(openAddModal());
  const handleEditItem = (id: string) => dispatch(openEditModal(id));
  const handleDeleteItem = (id: string) => dispatch(deleteItem(id));
  const handleIncrement = (id: string) => dispatch(incrementQuantity(id));
  const handleDecrement = (id: string) => dispatch(decrementQuantity(id));
  const handleFilterChange = (key: string, value: string) => dispatch(setFilters({ [key]: value }));
  const handleSearchChange = (value: string) => dispatch(setFilters({ search: value }));
  const handleVisibilityToggle = (key: string) => dispatch(setVisibilityOptions({ [key]: !visibilityOptions[key as keyof typeof visibilityOptions] }));
  const handleResetFilters = () => dispatch(setFilters({ category: 'all', status: 'all', search: '', assignedTo: 'all' }));

  const renderFilters = () => (
    <Box bg={colors.background.card} borderRadius="$lg" borderWidth={1} borderColor={colors.border.primary} p={isMobile ? "$3" : "$4"}>
      {!isMobile && <Text size="md" fontWeight="$semibold" color={colors.text.primary} mb="$3">Filters</Text>}
      <VStack gap={isMobile ? "$2" : "$3"}>
        <Box flex={1} minWidth={200}>
          <Input bg={colors.background.input} borderColor={colors.border.primary}>
            <InputSlot pl="$3"><MaterialCommunityIcons name="magnify" size={18} color={colors.text.muted} /></InputSlot>
            <InputField placeholder="Search medications..." value={filters.search} onChangeText={handleSearchChange} />
          </Input>
        </Box>
        <HStack gap="$2" flexWrap="wrap">
          <Select selectedValue={filters.category} onValueChange={(v: string) => handleFilterChange('category', v)} flex={1} minWidth={isMobile ? "45%" : 140}>
            <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary}><SelectInput placeholder="All Categories" /></SelectTrigger>
            <SelectPortal><SelectBackdrop /><SelectContent><SelectItem label="All Categories" value="all" />{categories.map((cat) => (<SelectItem key={cat} label={cat} value={cat} />))}</SelectContent></SelectPortal>
          </Select>
          <Select selectedValue={filters.assignedTo} onValueChange={(v: string) => handleFilterChange('assignedTo', v)} flex={1} minWidth={isMobile ? "45%" : 140}>
            <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary}><SelectInput placeholder="All Assigned" /></SelectTrigger>
            <SelectPortal><SelectBackdrop /><SelectContent><SelectItem label="All Assigned" value="all" /><SelectItem label="Unassigned" value="none" />{assignedToList.map((person) => (<SelectItem key={person} label={person} value={person} />))}</SelectContent></SelectPortal>
          </Select>
          <Select selectedValue={filters.status} onValueChange={(v: string) => handleFilterChange('status', v)} flex={1} minWidth={isMobile ? "45%" : 140}>
            <SelectTrigger bg={colors.background.input} borderColor={colors.border.primary}><SelectInput placeholder="All Status" /></SelectTrigger>
            <SelectPortal><SelectBackdrop /><SelectContent><SelectItem label="All Status" value="all" /><SelectItem label="Active" value="active" /><SelectItem label="Out of Stock" value="out_of_stock" /></SelectContent></SelectPortal>
          </Select>
          <Button variant="outline" size="sm" onPress={handleResetFilters} flex={isMobile ? 1 : 0} minWidth={isMobile ? "20%" : 80}><ButtonText size="sm" color={colors.text.secondary}>Reset</ButtonText></Button>
        </HStack>
        <HStack gap="$4" mt="$1" pt="$2" borderTopWidth={1} borderColor={colors.border.primary} flexWrap="wrap">
          <HStack gap="$2" alignItems="center">
            <Pressable onPress={() => handleVisibilityToggle('showExpired')} hitSlop={8}><MaterialCommunityIcons name={visibilityOptions.showExpired ? 'eye' : 'eye-off'} size={18} color={colors.text.secondary} /></Pressable>
            <Text size="sm" color={colors.text.secondary}>Show Expired</Text>
          </HStack>
          <HStack gap="$2" alignItems="center">
            <Pressable onPress={() => handleVisibilityToggle('showOutOfStock')} hitSlop={8}><MaterialCommunityIcons name={visibilityOptions.showOutOfStock ? 'eye' : 'eye-off'} size={18} color={colors.text.secondary} /></Pressable>
            <Text size="sm" color={colors.text.secondary}>Show Out of Stock</Text>
          </HStack>
          </HStack>
      </VStack>
    </Box>
  );

  const renderAlerts = () => (
    <Box bg={colors.background.card} borderRadius="$lg" borderWidth={1} borderColor={colors.border.primary} p={isMobile ? "$3" : "$4"}>
      <HStack gap="$2" alignItems="center" mb="$3"><MaterialCommunityIcons name="alert-circle-outline" size={isMobile ? 18 : 20} color={colors.text.secondary} /><Text size={isMobile ? "sm" : "md"} fontWeight="$semibold" color={colors.text.primary}>Overview</Text></HStack>
      <VStack gap="$2"><LowStockAlertCard count={alerts.lowStockCount} /><ExpiringSoonAlertCard count={alerts.expiringSoonCount} /><ExpiredAlertCard count={alerts.expiredCount} /><OutOfStockAlertCard count={alerts.outOfStockCount} /></VStack>
    </Box>
  );

  const renderSummary = () => (
    <Box bg={colors.background.card} borderRadius="$lg" borderWidth={1} borderColor={colors.border.primary} p={isMobile ? "$3" : "$4"}>
      <Text size={isMobile ? "sm" : "md"} fontWeight="$semibold" color={colors.text.primary} mb="$3">Summary</Text>
      <VStack gap="$2">
        <HStack justifyContent="space-between"><Text size="sm" color={colors.text.secondary}>Total Medications</Text><Text size="sm" fontWeight="$semibold" color={colors.text.primary}>{filteredItems.length}</Text></HStack>
        <HStack justifyContent="space-between"><Text size="sm" color={colors.text.secondary}>Active</Text><Text size="sm" fontWeight="$semibold" color={colors.text.primary}>{filteredItems.filter((i) => i.status === 'active').length}</Text></HStack>
        <HStack justifyContent="space-between"><Text size="sm" color={colors.text.secondary}>Out of Stock</Text><Text size="sm" fontWeight="$semibold" color={colors.text.primary}>{filteredItems.filter((i) => i.status === 'out_of_stock').length}</Text></HStack>
      </VStack>
    </Box>
  );

  if (isMobile || isTablet) {
    return (
      <Box flex={1} bg={colors.background.primary}>
        <Box p="$4" borderBottomWidth={1} borderColor={colors.border.primary} bg={colors.background.card}>
          <VStack gap="$2">
            <Text size={isMobile ? "xl" : "2xl"} fontWeight="$bold" color={colors.text.primary}>Medical Inventory</Text>
            <Text size="sm" color={colors.text.muted}>{filteredItems.length} items • {alerts.lowStockCount + alerts.expiringSoonCount} alerts</Text>
          </VStack>
          <Button mt="$3" w="100%" onPress={handleAddItem} bg={colors.isDark ? '$primary500' : '$primary600'}><HStack gap="$2" alignItems="center"><MaterialCommunityIcons name="plus" size={18} color="white" /><ButtonText color="white" fontWeight="$semibold">Add Medication</ButtonText></HStack></Button>
        </Box>
        <ScrollView flex={1} p="$4" showsVerticalScrollIndicator={true}>
          {renderAlerts()}
          {renderFilters()}
          <VStack gap="$2" mt="$2">
            {filteredItems.length === 0 ? (
              <Box bg={colors.background.card} borderRadius="$lg" p="$8" alignItems="center" justifyContent="center" mt="$4">
                <MaterialCommunityIcons name="pill" size={isMobile ? 40 : 48} color={colors.text.muted} />
                <Text size="lg" color={colors.text.secondary} mt="$2">No medications found</Text>
                <Text size="sm" color={colors.text.muted}>Add a new medication to get started</Text>
              </Box>
            ) : filteredItems.map((item) => (<InventoryItemRow key={item.id} item={item} onEdit={() => handleEditItem(item.id)} onDelete={() => handleDeleteItem(item.id)} onIncrement={() => handleIncrement(item.id)} onDecrement={() => handleDecrement(item.id)} />))}
          </VStack>
          {renderSummary()}
        </ScrollView>
        <ItemModal isOpen={isModalOpen} onClose={() => dispatch(closeModal())} />
      </Box>
    );
  }

  return (
    <Box flex={1} bg={colors.background.primary} p="$4">
      <HStack justifyContent="space-between" alignItems="center" mb="$4">
        <VStack>
          <Text size="2xl" fontWeight="$bold" color={colors.text.primary}>Medical Inventory</Text>
          <Text size="sm" color={colors.text.muted}>{filteredItems.length} items • {alerts.lowStockCount + alerts.expiringSoonCount} alerts</Text>
        </VStack>
        <Button onPress={handleAddItem} bg={colors.isDark ? '$primary500' : '$primary600'}><HStack gap="$2" alignItems="center"><MaterialCommunityIcons name="plus" size={18} color="white" /><ButtonText color="white" fontWeight="$semibold">Add Medication</ButtonText></HStack></Button>
      </HStack>
      <HStack gap="$4" flex={1} alignItems="flex-start">
        <VStack flex={1} gap="$4" maxWidth="70%">
          {renderFilters()}
          <ScrollView flex={1} showsVerticalScrollIndicator={true}>
            {filteredItems.length === 0 ? (
              <Box bg={colors.background.card} borderRadius="$lg" p="$8" alignItems="center" justifyContent="center">
                <MaterialCommunityIcons name="pill" size={48} color={colors.text.muted} />
                <Text size="lg" color={colors.text.secondary} mt="$2">No medications found</Text>
                <Text size="sm" color={colors.text.muted}>Add a new medication to get started</Text>
              </Box>
            ) : filteredItems.map((item) => (<InventoryItemRow key={item.id} item={item} onEdit={() => handleEditItem(item.id)} onDelete={() => handleDeleteItem(item.id)} onIncrement={() => handleIncrement(item.id)} onDecrement={() => handleDecrement(item.id)} />))}
          </ScrollView>
        </VStack>
        <VStack gap="$4" minWidth={280} maxWidth="30%">
          {renderAlerts()}
          {renderSummary()}
        </VStack>
      </HStack>
      <ItemModal isOpen={isModalOpen} onClose={() => dispatch(closeModal())} />
    </Box>
  );
}
