/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: '#000000',
                secondary: '#f3f4f6',
                accent: '#e11d48',
                background: '#ffffff',
                surface: '#f9fafb',
                textPrimary: '#111827',
                textSecondary: '#6b7280',
                border: '#e5e7eb',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            spacing: {
                'micro': '4px',
                'tiny': '8px',
                'small': '12px',
                'base': '16px',
                'large': '24px',
                'xlarge': '32px',
            }
        },
    },
    plugins: [],
}
