import { Center, Text, View } from '@gluestack-ui/themed';

export default function Transactions() {
  return (
    <View flex={1} bg="$blue500">
      <Center flex={1}>
        <Text size="2xl" color="$textLight50" fontWeight="$bold">
          Transactions
        </Text>
      </Center>
    </View>
  );
}

