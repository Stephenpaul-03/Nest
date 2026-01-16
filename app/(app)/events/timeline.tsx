import { Center, Text, View } from '@gluestack-ui/themed';

export default function Timeline() {
  return (
    <View flex={1} bg="$teal500">
      <Center flex={1}>
        <Text size="2xl" color="$textLight50" fontWeight="$bold">
          Timeline
        </Text>
      </Center>
    </View>
  );
}

