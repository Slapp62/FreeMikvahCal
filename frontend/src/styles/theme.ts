import { Button, Card, createTheme, Paper, rem, Select, Title, virtualColor } from "@mantine/core";
import type { MantineThemeOverride } from "@mantine/core";

export const myTheme: MantineThemeOverride = createTheme({
  fontFamily: "Raleway, sans-serif",
  fontSizes: {
    xs: rem("12px"),
    sm: rem("14px"),
    md: rem("16px"),
    lg: rem("18px"),
    xl: rem("20px"),
    "2xl": rem("24px"),
    "3xl": rem("30px"),
    "4xl": rem("36px"),
    "5xl": rem("48px"),
  },
  spacing: {
    "3xs": rem("4px"),
    "2xs": rem("8px"),
    xs: rem("10px"),
    sm: rem("12px"),
    md: rem("16px"),
    lg: rem("20px"),
    xl: rem("24px"),
    "2xl": rem("28px"),
    "3xl": rem("32px"),
  },

  colors: {
    primary: virtualColor({
      name: 'primary',
      light: 'pink',
      dark: 'pink',
    }),
    black: [
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
      "#000000",
    ],
  },

  components: {
    /** Put your mantine component override here */
    
    Paper: Paper.extend({
      defaultProps: {
        p: "md",
        shadow: "xl",
        radius: "md",
        withBorder: true,
      },
    }),

    Button: Button.extend({
      defaultProps: {
        radius: "sm",
        color: "primary",
        fw: 800,
      },
    }),

    Title: Title.extend({
      defaultProps: {
        
      },
    }),

    Text: Button.extend({
      defaultProps: {
       
      },
    }),

    Card: Card.extend({
      defaultProps: {
        p: "xl",
        shadow: "xl",
        radius: "var(--mantine-radius-default)",
        withBorder: true,
      },
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: "right",
      },
    }),
  },
  other: {
    style: "mantine",
  },
});

export default myTheme;