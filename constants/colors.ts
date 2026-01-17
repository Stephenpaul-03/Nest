/**
 * Unified Theme Colors for the Nest app.
 * This is the SINGLE SOURCE OF TRUTH for all colors in the app.
 * 
 * This file consolidates both:
 * 1. The custom semantic color system (background, text, border, icon, toggle)
 * 2. The gluestack-ui CSS variable system
 * 
 * Usage:
 * - For app components: import { useThemedColors } from '@/constants/colors'
 * - For gluestack components: Uses CSS variables defined in config.ts (imported from here)
 */

import { useThemeContext } from '@/src/context/ThemeContext';

// Theme type
export type ColorScheme = 'light' | 'dark';

// ============================================================================
// UNIFIED COLOR DEFINITIONS
// All colors are defined here once, then used by both systems
// ============================================================================

// Background colors
const BACKGROUND_LIGHT = {
  0: '#FBFBFB',
  50: '#F3F4F6',
  100: '#E5E7EB',
  200: '#D1D5DB',
  300: '#9CA3AF',
  400: '#6B7280',
  800: '#1F2937',
  900: '#111827',
} as const;

const BACKGROUND_DARK = {
  0: '#0a0a0a',
  50: '#1F2937',
  100: '#374151',
  200: '#4B5563',
  300: '#6B7280',
  800: '#1F2937',
  900: '#111827',
} as const;

// Text colors
const TEXT_LIGHT = {
  50: '#F9FAFB',
  200: '#E5E7EB',
  300: '#9CA3AF',
  600: '#4B5563',
  700: '#374151',
  900: '#11181C',
} as const;

const TEXT_DARK = {
  50: '#F9FAFB',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  900: '#ECEDEE',
} as const;

// Border colors
const BORDER_LIGHT = {
  200: '#E5E7EB',
} as const;

const BORDER_DARK = {
  700: '#374151',
  800: '#1F2937',
} as const;

// Icon colors
const ICON_LIGHT = '#374151';
const ICON_DARK = '#D1D5DB';

// Toggle colors
const TOGGLE_ON = '#6366F1';
const TOGGLE_OFF = '#E5E7EB';

// ============================================================================
// SEMANTIC COLOR TOKENS (for app components)
// ============================================================================

export const BACKGROUND = {
  light: BACKGROUND_LIGHT,
  dark: BACKGROUND_DARK,
} as const;

export const TEXT = {
  light: TEXT_LIGHT,
  dark: TEXT_DARK,
} as const;

export const BORDER = {
  light: BORDER_LIGHT,
  dark: BORDER_DARK,
} as const;

export const ICON = {
  light: ICON_LIGHT,
  dark: ICON_DARK,
} as const;

export const TOGGLE = {
  on: TOGGLE_ON,
  off: TOGGLE_OFF,
} as const;

// ============================================================================
// HOOK: useThemedColors
// Provides theme-aware semantic colors for app components
// ============================================================================

export function useThemedColors() {
  const { colorMode } = useThemeContext();
  const isDark = colorMode === 'dark';

  return {
    isDark,
    colorMode,
    background: {
      primary: isDark ? BACKGROUND.dark[0] : BACKGROUND.light[0],
      secondary: isDark ? BACKGROUND.dark[800] : BACKGROUND.light[50],
      tertiary: isDark ? BACKGROUND.dark[900] : BACKGROUND.light[0],
      card: isDark ? BACKGROUND.dark[800] : BACKGROUND.light[50],
      cardAlt: isDark ? BACKGROUND.dark[900] : BACKGROUND.light[0],
      hover: isDark ? BACKGROUND.dark[100] : BACKGROUND.light[200],
      input: isDark ? BACKGROUND.dark[50] : BACKGROUND.light[100],
    },
    text: {
      primary: isDark ? TEXT.dark[900] : TEXT.light[900],
      secondary: isDark ? TEXT.dark[400] : TEXT.light[600],
      tertiary: isDark ? TEXT.dark[300] : TEXT.light[700],
      muted: isDark ? TEXT.dark[200] : TEXT.light[300],
    },
    border: {
      primary: isDark ? BORDER.dark[700] : BORDER.light[200],
      secondary: isDark ? BORDER.dark[800] : BORDER.light[200],
    },
    icon: {
      primary: isDark ? ICON.dark : ICON.light,
      muted: isDark ? '#A0A0A0' : '#9CA3AF',
    },
    toggle: {
      on: TOGGLE.on,
      off: TOGGLE.off,
    },
  };
}

// ============================================================================
// FUNCTION: getThemedColors
// Non-hook version for use outside React components
// ============================================================================

