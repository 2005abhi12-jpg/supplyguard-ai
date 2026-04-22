"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { suppliers, warehouses, retailers, routes } from "@/data/mockData";
import { useSupplyChain } from "@/context/SupplyChainContext";
import { colors, typography } from "@/styles/designSystem";

/**
 * Calculate supply chain health score (0-100)
 * - Start at 100
 * - -15 per disrupted node
 * - -8 per at_risk node
 * - -3 per route with risk_score > 70
 * - Never below 0
 */
export function calculateHealthScore(state) {
  const allEntities = [...state.suppliers, ...state.warehouses, ...state.retailers];
  let score = 100;

  const disruptedCount = allEntities.filter(
    (e) => e.status === "disrupted" || state.disruptedNodes.includes(e.id)
  ).length;

  const atRiskCount = allEntities.filter(
    (e) => e.status === "at_risk" && !state.disruptedNodes.includes(e.id)
  ).length;

  const highRiskRoutes = state.routes.filter((r) => r.status !== "normal" && r.risk_score > 70).length;

  score -= disruptedCount * 15;
  score -= atRiskCount * 8;
  score -= highRiskRoutes * 3;

  return Math.max(0, Math.min(100, score));
}

export function getScoreColor(score) {
  if (score >= 80) return colors.accentGreen;
  if (score >= 50) return colors.accentYellow;
  return colors.accentRed;
}

export function getScoreLabel(score) {
  if (score >= 80) return "Good";
  if (score >= 50) return "At Risk";
  return "Critical";
}

/**
 * Full-size circular health score component (120px) with animated counter
 */
export function HealthScore() {
  const { state } = useSupplyChain();
  const targetScore = useMemo(
    () => calculateHealthScore(state),
    [state]
  );

  const [displayScore, setDisplayScore] = useState(targetScore);
  const [glowing, setGlowing] = useState(false);
  const prevScore = useRef(targetScore);
  
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // Animate score changes smoothly
  useEffect(() => {
    if (targetScore === displayScore) return;

    // Detect if score is improving (trigger glow)
    if (targetScore > prevScore.current) {
      setGlowing(true);
      setTimeout(() => setGlowing(false), 2000);
    }
    prevScore.current = targetScore;

    const step = targetScore > displayScore ? 1 : -1;
    const timer = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev === targetScore) {
          clearInterval(timer);
          return prev;
        }
        return prev + step;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [targetScore]);

  const color = getScoreColor(displayScore);
  const label = getScoreLabel(displayScore);

  // SVG arc calculations
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const offset = circumference - progress;

  return (
    <div style={{ 
      background: "#ffffff", 
      border: "1px solid #e2e8f0", 
      borderRadius: "16px", 
      padding: "24px",
      display: "flex", 
      gap: "24px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.03)"
    }}>
      {/* Left: Circle Arc */}
      <div className="shrink-0 flex items-center justify-center">
        <div style={{ position: "relative", width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            {/* Background circle */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.border} strokeWidth={strokeWidth} />
            {/* Progress arc */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke 0.3s ease" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
            <span style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: "36px", color: color, lineHeight: 1, letterSpacing: "-0.04em" }}>{displayScore}</span>
            <span className="text-[12px] font-semibold text-slate-400 mt-1">/100</span>
          </div>
        </div>
      </div>

      {/* Right: Text & Badges */}
      <div className="flex flex-col justify-center gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[15px] font-bold text-slate-900 leading-none">Health Score</h3>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${color === colors.accentRed ? 'bg-red-50 text-red-600' : color === colors.accentYellow ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
            {label}
          </span>
        </div>
        
        <p className="text-[13px] font-medium text-slate-600 leading-snug">
          {label === "Good" ? "System is stable. No disruptions active." : label === "At Risk" ? "System experiencing minor delays." : "System at risk. Immediate attention required."}
        </p>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-1" suppressHydrationWarning>
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          Last updated: {mounted ? currentTime : "--:--"}
        </div>
      </div>
    </div>
  );
}

/**
 * Mini health score for Navbar — just colored dot + number
 */
export function MiniHealthScore() {
  const { state } = useSupplyChain();
  const targetScore = useMemo(
    () => calculateHealthScore(state),
    [state]
  );

  const [displayScore, setDisplayScore] = useState(targetScore);

  useEffect(() => {
    if (targetScore === displayScore) return;
    const step = targetScore > displayScore ? 1 : -1;
    const timer = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev === targetScore) {
          clearInterval(timer);
          return prev;
        }
        return prev + step;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [targetScore]);

  const color = getScoreColor(displayScore);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "999px",
        background: `${color}15`,
        border: `1px solid ${color}30`,
        cursor: "default",
        transition: "all 0.5s ease",
      }}
      title={`Health Score: ${displayScore}/100 — ${getScoreLabel(displayScore)}`}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          flexShrink: 0,
          transition: "background 0.3s ease",
        }}
      />
      <span
        style={{
          fontFamily: typography.fontFamily,
          fontWeight: 600,
          fontSize: "12px",
          color: color,
          transition: "color 0.3s ease",
        }}
      >
        {displayScore}
      </span>
    </div>
  );
}

export default HealthScore;
