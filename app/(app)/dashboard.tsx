import { useThemeContext } from '@/src/context/ThemeContext';
import { Center, Text } from '@gluestack-ui/themed';

export default function Dashboard() {
  const { colorMode } = useThemeContext();
  const backgroundColor = colorMode === 'dark' ? '#0a0a0a' : '#FBFBFB';
  const textColor = colorMode === 'dark' ? '#ECEDEE' : '#11181C';

  return (
    <Center flex={1} bg={backgroundColor}>
      <Text size="2xl" color={textColor} fontWeight="$bold">
        Dashboard
      </Text>
    </Center>
  );
}