export function getThemedColors(isDark: boolean) {
  return {
    isDark,
    background: {
      primary: isDark ? BACKGROUND.dark[0] : BACKGROUND.light[0],
      secondary: isDark ? BACKGROUND.dark[800] : BACKGROUND.light[50],
      tertiary: isDark ? BACKGROUND.dark[900] : BACKGROUND.light[0],
      card: isDark ? BACKGROUND.dark[800] : BACKGROUND.light[50],
      cardAlt: isDark ? BACKGROUND.dark[900] : BACKGROUND.light[0],
      hover: isDark ? BACKGROUND.dark[100] : BACKGROUND.light[200],
      input: isDark ? BACKGROUND.dark[50] : BACKGROUND.light[100],
    },
    text: {
      primary: isDark ? TEXT.dark[900] : TEXT.light[900],
      secondary: isDark ? TEXT.dark[400] : TEXT.light[600],
      tertiary: isDark ? TEXT.dark[300] : TEXT.light[700],
      muted: isDark ? TEXT.dark[200] : TEXT.light[300],
    },
    border: {
      primary: isDark ? BORDER.dark[700] : BORDER.light[200],
      secondary: isDark ? BORDER.dark[800] : BORDER.light[200],
    },
    icon: {
      primary: isDark ? ICON.dark : ICON.light,
      muted: isDark ? '#A0A0A0' : '#9CA3AF',
    },
    toggle: {
      on: TOGGLE.on,
      off: TOGGLE.off,
    },
  };
}

// ============================================================================
// GLUESTACK-UI COMPATIBLE CONFIG
// This is used by config.ts to generate CSS variables
// ============================================================================

