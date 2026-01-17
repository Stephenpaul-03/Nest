import { useThemeContext } from '@/src/context/ThemeContext';
import { login } from '@/src/store/authSlice';
import { Button, ButtonText, Center, Heading, Text, VStack } from '@gluestack-ui/themed';
import { useDispatch } from 'react-redux';

export default function Login() {
  const dispatch = useDispatch();
  const { colorMode } = useThemeContext();

  const handleLogin = () => {
    dispatch(login());
    // Dynamic import to avoid SSR issues
    import('expo-router').then(({ router }) => {
      router.replace('/(app)/dashboard');
    });
  };

  const backgroundColor = colorMode === 'dark' ? '$backgroundDark0' : '$backgroundLight0';
  const textColor = colorMode === 'dark' ? '$textDark900' : '$textLight900';

  return (
    <Center flex={1} bg={backgroundColor} padding="$6">
      <VStack gap="$8" width="100%" maxWidth="$80" alignItems="center">
        <VStack gap="$2" alignItems="center">
          <Heading size="3xl" color={textColor}>
            Nest
          </Heading>
          <Text size="lg" color="$textLight600">
            Sign in to your workspace
          </Text>
        </VStack>

        <Button
          size="lg"
          variant="solid"
          action="primary"
          width="100%"
          onPress={handleLogin}
        >
          <ButtonText>Sign in with Google</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
}

