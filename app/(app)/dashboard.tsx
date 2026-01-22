/**
 * Dashboard Component
 * 
 * High-level workspace summary showing:
 * - Finance Summary (if Finance enabled)
 * - Events Summary (if Events enabled)
 * - Medical Alerts (if Medicals enabled)
 * 
 * Read-only, projection layer only - no data mutation.
 */

import { AlertCard } from '@/components/inventory/AlertCard';
import { NetBalanceCard, ReportsMetricsCard } from '@/components/reports/ReportsMetricsCard';
import { useThemedColors } from '@/constants/colors';
import { RootState } from '@/src/store';
import { formatDateTime, getUpcomingEvents } from '@/src/utils/eventHelpers';
import { calculateAlerts } from '@/src/utils/inventoryHelpers';
import { getCurrentMonthTransactions } from '@/src/utils/transactionHelpers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Box,
  HStack,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';

// ============================================================================
// Selectors / Derived Data
// ============================================================================

function useFinanceSummary() {
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const currentMonthTransactions = useMemo(
    () => getCurrentMonthTransactions(transactions),
    [transactions]
  );

  const income = useMemo(
    () =>
      currentMonthTransactions
        .filter((t) => t.type === 'income' && !t.deleted)
        .reduce((sum, t) => sum + t.amount, 0),
    [currentMonthTransactions]
  );

  const expense = useMemo(
    () =>
      currentMonthTransactions
        .filter((t) => t.type === 'expense' && !t.deleted)
        .reduce((sum, t) => sum + t.amount, 0),
    [currentMonthTransactions]
  );

  return { income, expense };
}

function useEventsSummary() {
  const events = useSelector((state: RootState) => state.events.items);

  const upcomingEvents = useMemo(
    () => getUpcomingEvents(events, 30),
    [events]
  );

  const nextEvent = upcomingEvents[0] || null;
  const eventsIn7Days = useMemo(
    () => getUpcomingEvents(events, 7).length,
    [events]
  );
  const eventsIn30Days = upcomingEvents.length;

  return { nextEvent, eventsIn7Days, eventsIn30Days };
}

function useMedicalAlerts() {
  const items = useSelector((state: RootState) => state.inventory.items);
  return useMemo(() => calculateAlerts(items), [items]);
}

// ============================================================================
// Section Components
// ============================================================================

function FinanceSummarySection({ isMobile }: { isMobile: boolean }) {
  const { income, expense } = useFinanceSummary();
  const router = useRouter();
  const colors = useThemedColors();

  if (isMobile) {
    // Mobile: Stack values vertically with clear labels
    return (
      <VStack gap="$4">
        {/* Section Header */}
        <HStack gap="$2" alignItems="center">
          <MaterialCommunityIcons
            name="trending-up"
            size={20}
            color={colors.text.muted}
          />
          <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
            Finance
          </Text>
        </HStack>

        {/* Net Balance Card */}
        <NetBalanceCard income={income} expense={expense} />

        {/* Income & Expense Stacked */}
        <VStack gap="$3">
          <Box
            bg={colors.background.card}
            borderRadius="$lg"
            borderWidth={1}
            borderColor={colors.border.primary}
            p="$4"
          >
            <VStack gap="$1">
              <Text size="sm" color={colors.text.muted} fontWeight="$medium">
                Income (MTD)
              </Text>
              <Text size="2xl" fontWeight="$bold" color={colors.isDark ? '#4ade80' : '#16a34a'}>
                +${income.toLocaleString()}
              </Text>
            </VStack>
          </Box>

          <Box
            bg={colors.background.card}
            borderRadius="$lg"
            borderWidth={1}
            borderColor={colors.border.primary}
            p="$4"
          >
            <VStack gap="$1">
              <Text size="sm" color={colors.text.muted} fontWeight="$medium">
                Expense (MTD)
              </Text>
              <Text size="2xl" fontWeight="$bold" color={colors.isDark ? '#f87171' : '#dc2626'}>
                -${expense.toLocaleString()}
              </Text>
            </VStack>
          </Box>
        </VStack>

        {/* Navigation Link */}
        <Pressable onPress={() => router.push('/(app)/finance/transactions' as any)}>
          <HStack
            justifyContent="center"
            alignItems="center"
            gap="$1"
            py="$2"
          >
            <Text size="sm" color="$textMuted">
              View Transactions
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#9ca3af"
            />
          </HStack>
        </Pressable>
      </VStack>
    );
  }

  // Desktop: Keep existing horizontal layout
  return (
    <VStack gap="$3">
      {/* Section Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap="$2" alignItems="center">
          <MaterialCommunityIcons
            name="trending-up"
            size={20}
            color="$textMuted"
          />
          <Text size="lg" fontWeight="$semibold" color="$textPrimary">
            Finance
          </Text>
        </HStack>
      </HStack>

      {/* Cards */}
      <VStack gap="$3">
        {/* Net Balance Card */}
        <NetBalanceCard income={income} expense={expense} />

        {/* Income & Expense Cards */}
        <HStack gap="$3">
          <ReportsMetricsCard
            title="Income (MTD)"
            value={income}
            isPositive={true}
          />
          <ReportsMetricsCard
            title="Expense (MTD)"
            value={expense}
            isPositive={false}
          />
        </HStack>

        {/* Navigation Link */}
        <Pressable onPress={() => router.push('/(app)/finance/transactions' as any)}>
          <HStack
            justifyContent="center"
            alignItems="center"
            gap="$1"
            py="$2"
          >
            <Text size="sm" color="$textMuted">
              View Transactions
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#9ca3af"
            />
          </HStack>
        </Pressable>
      </VStack>
    </VStack>
  );
}

