"use client";

import {
  colors,
  typography,
  card,
  kpiIconContainer,
} from "@/styles/designSystem";

import { useState } from "react";
// icon: a React node or SVG element rendered inside the icon container
// accentColor: the accent from the design palette for this KPI
// trend: "+4.2%" or "-1.8%" etc — string shown top-right
// trendDirection: "up" | "down" | "neutral"
export default function KPICard({ title, value, subtitle, icon, accentColor, trend, trendDirection, onClick, isActive, layout = "vertical" }) {
  const trendColor =
    trendDirection === "up"
      ? colors.accentGreen
      : trendDirection === "down"
      ? colors.accentRed
      : colors.textMuted;

  const [isHovered, setIsHovered] = useState(false);

  if (layout === "horizontal") {
    return (
      <div 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...card,
          cursor: onClick ? "pointer" : "default",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: isActive ? `1px solid ${accentColor}` : isHovered && onClick ? `1px solid ${colors.borderHover || accentColor + '80'}` : card.border,
          transform: isActive || (isHovered && onClick) ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.2s ease-in-out",
          boxShadow: isActive || (isHovered && onClick) ? `0 8px 16px -4px ${accentColor}1A` : card.boxShadow,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Icon container */}
          <div style={{ ...kpiIconContainer(accentColor), width: "42px", height: "42px" }}>
            <span style={{ color: accentColor, fontSize: "20px", lineHeight: 1 }}>{icon}</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <div style={{ ...typography.kpiNumber, fontSize: "28px" }}>{value}</div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ ...typography.body, color: colors.textSecondary, fontSize: "14px", fontWeight: 600, lineHeight: 1.2, marginBottom: "4px" }}>
                {title}
              </div>
              {subtitle && (
                <div style={{ fontFamily: typography.fontFamily, fontWeight: 500, fontSize: "11px", color: colors.textMuted }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trend indicator */}
        {trend && (
          <span style={{ fontFamily: typography.fontFamily, fontWeight: 600, fontSize: "11px", color: trendColor }}>
            {trend}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...card,
        cursor: onClick ? "pointer" : "default",
        padding: "24px",
        border: isActive ? `1px solid ${accentColor}` : isHovered && onClick ? `1px solid ${colors.borderHover || accentColor + '80'}` : card.border,
        transform: isActive || (isHovered && onClick) ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s ease-in-out",
        boxShadow: isActive || (isHovered && onClick) ? `0 8px 16px -4px ${accentColor}1A` : card.boxShadow,
      }}
    >
      {/* Top row: icon + trend */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        {/* Icon container */}
        <div style={kpiIconContainer(accentColor)}>
          <span style={{ color: accentColor, fontSize: "16px", lineHeight: 1 }}>{icon}</span>
        </div>

        {/* Trend indicator */}
        {trend && (
          <span
            style={{
              fontFamily: typography.fontFamily,
              fontWeight: 600,
              fontSize: "11px",
              color: trendColor,
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Middle: big number */}
      <div style={{ ...typography.kpiNumber, fontSize: "32px", marginBottom: "8px" }}>{value}</div>

      {/* Bottom: label + optional subtitle */}
      <div style={{ ...typography.body, color: colors.textMuted, fontSize: "13px", fontWeight: 500 }}>
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: typography.fontFamily,
            fontWeight: 400,
            fontSize: "11px",
            color: colors.textMuted,
            marginTop: "4px",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
