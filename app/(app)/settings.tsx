import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useThemedColors } from '@/constants/colors';
import { useThemeContext } from '@/src/context/ThemeContext';
import { RootState } from '@/src/store';
import {
  addMockUser,
  logout,
  selectAllUsers, selectCurrentUser,
  setActiveWorkspace,
  setWorkspaceCurrencySymbol,
  switchAccount,
  toggleTool,
  ToolKey,
  User
} from '@/src/store/authSlice';
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
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  ScrollView,
  Switch,
  Text,
  VStack,
} from '@gluestack-ui/themed';
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
  const [switchingProgress, setSwitchingProgress] = useState(0);
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

  const handleAccountSwitch = (userId: string) => {
    setShowAccountModal(false);
    dispatch(switchAccount(userId));
    import('expo-router').then(({ router }) => {
      router.replace('/(app)/dashboard');
    });
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
    
    import('expo-router').then(({ router }) => {
      router.replace('/(app)/dashboard');
    });
  };

  const handleToolToggle = (tool: ToolKey) => {
    dispatch(toggleTool({ workspace: activeWorkspace, tool }));
  };

  const handleCurrencyChange = (symbol: string) => {
    dispatch(setWorkspaceCurrencySymbol({ workspace: activeWorkspace, symbol }));
    setShowCurrencyModal(false);
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

