/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#ff6b6b",
          secondary: "#ee5a24",
          point: "#00ff6e",
          disablebg: "#E0E0E0",
          bg: "#0f0f0f",
          bggray: "#1a1a1a",
          'glass': "rgba(255,255,255,0.05)",
          'text-main': "#fff",
          'text-weak': "rgba(255,255,255,0.8)",
          border: "rgba(255,255,255,0.1)"
        },
        fontFamily: {
          'main': ['"Apple SD Gothic Neo"', 'sans-serif'],
        },
        fontSize: {
          'title': ['36px', { fontWeight: 'bold' }],
          'header': ['24px', { fontWeight: 'bold' }],
          'body': ['16px', { fontWeight: 'normal' }],
          'caption': ['12px', { fontWeight: 'normal' }],
        }
      },
    },
    plugins: [],
  };
  