function EventsSummarySection({ isMobile }: { isMobile: boolean }) {
  const { nextEvent, eventsIn7Days, eventsIn30Days } = useEventsSummary();
  const router = useRouter();
  const colors = useThemedColors();

  if (isMobile) {
    // Mobile: Vertical stacking with compact counts
    return (
      <VStack gap="$4">
        {/* Section Header */}
        <HStack gap="$2" alignItems="center">
          <MaterialCommunityIcons
            name="calendar"
            size={20}
            color={colors.text.muted}
          />
          <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
            Events
          </Text>
        </HStack>

        {/* Next Event Card */}
        {nextEvent ? (
          <Box
            bg={colors.background.card}
            borderRadius="$lg"
            borderWidth={1}
            borderColor={colors.border.primary}
            p="$4"
          >
            <VStack gap="$2">
              <Text size="xs" color={colors.text.muted} fontWeight="$medium">
                Next Event
              </Text>
              <Text size="lg" fontWeight="$semibold" color={colors.text.primary}>
                {nextEvent.title}
              </Text>
              <Text size="sm" color={colors.text.secondary}>
                {formatDateTime(nextEvent.startDateTime)}
              </Text>
            </VStack>
          </Box>
        ) : (
          <Box
            bg={colors.background.card}
            borderRadius="$lg"
            borderWidth={1}
            borderColor={colors.border.primary}
            p="$4"
          >
            <Text size="sm" color={colors.text.muted}>
              No upcoming events
            </Text>
          </Box>
        )}

        {/* Event Counts - Stacked on mobile */}
        <VStack gap="$3">
          <Box
            bg={colors.background.card}
            borderRadius="$lg"
            borderWidth={1}
            borderColor={colors.border.primary}
            p="$4"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Text size="sm" color={colors.text.muted}>
                Next 7 days
              </Text>
              <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
                {eventsIn7Days}
              </Text>
            </HStack>
          </Box>
          <Box
            bg={colors.background.card}
            borderRadius="$lg"
            borderWidth={1}
            borderColor={colors.border.primary}
            p="$4"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Text size="sm" color={colors.text.muted}>
                Next 30 days
              </Text>
              <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
                {eventsIn30Days}
              </Text>
            </HStack>
          </Box>
        </VStack>

        {/* Navigation Link */}
        <Pressable onPress={() => router.push('/(app)/events' as any)}>
          <HStack
            justifyContent="center"
            alignItems="center"
            gap="$1"
            py="$2"
          >
            <Text size="sm" color="$textMuted">
              View Calendar
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#9ca3af"
            />
          </HStack>
        </Pressable>
      </VStack>
    );
  }

  // Desktop: Keep existing layout
  return (
    <VStack gap="$3">
      {/* Section Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap="$2" alignItems="center">
          <MaterialCommunityIcons
            name="calendar"
            size={20}
            color="$textMuted"
          />
          <Text size="lg" fontWeight="$semibold" color="$textPrimary">
            Events
          </Text>
        </HStack>
      </HStack>

      {/* Next Event Card */}
      {nextEvent ? (
        <Box
          bg={colors.background.card}
          borderRadius="$lg"
          borderWidth={1}
          borderColor={colors.border.primary}
          p="$4"
        >
          <VStack gap="$2">
            <Text size="xs" color={colors.text.muted} fontWeight="$medium">
              Next Event
            </Text>
            <Text size="lg" fontWeight="$semibold" color={colors.text.primary}>
              {nextEvent.title}
            </Text>
            <Text size="sm" color={colors.text.secondary}>
              {formatDateTime(nextEvent.startDateTime)}
            </Text>
          </VStack>
        </Box>
      ) : (
        <Box
          bg={colors.background.card}
          borderRadius="$lg"
          borderWidth={1}
          borderColor={colors.border.primary}
          p="$4"
        >
          <Text size="sm" color={colors.text.muted}>
            No upcoming events
          </Text>
        </Box>
      )}

      {/* Event Counts */}
      <HStack gap="$3">
        <Box
          flex={1}
          bg={colors.background.card}
          borderRadius="$lg"
          borderWidth={1}
          borderColor={colors.border.primary}
          p="$3"
        >
          <VStack alignItems="center" gap="$1">
            <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
              {eventsIn7Days}
            </Text>
            <Text size="xs" color={colors.text.muted}>
              Next 7 days
            </Text>
          </VStack>
        </Box>
        <Box
          flex={1}
          bg={colors.background.card}
          borderRadius="$lg"
          borderWidth={1}
          borderColor={colors.border.primary}
          p="$3"
        >
          <VStack alignItems="center" gap="$1">
            <Text size="xl" fontWeight="$bold" color={colors.text.primary}>
              {eventsIn30Days}
            </Text>
            <Text size="xs" color={colors.text.muted}>
              Next 30 days
            </Text>
          </VStack>
        </Box>
      </HStack>

      {/* Navigation Link */}
      <Pressable onPress={() => router.push('/(app)/events' as any)}>
        <HStack
          justifyContent="center"
          alignItems="center"
          gap="$1"
          py="$2"
        >
          <Text size="sm" color="$textMuted">
            View Calendar
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color="#9ca3af"
          />
        </HStack>
      </Pressable>
    </VStack>
  );
}

