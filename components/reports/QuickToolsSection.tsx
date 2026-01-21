/**
 * Quick Tools Section Component
 * Quick actions for reports page
 */

import { useThemedColors } from '@/constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import React from 'react';

interface QuickToolsSectionProps {
  onChangeTimeRange: () => void;
}

export function QuickToolsSection({ onChangeTimeRange }: QuickToolsSectionProps) {
  const colors = useThemedColors();
  const router = useRouter();
  
  const handleJumpToTransactions = () => {
    router.push('/finance/transactions');
  };
  
  const handleJumpToHistory = () => {
    router.push('/finance/history');
  };
  
  const handleExport = () => {
    // Placeholder - no logic implemented
    console.log('Export report - placeholder');
  };
  
  const handleSaveReport = () => {
    // Placeholder - no logic implemented
    console.log('Save report - placeholder');
  };
  
  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p="$4"
    >
      <VStack gap="$4">
        {/* Section Title */}
        <HStack alignItems="center" gap="$2">
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={18}
            color={colors.text.muted}
          />
          <Text size="sm" color={colors.text.muted} fontWeight="$medium">
            Quick Tools
          </Text>
        </HStack>
        
        {/* Actions Grid */}
        <HStack gap="$3" flexWrap="wrap">
          {/* Change Time Range */}
          <QuickToolButton
            icon="calendar-range"
            label="Time Range"
            onPress={onChangeTimeRange}
            colors={colors}
          />
          
          {/* Jump to Transactions */}
          <QuickToolButton
            icon="swap-horizontal"
            label="Transactions"
            onPress={handleJumpToTransactions}
            colors={colors}
          />
          
          {/* Jump to History */}
          <QuickToolButton
            icon="history"
            label="History"
            onPress={handleJumpToHistory}
            colors={colors}
          />
          
          {/* Export (Placeholder) */}
          <QuickToolButton
            icon="export"
            label="Export"
            onPress={handleExport}
            colors={colors}
            isPlaceholder
          />
          
          {/* Save Report (Placeholder) */}
          <QuickToolButton
            icon="content-save-outline"
            label="Save Report"
            onPress={handleSaveReport}
            colors={colors}
            isPlaceholder
          />
        </HStack>
      </VStack>
    </Box>
  );
}

/**
 * Quick Tool Button Component
 */
interface QuickToolButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useThemedColors>;
  isPlaceholder?: boolean;
}

function QuickToolButton({
  icon,
  label,
  onPress,
  colors,
  isPlaceholder = false,
}: QuickToolButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      opacity={isPlaceholder ? 0.6 : 1}
    >
      <HStack
        bg={colors.background.secondary}
        borderRadius="$md"
        px="$4"
        py="$3"
        alignItems="center"
        gap="$2"
        borderWidth={1}
        borderColor={colors.border.primary}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={18}
          color={colors.text.secondary}
        />
        <Text
          size="sm"
          color={isPlaceholder ? colors.text.muted : colors.text.secondary}
        >
          {label}
        </Text>
        {isPlaceholder && (
          <MaterialCommunityIcons
            name="lock-outline"
            size={12}
            color={colors.text.muted}
          />
        )}
      </HStack>
    </Pressable>
  );
}

/**
 * Time Range Picker Modal Component
 */
interface TimeRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRange: { type: 'month' | 'year' | 'custom'; value: string };
  onSelect: (range: { type: 'month' | 'year' | 'custom'; value: string }) => void;
}

