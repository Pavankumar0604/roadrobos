/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                'primary-light': 'var(--color-primary-light)',
                'primary-dark': 'var(--color-primary-dark)',
                secondary: 'var(--color-secondary)',
                'secondary-light': 'var(--color-secondary-light)',
                warm: 'var(--color-warm)',
                accent: 'var(--color-accent)',
                card: 'var(--color-card)',
                input: 'var(--color-input)',
                'input-focus': 'var(--color-input-focus)',
                error: 'var(--color-error)',
                'text-body': 'var(--color-text-body)',
                'text-muted': 'var(--color-text-muted)',
            },
            borderColor: {
                card: 'var(--color-card)',
                input: 'var(--color-input)',
                'input-focus': 'var(--color-input-focus)',
            },
            boxShadow: {
                card: 'var(--shadow-card)',
                'card-hover': 'var(--shadow-card-hover)',
            },
            borderRadius: {
                card: 'var(--radius-card)',
            },
            ringColor: {
                primary: 'var(--color-primary)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
