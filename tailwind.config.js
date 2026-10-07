/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        shell: {
          blue: 'var(--os-blue)',
          light: 'var(--os-light)',
          surface: 'var(--os-surface)',
          border: 'var(--os-border)',
          hover: 'var(--os-hover)',
          text: 'var(--os-text)',
          muted: 'var(--os-text-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Cascadia Code', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      keyframes: {
        windowOpen: {
          '0%': { opacity: '0', transform: 'scale(.86) translateY(18px)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        windowClose: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(.9) translateY(10px)' },
        },
        bootSpin: {
          to: { transform: 'rotate(360deg)' },
        },
        caretBlink: {
          '0%, 70%': { opacity: '1' },
          '71%, 100%': { opacity: '0' },
        },
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        orbitOne: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(6px,-10px,0) scale(1.04)' },
        },
        orbitTwo: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(-8px,8px,0) scale(.97)' },
        },
        badgePulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(92,131,255,.5)' },
          '50%': { boxShadow: '0 0 0 10px rgba(92,131,255,0)' },
        },
        slideUpPane: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftPane: {
          from: { opacity: '0', transform: 'translateX(28px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        silentLaunch: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        silentPulse: {
          '0%, 100%': { opacity: '.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'window-open': 'windowOpen .26s cubic-bezier(.16,1,.3,1) both',
        'window-close': 'windowClose .18s ease-in both',
        'boot-spin': 'bootSpin 1s linear infinite',
        'caret-blink': 'caretBlink 1.25s ease-out infinite',
        'float-soft': 'floatSoft 2.8s ease-in-out infinite',
        'orbit-one': 'orbitOne 3.4s ease-in-out infinite',
        'orbit-two': 'orbitTwo 2.9s ease-in-out infinite',
        'badge-pulse': 'badgePulse 2.4s ease-in-out infinite',
        'slide-up-pane': 'slideUpPane .25s cubic-bezier(.4,0,.2,1) both',
        'slide-left-pane': 'slideLeftPane .25s cubic-bezier(.4,0,.2,1) both',
        'silent-launch': 'silentLaunch .26s cubic-bezier(.2,.8,.2,1) both',
        'silent-pulse': 'silentPulse 1.35s ease-in-out infinite',
      },
      boxShadow: {
        mica: '0 18px 50px -12px rgba(15,23,42,.35), 0 1px 0 0 rgba(255,255,255,.55) inset',
        'mica-dark': '0 26px 70px -18px rgba(0,0,0,.72), 0 1px 0 0 rgba(255,255,255,.09) inset',
        window: '0 32px 80px -20px rgba(9,12,20,.55), 0 0 0 1px rgba(255,255,255,.18) inset',
      },
    },
  },
  plugins: [],
};