function MedicalAlertsSection({ isMobile }: { isMobile: boolean }) {
  const alerts = useMedicalAlerts();
  const router = useRouter();
  const colors = useThemedColors();

  if (isMobile) {
    // Mobile: Stack alert cards vertically as full-width rows
    return (
      <VStack gap="$4">
        {/* Section Header */}
        <HStack gap="$2" alignItems="center">
          <MaterialCommunityIcons
            name="medical-bag"
            size={20}
            color={colors.text.muted}
          />
          <Text size="lg" fontWeight="$bold" color={colors.text.primary}>
            Medical Alerts
          </Text>
        </HStack>

        {/* Alert Cards - Stacked Vertically */}
        <VStack gap="$3">
          <AlertCard
            title="Low Stock"
            count={alerts.lowStockCount}
            alertType="warning"
            icon="alert-circle-outline"
            description="Below threshold"
          />
          <AlertCard
            title="Expiring Soon"
            count={alerts.expiringSoonCount}
            alertType="warning"
            icon="clock-alert-outline"
            description="Within 30 days"
          />
          <AlertCard
            title="Out of Stock"
            count={alerts.outOfStockCount}
            alertType="error"
            icon="package-variant-remove"
            description="Need restocking"
          />
        </VStack>

        {/* Navigation Link */}
        <Pressable onPress={() => router.push('/(app)/medicals/inventory' as any)}>
          <HStack
            justifyContent="center"
            alignItems="center"
            gap="$1"
            py="$2"
          >
            <Text size="sm" color="$textMuted">
              View Inventory
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#9ca3af"
            />
          </HStack>
        </Pressable>
      </VStack>
    );
  }

  // Desktop: Keep existing flex-wrap layout
  return (
    <VStack gap="$3">
      {/* Section Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap="$2" alignItems="center">
          <MaterialCommunityIcons
            name="medical-bag"
            size={20}
            color="$textMuted"
          />
          <Text size="lg" fontWeight="$semibold" color="$textPrimary">
            Medical Alerts
          </Text>
        </HStack>
      </HStack>

      {/* Alert Cards Grid */}
      <HStack gap="$2" flexWrap="wrap">
        <AlertCard
          title="Low Stock"
          count={alerts.lowStockCount}
          alertType="warning"
          icon="alert-circle-outline"
          description="Below threshold"
        />
        <AlertCard
          title="Expiring Soon"
          count={alerts.expiringSoonCount}
          alertType="warning"
          icon="clock-alert-outline"
          description="Within 30 days"
        />
        <AlertCard
          title="Out of Stock"
          count={alerts.outOfStockCount}
          alertType="error"
          icon="package-variant-remove"
          description="Need restocking"
        />
      </HStack>

      {/* Navigation Link */}
      <Pressable onPress={() => router.push('/(app)/medicals/inventory' as any)}>
        <HStack
          justifyContent="center"
          alignItems="center"
          gap="$1"
          py="$2"
        >
          <Text size="sm" color="$textMuted">
            View Inventory
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color="#9ca3af"
          />
        </HStack>
      </Pressable>
    </VStack>
  );
}

