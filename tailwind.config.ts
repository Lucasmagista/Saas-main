
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
darkMode: ["class"],
content: [
	"./pages/**/*.{js,ts,jsx,tsx}",
	"./components/**/*.{js,ts,jsx,tsx}",
	"./app/**/*.{js,ts,jsx,tsx}",
	"./src/**/*.{js,ts,jsx,tsx}",
],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['var(--font-family)', 'Inter', 'system-ui', 'sans-serif'],
				'inter': ['Inter', 'system-ui', 'sans-serif'],
				'roboto': ['Roboto', 'system-ui', 'sans-serif'],
				'open-sans': ['Open Sans', 'system-ui', 'sans-serif'],
				'poppins': ['Poppins', 'system-ui', 'sans-serif'],
				'source-sans-pro': ['Source Sans Pro', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['var(--base-font-size, 1rem)', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Platform colors
				whatsapp: '#25D366',
				telegram: '#0088cc',
				discord: '#5865F2',
				instagram: '#E4405F',
				facebook: '#1877F2',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				'none': '0px',
				'sm': 'calc(var(--radius, 0.5rem) * 0.5)',
				'md': 'calc(var(--radius, 0.75rem) * 0.75)',
				'lg': 'var(--radius, 0.75rem)',
				'xl': 'calc(var(--radius, 0.75rem) * 1.5)',
				'2xl': 'calc(var(--radius, 0.75rem) * 2)',
				'3xl': 'calc(var(--radius, 0.75rem) * 3)',
				'full': '9999px'
			},
			transitionDuration: {
				'DEFAULT': 'var(--animation-duration, 300ms)',
				'75': '75ms',
				'100': '100ms',
				'150': '150ms',
				'200': '200ms',
				'300': '300ms',
				'500': '500ms',
				'700': '700ms',
				'1000': '1000ms',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(-2px)' },
					'50%': { transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down var(--animation-duration, 0.2s) ease-out',
				'accordion-up': 'accordion-up var(--animation-duration, 0.2s) ease-out',
				'fade-in': 'fade-in var(--animation-duration, 0.3s) ease-out',
				'slide-in-right': 'slide-in-right var(--animation-duration, 0.3s) ease-out',
				'slide-in-left': 'slide-in-left var(--animation-duration, 0.3s) ease-out',
				'scale-in': 'scale-in var(--animation-duration, 0.2s) ease-out',
				'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
				'bounce-subtle': 'bounce-subtle var(--animation-duration, 0.3s) ease-in-out infinite'
			}
		}
	},
plugins: [tailwindcssAnimate],
} satisfies Config;
