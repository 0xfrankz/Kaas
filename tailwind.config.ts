import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: {
          DEFAULT: 'var(--gray-a6)',
          hover: 'var(--gray-a7)',
          yellow: {
            DEFAULT: 'var(--yellow-a6)',
            hover: 'var(--yellow-a7)',
          },
        },
        input: {
          DEFAULT: 'var(--yellow-a7)',
          hover: 'var(--yellow-a8)',
        },
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'var(--gray-12)',
        subtle: 'var(--gray-a1)',
        primary: {
          DEFAULT: 'var(--yellow-9)',
          hover: 'var(--yellow-10)',
          active: 'filter: var(--button-active)',
          foreground: 'var(--yellow-contrast)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'var(--gray-a6)',
          hover: 'var(--gray-a7)',
          foreground: 'var(--gray-a11)',
        },
        accent: {
          DEFAULT: 'var(--yellow-4)',
          hover: 'var(--yellow-5)',
          foreground: 'var(--yellow-12)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--background))',
          foreground: 'var(--gray-12)',
        },
        surface: {
          DEFAULT: 'var(--yellow-surface)',
          gray: 'var(--gray-surface)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      boxShadow: {
        'gray-border-1': '0 0 0 1px var(--gray-a7)',
        'gray-border-2': '0 0 0 2px var(--gray-a7)',
        'yellow-border-1': '0 0 0 1px var(--yellow-a7)',
        'yellow-border-2': '0 0 0 2px var(--yellow-a7)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-once': 'spin .2s linear 1',
        'bounce-once': 'bounce .2s linear 1',
      },
      saturate: {
        110: '1.1',
      },
      fontFamily: {
        kaas: ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
    },
    typography: {
      DEFAULT: {
        css: {
          strong: {
            color: 'var(--gray-12)',
          },
        },
      },
    },
  },
  // eslint-disable-next-line global-require
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;