function FinanceEmptyState({ isMobile }: { isMobile: boolean }) {
  const router = useRouter();
  const colors = useThemedColors();

  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p={isMobile ? "$4" : "$4"}
    >
      <VStack gap="$3" alignItems="center">
        <MaterialCommunityIcons
          name="trending-up"
          size={isMobile ? 32 : 40}
          color={colors.text.muted}
        />
        <Text size="lg" fontWeight="$semibold" color={colors.text.secondary} textAlign="center">
          No transactions yet
        </Text>
        <Text size="sm" color={colors.text.muted} textAlign="center">
          Track your income and expenses by adding your first transaction
        </Text>
        <Pressable
          onPress={() => router.push('/(app)/finance/transactions' as any)}
          mt="$2"
        >
          <Box
            bg={colors.isDark ? '$primary600' : '$primary500'}
            borderRadius="$md"
            px="$4"
            py="$2"
          >
            <Text color="white" fontWeight="$semibold" size="sm">
              Add your first transaction
            </Text>
          </Box>
        </Pressable>
      </VStack>
    </Box>
  );
}

function EventsEmptyState({ isMobile }: { isMobile: boolean }) {
  const router = useRouter();
  const colors = useThemedColors();

  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p={isMobile ? "$4" : "$4"}
    >
      <VStack gap="$3" alignItems="center">
        <MaterialCommunityIcons
          name="calendar-blank"
          size={isMobile ? 32 : 40}
          color={colors.text.muted}
        />
        <Text size="lg" fontWeight="$semibold" color={colors.text.secondary} textAlign="center">
          No upcoming events
        </Text>
        <Text size="sm" color={colors.text.muted} textAlign="center">
          Schedule events and appointments to see them here
        </Text>
        <Pressable
          onPress={() => router.push('/(app)/events' as any)}
          mt="$2"
        >
          <Box
            bg={colors.isDark ? '$primary600' : '$primary500'}
            borderRadius="$md"
            px="$4"
            py="$2"
          >
            <Text color="white" fontWeight="$semibold" size="sm">
              Add an event
            </Text>
          </Box>
        </Pressable>
      </VStack>
    </Box>
  );
}

function MedicalAlertsEmptyState({ isMobile }: { isMobile: boolean }) {
  const router = useRouter();
  const colors = useThemedColors();

  return (
    <Box
      bg={colors.background.card}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.border.primary}
      p={isMobile ? "$4" : "$4"}
    >
      <VStack gap="$3" alignItems="center">
        <MaterialCommunityIcons
          name="medical-bag"
          size={isMobile ? 32 : 40}
          color={colors.text.muted}
        />
        <Text size="lg" fontWeight="$semibold" color={colors.text.secondary} textAlign="center">
          No medical items added
        </Text>
        <Text size="sm" color={colors.text.muted} textAlign="center">
          Add medicine or supplies to track inventory and schedules
        </Text>
        <Pressable
          onPress={() => router.push('/(app)/medicals/inventory' as any)}
          mt="$2"
        >
          <Box
            bg={colors.isDark ? '$primary600' : '$primary500'}
            borderRadius="$md"
            px="$4"
            py="$2"
          >
            <Text color="white" fontWeight="$semibold" size="sm">
              Add medicine or supply
            </Text>
          </Box>
        </Pressable>
      </VStack>
    </Box>
  );
}

