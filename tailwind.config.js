/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:   '#0A0A0A',
        accent:    '#C8F135',
        surface:   '#111827',
        surface2:  '#1F2937',
        text:      '#F5F5F5',
        textMuted: '#6B7280',
        danger:    '#EF4444',
        success:   '#10B981',
        border:    '#374151',
      },
      fontFamily: {
        display: ['Syne_700Bold'],
        body:    ['DMSans_400Regular'],
        bodyMd:  ['DMSans_500Medium'],
        mono:    ['DMMono_400Regular'],
      },
    },
  },
  plugins: [],
};
