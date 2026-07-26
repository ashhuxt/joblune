/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#faf9f5',
        surfaceSoft: '#f5f0e8',
        surfaceCard: '#efe9de',
        surfaceCreamStrong: '#e8e0d2',
        surfaceDark: '#181715',
        surfaceDarkElevated: '#252320',
        surfaceDarkSoft: '#1f1e1b',
        ink: '#141413',
        body: '#3d3d3a',
        bodyStrong: '#252523',
        muted: '#6c6a64',
        mutedSoft: '#8e8b82',
        hairline: '#e6dfd8',
        hairlineSoft: '#ebe6df',
        coral: '#cc785c',
        coralActive: '#a9583e',
        coralDisabled: '#e6dfd8',
        onPrimary: '#ffffff',
        onDark: '#faf9f5',
        onDarkSoft: '#a09d96',
        success: '#5db872',
        warning: '#d4a017',
        error: '#c64545',
        danger: '#c64545'
      },
      fontFamily: {
        display: ['"Tiempos Headline"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        card: '12px'
      }
    }
  },
  plugins: []
}
