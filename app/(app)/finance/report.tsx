import { Center, Text, View } from '@gluestack-ui/themed';

export default function Report() {
  return (
    <View flex={1} bg="$purple500">
      <Center flex={1}>
        <Text size="2xl" color="$textLight50" fontWeight="$bold">
          Reports
        </Text>
      </Center>
    </View>
  );
}

