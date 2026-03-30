/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,css}'],
  theme: {
    extend: {
      colors: {
        glass: 'rgba(255, 255, 255, 0.18)',
        glassBorder: 'rgba(255, 255, 255, 0.35)',
        bgPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        bgSecondary: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
        textPrimary: '#2c3e50',
        textSecondary: '#7f8c8d',
        accentBlue: '#3498db',
        accentGreen: '#27ae60',
        accentOrange: '#f39c12',
        accentRed: '#e74c3c',
        priorityLow: '#27ae60',
        priorityMed: '#f39c12',
        priorityHigh: '#e74c3c',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shine': 'shine 3s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(0,255,136,0.5))' },
          '100%': { filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.8))' },
        },
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
