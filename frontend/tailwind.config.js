export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe8ff',
          200: '#bfd5ff',
          300: '#93b7ff',
          400: '#628fff',
          500: '#3b6af6',
          600: '#294ee8',
          700: '#213ecb',
          800: '#2238a4',
          900: '#22347f'
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        ink: {
          400: '#475569',
          500: '#334155',
          700: '#1f2937',
          900: '#0b1220'
        },
        success: {
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a'
        },
        warning: {
          100: '#fef3c7',
          700: '#b45309'
        },
        danger: {
          100: '#fee2e2',
          600: '#dc2626'
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / .08), 0 1px 2px -1px rgb(0 0 0 / .08)'
      }
    }
  },
  plugins: []
};