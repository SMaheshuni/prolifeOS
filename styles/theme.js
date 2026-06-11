// Aurora Glass — single source of truth for visual values per CODING_STANDARDS.md §9.
// Glass surfaces over animated aurora gradients. Numbers as art. One sharp accent.
// Display: Fraunces (variable serif). Body: Cabinet Grotesk (Fontshare, free).

export const theme = {
  font: {
    family: 'Cabinet Grotesk',
    displayFamily: 'Fraunces',
    size: {
      micro: '12px',
      label: '14px',
      body: '16px',
      subheading: '18px',
      heading: '24px',
      display: '32px',
    },
    weight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      body: 1.5,
      heading: 1.05,
    },
  },

  // Light — "Pearl": oyster pearl base, glass surfaces, electric lime accent
  color: {
    primary: '#0E0E10',          // onyx — primary text, primary CTA fill
    primaryLight: 'rgba(14, 14, 16, 0.06)',
    accent: '#F5664A',           // refined coral — single sharp pop
    accentInk: '#FFFFFF',        // white text on coral
    accentLight: 'rgba(245, 102, 74, 0.14)', // subtle coral tint for tertiary CTAs
    success: '#7FA67C',
    successLight: '#E8F4EC',
    warning: '#E5A148',
    warningLight: '#FCEEDB',
    danger: '#FF6B85',           // rose, destructive only
    dangerLight: '#FFE3E9',
    background: '#F5F3EE',       // oyster pearl
    surface: 'rgba(255, 255, 255, 0.72)', // glass
    surfaceSolid: '#FFFFFF',     // when solid required
    text: '#0E0E10',
    muted: '#6B6B72',
    border: 'rgba(14, 14, 16, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.55)',
    overlay: 'rgba(14, 14, 16, 0.32)',
  },

  // Dark — "Aurora": deep teal-night, white-glass surfaces, electric lime accent
  darkColor: {
    primary: '#F5F3EE',
    primaryLight: 'rgba(245, 243, 238, 0.08)',
    accent: '#FF7E5F',
    accentInk: '#0A1419',
    accentLight: 'rgba(255, 126, 95, 0.18)',
    success: '#A8C7A2',
    successLight: 'rgba(168, 199, 162, 0.12)',
    warning: '#F5B16E',
    warningLight: 'rgba(245, 177, 110, 0.12)',
    danger: '#FF7B92',
    dangerLight: 'rgba(255, 123, 146, 0.14)',
    background: '#0A1419',
    surface: 'rgba(255, 255, 255, 0.06)',
    surfaceSolid: '#13202A',
    text: '#F5F3EE',
    muted: '#8B8B95',
    border: 'rgba(245, 243, 238, 0.10)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },

  radius: {
    sm: '12px',
    md: '20px',
    lg: '28px',
    xl: '36px',
    full: '9999px',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '72px',
  },

  shadow: {
    sm: '0 1px 2px rgba(14, 14, 16, 0.04)',
    md: '0 12px 40px rgba(14, 14, 16, 0.08), 0 2px 8px rgba(14, 14, 16, 0.04)',
    lg: '0 32px 64px rgba(14, 14, 16, 0.12), 0 8px 16px rgba(14, 14, 16, 0.06)',
    glassLight: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 16px 48px rgba(14, 14, 16, 0.08)',
    glassDark: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 48px rgba(0, 0, 0, 0.4)',
  },

  zIndex: {
    base: 0,
    aurora: 0,
    card: 10,
    header: 100,
    bottomNav: 100,
    bottomSheet: 200,
    modal: 300,
    toast: 400,
  },

  transition: {
    duration: '220ms',
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
    bottomSheet: '320ms cubic-bezier(0.32, 0.72, 0, 1)',
  },
}
