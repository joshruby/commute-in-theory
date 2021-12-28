module.exports = {
  content: [
    './src/**/*.svelte'
  ],
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  daisyui: {
    styled: true,
    base: true,
    utils: true,
    // themes: true,
    // logs: true,
    // rtl: false,
  },
}