export function TimeRangePicker({
  isOpen,
  onClose,
  currentRange,
  onSelect,
}: TimeRangePickerProps) {
  const colors = useThemedColors();
  const [view, setView] = React.useState<'main' | 'month' | 'year' | 'custom'>('main');
  const [customRange, setCustomRange] = React.useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];
  
  const years = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: String(year), label: String(year) };
  });
  
  const handleMonthSelect = (month: string) => {
    const now = new Date();
    const value = `${now.getFullYear()}-${month}`;
    onSelect({ type: 'month', value });
    onClose();
  };
  
  const handleYearSelect = (year: string) => {
    onSelect({ type: 'year', value: year });
    onClose();
  };
  
  const handleCustomApply = () => {
    onSelect({ 
      type: 'custom', 
      value: `${customRange.start} to ${customRange.end}` 
    });
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0,0,0,0.3)"
      justifyContent="center"
      alignItems="center"
      zIndex={1000}
    >
      <Box
        bg={colors.background.card}
        borderRadius="$lg"
        borderWidth={1}
        borderColor={colors.border.primary}
        p="$4"
        w={300}
        maxHeight={400}
      >
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" mb="$4">
          <Text size="md" fontWeight="$bold" color={colors.text.primary}>
            Select Time Range
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={colors.text.muted}
            />
          </Pressable>
        </HStack>
        
        {/* Main Options */}
        {view === 'main' && (
          <VStack gap="$2">
            <Pressable onPress={() => setView('month')}>
              <HStack
                p="$3"
                bg={colors.background.secondary}
                borderRadius="$md"
                alignItems="center"
                gap="$3"
              >
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text size="sm" color={colors.text.primary}>
                  Current Month
                </Text>
              </HStack>
            </Pressable>
            
            <Pressable onPress={() => setView('year')}>
              <HStack
                p="$3"
                bg={colors.background.secondary}
                borderRadius="$md"
                alignItems="center"
                gap="$3"
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text size="sm" color={colors.text.primary}>
                  Current Year
                </Text>
              </HStack>
            </Pressable>
            
            <Pressable onPress={() => setView('custom')}>
              <HStack
                p="$3"
                bg={colors.background.secondary}
                borderRadius="$md"
                alignItems="center"
                gap="$3"
              >
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text size="sm" color={colors.text.primary}>
                  Custom Range
                </Text>
              </HStack>
            </Pressable>
          </VStack>
        )}
        
        {/* Month Selection */}
        {view === 'month' && (
          <VStack gap="$2">
            <Pressable onPress={() => setView('main')} mb="$2">
              <HStack gap="$1" alignItems="center">
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={16}
                  color={colors.text.muted}
                />
                <Text size="sm" color={colors.text.muted}>
                  Back
                </Text>
              </HStack>
            </Pressable>
            
            <Text size="sm" color={colors.text.muted} mb="$1">
              Select Month
            </Text>
            {months.map((month) => {
              const now = new Date();
              const value = `${now.getFullYear()}-${month.value}`;
              const isSelected = currentRange.type === 'month' && currentRange.value === value;
              
              return (
                <Pressable key={month.value} onPress={() => handleMonthSelect(month.value)}>
                  <HStack
                    p="$3"
                    bg={isSelected ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.secondary}
                    borderRadius="$md"
                    alignItems="center"
                    gap="$3"
                    borderWidth={1}
                    borderColor={isSelected ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                  >
                    <Text size="sm" color={colors.text.primary}>
                      {month.label}
                    </Text>
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        )}
        
        {/* Year Selection */}
        {view === 'year' && (
          <VStack gap="$2">
            <Pressable onPress={() => setView('main')} mb="$2">
              <HStack gap="$1" alignItems="center">
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={16}
                  color={colors.text.muted}
                />
                <Text size="sm" color={colors.text.muted}>
                  Back
                </Text>
              </HStack>
            </Pressable>
            
            <Text size="sm" color={colors.text.muted} mb="$1">
              Select Year
            </Text>
            {years.map((year) => {
              const isSelected = currentRange.type === 'year' && currentRange.value === year.value;
              
              return (
                <Pressable key={year.value} onPress={() => handleYearSelect(year.value)}>
                  <HStack
                    p="$3"
                    bg={isSelected ? (colors.isDark ? '$primary500' : '$primary100') : colors.background.secondary}
                    borderRadius="$md"
                    alignItems="center"
                    gap="$3"
                    borderWidth={1}
                    borderColor={isSelected ? (colors.isDark ? '$primary400' : '$primary500') : colors.border.primary}
                  >
                    <Text size="sm" color={colors.text.primary}>
                      {year.label}
                    </Text>
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        )}
        
        {/* Custom Range */}
        {view === 'custom' && (
          <VStack gap="$2">
            <Pressable onPress={() => setView('main')} mb="$2">
              <HStack gap="$1" alignItems="center">
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={16}
                  color={colors.text.muted}
                />
                <Text size="sm" color={colors.text.muted}>
                  Back
                </Text>
              </HStack>
            </Pressable>
            
            <Text size="sm" color={colors.text.muted} mb="$1">
              Custom Range (Coming Soon)
            </Text>
            <Box p="$4" bg={colors.background.secondary} borderRadius="$md">
              <Text size="sm" color={colors.text.muted} textAlign="center">
                Custom date range selection will be available in a future update.
              </Text>
            </Box>
          </VStack>
        )}
      </Box>
    </Box>
  );
}