function WorkspaceEmptyState() {
  const colors = useThemedColors();

  return (
    <Box flex={1} justifyContent="center" alignItems="center" py="$20">
      <VStack gap="$4" alignItems="center" maxWidth={400}>
        <MaterialCommunityIcons
          name="home-variant-outline"
          size={64}
          color={colors.text.muted}
        />
        <Text size="xl" fontWeight="$bold" color={colors.text.primary} textAlign="center">
          This workspace is empty
        </Text>
        <Text size="md" color={colors.text.secondary} textAlign="center">
          Start by adding data using the tools below. Enable Finance to track transactions, Events for calendar management, or Medicals for health tracking.
        </Text>
      </VStack>
    </Box>
  );
}

// ============================================================================
// Main Dashboard Component
// ============================================================================

export default function Dashboard() {
  const colors = useThemedColors();
  
  // Mobile detection
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  // Get enabled tools from workspace config
  const activeWorkspace = useSelector(
    (state: RootState) => state.auth.activeWorkspace
  );
  const workspaces = useSelector((state: RootState) => state.auth.workspaces);
  const enabledTools = workspaces[activeWorkspace]?.enabledTools || {
    finance: true,
    events: true,
    medicals: true,
  };

  // Determine which sections to show
  const showFinance = enabledTools.finance;
  const showEvents = enabledTools.events;
  const showMedicals = enabledTools.medicals;

  // Check if any tools are enabled
  const hasEnabledTools = showFinance || showEvents || showMedicals;

  // Get data for empty state checks
  const { income, expense } = useFinanceSummary();
  const { nextEvent, eventsIn7Days, eventsIn30Days } = useEventsSummary();
  const alerts = useMedicalAlerts();
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const events = useSelector((state: RootState) => state.events.items);
  const items = useSelector((state: RootState) => state.inventory.items);

  // Responsive spacing
  const containerPadding = isMobile ? '$4' : '$4';
  const containerGap = isMobile ? '$6' : '$8';
  const sectionGap = isMobile ? '$4' : '$3';

  return (
    <ScrollView
      flex={1}
      bg={colors.background.primary}
      contentContainerStyle={{ flexGrow: 1 }}
      px={containerPadding}
      py={isMobile ? '$6' : '$6'}
    >
      {/* Workspace Title */}
      <Box mb={isMobile ? '$6' : '$6'}>
        <Text size={isMobile ? 'xl' : 'xl'} fontWeight="$bold" color={colors.text.primary}>
          {activeWorkspace} Workspace
        </Text>
        <Text size="sm" color={colors.text.muted}>
          Quick overview
        </Text>
      </Box>

      {/* Content */}
      {!hasEnabledTools ? (
        <WorkspaceEmptyState />
      ) : (
        <VStack gap={containerGap}>
          {/* Finance Section */}
          {showFinance && (
            <Box>
              {transactions.length === 0 ? (
                <FinanceEmptyState isMobile={isMobile} />
              ) : (
                <FinanceSummarySection isMobile={isMobile} />
              )}
            </Box>
          )}

          {/* Events Section */}
          {showEvents && (
            <Box>
              {events.length === 0 ? (
                <EventsEmptyState isMobile={isMobile} />
              ) : (
                <EventsSummarySection isMobile={isMobile} />
              )}
            </Box>
          )}

          {/* Medicals Section */}
          {showMedicals && (
            <Box>
              {items.length === 0 ? (
                <MedicalAlertsEmptyState isMobile={isMobile} />
              ) : (
                <MedicalAlertsSection isMobile={isMobile} />
              )}
            </Box>
          )}
        </VStack>
      )}
    </ScrollView>
  );
}

