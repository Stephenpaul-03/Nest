/**
 * Onboarding Screen
 * 
 * Minimal 4-step onboarding flow to create workspace config.
 * Supports creating and switching between multiple workspaces.
 * 
 * Steps:
 * 1. Workspace Name
 * 2. Accent Color
 * 3. Enable Tools
 * 4. Display Name
 */

import { useThemeContext } from '@/src/context/ThemeContext';
import { RootState } from '@/src/store';
import type { User } from '@/src/store/authSlice';
import { addMockUser, hydrateWorkspace, selectCurrentUser } from '@/src/store/authSlice';
import { loadConfig } from '@/src/workspace/config/loadConfig';
import { createWorkspace } from '@/src/workspace/config/saveConfig';
import { DEFAULT_ACCENT_COLOR, DEFAULT_WORKSPACE_NAME } from '@/src/workspace/config/types';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Input,
  InputField,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// ============================================================================
// Constants
// ============================================================================

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#8b5cf6' },
];

const TOOLS_CONFIG = [
  { key: 'finance', label: 'Finances', icon: 'account-balance-wallet', color: '#10b981' },
  { key: 'events', label: 'Events', icon: 'event', color: '#3b82f6' },
  { key: 'medicals', label: 'Medicals', icon: 'local-hospital', color: '#ec4899' },
] as const;

type ToolKey = typeof TOOLS_CONFIG[number]['key'];

// ============================================================================
// Main Onboarding Component
// ============================================================================

