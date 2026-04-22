// ============================================================
// SupplyGuard AI — Design System (Single Source of Truth)
// ============================================================
// Every component and page MUST import from this file.
// Never hardcode colors, spacing, or font styles elsewhere.
// ============================================================

// --- COLOR PALETTE ---
export const colors = {
  bgMain: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",

  accentBlue: "#2563eb",
  accentGreen: "#10b981",
  accentYellow: "#f59e0b",
  accentRed: "#ef4444",

  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
};

// --- TYPOGRAPHY ---
export const typography = {
  fontFamily: "'Inter', sans-serif",

  pageHeading: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "22px",
    color: colors.textPrimary,
    lineHeight: 1.3,
  },

  cardTitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "14px",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    lineHeight: 1.4,
  },

  kpiNumber: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "32px",
    color: colors.textPrimary,
    lineHeight: 1.2,
  },

  body: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: "14px",
    color: colors.textSecondary,
    lineHeight: 1.6,
  },

  small: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: "12px",
    color: colors.textMuted,
    lineHeight: 1.4,
  },
};

// --- CARD STYLING ---
export const card = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
};

// Status card variant — adds a colored left border
export function statusCard(accentColor) {
  return {
    ...card,
    borderLeft: `3px solid ${accentColor}`,
  };
}

// --- NAVBAR ---
export const navbar = {
  background: colors.bgMain,
  borderBottom: `1px solid ${colors.border}`,
  height: "60px",
  padding: "0 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  zIndex: 1000,
};

export const navLogo = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700,
  fontSize: "16px",
  color: colors.textPrimary,
};

export const navLink = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: "14px",
  color: colors.textSecondary,
  textDecoration: "none",
  padding: "18px 0",
  borderBottom: "2px solid transparent",
  transition: "color 0.2s ease, border-color 0.2s ease",
};

export const navLinkActive = {
  ...navLink,
  color: colors.textPrimary,
  borderBottom: `2px solid ${colors.accentBlue}`,
};

// --- BUTTONS ---
export const buttons = {
  primary: {
    background: colors.accentBlue,
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "14px",
    borderRadius: "8px",
    padding: "10px 20px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  primaryHover: {
    background: "#2D5BC7",
  },

  danger: {
    background: "transparent",
    color: colors.accentRed,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "14px",
    borderRadius: "8px",
    padding: "10px 20px",
    border: `1px solid ${colors.accentRed}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  dangerHover: {
    background: colors.accentRed,
    color: "#ffffff",
  },

  ghost: {
    background: "transparent",
    color: colors.textSecondary,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: "14px",
    borderRadius: "8px",
    padding: "10px 20px",
    border: `1px solid ${colors.border}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  ghostHover: {
    borderColor: colors.accentBlue,
    color: colors.accentBlue,
  },
};

// --- STATUS BADGES ---
export const badges = {
  normal: {
    background: "#ecfdf5",
    color: colors.accentGreen,
    border: `1px solid #a7f3d0`,
    borderRadius: "999px",
    padding: "2px 10px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    display: "inline-block",
    lineHeight: 1.6,
  },
  at_risk: {
    background: "#fffbeb",
    color: colors.accentYellow,
    border: `1px solid #fde68a`,
    borderRadius: "999px",
    padding: "2px 10px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    display: "inline-block",
    lineHeight: 1.6,
  },
  disrupted: {
    background: "#fef2f2",
    color: colors.accentRed,
    border: `1px solid #fecaca`,
    borderRadius: "999px",
    padding: "2px 10px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    display: "inline-block",
    lineHeight: 1.6,
  },
};

// --- TABLE STYLING ---
export const table = {
  wrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    background: colors.surface,
    color: colors.textSecondary,
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    borderBottom: `1px solid ${colors.border}`,
  },
  td: {
    padding: "12px 16px",
    color: colors.textPrimary,
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    borderBottom: `1px solid ${colors.border}`,
  },
  tdMuted: {
    padding: "12px 16px",
    color: colors.textSecondary,
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    borderBottom: `1px solid ${colors.border}`,
  },
  rowHover: {
    background: "#f8fafc",
  },
};

// --- CHART THEME ---
export const chartTheme = {
  gridStroke: colors.border,
  gridDasharray: "3 3",
  axisTickStyle: {
    fill: colors.textSecondary,
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
  },
  tooltip: {
    contentStyle: {
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      color: colors.textPrimary,
      fontFamily: "'Inter', sans-serif",
      fontSize: "13px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    },
    labelStyle: {
      color: colors.textSecondary,
      fontFamily: "'Inter', sans-serif",
    },
    cursor: { stroke: colors.border },
  },
};

// --- KPI ICON CONTAINER ---
// 36px square, border-radius 8px, accent at 15% opacity
export function kpiIconContainer(accentColor) {
  // Extract hex value and apply 26 (=15%) alpha
  return {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: `${accentColor}26`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
}

// --- PAGE HEADER ---
export const pageHeader = {
  wrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: "20px",
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: "32px",
  },
  title: {
    ...typography.pageHeading,
    margin: 0,
  },
  subtitle: {
    ...typography.body,
    marginTop: "4px",
  },
  rightSide: {
    ...typography.small,
    textAlign: "right",
  },
};

// --- SPACING ---
export const spacing = {
  pagePadding: "32px",
  pagePaddingMobile: "16px",
  cardGap: "20px",
  sectionGap: "40px",
};

// --- PAGE WRAPPER ---
export const pageWrapper = {
  minHeight: "100vh",
  background: colors.bgMain,
  padding: spacing.pagePadding,
  fontFamily: typography.fontFamily,
};
