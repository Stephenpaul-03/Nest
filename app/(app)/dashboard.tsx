import { useThemedColors } from '@/constants/colors';
import { Center, Text } from '@gluestack-ui/themed';

export default function Dashboard() {
  const { background, text } = useThemedColors();

  return (
    <Center flex={1} bg={background.primary}>
      <Text size="2xl" color={text.primary} fontWeight="$bold">
        Dashboard
      </Text>
    </Center>
  );
}
