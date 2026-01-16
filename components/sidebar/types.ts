import { MaterialIcons } from '@expo/vector-icons';

export type NavItem = {
  title: string;
  path?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  accentColor?: string;
  children?: {
    title: string;
    path: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    accentColor?: string;
  }[];
};
