import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useThemedColors } from '@/constants/colors';
import { useThemeContext } from '@/src/context/ThemeContext';
import { RootState } from '@/src/store';
import {
  addMockUser,
  hydrateFromConfig,
  logout,
  selectAllUsers,
  selectCurrentUser,
  setActiveWorkspace,
  setWorkspaceCurrencySymbol,
  switchAccount,
  ToolKey,
  User
} from '@/src/store/authSlice';
import { updateConfig } from '@/src/workspace/config/loadConfig';
import { DEFAULT_ACCENT_COLOR } from '@/src/workspace/config/types';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  ScrollView,
  Spinner,
  Switch,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Mock users for adding new accounts
const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=6366f1&color=fff',
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob.smith@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=10b981&color=fff',
  },
  {
    id: 'user-3',
    name: 'Carol Williams',
    email: 'carol.williams@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Carol+Williams&background=f59e0b&color=fff',
  },
];

const CURRENCY_OPTIONS = [
  { symbol: '$', name: 'US Dollar', code: 'USD' },
  { symbol: '€', name: 'Euro', code: 'EUR' },
  { symbol: '£', name: 'British Pound', code: 'GBP' },
  { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  { symbol: '₩', name: 'South Korean Won', code: 'KRW' },
  { symbol: '₽', name: 'Russian Ruble', code: 'RUB' },
  { symbol: 'R$', name: 'Brazilian Real', code: 'BRL' },
  { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  { symbol: 'CHF', name: 'Swiss Franc', code: 'CHF' },
  { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
  { symbol: 'kr', name: 'Swedish Krona', code: 'SEK' },
  { symbol: 'kr', name: 'Norwegian Krone', code: 'NOK' },
  { symbol: '₺', name: 'Turkish Lira', code: 'TRY' },
  { symbol: '฿', name: 'Thai Baht', code: 'THB' },
  { symbol: '₫', name: 'Vietnamese Dong', code: 'VND' },
  { symbol: '₪', name: 'Israeli Shekel', code: 'ILS' },
  { symbol: 'zł', name: 'Polish Zloty', code: 'PLN' },
  { symbol: 'Kč', name: 'Czech Koruna', code: 'CZK' },
];

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#8b5cf6' },
];

export default function Settings() {
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state: RootState) => state.auth.activeWorkspace);
  const workspaces = useSelector((state: RootState) => state.auth.workspaces);
  const currentWorkspaceTools = workspaces[activeWorkspace]?.enabledTools || {
    finance: true,
    events: true,
    medicals: true,
  };
  const currentCurrencySymbol = workspaces[activeWorkspace]?.currencySymbol || '$';
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state));
  const rememberedUsers = useSelector((state: RootState) => selectAllUsers(state));
  
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showSwitchingModal, setShowSwitchingModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [switchingProgress, setSwitchingProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Workspace settings state
  const [newWorkspaceName, setNewWorkspaceName] = useState(activeWorkspace);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_ACCENT_COLOR);
  const [localTools, setLocalTools] = useState(currentWorkspaceTools);
  
  const { colorMode } = useThemeContext();

  const {
    background,
    text,
    border,
    icon,
    toggle
  } = useThemedColors();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
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
        router.replace('/(app)/dashboard');
      }
    }, interval);
  };

  const handleAccountSwitch = (userId: string) => {
    setShowAccountModal(false);
    dispatch(switchAccount(userId));
    router.replace('/(app)/dashboard');
  };

  const handleAddNewAccount = () => {
    setShowAddAccountModal(false);
    
    // Find a user that's not already in the list
    const existingIds = new Set(rememberedUsers.map(u => u.id));
    const availableUser = MOCK_USERS.find(u => !existingIds.has(u.id));
    
    if (availableUser) {
      dispatch(addMockUser(availableUser));
    } else {
      // All mock users are used, create a new one
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: `User ${rememberedUsers.length + 1}`,
        email: `user${rememberedUsers.length + 1}@example.com`,
        avatar: `https://ui-avatars.com/api/?name=User+${rememberedUsers.length + 1}&background=random&color=fff`,
      };
      dispatch(addMockUser(newUser));
    }
    
    router.replace('/(app)/dashboard');
  };

  const handleToolToggle = (tool: ToolKey) => {
    setLocalTools(prev => ({
      ...prev,
      [tool]: !prev[tool],
    }));
  };

  const handleCurrencyChange = (symbol: string) => {
    dispatch(setWorkspaceCurrencySymbol({ workspace: activeWorkspace, symbol }));
    setShowCurrencyModal(false);
  };

  // ========================================
  // Workspace Settings - Config-driven
  // ========================================

  const handleRenameWorkspace = async () => {
    if (!newWorkspaceName.trim() || newWorkspaceName.trim() === activeWorkspace) {
      setShowRenameModal(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateConfig({ name: newWorkspaceName.trim() });
      
      if (result.success && result.config) {
        // Hydrate Redux from updated config
        dispatch(hydrateFromConfig({
          name: result.config.name,
          accentColor: result.config.accentColor,
          tools: result.config.tools,
          members: result.config.members,
        }));
        setShowRenameModal(false);
      } else {
        console.error('[Settings] Failed to rename workspace:', result.error);
      }
    } catch (error) {
      console.error('[Settings] Error renaming workspace:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeColor = async (color: string) => {
    setSelectedColor(color);
    setIsSaving(true);
    try {
      const result = await updateConfig({ accentColor: color });
      
      if (result.success && result.config) {
        dispatch(hydrateFromConfig({
          name: result.config.name,
          accentColor: result.config.accentColor,
          tools: result.config.tools,
          members: result.config.members,
        }));
        setShowColorModal(false);
      }
    } catch (error) {
      console.error('[Settings] Error changing color:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTool = async (tool: ToolKey) => {
    const newTools = { ...localTools, [tool]: !localTools[tool] };
    setLocalTools(newTools);
    
    setIsSaving(true);
    try {
      const result = await updateConfig({ tools: newTools });
      
      if (result.success && result.config) {
        dispatch(hydrateFromConfig({
          name: result.config.name,
          accentColor: result.config.accentColor,
          tools: result.config.tools,
          members: result.config.members,
        }));
      } else {
        // Revert on failure
        setLocalTools(currentWorkspaceTools);
      }
    } catch (error) {
      console.error('[Settings] Error toggling tool:', error);
      setLocalTools(currentWorkspaceTools);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement deleteConfig function in loadConfig module
      // const deleted = await deleteConfig();
      // For now, redirect to onboarding
      router.replace('/(auth)/onboarding');
    } catch (error) {
      console.error('[Settings] Error deleting workspace:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const workspaceOptions = ['Personal', 'Family'];

  const tools: { key: ToolKey; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: 'finance', label: 'Finances', icon: 'account-balance-wallet' },
    { key: 'events', label: 'Events', icon: 'event' },
    { key: 'medicals', label: 'Medicals', icon: 'local-hospital' },
  ];

  const progressWidth = `${switchingProgress}%`;

  // Find the currency name for display
  const currentCurrencyInfo = CURRENCY_OPTIONS.find(c => c.symbol === currentCurrencySymbol) || {
    symbol: currentCurrencySymbol,
    name: 'Custom Currency',
    code: 'CUSTOM'
  };

  return (
    <Box flex={1} bg={background.primary}>
      <ScrollView flex={1}>
        <VStack flex={1} alignItems="center" py="$8" px="$4">
          <VStack gap="$6" maxWidth={500} width="100%">
            <Heading size="2xl" color={text.primary} textAlign="center">
              Settings
            </Heading>

            {/* Account Section */}
            <Box bg={background.card} p="$4" borderRadius="$lg" borderWidth={1} borderColor={border.primary}>
              <Text size="sm" fontWeight="$semibold" color={text.secondary} textTransform="uppercase" mb="$3">
                Account
              </Text>
              
              {currentUser ? (
                <HStack alignItems="center" gap="$3" mb="$4">
                  <Avatar size="lg" borderRadius="$full">
                    <AvatarFallbackText>{currentUser.name}</AvatarFallbackText>
                    {currentUser.avatar && <AvatarImage source={{ uri: currentUser.avatar }} />}
                  </Avatar>
                  <VStack flex={1}>
                    <Text size="lg" fontWeight="$medium" color={text.primary}>
                      {currentUser.name}
                    </Text>
                    <Text size="sm" color={text.secondary}>
                      {currentUser.email}
                    </Text>
                  </VStack>
                </HStack>
              ) : null}
              
              <VStack gap="$2">
                <Button
                  variant="outline"
                  action="secondary"
                  onPress={() => setShowAccountModal(true)}
                >
                  <MaterialIcons name="swap-horiz" size={20} color={text.primary} />
                  <ButtonText ml="$2" color={text.primary}>Switch account</ButtonText>
                </Button>
                
                <Button
                  variant="outline"
                  action="secondary"
                  onPress={() => setShowAddAccountModal(true)}
                >
                  <MaterialIcons name="person-add" size={20} color={text.primary} />
                  <ButtonText ml="$2" color={text.primary}>Add another account</ButtonText>
                </Button>
                
                <Button variant="solid" action="negative" onPress={handleLogout}>
                  <ButtonText>Log out</ButtonText>
                </Button>
              </VStack>
            </Box>

            {/* Workspace Settings Section */}
            <Box bg={background.card} p="$4" borderRadius="$lg" borderWidth={1} borderColor={border.primary}>
              <HStack justifyContent="space-between" alignItems="center" mb="$3">
                <Text size="sm" fontWeight="$semibold" color={text.secondary} textTransform="uppercase">
                  Workspace
                </Text>
                <Pressable onPress={() => setShowRenameModal(true)}>
                  <HStack alignItems="center" gap="$1">
                    <MaterialIcons name="edit" size={16} color={toggle.on} />
                    <Text size="xs" color={toggle.on}>Edit</Text>
                  </HStack>
                </Pressable>
              </HStack>
              
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

            {/* Accent Color Section */}
            <Box bg={background.card} p="$4" borderRadius="$lg" borderWidth={1} borderColor={border.primary}>
              <HStack justifyContent="space-between" alignItems="center" mb="$3">
                <Text size="sm" fontWeight="$semibold" color={text.secondary} textTransform="uppercase">
                  Accent Color
                </Text>
                <Pressable onPress={() => setShowColorModal(true)}>
                  <HStack alignItems="center" gap="$1">
                    <MaterialIcons name="edit" size={16} color={toggle.on} />
                    <Text size="xs" color={toggle.on}>Change</Text>
                  </HStack>
                </Pressable>
              </HStack>
              
              <HStack alignItems="center" gap="$3">
                <Box 
                  bg={ACCENT_COLORS.find(c => c.value === selectedColor)?.value || DEFAULT_ACCENT_COLOR} 
                  width={32} 
                  height={32} 
                  borderRadius="$full" 
                />
                <Text size="md" fontWeight="$medium" color={text.primary}>
                  {ACCENT_COLORS.find(c => c.value === selectedColor)?.name || 'Indigo'}
                </Text>
              </HStack>
            </Box>

            {/* Enabled Tools Section - Now Config-driven */}
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
                      value={localTools[tool.key]}
                      onToggle={() => handleToggleTool(tool.key)}
                      size="md"
                      trackColor={{ false: toggle.off, true: toggle.on }}
                      thumbColor="#FFFFFF"
                      isDisabled={isSaving}
                    />
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Currency Symbol Section */}
            <Box bg={background.card} p="$4" borderRadius="$lg" borderWidth={1} borderColor={border.primary}>
              <Text size="sm" fontWeight="$semibold" color={text.secondary} textTransform="uppercase" mb="$3">
                Currency Symbol
              </Text>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" gap="$3">
                  <Box bg={background.cardAlt} p="$2" borderRadius="$md">
                    <Text size="xl" fontWeight="$bold" color={text.primary}>
                      {currentCurrencySymbol}
                    </Text>
                  </Box>
                  <VStack>
                    <Text size="md" fontWeight="$medium" color={text.primary}>
                      {currentCurrencyInfo.name}
                    </Text>
                    <Text size="xs" color={text.secondary}>
                      {currentCurrencyInfo.code}
                    </Text>
                  </VStack>
                </HStack>
                <Button variant="outline" size="sm" onPress={() => setShowCurrencyModal(true)}>
                  <ButtonText>Change</ButtonText>
                </Button>
              </HStack>
            </Box>

            {/* Delete Workspace Section */}
            <Box 
              bg={background.card} 
              p="$4" 
              borderRadius="$lg" 
              borderWidth={1} 
              borderColor="$error600"
            >
              <Text size="sm" fontWeight="$semibold" color="$error600" textTransform="uppercase" mb="$3">
                Danger Zone
              </Text>
              <Text size="sm" color={text.secondary} mb="$3">
                Deleting the workspace will remove all data and redirect you to onboarding.
              </Text>
              <Button 
                variant="solid" 
                action="negative" 
                onPress={() => setShowDeleteModal(true)}
                isDisabled={isSaving}
              >
                <ButtonText>Delete Workspace</ButtonText>
              </Button>
            </Box>

            {/* Appearance Section */}
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
          </VStack>
        </VStack>
      </ScrollView>

      {/* Account Selection Modal */}
      <Modal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Switch Account</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap="$2" mt="$2">
              {rememberedUsers.map((user) => (
                <Pressable
                  key={user.id}
                  py="$3"
                  px="$4"
                  $hover={{ bg: background.hover }}
                  borderColor={border.primary}
                  borderWidth={currentUser?.id === user.id ? '$2' : '$0'}
                  borderRadius="$lg"
                  onPress={() => handleAccountSwitch(user.id)}
                >
                  <HStack alignItems="center" gap="$3">
                    <Avatar size="sm" borderRadius="$full">
                      <AvatarFallbackText>{user.name}</AvatarFallbackText>
                      {user.avatar && <AvatarImage source={{ uri: user.avatar }} />}
                    </Avatar>
                    <VStack flex={1}>
                      <Text
                        size="md"
                        fontWeight={currentUser?.id === user.id ? '$bold' : '$normal'}
                        color={text.primary}
                      >
                        {user.name}
                      </Text>
                      <Text size="xs" color={text.secondary}>
                        {user.email}
                      </Text>
                    </VStack>
                    {currentUser?.id === user.id && (
                      <MaterialIcons name="check" size={20} color={toggle.on} />
                    )}
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" action="secondary" onPress={() => setShowAccountModal(false)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Account Modal */}
      <Modal isOpen={showAddAccountModal} onClose={() => setShowAddAccountModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Add Account</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap="$4" py="$2">
              <Text size="md" color={text.primary}>
                Select a mock account to add:
              </Text>
              <VStack gap="$2">
                {MOCK_USERS.filter(u => !rememberedUsers.find(ru => ru.id === u.id)).map((user) => (
                  <Pressable
                    key={user.id}
                    py="$3"
                    px="$4"
                    $hover={{ bg: background.hover }}
                    borderColor={border.primary}
                    borderWidth={1}
                    borderRadius="$lg"
                    onPress={() => handleAddNewAccount()}
                  >
                    <HStack alignItems="center" gap="$3">
                      <Avatar size="sm" borderRadius="$full">
                        <AvatarFallbackText>{user.name}</AvatarFallbackText>
                        {user.avatar && <AvatarImage source={{ uri: user.avatar }} />}
                      </Avatar>
                      <VStack>
                        <Text size="md" fontWeight="$medium" color={text.primary}>
                          {user.name}
                        </Text>
                        <Text size="xs" color={text.secondary}>
                          {user.email}
                        </Text>
                      </VStack>
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" action="secondary" onPress={() => setShowAddAccountModal(false)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Workspace Selection Modal */}
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

      {/* Rename Workspace Modal */}
      <Modal isOpen={showRenameModal} onClose={() => setShowRenameModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Rename Workspace</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap="$4" py="$2">
              <Input
                size="lg"
                variant="outline"
                borderColor={border.primary}
                bg={background.card}
              >
                <InputField
                  value={newWorkspaceName}
                  onChangeText={setNewWorkspaceName}
                  placeholder="Workspace name"
                  placeholderTextColor={text.muted}
                  color={text.primary}
                />
              </Input>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack gap="$3">
              <Button variant="outline" action="secondary" onPress={() => setShowRenameModal(false)}>
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button 
                onPress={handleRenameWorkspace}
                isDisabled={isSaving || !newWorkspaceName.trim()}
              >
                {isSaving ? <Spinner color="white" /> : <ButtonText>Rename</ButtonText>}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Color Selection Modal */}
      <Modal isOpen={showColorModal} onClose={() => setShowColorModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Choose Accent Color</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap="$3" py="$2">
              <HStack gap="$3" flexWrap="wrap" justifyContent="center">
                {ACCENT_COLORS.map((color) => (
                  <Pressable
                    key={color.value}
                    onPress={() => handleChangeColor(color.value)}
                    disabled={isSaving}
                  >
                    <Box
                      bg={color.value}
                      width={48}
                      height={48}
                      borderRadius="$full"
                      borderWidth={selectedColor === color.value ? 4 : 0}
                      borderColor={text.primary}
                      justifyContent="center"
                      alignItems="center"
                    >
                      {selectedColor === color.value && (
                        <MaterialIcons name="check" size={20} color="white" />
                      )}
                    </Box>
                  </Pressable>
                ))}
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" action="secondary" onPress={() => setShowColorModal(false)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal isOpen={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Select Currency</Heading>
          </ModalHeader>
          <ModalBody>
            <ScrollView maxHeight={400}>
              <VStack gap="$2" mt="$2">
                {CURRENCY_OPTIONS.map((currency) => (
                  <Pressable
                    key={currency.code}
                    py="$3"
                    px="$4"
                    $hover={{ bg: background.hover }}
                    borderColor={border.primary}
                    borderWidth={currentCurrencySymbol === currency.symbol ? '$2' : '$0'}
                    borderRadius="$lg"
                    onPress={() => handleCurrencyChange(currency.symbol)}
                  >
                    <HStack alignItems="center" justifyContent="space-between">
                      <HStack alignItems="center" gap="$3">
                        <Box bg={background.cardAlt} p="$2" borderRadius="$md" minWidth={40} alignItems="center">
                          <Text size="lg" fontWeight="$bold" color={text.primary}>
                            {currency.symbol}
                          </Text>
                        </Box>
                        <VStack>
                          <Text
                            size="md"
                            fontWeight={currentCurrencySymbol === currency.symbol ? '$bold' : '$normal'}
                            color={text.primary}
                          >
                            {currency.name}
                          </Text>
                          <Text size="xs" color={text.secondary}>
                            {currency.code}
                          </Text>
                        </VStack>
                      </HStack>
                      {currentCurrencySymbol === currency.symbol && (
                        <MaterialIcons name="check" size={20} color={toggle.on} />
                      )}
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </ScrollView>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" action="secondary" onPress={() => setShowCurrencyModal(false)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Workspace Confirmation Modal */}
      <Modal isOpen={showDeleteModal} size="md" avoidKeyboard>
        <ModalBackdrop bg="rgba(0,0,0,0.5)" />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" color="$error600">Delete Workspace</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap="$4" py="$2">
              <HStack alignItems="center" gap="$3" p="$3" bg="$error100" borderRadius="$md">
                <MaterialIcons name="warning" size={24} color="$error700" />
                <Text size="sm" color="$error700">
                  This action cannot be undone. All workspace data will be permanently deleted.
                </Text>
              </HStack>
              <Text size="md" color={text.primary}>
                Are you sure you want to delete "{activeWorkspace}"?
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack gap="$3">
              <Button variant="outline" action="secondary" onPress={() => setShowDeleteModal(false)}>
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button 
                variant="solid" 
                action="negative"
                onPress={handleDeleteWorkspace}
                isDisabled={isSaving}
              >
                {isSaving ? <Spinner color="white" /> : <ButtonText>Delete</ButtonText>}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Workspace Switching Modal */}
      <Modal isOpen={showSwitchingModal} size="md" avoidKeyboard>
        <ModalBackdrop bg="rgba(0,0,0,0.5)" />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" textAlign="center" width="100%">Switching Workspace</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap="$4" alignItems="center" py="$4">
              <Spinner size="large" color={toggle.on} />
              <Text size="lg" fontWeight="$medium" color={text.primary} textAlign="center">
                Switching to {workspaceOptions.find(w => w !== activeWorkspace) || activeWorkspace}...
              </Text>
              <Text size="sm" color={text.secondary} textAlign="center">
                Give me a minute. Let me crunch some numbers.
              </Text>
              <Box width="100%" height={4} bg="$backgroundLight300" borderRadius="$full" overflow="hidden">
                <Box
                  height="100%"
                  style={{width:progressWidth}}
                  bg="$primary500"
                  $xs-borderRadius="$full"
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

