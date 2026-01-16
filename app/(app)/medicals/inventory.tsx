import { Center, Text, View } from '@gluestack-ui/themed';

export default function Inventory() {
  return (
    <View flex={1} bg="$red500">
      <Center flex={1}>
        <Text size="2xl" color="$textLight50" fontWeight="$bold">
          Inventory
        </Text>
      </Center>
    </View>
  );
}

