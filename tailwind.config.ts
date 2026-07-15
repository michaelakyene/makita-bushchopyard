import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#B91C1C",
        gold: "#D97706",
        charcoal: "#1F2937",
        background: "#FAF7F0",
        foreground: "#1F2937",
        card: "#FFFFFF",
        "card-foreground": "#1F2937",
        muted: "#F3F4F6",
        "muted-foreground": "#6B7280",
        border: "#E5E7EB",
        input: "#E5E7EB",
        secondary: "#D97706",
        "secondary-foreground": "#FFFFFF",
        accent: "#D97706",
        "accent-foreground": "#FFFFFF",
        destructive: "#DC2626",
        ring: "#B91C1C",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Fraunces", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
