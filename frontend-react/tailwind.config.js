/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron:  '#FF9933',
        navy:     '#000080',
        danger:   '#DC3545',
        warning:  '#FFC107',
        success:  '#28A745',
        bglight:  '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
