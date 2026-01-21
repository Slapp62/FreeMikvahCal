import {
  Button,
  Card,
  createTheme,
  Input,
  Modal,
  Paper,
  rem,
  Select,
  Text,
  TextInput,
  Title,
  virtualColor,
} from '@mantine/core';
import type { MantineThemeOverride } from '@mantine/core';

export const myTheme: MantineThemeOverride = createTheme({
  fontFamily: 'Raleway, sans-serif',

  fontSizes: {
    xs: rem('12px'),
    sm: rem('14px'),
    md: rem('16px'),
    lg: rem('18px'),
    xl: rem('20px'),
    '2xl': rem('24px'),
    '3xl': rem('30px'),
    '4xl': rem('36px'),
    '5xl': rem('48px'),
  },

  spacing: {
    '3xs': rem('4px'),
    '2xs': rem('8px'),
    xs: rem('10px'),
    sm: rem('12px'),
    md: rem('16px'),
    lg: rem('20px'),
    xl: rem('24px'),
    '2xl': rem('28px'),
    '3xl': rem('32px'),
  },

  // Material Design-inspired border radius
  radius: {
    xs: rem('4px'),
    sm: rem('8px'),
    md: rem('12px'),
    lg: rem('16px'),
    xl: rem('20px'),
  },

  // Material Design-inspired shadows
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    sm: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    md: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    lg: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },

  colors: {
    // Primary: Feminine Pink Scale
    pink: [
      '#FEF5FC', // 0 - Lightest (backgrounds, hover states)
      '#FDE8F7', // 1 - Very light
      '#FCD3F0', // 2 - Light pink
      '#FABAE5', // 3 - Soft pink
      '#F79AD9', // 4 - Medium-light
      '#F370CA', // 5 - Medium
      '#E91E8C', // 6 - Brand primary (default)
      '#C91A7A', // 7 - Medium-dark
      '#A31666', // 8 - Dark
      '#7D1150', // 9 - Darkest
    ],

    // Secondary: Purple Scale
    purple: [
      '#F5F3FF', // 0 - Lightest
      '#EDE9FE', // 1 - Very light
      '#DDD6FE', // 2 - Light
      '#C4B5FD', // 3 - Soft purple
      '#A78BFA', // 4 - Medium-light
      '#8B5CF6', // 5 - Medium
      '#7C3AED', // 6 - Brand secondary (default)
      '#6D28D9', // 7 - Medium-dark
      '#5B21B6', // 8 - Dark
      '#4C1D95', // 9 - Darkest
    ],

    // Accent: Indigo Scale
    indigo: [
      '#EEF2FF', // 0 - Lightest
      '#E0E7FF', // 1 - Very light
      '#C7D2FE', // 2 - Light
      '#A5B4FC', // 3 - Soft indigo
      '#818CF8', // 4 - Medium-light
      '#6366F1', // 5 - Medium (default)
      '#4F46E5', // 6 - Brand accent
      '#4338CA', // 7 - Medium-dark
      '#3730A3', // 8 - Dark
      '#312E81', // 9 - Darkest
    ],

    // Virtual color for semantic 'primary'
    primary: virtualColor({
      name: 'primary',
      light: 'pink',
      dark: 'pink',
    }),

    // Virtual color for semantic 'secondary'
    secondary: virtualColor({
      name: 'secondary',
      light: 'purple',
      dark: 'purple',
    }),

    // Virtual color for semantic 'accent'
    accent: virtualColor({
      name: 'accent',
      light: 'indigo',
      dark: 'indigo',
    }),
  },

  primaryColor: 'pink',
  primaryShade: 6,

  components: {
    Paper: Paper.extend({
      defaultProps: {
        p: 'md',
        shadow: 'md',
        radius: 'md',
        withBorder: true,
      },
    }),

    Button: Button.extend({
      defaultProps: {
        radius: 'md',
        color: 'primary',
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: 'all 150ms ease',
        },
      },
    }),

    Card: Card.extend({
      defaultProps: {
        p: 'xl',
        shadow: 'sm',
        radius: 'md',
        withBorder: true,
      },
    }),

    Modal: Modal.extend({
      defaultProps: {
        radius: 'md',
        shadow: 'xl',
        centered: true,
      },
    }),

    Input: Input.extend({
      defaultProps: {
        radius: 'md',
      },
    }),

    TextInput: TextInput.extend({
      defaultProps: {
        radius: 'md',
      },
    }),

    Select: Select.extend({
      defaultProps: {
        checkIconPosition: 'right',
        radius: 'md',
      },
    }),

    Title: Title.extend({
      styles: {
        root: {
          fontWeight: 700,
        },
      },
    }),

    Text: Text.extend({
      defaultProps: {
        // Default text properties can be added here
      },
    }),
  },

  other: {
    // Custom properties for calendar event colors
    eventColors: {
      periodStart: {
        color: 'var(--mantine-color-pink-7)',
        background: 'var(--mantine-color-pink-0)',
      },
      hefsekTahara: {
        color: 'var(--mantine-color-purple-7)',
        background: 'var(--mantine-color-purple-0)',
      },
      onah: {
        color: 'var(--mantine-color-indigo-6)',
        background: 'var(--mantine-color-indigo-0)',
      },
    },
  },
});

export default myTheme;
