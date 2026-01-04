import { Button, Center, Text, VStack } from '@gluestack-ui/themed';

export default function Home() {
  return (
    <Center flex={1} bg="$backgroundDark900">
      <VStack space="lg" alignItems="center">
        <Text size="xl" color="$textLight50" fontWeight="$bold">
          Expo Router + Gluestack works
        </Text>

        <Button onPress={() => console.log('Button works')}>
          <Text color="$textLight50">Test Button</Text>
        </Button>
      </VStack>
    </Center>
  );
}
