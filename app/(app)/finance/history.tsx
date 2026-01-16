import { Center, Text, View } from '@gluestack-ui/themed';

export default function History() {
  return (
    <View flex={1} bg="$green500">
      <Center flex={1}>
        <Text size="2xl" color="$textLight50" fontWeight="$bold">
          History
        </Text>
      </Center>
    </View>
  );
}

