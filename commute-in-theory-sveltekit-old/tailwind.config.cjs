module.exports = {
  content: [
    './src/**/*.svelte'
  ],
  theme: {
    extend: {
      colors: {
        'baby-blue': '#a4c2f4'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
