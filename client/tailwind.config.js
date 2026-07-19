/** @type {import('tailwindcss').Config} */
import { designTokens } from "./src/styles/tokens.js";

const { colors, spacing, typeScale } = designTokens;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: typeScale,
      spacing,
      colors: {
        surface: {
          DEFAULT: colors.warmWhite,
          card: colors.paper,
          muted: colors.warmWhiteMuted,
        },
        brand: {
          DEFAULT: colors.inkNavy,
          dark: "#06070B",
          soft: colors.warmWhiteMuted,
        },
        ink: { DEFAULT: colors.inkNavy, muted: colors.inkMuted },
        accent: {
          DEFAULT: colors.warmAmber,
          deep: colors.warmAmberDeep,
          soft: colors.warmAmberSoft,
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};
