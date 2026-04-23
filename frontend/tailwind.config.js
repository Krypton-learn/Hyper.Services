/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9C19F9',
        secondary: '#F96F0B',
        background: '#F4F3F4',
        foreground: '#262832',
        muted: '#A399A7',
        accent: '#69988E',
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
        heading: ['Zalando Sans Expanded', 'sans-serif'],
        body: ['Zalando Sans Expanded', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        bold: '700',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
