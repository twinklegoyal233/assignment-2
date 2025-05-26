import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
    fontFamily: {
      // OVERRIDE the default 'sans' font stack
      sans: ['var(--font-work-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      // You can still keep a custom name if you want, but 'sans' is what's used by default
      'work-sans': ['var(--font-work-sans)', 'sans-serif'],
    },
  },
  plugins: [],
} satisfies Config;
