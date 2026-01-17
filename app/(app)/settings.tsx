import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useThemedColors } from '@/constants/colors';
import { useThemeContext } from '@/src/context/ThemeContext';
import { RootState } from '@/src/store';
import { logout, setActiveWorkspace, toggleTool, ToolKey } from '@/src/store/authSlice';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  Switch,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function Settings() {
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const workspaces = useSelector((state: RootState) => state.auth.workspaces);
  const currentWorkspaceTools = workspaces[activeWorkspace]?.enabledTools || {
    finance: true,
    events: true,
    medicals: true,
  };
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showSwitchingModal, setShowSwitchingModal] = useState(false);
  const [switchingProgress, setSwitchingProgress] = useState(0);
  const { colorMode } = useThemeContext();

  const {
    isDark,
    background,
    text,
    border,
    icon,
    toggle
  } = useThemedColors();

  const handleLogout = () => {
    dispatch(logout());
    import('expo-router').then(({ router }) => {
      router.replace('/(auth)/login');
    });
  };

  const handleWorkspaceChange = (workspace: string) => {
    setShowWorkspaceModal(false);
    setShowSwitchingModal(true);
    setSwitchingProgress(0);

    const duration = 5000;
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = (currentStep / steps) * 100;
      setSwitchingProgress(progress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setShowSwitchingModal(false);
        dispatch(setActiveWorkspace(workspace));
        import('expo-router').then(({ router }) => {
          router.replace('/(app)/dashboard');
        });
      }
    }, interval);
  };

  const handleToolToggle = (tool: ToolKey) => {
    dispatch(toggleTool({ workspace: activeWorkspace, tool }));
  };

  const workspaceOptions = ['Personal', 'Family'];

  const tools: { key: ToolKey; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: 'finance', label: 'Finances', icon: 'account-balance-wallet' },
    { key: 'events', label: 'Events', icon: 'event' },
    { key: 'medicals', label: 'Medicals', icon: 'local-hospital' },
  ];

  const progressWidth = `${switchingProgress}%`;

  return (
    <Box flex={1} bg={background.primary}>
      <VStack flex={1} alignItems="center" py="$8" px="$4">
        <VStack gap="$6" maxWidth={500} width="100%">
          <Heading size="2xl" color={text.primary} textAlign="center">
            Settings
          </Heading>

          <Box bg={background.card} p="$4" borderRadius="$lg" borderWidth={1} borderColor={border.primary}>
            <Text size="sm" fontWeight="$semibold" color={text.secondary} textTransform="uppercase" mb="$3">
              Workspace
            </Text>
            <HStack alignItems="center" justifyContent="space-between">
              <VStack>
                <Text size="lg" fontWeight="$medium" color={text.primary}>
                  {activeWorkspace}
                </Text>
                <Text size="sm" color={text.secondary}>
                  {workspaceOptions.filter(w => w !== activeWorkspace).length} other workspace
                  {workspaceOptions.filter(w => w !== activeWorkspace).length !== 1 ? 's' : ''}
                </Text>
              </VStack>
              <Button variant="outline" size="sm" onPress={() => setShowWorkspaceModal(true)}>
                <ButtonText>Change</ButtonText>
              </Button>
            </HStack>
          </Box>

          <Box bg={background.card} p="$4" borderRadius="$lg" borderWidth={1} borderColor={border.primary}>
            <Text size="sm" fontWeight="$semibold" color={text.secondary} textTransform="uppercase" mb="$3">
              Enabled Tools
            </Text>
            <VStack gap="$2">
              {tools.map((tool) => (
                <HStack
                  key={tool.key}
                  alignItems="center"
                  justifyContent="space-between"
                  bg={background.cardAlt}
                  p="$3"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor={border.primary}
                >
                  <HStack alignItems="center" gap="$3">
                    <Box bg={background.hover} p="$2" borderRadius="$md">
                      <MaterialIcons name={tool.icon} size={20} color={text.primary} />
                    </Box>
                    <Text size="md" fontWeight="$medium" color={text.primary}>
                      {tool.label}
                    </Text>
                  </HStack>
                  <Switch
                    value={currentWorkspaceTools[tool.key]}
                    onToggle={() => handleToolToggle(tool.key)}
                    size="md"
                    trackColor={{ false: toggle.off, true: toggle.on }}
                    thumbColor="#FFFFFF"
                  />
                </HStack>
              ))}
            </VStack>
          </Box>

          <Box bg={background.card} p="$4" borderRadius="$lg" borderWidth={1} borderColor={border.primary}>
            <Text size="sm" fontWeight="$semibold" color={text.secondary} textTransform="uppercase" mb="$3">
              Appearance
            </Text>
            <Box
              bg={background.cardAlt}
              p="$3"
              borderRadius="$md"
              borderWidth={1}
              borderColor={border.primary}
            >
              <ThemeToggle />
            </Box>
          </Box>

          <Box bg={background.card} p="$4" borderRadius="$lg" borderWidth={1} borderColor={border.primary}>
            <Text size="sm" fontWeight="$semibold" color={text.secondary} textTransform="uppercase" mb="$3">
              Account
            </Text>
            <Button variant="solid" action="negative" onPress={handleLogout}>
              <ButtonText>Log out</ButtonText>
            </Button>
          </Box>
        </VStack>
      </VStack>

      <Modal isOpen={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Select Workspace</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap="$2" mt="$2">
              {workspaceOptions.map((workspace) => (
                <Pressable
                  key={workspace}
                  py="$3"
                  px="$4"
                  $hover={{ bg: background.hover }}
                  borderColor={border.primary}
                  borderWidth={activeWorkspace === workspace ? '$2' : '$0'}
                  borderRadius="$lg"
                  onPress={() => handleWorkspaceChange(workspace)}
                >
                  <HStack alignItems="center" justifyContent="space-between">
                    <Text
                      size="md"
                      fontWeight={activeWorkspace === workspace ? '$bold' : '$normal'}
                      color={text.primary}
                    >
                      {workspace}
                    </Text>
                    {activeWorkspace === workspace && (
                      <MaterialIcons name="check" size={20} color={toggle.on} />
                    )}
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" action="secondary" onPress={() => setShowWorkspaceModal(false)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showSwitchingModal} size="md" avoidKeyboard>
        <ModalBackdrop bg="rgba(0,0,0,0.5)" />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" textAlign="center" width="100%">Switching Workspace</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap="$4" alignItems="center" py="$4">
              <Box animation="pulse" iterationCount="infinite">
                <MaterialIcons name="sync" size={48} color={toggle.on} />
              </Box>
              <Text size="lg" fontWeight="$medium" color={text.primary} textAlign="center">
                Switching to {workspaceOptions.find(w => w !== activeWorkspace) || activeWorkspace}...
              </Text>
              <Text size="sm" color={text.secondary} textAlign="center">
                Give me a Minute. Let me crunch some numbers.
              </Text>
              <Box width="100%" height={4} bg="$backgroundLight300" borderRadius="$full" overflow="hidden">
                <Box
                  height="100%"
                  width={progressWidth}
                  bg="$primary500"
                  borderRadius="$full"
                  transition="width 100ms linear"
                />
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

