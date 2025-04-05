module.exports = {
    theme: {
      extend: {
        colors: {
          primary: {
            500: '#2563eb', // Bold blue
            600: '#1d4ed8',
          },
          secondary: {
            400: '#fb923c', // Warm orange
            500: '#f97316',
          }
        },
        fontFamily: {
          sans: ['GeistSans', ...defaultTheme.fontFamily.sans],
        },
      }
    }
  }