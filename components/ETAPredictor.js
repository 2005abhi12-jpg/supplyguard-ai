"use client";

import { colors, typography } from "@/styles/designSystem";

/**
 * Calculate ETA for a route considering disruption and risk
 */
export function calculateETA(route, isDisrupted, riskScore) {
  const baseHours = route.base_eta_hours || 12;
  const disruptionDelay = isDisrupted ? Math.floor(Math.random() * 3) + 1 : 0;
  const riskDelay = riskScore > 70 ? Math.floor(riskScore / 25) : 0;
  const totalHours = baseHours + disruptionDelay + riskDelay;
  const delayHours = disruptionDelay + riskDelay;
  return { totalHours, delayHours, isDelayed: delayHours > 0 };
}

/**
 * Format hours into "Xh Ym" string
 */
export function formatETA(totalHours) {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  if (minutes > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  return `${hours}h 00m`;
}

/**
 * Get delay risk level label
 */
export function getDelayRisk(riskScore, isDisrupted) {
  if (isDisrupted) return "High";
  if (riskScore > 70) return "High";
  if (riskScore > 40) return "Medium";
  return "Low";
}

/**
 * Get color for delay risk level
 */
export function getDelayRiskColor(riskLevel) {
  if (riskLevel === "High") return colors.accentRed;
  if (riskLevel === "Medium") return colors.accentYellow;
  return colors.accentGreen;
}

/**
 * ETA display component for table cells
 */
export function ETACell({ route, isDisrupted }) {
  const riskScore = route.risk_score;
  const eta = calculateETA(route, isDisrupted, riskScore);

  if (isDisrupted || eta.isDelayed) {
    // Delayed or disrupted
    const etaColor = isDisrupted ? colors.accentRed : colors.accentYellow;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span
          style={{
            fontFamily: typography.fontFamily,
            fontSize: "13px",
            fontWeight: 500,
            color: etaColor,
          }}
        >
          In {formatETA(eta.totalHours)}
        </span>
        {eta.delayHours > 0 && (
          <span
            style={{
              fontFamily: typography.fontFamily,
              fontSize: "11px",
              color: etaColor,
              opacity: 0.8,
            }}
          >
            (+{formatETA(eta.delayHours)} delay)
          </span>
        )}
      </div>
    );
  }

  // Normal — on time
  return (
    <span
      style={{
        fontFamily: typography.fontFamily,
        fontSize: "13px",
        fontWeight: 500,
        color: colors.accentGreen,
      }}
    >
      In {formatETA(eta.totalHours)}
    </span>
  );
}

/**
 * ETA info for map side panel tooltip
 */
export function ETAMapInfo({ route, isDisrupted }) {
  const riskScore = route.risk_score;
  const eta = calculateETA(route, isDisrupted, riskScore);
  const delayRisk = getDelayRisk(riskScore, isDisrupted);
  const riskColor = getDelayRiskColor(delayRisk);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...typography.small, color: colors.textMuted }}>Expected arrival</span>
        <span
          style={{
            fontFamily: typography.fontFamily,
            fontSize: "12px",
            fontWeight: 600,
            color: eta.isDelayed ? colors.accentRed : colors.accentGreen,
          }}
        >
          {formatETA(eta.totalHours)}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...typography.small, color: colors.textMuted }}>Delay risk</span>
        <span
          style={{
            fontFamily: typography.fontFamily,
            fontSize: "11px",
            fontWeight: 600,
            color: riskColor,
            padding: "1px 8px",
            borderRadius: "999px",
            background: `${riskColor}18`,
            border: `1px solid ${riskColor}40`,
          }}
        >
          {delayRisk}
        </span>
      </div>
    </div>
  );
}

export default ETACell;
