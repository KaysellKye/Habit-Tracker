/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#FAFBFC",
        surface: "#FFFFFF",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F8FAFC",
        "surface-container": "#F1F5F9",
        "surface-container-high": "#E2E8F0",
        "surface-container-highest": "#CBD5E1",
        "on-surface": "#111827",
        "on-surface-variant": "#64748B",
        
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          container: "#2563EB",
          light: "#DBEAFE",
        },
        "primary-container": "#2563EB",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#FFFFFF",
        
        secondary: {
          DEFAULT: "#7C3AED",
          fixed: "#EDE9FE",
        },
        "secondary-fixed": "#EDE9FE",
        "on-secondary-fixed": "#5B21B6",
        
        tertiary: {
          DEFAULT: "#0891B2",
          fixed: "#CFFAFE",
          container: "#0891B2",
        },
        "tertiary-fixed": "#CFFAFE",
        "on-tertiary-fixed": "#155E75",
        "tertiary-container": "#0891B2",
        
        error: {
          DEFAULT: "#DC2626",
          container: "#FEE2E2",
        },
        "error-container": "#FEE2E2",
        "on-error": "#FFFFFF",
        "on-error-container": "#991B1B",
        
        gcal: {
          DEFAULT: "#D97706",
          bg: "#FEF3C7",
          text: "#92400E",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)",
        cardHover: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      }
    },
  },
  plugins: [],
}
