/** @type {import('tailwindcss').Config} */
const withOpacity = (variableName) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `oklch(var(${variableName}) / ${opacityValue})`
    }
    return `oklch(var(${variableName}))`
  }
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }], // 10px
        'xs':  ['0.75rem',  { lineHeight: '1rem' }],
      },
      letterSpacing: {
        'label':   '0.08em',
        'display': '0.12em',
        'wide':    '0.2em',
      },
      colors: {
        /* ── shadcn/ui semantic tokens ── */
        border: withOpacity("--border"),
        input: withOpacity("--input"),
        ring: withOpacity("--ring"),
        background: withOpacity("--background"),
        foreground: withOpacity("--foreground"),
        card: {
          DEFAULT: withOpacity("--card"),
          foreground: withOpacity("--card-foreground"),
        },
        popover: {
          DEFAULT: withOpacity("--popover"),
          foreground: withOpacity("--popover-foreground"),
        },
        primary: {
          DEFAULT: withOpacity("--primary"),
          foreground: withOpacity("--primary-foreground"),
        },
        secondary: {
          DEFAULT: withOpacity("--secondary"),
          foreground: withOpacity("--secondary-foreground"),
        },
        muted: {
          DEFAULT: withOpacity("--muted"),
          foreground: withOpacity("--muted-foreground"),
        },
        accent: {
          DEFAULT: withOpacity("--accent"),
          foreground: withOpacity("--accent-foreground"),
        },
        destructive: {
          DEFAULT: withOpacity("--destructive"),
          foreground: withOpacity("--destructive-foreground"),
        },
        chart: {
          1: withOpacity("--chart-1"),
          2: withOpacity("--chart-2"),
          3: withOpacity("--chart-3"),
          4: withOpacity("--chart-4"),
          5: withOpacity("--chart-5"),
        },
        sidebar: {
          DEFAULT: withOpacity("--sidebar"),
          foreground: withOpacity("--sidebar-foreground"),
          primary: withOpacity("--sidebar-primary"),
          "primary-foreground": withOpacity("--sidebar-primary-foreground"),
          accent: withOpacity("--sidebar-accent"),
          "accent-foreground": withOpacity("--sidebar-accent-foreground"),
          border: withOpacity("--sidebar-border"),
          ring: withOpacity("--sidebar-ring"),
        },

        /* ── TLR semantic palette — use these in all components ── */
        /* Periwinkle/slate-purple accent — NOT yellow, NOT school colors     */
        tlr: {
          /* Backgrounds */
          bg:       '#0f0f1a',   // deep navy-black
          surface:  '#1a1a2e',   // dark navy card
          surface2: '#252540',   // elevated navy
          /* Borders */
          border:   '#3a3a5c',   // navy border
          border2:  '#4a4a70',   // lighter border (hover state)
          /* Accent (periwinkle) */
          accent:   '#7c7eb8',   // primary CTA / highlight
          'accent-hover': '#9496cc',
          'accent-dim':   '#2a2a4a',   // dim accent bg for chips/tags
          'accent-glow':  'rgba(124,126,184,0.18)',
          /* Silver/metallic */
          silver:   '#a8a8c0',
          /* Text */
          text:     '#f0f0f8',   // near-white cool
          muted:    '#8888a8',   // secondary text
          dim:      '#555570',   // placeholder / disabled
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        xs: "0 1px 0 0 rgba(0, 0, 0, 0.05)",
        'accent': '0 0 32px 0 rgba(124,126,184,0.25)',
        'accent-sm': '0 0 12px 0 rgba(124,126,184,0.20)',
        'card': '0 4px 24px 0 rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'tlr-gradient': 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        'tlr-surface-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #252540 100%)',
        'tlr-accent-gradient': 'linear-gradient(135deg, #7c7eb8 0%, #9496cc 100%)',
        'tlr-radial': 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(124,126,184,0.12) 0%, transparent 70%)',
        'tlr-radial-sm': 'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(124,126,184,0.08) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}
