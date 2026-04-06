/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          50: '#E0E7EE',
          100: '#C2D0DD',
          200: '#89A4BC',
          300: '#51799C',
          400: '#294F79',
          500: '#003B5C',
          600: '#002E49',
          700: '#002237',
          800: '#001625',
          900: '#000B13',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: '#F3C45D',
          dark: '#C58A12',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        background: {
          DEFAULT: 'var(--color-bg-main)',
          muted: 'var(--color-bg-light)',
        },
        border: 'var(--color-border)',
        text: {
          main: 'var(--color-text-main)',
          secondary: 'var(--color-text-secondary)',
        }
      },
      fontFamily: {
        sans: ['var(--font-family-base)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-md)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: '1rem',
        full: 'var(--radius-full)',
      },
    },
  },
  plugins: [],
};