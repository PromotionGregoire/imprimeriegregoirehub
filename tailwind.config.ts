import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
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
				},
				// Base Web semantic colors
				positive: 'hsl(var(--status-positive))',
				'positive-light': 'hsl(var(--status-positive-light))',
				warning: 'hsl(var(--status-warning))',
				'warning-light': 'hsl(var(--status-warning-light))',
				negative: 'hsl(var(--status-negative))',
				'negative-light': 'hsl(var(--status-negative-light))',
				info: 'hsl(var(--status-info))',
				'info-light': 'hsl(var(--status-info-light))',
			},
			// Base Web Typography Scale
			fontSize: {
				'base-100': ['0.75rem', { lineHeight: '1rem' }],      // 12px - Caption
				'base-200': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px - Body Small
				'base-300': ['1rem', { lineHeight: '1.5rem' }],        // 16px - Body
				'base-400': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px - Body Large
				'base-550': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px - Heading Small
				'base-650': ['1.5rem', { lineHeight: '2rem' }],        // 24px - Heading Medium
				'base-750': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px - Heading Large
				'base-950': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px - Display Small
				'base-1050': ['2.75rem', { lineHeight: '1' }],         // 44px - Display Medium
				'base-1150': ['3.25rem', { lineHeight: '1' }],         // 52px - Display Large
			},
			// Base Web Spacing Scale (8px base unit)
			spacing: {
				'base-100': '0.25rem',   // 4px
				'base-200': '0.5rem',    // 8px
				'base-300': '0.75rem',   // 12px
				'base-400': '1rem',      // 16px
				'base-500': '1.25rem',   // 20px
				'base-600': '1.5rem',    // 24px
				'base-700': '2rem',      // 32px
				'base-800': '2.5rem',    // 40px
				'base-900': '3rem',      // 48px
				'base-1000': '4rem',     // 64px
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Base Web radius scale
				'base-100': '2px',
				'base-200': '4px',
				'base-300': '8px',
				'base-400': '12px',
			},
			// Base Web Animations (Uber style)
			keyframes: {
				// Accordion animations
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				// Fade animations (Base Web style)
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(8px)' }
				},
				// Scale animations (Uber micro-interactions)
				'scale-in': {
					'0%': { transform: 'scale(0.96)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.96)', opacity: '0' }
				},
				// Slide animations
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				// Uber-style pulse
				'uber-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
			},
			animation: {
				// Basic animations with Uber timing
				'accordion-down': 'accordion-down 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
				'accordion-up': 'accordion-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
				'fade-in': 'fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				'fade-out': 'fade-out 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-out': 'scale-out 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-out-right': 'slide-out-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				'uber-pulse': 'uber-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			// Base Web easing curves
			transitionTimingFunction: {
				'uber': 'cubic-bezier(0.16, 1, 0.3, 1)',
				'uber-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'uber-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
				'uber-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
