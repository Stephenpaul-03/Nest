import { Center, Text, View } from '@gluestack-ui/themed';

export default function Schedule() {
  return (
    <View flex={1} bg="$pink500">
      <Center flex={1}>
        <Text size="2xl" color="$textLight50" fontWeight="$bold">
          Schedules
        </Text>
      </Center>
    </View>
  );
}

