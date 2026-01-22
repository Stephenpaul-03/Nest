import { useThemeContext } from '@/src/context/ThemeContext';
import { RootState } from '@/src/store';
import { addMockUser, selectAllUsers, selectCurrentUser, User } from '@/src/store/authSlice';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Button,
  ButtonText,
  Center,
  Heading,
  HStack,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Mock user profiles for demo/testing
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

export default function Login() {
  const dispatch = useDispatch();
  const { colorMode } = useThemeContext();
  
  // Get remembered users from Redux
  const rememberedUsers = useSelector((state: RootState) => selectAllUsers(state));
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state));
  
  const [showUserList, setShowUserList] = useState(false);

  const backgroundColor = colorMode === 'dark' ? '$backgroundDark0' : '$backgroundLight0';
  const textColor = colorMode === 'dark' ? '$textDark900' : '$textLight900';
  const secondaryTextColor = colorMode === 'dark' ? '$textDark400' : '$textLight500';
  const cardBg = colorMode === 'dark' ? '$backgroundDark800' : '$backgroundLight50';
  const hoverBg = colorMode === 'dark' ? '$backgroundDark700' : '$backgroundLight100';

  // Navigate if already logged in
  useEffect(() => {
    if (currentUser) {
      import('expo-router').then(({ router }) => {
        router.replace('/(app)/dashboard');
      });
    }
  }, [currentUser]);

  const handleContinueAs = (user: User) => {
    dispatch(addMockUser(user));
    import('expo-router').then(({ router }) => {
      router.replace('/(app)/dashboard');
    });
  };

  const handleAddNewAccount = () => {
    // Find a user that's not already in the list
    const existingIds = new Set(rememberedUsers.map(u => u.id));
    const availableUser = MOCK_USERS.find(u => !existingIds.has(u.id));
    
    if (availableUser) {
      handleContinueAs(availableUser);
    } else {
      // All mock users are used, create a new one
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: `User ${rememberedUsers.length + 1}`,
        email: `user${rememberedUsers.length + 1}@example.com`,
        avatar: `https://ui-avatars.com/api/?name=User+${rememberedUsers.length + 1}&background=random&color=fff`,
      };
      handleContinueAs(newUser);
    }
  };

  return (
    <Center flex={1} bg={backgroundColor} padding="$6">
      <VStack gap="$8" width="100%" maxWidth="$80" alignItems="center">
        <VStack gap="$2" alignItems="center">
          <Heading size="3xl" color={textColor}>
            Nest
          </Heading>
          <Text size="lg" color={secondaryTextColor}>
            Sign in to your workspace
          </Text>
        </VStack>

        {/* Continue as section - shown when there are remembered users */}
        {rememberedUsers.length > 0 && (
          <VStack gap="$4" width="100%">
            <Text size="sm" fontWeight="$semibold" color={secondaryTextColor} textTransform="uppercase">
              Continue as
            </Text>
            
            <VStack gap="$2">
              {rememberedUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => handleContinueAs(user)}
                  activeOpacity={0.7}
                >
                  <HStack
                    alignItems="center"
                    bg={cardBg}
                    p="$3"
                    borderRadius="$lg"
                    borderWidth={1}
                    borderColor="$borderLight200"
                    $dark={{
                      bg: '$backgroundDark800',
                      borderColor: '$borderDark700',
                    }}
                  >
                    <Avatar size="md" borderRadius="$full">
                      <AvatarFallbackText>{user.name}</AvatarFallbackText>
                      {user.avatar && <AvatarImage source={{ uri: user.avatar }} />}
                    </Avatar>
                    <VStack flex={1} ml="$3">
                      <Text size="md" fontWeight="$medium" color={textColor}>
                        {user.name}
                      </Text>
                      <Text size="sm" color={secondaryTextColor}>
                        {user.email}
                      </Text>
                    </VStack>
                    <MaterialIcons 
                      name="chevron-right" 
                      size={24} 
                      color={secondaryTextColor} 
                    />
                  </HStack>
                </TouchableOpacity>
              ))}
            </VStack>
          </VStack>
        )}

        {/* Use another account button */}
        <Button
          size="lg"
          variant="outline"
          action="primary"
          width="100%"
          onPress={handleAddNewAccount}
        >
          <MaterialIcons name="add" size={20} color="$primary500" />
          <ButtonText ml="$2" color="$primary500">
            Use another account
          </ButtonText>
        </Button>

        {/* Info text */}
        <Text size="xs" color={secondaryTextColor} textAlign="center">
          This is a pre-OAuth demo.{"\n"}
          Mock accounts are stored locally in memory.
        </Text>
      </VStack>
    </Center>
  );
}

