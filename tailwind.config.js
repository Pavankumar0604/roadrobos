/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                'accent-warm': 'var(--color-warm)',
                accent: 'var(--bg)',
                card: 'var(--card-bg)',
                'text-body': 'var(--text-color)',
                'text-muted': 'var(--text-muted-color)',
                error: 'var(--error-color)',
            },
            borderColor: {
                DEFAULT: 'var(--input-border-color)',
                card: 'var(--card-border-color)',
                input: 'var(--input-border-color)',
                'input-focus': 'var(--input-border-focus-color)',
                error: 'var(--error-color)',
            },
            boxShadow: {
                card: 'var(--card-shadow-value)',
                subtle: '0 4px 12px rgba(0, 0, 0, 0.08)',
                md: '0 6px 15px rgba(0, 0, 0, 0.1)',
            },
            borderRadius: {
                card: 'var(--radius)',
                xl: '16px',
            },
            ringColor: {
                DEFAULT: 'var(--color-secondary)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Poppins', 'sans-serif'],
            },
        }
    },
    plugins: [],
}
