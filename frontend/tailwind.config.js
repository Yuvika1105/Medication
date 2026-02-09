module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(220, 20%, 85%)',
        input: 'hsl(220, 20%, 85%)',
        ring: 'hsl(10, 70%, 55%)',
        background: 'hsl(40, 20%, 97%)',
        foreground: 'hsl(220, 40%, 15%)',
        primary: {
          DEFAULT: 'hsl(10, 70%, 55%)',
          foreground: 'hsl(0, 0%, 100%)',
          hover: 'hsl(10, 70%, 45%)',
        },
        secondary: {
          DEFAULT: 'hsl(150, 30%, 40%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        accent: {
          DEFAULT: 'hsl(45, 90%, 60%)',
          foreground: 'hsl(220, 40%, 15%)',
        },
        muted: {
          DEFAULT: 'hsl(220, 20%, 40%)',
          foreground: 'hsl(220, 20%, 40%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 70%, 60%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        success: 'hsl(150, 40%, 45%)',
        warning: 'hsl(35, 90%, 60%)',
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(220, 40%, 15%)',
        },
        popover: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(220, 40%, 15%)',
        },
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        mulish: ['Mulish', 'sans-serif'],
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}