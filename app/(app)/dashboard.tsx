import { Center, Text } from '@gluestack-ui/themed';

export default function Dashboard() {
  return (
    <Center flex={1} bg="$backgroundDark900">
      <Text size="2xl" color="$textLight50" fontWeight="$bold">
        Dashboard
      </Text>
    </Center>
  );
}

