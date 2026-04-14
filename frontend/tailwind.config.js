/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--arcademia-pages-dev-color-1)",
        primary: "var(--arcademia-pages-dev-color-2)",
        foreground: "var(--arcademia-pages-dev-color-3)",
        accent: "var(--arcademia-pages-dev-color-4)",
        muted: "var(--arcademia-pages-dev-color-5)",
        secondary: "var(--arcademia-pages-dev-color-6)",
      },
      fontSize: {
        sm: '0.750rem',
        base: '1rem',
        xl: '1.333rem',
        '2xl': '1.777rem',
        '3xl': '2.369rem',
        '4xl': '3.158rem',
        '5xl': '4.210rem',
      },
      fontFamily: {
        heading: 'EB Garamond',
        body: 'EB Garamond',
      },
      fontWeight: {
        normal: '400',
        bold: '700',
      },
    },
  },
  plugins: [],
}