export default function Onboarding() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state));
  const { colorMode } = useThemeContext();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Form state
  const [workspaceName, setWorkspaceName] = useState(DEFAULT_WORKSPACE_NAME);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [enabledTools, setEnabledTools] = useState({
    finance: true,
    events: true,
    medicals: true,
  });
  const [displayName, setDisplayName] = useState('');

  // Initialize display name from current user
  useEffect(() => {
    if (currentUser && !displayName) {
      setDisplayName(currentUser.name);
    }
  }, [currentUser, displayName]);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return workspaceName.trim().length > 0 && workspaceName.length <= 50;
      case 1:
        return ACCENT_COLORS.some(c => c.value === accentColor);
      case 2:
        return Object.values(enabledTools).some(v => v);
      case 3:
        return displayName.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    await handleComplete();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleToggleTool = (key: string) => {
    setEnabledTools(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Create new workspace
      const result = await createWorkspace(workspaceName.trim(), accentColor);

      if (!result.success || !result.workspace) {
        console.error('[Onboarding] Failed to create workspace:', result.error);
        setIsLoading(false);
        return;
      }

      // Reload config to get the full config with active workspace
      const configResult = await loadConfig();

      if (configResult.success && configResult.config) {
        dispatch(hydrateWorkspace({
          config: result.workspace,
          activeWorkspaceId: configResult.config.activeWorkspaceId,
        }));
      }

      // If no current user, add a mock user with the display name
      if (!currentUser) {
        const mockUser: User = {
          id: `user-${Date.now()}`,
          name: displayName.trim(),
          email: `${displayName.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
        };
        dispatch(addMockUser(mockUser));
      }

      // Show completion and redirect
      setIsComplete(true);
      setTimeout(() => {
        router.replace('/(app)/dashboard');
      }, 1500);

    } catch (error) {
      console.error('[Onboarding] Error completing onboarding:', error);
      setIsLoading(false);
    }
  };

  const backgroundColor = colorMode === 'dark' ? '$backgroundDark0' : '$backgroundLight0';

  // Render completion screen
  if (isComplete) {
    return (
      <Center flex={1} bg={backgroundColor} padding="$6">
        <VStack gap="$6" alignItems="center">
          <Box
            bg="#10b981"
            width={80}
            height={80}
            borderRadius="$full"
            justifyContent="center"
            alignItems="center"
          >
            <MaterialIcons name="check" size={40} color="white" />
          </Box>
          <Heading size="2xl" color="$textPrimary" textAlign="center">
            All set!
          </Heading>
          <Text size="lg" color="$textSecondary" textAlign="center">
            Your workspace is ready. Let's get started.
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Center flex={1} bg={backgroundColor} padding={isMobile ? '$4' : '$8'}>
      <VStack
        gap="$6"
        width="100%"
        maxWidth={isMobile ? '100%' : 480}
        flex={1}
        maxHeight={isMobile ? undefined : 600}
      >
        {/* Progress Indicator */}
        <HStack gap="$2" justifyContent="center">
          {[0, 1, 2, 3].map((step) => (
            <Box
              key={step}
              flex={1}
              height={4}
              borderRadius="$full"
              bg={step <= currentStep ? accentColor : '$textMuted'}
              opacity={step < currentStep ? 0.3 : 1}
            />
          ))}
        </HStack>

        {/* Step 1: Workspace Name */}
        {currentStep === 0 && (
          <StepWorkspaceName
            value={workspaceName}
            onChange={setWorkspaceName}
            onNext={handleNext}
            isMobile={isMobile}
          />
        )}

        {/* Step 2: Accent Color */}
        {currentStep === 1 && (
          <StepAccentColor
            value={accentColor}
            onChange={setAccentColor}
            onNext={handleNext}
            onBack={handleBack}
            isMobile={isMobile}
          />
        )}

        {/* Step 3: Enable Tools */}
        {currentStep === 2 && (
          <StepEnableTools
            tools={enabledTools}
            onToggle={handleToggleTool}
            onNext={handleNext}
            onBack={handleBack}
            isMobile={isMobile}
          />
        )}

        {/* Step 4: Display Name */}
        {currentStep === 3 && (
          <StepDisplayName
            value={displayName}
            onChange={setDisplayName}
            onNext={handleNext}
            onBack={handleBack}
            currentUser={currentUser}
            isMobile={isMobile}
            isLoading={isLoading}
          />
        )}
      </VStack>
    </Center>
  );
}

// ============================================================================
// Step 1: Workspace Name
// ============================================================================

function StepWorkspaceName({
  value,
  onChange,
  onNext,
  isMobile,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  isMobile: boolean;
}) {
  return (
    <VStack flex={1} gap="$6">
      <VStack gap="$2">
        <Heading size="2xl" color="$textPrimary">
          Name your workspace
        </Heading>
        <Text size="md" color="$textSecondary">
          Create a name for your first workspace.
        </Text>
      </VStack>

      <Box flex={1}>
        <VStack gap="$4">
          <Input
            size="lg"
            variant="outline"
            borderColor="$borderPrimary"
            bg="$backgroundCard"
          >
            <InputField
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Personal, Family, Work"
              placeholderTextColor="$textMuted"
              sx={{
                fontSize: isMobile ? 18 : 16,
              }}
              py="$3"
              color="$textPrimary"
            />
          </Input>
          <Text size="sm" color="$textMuted">
            {value.length}/50 characters
          </Text>
        </VStack>
      </Box>

      <HStack gap="$3" justifyContent="flex-end">
        <Button onPress={onNext} size={isMobile ? 'lg' : 'md'}>
          <ButtonText>Continue</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}

// ============================================================================
// Step 2: Accent Color
// ============================================================================

function StepAccentColor({
  value,
  onChange,
  onNext,
  onBack,
  isMobile,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  isMobile: boolean;
}) {
  return (
    <VStack flex={1} gap="$6">
      <VStack gap="$2">
        <Heading size="2xl" color="$textPrimary">
          Choose accent color
        </Heading>
        <Text size="md" color="$textSecondary">
          This will be used for workspace highlights.
        </Text>
      </VStack>

      <Box flex={1}>
        <VStack gap="$6">
          {/* Live Preview */}
          <Box
            bg="$backgroundCard"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$borderPrimary"
            p="$6"
            alignItems="center"
          >
            <Box
              bg={value}
              width={60}
              height={60}
              borderRadius="$full"
            />
            <Text size="lg" fontWeight="$semibold" color="$textPrimary" mt="$3">
              Preview
            </Text>
          </Box>

          {/* Color Options */}
          <VStack gap="$3">
            <Text size="sm" fontWeight="$semibold" color="$textSecondary" textTransform="uppercase">
              Select color
            </Text>
            <HStack gap="$3" flexWrap="wrap">
              {ACCENT_COLORS.map((color) => (
                <Pressable
                  key={color.value}
                  onPress={() => onChange(color.value)}
                >
                  <Box
                    bg={color.value}
                    width={isMobile ? 48 : 56}
                    height={isMobile ? 48 : 56}
                    borderRadius="$full"
                    borderWidth={value === color.value ? 4 : 0}
                    borderColor="$textPrimary"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {value === color.value && (
                      <MaterialIcons name="check" size={isMobile ? 20 : 24} color="white" />
                    )}
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        </VStack>
      </Box>

      <HStack gap="$3" justifyContent="space-between">
        <Button variant="outline" onPress={onBack} size={isMobile ? 'lg' : 'md'}>
          <ButtonText>Back</ButtonText>
        </Button>
        <Button onPress={onNext} size={isMobile ? 'lg' : 'md'} flex={1} maxWidth={200}>
          <ButtonText>Continue</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}

// ============================================================================
// Step 3: Enable Tools
// ============================================================================

function StepEnableTools({
  tools,
  onToggle,
  onNext,
  onBack,
  isMobile,
}: {
  tools: Record<string, boolean>;
  onToggle: (key: string) => void;
  onNext: () => void;
  onBack: () => void;
  isMobile: boolean;
}) {
  return (
    <VStack flex={1} gap="$6">
      <VStack gap="$2">
        <Heading size="2xl" color="$textPrimary">
          Enable tools
        </Heading>
        <Text size="md" color="$textSecondary">
          Select which tools you want to use in this workspace.
        </Text>
      </VStack>

      <Box flex={1}>
        <VStack gap="$3">
          {TOOLS_CONFIG.map((tool) => (
            <Pressable
              key={tool.key}
              onPress={() => onToggle(tool.key)}
            >
              <Box
                bg="$backgroundCard"
                borderRadius="$lg"
                borderWidth={2}
                borderColor={tools[tool.key] ? tool.color : '$borderPrimary'}
                p="$4"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack gap="$3" alignItems="center">
                  <Box bg={tool.color} p="$2" borderRadius="$md">
                    <MaterialIcons name={tool.icon as any} size={24} color="white" />
                  </Box>
                  <Text size="lg" fontWeight="$medium" color="$textPrimary">
                    {tool.label}
                  </Text>
                </HStack>
                <MaterialIcons
                  name={tools[tool.key] ? 'check-circle' : 'radio-button-unchecked'}
                  size={28}
                  color={tools[tool.key] ? tool.color : '$textMuted'}
                />
              </Box>
            </Pressable>
          ))}

          <Text size="sm" color="$textMuted" mt="$2">
            Enable at least one tool to continue
          </Text>
        </VStack>
      </Box>

      <HStack gap="$3" justifyContent="space-between">
        <Button variant="outline" onPress={onBack} size={isMobile ? 'lg' : 'md'}>
          <ButtonText>Back</ButtonText>
        </Button>
        <Button onPress={onNext} size={isMobile ? 'lg' : 'md'} flex={1} maxWidth={200}>
          <ButtonText>Continue</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
}

// ============================================================================
// Step 4: Display Name
// ============================================================================

function StepDisplayName({
  value,
  onChange,
  onNext,
  onBack,
  currentUser,
  isMobile,
  isLoading,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  currentUser: User | null;
  isMobile: boolean;
  isLoading: boolean;
}) {
  const avatarInitial = (value || currentUser?.name || 'U').charAt(0).toUpperCase();

  return (
    <VStack flex={1} gap="$6">
      <VStack gap="$2">
        <Heading size="2xl" color="$textPrimary">
          Your display name
        </Heading>
        <Text size="md" color="$textSecondary">
          How should we refer to you in this workspace?
        </Text>
      </VStack>

      <Box flex={1}>
        <VStack gap="$4">
          {currentUser && (
            <Box
              bg="$backgroundCard"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderPrimary"
              p="$4"
              flexDirection="row"
              alignItems="center"
              gap="$3"
            >
              <Box
                bg="#6366f1"
                width={48}
                height={48}
                borderRadius="$full"
                justifyContent="center"
                alignItems="center"
              >
                <Text size="lg" fontWeight="$bold" color="white">
                  {avatarInitial}
                </Text>
              </Box>
              <VStack>
                <Text size="sm" color="$textMuted">
                  Signed in as
                </Text>
                <Text size="md" fontWeight="$medium" color="$textPrimary">
                  {currentUser.email}
                </Text>
              </VStack>
            </Box>
          )}

          <VStack gap="$2">
            <Text size="md" fontWeight="$medium" color="$textPrimary">
              Display name
            </Text>
            <Input
              size="lg"
              variant="outline"
              borderColor="$borderPrimary"
              bg="$backgroundCard"
            >
              <InputField
                value={value}
                onChangeText={onChange}
                placeholder="Your name"
                placeholderTextColor="$textMuted"
                sx={{
                  fontSize: isMobile ? 18 : 16,
                }}
                py="$3"
                color="$textPrimary"
              />
            </Input>
          </VStack>

          <Text size="sm" color="$textMuted">
            This name will be shown to other workspace members.
          </Text>
        </VStack>
      </Box>

      <HStack gap="$3" justifyContent="space-between">
        <Button variant="outline" onPress={onBack} size={isMobile ? 'lg' : 'md'} isDisabled={isLoading}>
          <ButtonText>Back</ButtonText>
        </Button>
        <Button 
          onPress={onNext} 
          size={isMobile ? 'lg' : 'md'} 
          flex={1} 
          maxWidth={200}
          action={isLoading ? 'secondary' : 'primary'}
          isDisabled={isLoading}
        >
          {isLoading ? (
            <Spinner color="white" />
          ) : (
            <ButtonText>Complete Setup</ButtonText>
          )}
        </Button>
      </HStack>
    </VStack>
  );
}

