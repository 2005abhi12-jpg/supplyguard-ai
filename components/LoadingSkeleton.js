"use client";

import { colors, card, typography, spacing } from "@/styles/designSystem";

// --- Shared shimmer style ---
const shimmerBase = {
  background: `linear-gradient(90deg, ${colors.surface} 25%, ${colors.border} 50%, ${colors.surface} 75%)`,
  backgroundSize: "400% 100%",
  animation: "skeletonShimmer 1.8s ease-in-out infinite",
  borderRadius: "6px",
};

// ─── KPI Card Skeleton ──────────────────────────────────────
export function SkeletonKPI() {
  return (
    <div style={{ ...card, minHeight: "140px" }}>
      {/* Top row: icon + trend */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ ...shimmerBase, width: "36px", height: "36px", borderRadius: "8px" }} />
        <div style={{ ...shimmerBase, width: "48px", height: "14px" }} />
      </div>
      {/* Big number */}
      <div style={{ ...shimmerBase, width: "60px", height: "28px", marginBottom: "8px" }} />
      {/* Title */}
      <div style={{ ...shimmerBase, width: "110px", height: "14px", marginBottom: "4px" }} />
      {/* Subtitle */}
      <div style={{ ...shimmerBase, width: "140px", height: "12px" }} />
    </div>
  );
}

// ─── Table Row Skeleton ─────────────────────────────────────
export function SkeletonRow({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td
          key={i}
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              ...shimmerBase,
              width: i === 0 ? "50px" : i === 1 ? "140px" : i === 2 ? "80px" : i === 3 ? "70px" : "60px",
              height: "14px",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Chart Area Skeleton ────────────────────────────────────
export function SkeletonChart({ height = 280 }) {
  return (
    <div style={card}>
      {/* Title bar */}
      <div style={{ ...shimmerBase, width: "200px", height: "16px", marginBottom: "24px" }} />
      {/* Chart body */}
      <div
        style={{
          ...shimmerBase,
          width: "100%",
          height: `${height}px`,
          borderRadius: "8px",
        }}
      />
    </div>
  );
}

// ─── Map Spinner ────────────────────────────────────────────
export function MapSpinner() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 160px)",
        gap: "20px",
      }}
    >
      {/* Spinning circle */}
      <div
        className="map-spinner"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: `3px solid ${colors.border}`,
          borderTopColor: colors.accentBlue,
        }}
      />
      {/* Label */}
      <div
        style={{
          fontFamily: typography.fontFamily,
          fontWeight: 500,
          fontSize: "14px",
          color: colors.textSecondary,
          letterSpacing: "0.02em",
        }}
      >
        Initializing map...
      </div>
      {/* Sub-label */}
      <div style={{ ...typography.small, color: colors.textMuted }}>
        Loading nodes, routes, and geographic data
      </div>
    </div>
  );
}

// ─── Full page loading skeleton (Dashboard) ─────────────────
export function DashboardSkeleton() {
  return (
    <div style={{ opacity: 1 }}>
      {/* KPI Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: spacing.cardGap,
          marginBottom: spacing.sectionGap,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonKPI key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: spacing.cardGap,
          marginBottom: spacing.sectionGap,
        }}
      >
        <SkeletonChart height={280} />
        <SkeletonChart height={260} />
      </div>

      {/* Route Bar Chart */}
      <SkeletonChart height={260} />

      {/* Table */}
      <div style={{ ...card, marginTop: spacing.sectionGap }}>
        <div style={{ ...shimmerBase, width: "160px", height: "16px", marginBottom: "20px" }} />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} columns={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
