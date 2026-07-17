import { heroui } from "@heroui/theme";

/**
 * Military Manager design tokens.
 * Primary = army olive green, Secondary = brass/gold (rank insignia accent).
 * Same brand scale in both themes; only background/foreground/focus shift.
 */
export default heroui({
  themes: {
    light: {
      colors: {
        background: "#F7F6F0",
        foreground: "#23261D",
        divider: "#DEDACB",
        focus: "#A97C24",
        primary: {
          50: "#F3F5EC",
          100: "#E4E9D3",
          200: "#C9D3A9",
          300: "#ABBB80",
          400: "#8AA05C",
          500: "#62793C",
          600: "#4C5F2E",
          700: "#3B4A24",
          800: "#2E3A1C",
          900: "#212A14",
          DEFAULT: "#4C5F2E",
          foreground: "#FFFFFF",
        },
        secondary: {
          50: "#FBF6E7",
          100: "#F4E7C1",
          200: "#E9CD8B",
          300: "#DBAF56",
          400: "#C99735",
          500: "#A97C24",
          600: "#8A6420",
          700: "#6B4E1B",
          800: "#503A15",
          900: "#38290F",
          DEFAULT: "#A97C24",
          foreground: "#23261D",
        },
      },
    },
    dark: {
      colors: {
        background: "#14150F",
        foreground: "#E7E4D8",
        divider: "#2B2F21",
        focus: "#C99735",
        primary: {
          50: "#F3F5EC",
          100: "#E4E9D3",
          200: "#C9D3A9",
          300: "#ABBB80",
          400: "#8AA05C",
          500: "#62793C",
          600: "#4C5F2E",
          700: "#3B4A24",
          800: "#2E3A1C",
          900: "#212A14",
          DEFAULT: "#8AA05C",
          foreground: "#14150F",
        },
        secondary: {
          50: "#FBF6E7",
          100: "#F4E7C1",
          200: "#E9CD8B",
          300: "#DBAF56",
          400: "#C99735",
          500: "#A97C24",
          600: "#8A6420",
          700: "#6B4E1B",
          800: "#503A15",
          900: "#38290F",
          DEFAULT: "#C99735",
          foreground: "#14150F",
        },
      },
    },
  },
});
