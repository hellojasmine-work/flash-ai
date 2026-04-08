import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          50: "#FAF7F2",
          100: "#F5F0E8",
          200: "#EBE5D9",
          300: "#DDD4C4",
          400: "#C4B9A4",
          500: "#A89A84",
          600: "#8A7C67",
          700: "#6B5F4D",
          800: "#4D4437",
          900: "#2A2520",
          950: "#1A1714",
        },
        accent: {
          50: "#FEF3EE",
          100: "#FCE2D4",
          200: "#F9C3A8",
          300: "#F49B72",
          400: "#EE7A4D",
          500: "#E05A2B",
          600: "#C2412A",
          700: "#A13024",
          800: "#822923",
          900: "#6A2520",
        },
        sage: {
          50: "#F0F5F1",
          100: "#DCE8DE",
          200: "#BBD2C0",
          300: "#8FB69A",
          400: "#6A9B78",
          500: "#4A7F5C",
          600: "#386649",
          700: "#2D523B",
          800: "#264231",
          900: "#1F3629",
        },
        ink: {
          50: "#F5F5F6",
          100: "#E6E5E7",
          200: "#CFCED1",
          300: "#ADAAB1",
          400: "#84808A",
          500: "#69656F",
          600: "#5A565F",
          700: "#4D4A50",
          800: "#434046",
          900: "#2E2D31",
          950: "#1A191C",
        },
      },
      boxShadow: {
        "warm-sm": "0 1px 3px rgba(42, 37, 32, 0.06), 0 1px 2px rgba(42, 37, 32, 0.04)",
        "warm": "0 4px 12px rgba(42, 37, 32, 0.08), 0 2px 4px rgba(42, 37, 32, 0.04)",
        "warm-lg": "0 12px 32px rgba(42, 37, 32, 0.1), 0 4px 8px rgba(42, 37, 32, 0.04)",
        "warm-xl": "0 20px 48px rgba(42, 37, 32, 0.12), 0 8px 16px rgba(42, 37, 32, 0.06)",
        "card": "0 1px 3px rgba(42,37,32,0.04), 0 4px 12px rgba(42,37,32,0.03)",
        "card-hover": "0 8px 24px rgba(42,37,32,0.1), 0 2px 8px rgba(42,37,32,0.04)",
        "dark-card": "0 1px 3px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)",
        "dark-card-hover": "0 8px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-down": "slideDown 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float": "float 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