export const GLUESTACK_CONFIG = {
  light: {
    // Primary - Slate gray tones
    '--color-primary-0': '251 251 251',
    '--color-primary-50': '244 244 245',
    '--color-primary-100': '228 228 231',
    '--color-primary-200': '212 212 216',
    '--color-primary-300': '161 161 170',
    '--color-primary-400': '113 113 122',
    '--color-primary-500': '82 82 91',
    '--color-primary-600': '63 64 70',
    '--color-primary-700': '49 49 54',
    '--color-primary-800': '39 39 42',
    '--color-primary-900': '28 28 30',
    '--color-primary-950': '17 17 18',

    // Secondary - Warm gray
    '--color-secondary-0': '255 251 235',
    '--color-secondary-50': '254 243 199',
    '--color-secondary-100': '253 230 138',
    '--color-secondary-200': '252 211 77',
    '--color-secondary-300': '251 191 36',
    '--color-secondary-400': '245 158 11',
    '--color-secondary-500': '217 119 6',
    '--color-secondary-600': '180 83 9',
    '--color-secondary-700': '146 64 14',
    '--color-secondary-800': '120 53 15',
    '--color-secondary-900': '69 26 3',
    '--color-secondary-950': '48 26 5',

    // Tertiary - Brand color (Indigo)
    '--color-tertiary-0': '238 242 255',
    '--color-tertiary-50': '224 231 255',
    '--color-tertiary-100': '199 210 254',
    '--color-tertiary-200': '165 180 252',
    '--color-tertiary-300': '129 140 248',
    '--color-tertiary-400': '99 102 241',
    '--color-tertiary-500': '67 56 202',
    '--color-tertiary-600': '55 48 163',
    '--color-tertiary-700': '49 46 129',
    '--color-tertiary-800': '30 27 75',
    '--color-tertiary-900': '15 10 30',
    '--color-tertiary-950': '9 5 18',

    // Error
    '--color-error-0': '254 242 242',
    '--color-error-50': '254 226 226',
    '--color-error-100': '254 202 202',
    '--color-error-200': '252 165 165',
    '--color-error-300': '248 113 113',
    '--color-error-400': '239 68 68',
    '--color-error-500': '220 38 38',
    '--color-error-600': '185 28 28',
    '--color-error-700': '153 27 27',
    '--color-error-800': '127 29 29',
    '--color-error-900': '69 10 10',
    '--color-error-950': '48 12 12',

    // Success
    '--color-success-0': '240 253 244',
    '--color-success-50': '220 252 231',
    '--color-success-100': '187 247 208',
    '--color-success-200': '134 239 172',
    '--color-success-300': '74 222 128',
    '--color-success-400': '34 197 94',
    '--color-success-500': '22 163 74',
    '--color-success-600': '21 128 61',
    '--color-success-700': '22 101 52',
    '--color-success-800': '20 83 45',
    '--color-success-900': '20 83 45',
    '--color-success-950': '5 46 22',

    // Warning
    '--color-warning-0': '255 251 235',
    '--color-warning-50': '254 243 199',
    '--color-warning-100': '253 230 138',
    '--color-warning-200': '252 211 77',
    '--color-warning-300': '251 191 36',
    '--color-warning-400': '245 158 11',
    '--color-warning-500': '217 119 6',
    '--color-warning-600': '180 83 9',
    '--color-warning-700': '146 64 14',
    '--color-warning-800': '120 53 15',
    '--color-warning-900': '69 26 3',
    '--color-warning-950': '48 26 5',

    // Info
    '--color-info-0': '240 249 255',
    '--color-info-50': '224 242 254',
    '--color-info-100': '186 230 253',
    '--color-info-200': '125 211 252',
    '--color-info-300': '56 189 248',
    '--color-info-400': '14 165 233',
    '--color-info-500': '2 132 199',
    '--color-info-600': '7 89 156',
    '--color-info-700': '12 74 124',
    '--color-info-800': '22 58 99',
    '--color-info-900': '15 39 66',
    '--color-info-950': '8 26 44',

    // Typography
    '--color-typography-0': '255 255 255',
    '--color-typography-50': '251 251 251',
    '--color-typography-100': '244 244 245',
    '--color-typography-200': '228 228 231',
    '--color-typography-300': '212 212 216',
    '--color-typography-400': '161 161 170',
    '--color-typography-500': '113 113 122',
    '--color-typography-600': '82 82 91',
    '--color-typography-700': '63 64 70',
    '--color-typography-800': '49 49 54',
    '--color-typography-900': '28 28 30',
    '--color-typography-950': '9 9 11',

    // Outline
    '--color-outline-0': '250 250 250',
    '--color-outline-50': '244 244 245',
    '--color-outline-100': '228 228 231',
    '--color-outline-200': '212 212 216',
    '--color-outline-300': '186 186 192',
    '--color-outline-400': '161 161 170',
    '--color-outline-500': '130 130 137',
    '--color-outline-600': '113 113 122',
    '--color-outline-700': '97 97 105',
    '--color-outline-800': '82 82 90',
    '--color-outline-900': '66 66 69',
    '--color-outline-950': '46 46 48',

    // Background
    '--color-background-0': '255 255 255',
    '--color-background-50': '251 251 251',
    '--color-background-100': '243 244 246',
    '--color-background-200': '229 231 235',
    '--color-background-300': '209 213 219',
    '--color-background-400': '156 163 175',
    '--color-background-500': '107 114 128',
    '--color-background-600': '75 85 99',
    '--color-background-700': '55 65 81',
    '--color-background-800': '31 41 55',
    '--color-background-900': '17 24 39',
    '--color-background-950': '10 10 10',

    // Background Special
    '--color-background-error': '254 242 242',
    '--color-background-warning': '255 251 235',
    '--color-background-success': '240 253 244',
    '--color-background-muted': '250 250 250',
    '--color-background-info': '240 249 255',

    // Focus Ring Indicator
    '--color-indicator-primary': '99 102 241',
    '--color-indicator-info': '14 165 233',
    '--color-indicator-error': '239 68 68',
  },
  dark: {
    // Primary - Slate gray tones (reversed for dark mode)
    '--color-primary-0': '17 17 18',
    '--color-primary-50': '28 28 30',
    '--color-primary-100': '39 39 42',
    '--color-primary-200': '49 49 54',
    '--color-primary-300': '63 64 70',
    '--color-primary-400': '82 82 91',
    '--color-primary-500': '113 113 122',
    '--color-primary-600': '132 132 138',
    '--color-primary-700': '161 161 170',
    '--color-primary-800': '186 186 192',
    '--color-primary-900': '212 212 216',
    '--color-primary-950': '255 255 255',

    // Secondary - Warm gray
    '--color-secondary-0': '48 26 5',
    '--color-secondary-50': '69 26 3',
    '--color-secondary-100': '120 53 15',
    '--color-secondary-200': '146 64 14',
    '--color-secondary-300': '180 83 9',
    '--color-secondary-400': '217 119 6',
    '--color-secondary-500': '245 158 11',
    '--color-secondary-600': '251 191 36',
    '--color-secondary-700': '252 211 77',
    '--color-secondary-800': '253 230 138',
    '--color-secondary-900': '254 243 199',
    '--color-secondary-950': '255 251 235',

    // Tertiary - Brand color (Indigo)
    '--color-tertiary-0': '9 5 18',
    '--color-tertiary-50': '15 10 30',
    '--color-tertiary-100': '30 27 75',
    '--color-tertiary-200': '49 46 129',
    '--color-tertiary-300': '55 48 163',
    '--color-tertiary-400': '67 56 202',
    '--color-tertiary-500': '99 102 241',
    '--color-tertiary-600': '129 140 248',
    '--color-tertiary-700': '165 180 252',
    '--color-tertiary-800': '199 210 254',
    '--color-tertiary-900': '224 231 255',
    '--color-tertiary-950': '238 242 255',

    // Error
    '--color-error-0': '48 12 12',
    '--color-error-50': '69 10 10',
    '--color-error-100': '127 29 29',
    '--color-error-200': '153 27 27',
    '--color-error-300': '185 28 28',
    '--color-error-400': '220 38 38',
    '--color-error-500': '239 68 68',
    '--color-error-600': '248 113 113',
    '--color-error-700': '252 165 165',
    '--color-error-800': '254 202 202',
    '--color-error-900': '254 226 226',
    '--color-error-950': '254 242 242',

    // Success
    '--color-success-0': '5 46 22',
    '--color-success-50': '20 83 45',
    '--color-success-100': '20 83 45',
    '--color-success-200': '22 101 52',
    '--color-success-300': '21 128 61',
    '--color-success-400': '22 163 74',
    '--color-success-500': '34 197 94',
    '--color-success-600': '74 222 128',
    '--color-success-700': '134 239 172',
    '--color-success-800': '187 247 208',
    '--color-success-900': '220 252 231',
    '--color-success-950': '240 253 244',

    // Warning
    '--color-warning-0': '48 26 5',
    '--color-warning-50': '69 26 3',
    '--color-warning-100': '120 53 15',
    '--color-warning-200': '146 64 14',
    '--color-warning-300': '180 83 9',
    '--color-warning-400': '217 119 6',
    '--color-warning-500': '245 158 11',
    '--color-warning-600': '251 191 36',
    '--color-warning-700': '252 211 77',
    '--color-warning-800': '253 230 138',
    '--color-warning-900': '254 243 199',
    '--color-warning-950': '255 251 235',

    // Info
    '--color-info-0': '8 26 44',
    '--color-info-50': '15 39 66',
    '--color-info-100': '22 58 99',
    '--color-info-200': '12 74 124',
    '--color-info-300': '7 89 156',
    '--color-info-400': '2 132 199',
    '--color-info-500': '14 165 233',
    '--color-info-600': '56 189 248',
    '--color-info-700': '125 211 252',
    '--color-info-800': '186 230 253',
    '--color-info-900': '224 242 254',
    '--color-info-950': '240 249 255',

    // Typography
    '--color-typography-0': '9 9 11',
    '--color-typography-50': '17 17 18',
    '--color-typography-100': '28 28 30',
    '--color-typography-200': '39 39 42',
    '--color-typography-300': '49 49 54',
    '--color-typography-400': '63 64 70',
    '--color-typography-500': '82 82 91',
    '--color-typography-600': '113 113 122',
    '--color-typography-700': '130 130 137',
    '--color-typography-800': '161 161 170',
    '--color-typography-900': '212 212 216',
    '--color-typography-950': '228 228 231',

    // Outline
    '--color-outline-0': '46 46 48',
    '--color-outline-50': '66 66 69',
    '--color-outline-100': '82 82 90',
    '--color-outline-200': '97 97 105',
    '--color-outline-300': '113 113 122',
    '--color-outline-400': '130 130 137',
    '--color-outline-500': '161 161 170',
    '--color-outline-600': '186 186 192',
    '--color-outline-700': '212 212 216',
    '--color-outline-800': '228 228 231',
    '--color-outline-900': '244 244 245',
    '--color-outline-950': '250 250 250',

    // Background
    '--color-background-0': '10 10 10',
    '--color-background-50': '17 24 39',
    '--color-background-100': '31 41 55',
    '--color-background-200': '55 65 81',
    '--color-background-300': '75 85 99',
    '--color-background-400': '107 114 128',
    '--color-background-500': '156 163 175',
    '--color-background-600': '209 213 219',
    '--color-background-700': '229 231 235',
    '--color-background-800': '243 244 246',
    '--color-background-900': '251 251 251',
    '--color-background-950': '255 255 255',

    // Background Special
    '--color-background-error': '48 19 19',
    '--color-background-warning': '65 45 35',
    '--color-background-success': '28 56 41',
    '--color-background-muted': '51 51 51',
    '--color-background-info': '26 44 60',

    // Focus Ring Indicator
    '--color-indicator-primary': '129 140 248',
    '--color-indicator-info': '56 189 248',
    '--color-indicator-error': '248 113 113',
  },
};

// ============================================================================
// PRE-DEFINED THEME CONFIGURATIONS
// ============================================================================

export const THEMES = {
  light: {
    name: 'Light',
    colors: getThemedColors(false),
  },
  dark: {
    name: 'Dark',
    colors: getThemedColors(true),
  },
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ThemeColors = ReturnType<typeof getThemedColors>;
export type BackgroundColors = ThemeColors['background'];
export type TextColors = ThemeColors['text'];
export type BorderColors = ThemeColors['border'];
export type IconColors = ThemeColors['icon'];
export type ToggleColors = ThemeColors['toggle'];

// Re-export for convenience
export { BORDER as BorderColors, BACKGROUND as Colors, ICON as IconColors, TEXT as TextColors };

