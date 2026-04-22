"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import KPICard from "@/components/KPICard";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { HealthScore, calculateHealthScore, getScoreColor } from "@/components/HealthScore";
import { ETACell, calculateETA, formatETA } from "@/components/ETAPredictor";
import { useSupplyChain, RESET_ALL, RESOLVE_ALL } from "@/context/SupplyChainContext";
import {
  kpiData,
  monthlyTrends,
} from "@/data/mockData";
import {
  colors,
  typography,
  card,
  badges,
  table as tableStyles,
  chartTheme,
  pageHeader,
  pageWrapper,
  spacing,
  buttons,
} from "@/styles/designSystem";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// ─── Animated Number Component ──────────────────────────────
// Smoothly counts from current display value to target value
function AnimatedNumber({ value, duration = 800, prefix = "", suffix = "", style }) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(value);

  useEffect(() => {
    if (value === display && !startRef.current) return;
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = to;
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  // Keep fromRef in sync when value changes externally
  useEffect(() => {
    fromRef.current = display;
  }, [value]);

  const formatted = typeof display === "number" 
    ? display.toLocaleString("en-IN") 
    : display;

  return <span style={style}>{prefix}{formatted}{suffix}</span>;
}

// ─── Animated Arrow ────────────────────────────────────────
function AnimatedArrow({ resolved }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "6px",
    }}>
      <span
        style={{
          fontFamily: typography.fontFamily,
          fontSize: "32px",
          fontWeight: 700,
          color: resolved ? colors.accentGreen : colors.accentBlue,
          display: "inline-block",
          transition: "color 0.6s ease, transform 0.6s ease",
          transform: resolved ? "translateX(4px) scale(1.15)" : "translateX(0) scale(1)",
          filter: resolved ? `drop-shadow(0 0 8px ${colors.accentGreen}80)` : "none",
        }}
      >
        →
      </span>
      {resolved && (
        <span style={{
          fontFamily: typography.fontFamily,
          fontSize: "9px",
          fontWeight: 600,
          color: colors.accentGreen,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          opacity: 0.8,
          animation: "fadeInUp 0.5s ease both",
        }}>
          resolved
        </span>
      )}
    </div>
  );
}

// ─── Confidence Bar ────────────────────────────────────────
function ConfidenceIndicator({ value = 92, visible }) {
  const [displayWidth, setDisplayWidth] = useState(0);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setDisplayWidth(value), 200);
      return () => clearTimeout(timer);
    } else {
      setDisplayWidth(0);
    }
  }, [visible, value]);

  const barColor = value >= 85 ? colors.accentGreen : value >= 60 ? colors.accentYellow : colors.accentRed;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginTop: "10px",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>
      <span style={{
        fontFamily: typography.fontFamily,
        fontSize: "12px",
        fontWeight: 600,
        color: colors.textSecondary,
        whiteSpace: "nowrap",
      }}>
        Confidence:
      </span>
      <div style={{
        flex: 1,
        height: "6px",
        borderRadius: "3px",
        background: colors.border,
        overflow: "hidden",
        maxWidth: "120px",
      }}>
        <div style={{
          width: `${displayWidth}%`,
          height: "100%",
          borderRadius: "3px",
          background: barColor,
          transition: "width 1s ease-out",
        }} />
      </div>
      <span style={{
        fontFamily: typography.fontFamily,
        fontSize: "13px",
        fontWeight: 700,
        color: barColor,
        minWidth: "32px",
      }}>
        {value}%
      </span>
    </div>
  );
}

// --- SVG Icons ---
const IconFactory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20"/><path d="M5 20V8l5-4v16"/><path d="M10 20V4l9 4v12"/><path d="M14 12h.01"/><path d="M14 16h.01"/>
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconDisrupted = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconRoute = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>
  </svg>
);
const IconWarehouse = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/>
  </svg>
);
const IconResolved = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);

const PIE_COLORS = [colors.accentGreen, colors.accentYellow, colors.accentRed];

// --- Cost Impact Calculator ---
function calculateCostImpact(disruptedIds) {
  const disruptedCount = disruptedIds.length;
  const lossPerDisruption = 50000;
  const rerouteCost = 8000;
  const potentialLoss = disruptedCount * lossPerDisruption;
  const reroutingCost = disruptedCount * rerouteCost;
  const netSavings = potentialLoss - reroutingCost;
  return { potentialLoss, reroutingCost, netSavings, disruptedCount };
}

function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// --- Resolve Toast Component ---
function ResolveToast({ message, type, visible }) {
  const borderColor = type === "success" ? colors.accentGreen : colors.accentBlue;
  const textColor = type === "success" ? colors.accentGreen : colors.accentBlue;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        padding: "14px 24px",
        borderRadius: "12px",
        background: colors.surface,
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${borderColor}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        zIndex: 9999,
        fontFamily: typography.fontFamily,
        fontSize: "13px",
        fontWeight: 500,
        color: textColor,
        maxWidth: "400px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {message}
    </div>
  );
}

// ─── RELIABILITY BOOST: +12% for restored entities ─────────
const RELIABILITY_BOOST = 12;

export default function Dashboard() {
  const { state, dispatch } = useSupplyChain();
  const router = useRouter();
  const { disruptedNodes, activeAlerts, resolvedCount, suppliers, warehouses, retailers, routes } = state;

  const [selectedTab, setSelectedTab] = useState("suppliers");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Auto-resolve states
  const [isResolving, setIsResolving] = useState(false);
  const [resolveToast, setResolveToast] = useState({ message: "", type: "info", visible: false });
  const [justResolved, setJustResolved] = useState(false);
  const [flashingRows, setFlashingRows] = useState([]);
  const [beforeSnapshot, setBeforeSnapshot] = useState(null);
  const [resolvePhase, setResolvePhase] = useState("idle"); // "idle" | "animating" | "done"

  const tableRef = useRef(null);
  const routeChartRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate real-time disruption count
  const originalDisrupted = suppliers.filter((s) => s.status === "disrupted").length;
  const simulatedCount = disruptedNodes.filter(
    (id) => !suppliers.find((s) => s.id === id && s.status === "disrupted")
  ).length;
  const totalDisrupted = originalDisrupted + simulatedCount;

  // Cost impact
  const allEntities = [...suppliers, ...warehouses, ...retailers];
  const allDisruptedIds = [
    ...allEntities.filter((e) => e.status === "disrupted").map((e) => e.id),
    ...disruptedNodes,
  ];
  const uniqueDisruptedIds = [...new Set(allDisruptedIds)];
  const costImpact = useMemo(
    () => calculateCostImpact(uniqueDisruptedIds),
    [uniqueDisruptedIds.length]
  );

  // Health scores
  const currentHealthScore = useMemo(() => calculateHealthScore(state), [state]);
  const resolvedHealthScore = 100; // After Auto-Resolve, it returns to perfect health

  // Dynamic AI Insight
  const disruptedNames = useMemo(() => {
    return uniqueDisruptedIds.map(id => allEntities.find(e => e.id === id)?.name).filter(Boolean);
  }, [uniqueDisruptedIds.join(",")]);

  const aiInsightText = useMemo(() => {
    if (disruptedNames.length === 0) return "✅ All networks running via optimal pathways. No interventions active.";
    const first = disruptedNames[0];
    if (first.includes("Port")) {
      return `💡 AI predicted 14hr delay at ${first}. Automatically rerouting freight via secondary maritime hub.`;
    } else if (first.includes("Leyland") || first.includes("Auto")) {
      return `💡 AI identified part shortage risk at ${first}. Activating backup supplier network in Pune.`;
    } else if (first.includes("Electronics") || first.includes("Tech")) {
      return `💡 AI detected manufacturing halt at ${first}. Redistributing to alternative tech-hubs in South Zone (94% confidence).`;
    }
    return `💡 AI successfully mapped secure bypass route around ${first} maintaining 95% overall reliability.`;
  }, [disruptedNames]);

  // Status distribution
  const statusDistribution = [
    { name: "Normal", value: allEntities.filter((e) => e.status === "normal" && !disruptedNodes.includes(e.id)).length },
    { name: "At Risk", value: allEntities.filter((e) => e.status === "at_risk" && !disruptedNodes.includes(e.id)).length },
    { name: "Disrupted", value: allEntities.filter((e) => e.status === "disrupted" || disruptedNodes.includes(e.id)).length },
  ];

  const routeRiskData = routes.map((r) => ({
    name: r.id,
    risk: r.risk_score,
    fill: r.risk_score > 70 ? colors.accentRed : r.risk_score > 40 ? colors.accentYellow : colors.accentGreen,
  }));

  const tabMap = { suppliers, warehouses, retailers };

  const getEffectiveStatus = (entity) => {
    if (justResolved && beforeSnapshot?.disruptedIds?.includes(entity.id)) return "restored";
    if (disruptedNodes.includes(entity.id)) return "disrupted";
    return entity.status;
  };

  // Get reliability — boosted for restored entities
  const getEffectiveReliability = (entity) => {
    if (justResolved && beforeSnapshot?.disruptedIds?.includes(entity.id)) {
      return Math.min(99, entity.reliability_score + RELIABILITY_BOOST);
    }
    return entity.reliability_score;
  };

  const handleKpiClick = (tab, status) => {
    if (tab) setSelectedTab(tab);
    setStatusFilter(status);
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // ─── Auto-Resolve All Handler ─────────────────────────────
  const handleResolveAll = useCallback(() => {
    if (isResolving || uniqueDisruptedIds.length === 0) return;

    const snapshot = {
      disruptedIds: [...uniqueDisruptedIds],
      costImpact: { ...costImpact },
      healthScore: currentHealthScore,
      count: uniqueDisruptedIds.length,
    };
    setBeforeSnapshot(snapshot);
    setIsResolving(true);
    setResolvePhase("animating");

    // Step 1: Analyzing toast
    setTimeout(() => {
      setResolveToast({ message: "🧠 AI analyzing optimal rerouting...", type: "info", visible: true });
    }, 0);

    // Step 2: Rerouting toast
    setTimeout(() => {
      setResolveToast({ message: "🗺️ Updating route via backup supplier...", type: "info", visible: true });
    }, 1000);

    // Step 3: Dispatch + success
    setTimeout(() => {
      setFlashingRows([...uniqueDisruptedIds]);
      dispatch({ type: RESOLVE_ALL });
      setJustResolved(true);
      setIsResolving(false);
      setResolvePhase("done");
      setResolveToast({
        message: `✅ Disruption resolved! ${formatINR(snapshot.costImpact.netSavings)} saved!`,
        type: "success",
        visible: true,
      });
    }, 2000);

    // Step 4: Hide toast
    setTimeout(() => {
      setResolveToast({ message: "", type: "info", visible: false });
    }, 6000);

    // Step 5: Clear flashing
    setTimeout(() => {
      setFlashingRows([]);
    }, 4000);

    // Step 6: Keep justResolved for 15s
    setTimeout(() => {
      setJustResolved(false);
      setBeforeSnapshot(null);
      setResolvePhase("idle");
    }, 15000);
  }, [isResolving, uniqueDisruptedIds, costImpact, currentHealthScore, dispatch]);

  const now = new Date();
  const lastUpdated = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // ETA delay
  const snapshotCount = beforeSnapshot?.count ?? costImpact.disruptedCount;
  const disruptedDelayMinutes = snapshotCount * 140;
  const delayHours = Math.floor(disruptedDelayMinutes / 60);
  const delayMins = disruptedDelayMinutes % 60;

  // Before/After visual state
  const isResolved = resolvePhase === "done";
  const beforeBg = isResolved ? "#1A1210" : "#2A0A0A";
  const afterBg = isResolved ? "#0A2A1A" : "#121A14";

  // Restored badge style
  const restoredBadge = {
    background: "#0A2A1A",
    color: colors.accentGreen,
    border: `1px solid ${colors.accentGreen}`,
    borderRadius: "999px",
    padding: "2px 10px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    display: "inline-block",
    lineHeight: 1.6,
  };

  if (isLoading) {
    return (
      <div style={pageWrapper}>
        <div style={pageHeader.wrapper}>
          <div>
            <h1 style={pageHeader.title}>Dashboard Overview</h1>
            <p style={pageHeader.subtitle}>Loading supply chain intelligence...</p>
          </div>
          <div style={pageHeader.rightSide}>
            <span style={{ ...typography.small, color: colors.textMuted }}>Connecting...</span>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div style={pageWrapper}>
      <ResolveToast {...resolveToast} />

      {/* Inline CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 0.8; transform: translateY(0); }
        }
        @keyframes rowFlashGreen {
          0% { background: transparent; }
          20% { background: #0A2A1A; }
          100% { background: rgba(16,184,122,0.06); }
        }
        @keyframes reliabilityPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Page Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-2">
        
        {/* Left Side: Title & Potential Disruption Banner */}
        <div className="flex-1 flex flex-col w-full">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Supply Chain Control Center</h1>
            <span className="flex items-center gap-1.5 bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-slate-500 text-[15px] mb-6">Real-time supply chain intelligence across India</p>

          {totalDisrupted > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-red-500 text-[28px]">warning</span>
                <div>
                  <h3 className="text-red-700 font-bold text-[15px] mb-1">{totalDisrupted} disruptions detected that require immediate attention</h3>
                  <p className="text-slate-700 text-sm font-medium">Estimated potential loss: <span className="text-slate-900 font-bold">₹1,00,000</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push("/map")}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2 px-5 border border-slate-200 rounded-lg transition-colors shadow-sm text-sm"
                >
                  View Details
                </button>
                <button 
                  onClick={() => dispatch({ type: RESET_ALL })}
                  className="bg-white hover:bg-slate-50 text-slate-500 font-semibold py-2 px-5 border border-slate-200 rounded-lg transition-colors shadow-sm text-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Health Score */}
        <div className="shrink-0 xl:w-[340px] w-full">
          <HealthScore />
        </div>
      </div>

      <div className="content-reveal">
        {/* KPI Grids */}
        <div className="flex flex-col gap-6 mb-10">
          {/* Top Row: 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title="Total Suppliers" subtitle="2 new this quarter" value={kpiData.totalSuppliers} icon={<span className="material-symbols-outlined">factory</span>} accentColor={colors.accentBlue} trend="+2%" trendDirection="up" onClick={() => handleKpiClick("suppliers", "all")} isActive={selectedTab === "suppliers" && statusFilter === "all"} />
            <KPICard title="Nodes at Risk" subtitle="Supply chain wide" value={statusDistribution[1].value} icon={<span className="material-symbols-outlined">warning</span>} accentColor={colors.accentYellow} trend="-1" trendDirection="down" onClick={() => handleKpiClick("suppliers", "at_risk")} isActive={statusFilter === "at_risk"} />
            
            <div className="relative">
              <KPICard 
                title="Active Disruptions" 
                subtitle={totalDisrupted > 0 ? "Requires immediate attention" : "All systems normal"}
                value={totalDisrupted} 
                icon={<span className="material-symbols-outlined">crisis_alert</span>}
                accentColor={totalDisrupted > 0 ? colors.accentRed : colors.accentGreen} 
                trend={totalDisrupted > 0 ? "+1" : "0"} 
                trendDirection="neutral"
                onClick={() => handleKpiClick(null, "disrupted")} 
                isActive={statusFilter === "disrupted"} 
              />
            </div>
            <KPICard title="Avg Reliability" subtitle={totalDisrupted > 0 ? "5% drop this week" : "Stable this week"} value={`${kpiData.avgReliability}%`} icon={<span className="material-symbols-outlined">trending_up</span>} accentColor={colors.accentGreen} trend="+2.1%" trendDirection="up" />
          </div>

          {/* Bottom Row: 3 Wide Horizontal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard layout="horizontal" title="Active Routes" subtitle="3 high risk" value={10} icon={<span className="material-symbols-outlined">route</span>} accentColor={colors.accentBlue} />
            <KPICard layout="horizontal" title="Warehouses" subtitle="All regions covered" value={kpiData.totalWarehouses} icon={<span className="material-symbols-outlined">warehouse</span>} accentColor={colors.accentGreen} />
            <KPICard layout="horizontal" title="Disruptions Resolved" subtitle="This session" value={resolvedCount} icon={<span className="material-symbols-outlined">verified_user</span>} accentColor={colors.accentGreen} trend={resolvedCount > 0 ? `${resolvedCount} fixed` : "None yet"} trendDirection="neutral" />
          </div>
        </div>

        {/* Charts & Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Chart 1: Reliability Trend */}
          <div className="bg-white rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-[13px]">Reliability Trend (This Week)</h3>
              <select className="bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-md px-2 py-1 outline-none cursor-pointer shadow-sm">
                <option>7 Days</option>
                <option>30 Days</option>
              </select>
            </div>
            <div className="flex-1 min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" vertical={true} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} dx={-10} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip {...chartTheme.tooltip} />
                  <Area type="monotone" dataKey="onTime" stroke="#3b82f6" fill="url(#areaBlue)" strokeWidth={2} activeDot={{ r: 4, fill: '#3b82f6' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-green-50/50 rounded-lg p-3 border border-green-100 flex items-start gap-3">
              <span className="material-symbols-outlined text-green-500 bg-green-100 rounded p-1 text-[16px]">trending_up</span>
              <div>
                <p className="text-[12px] font-bold text-slate-900">Reliability dropped 5% this week</p>
                <p className="text-[11px] text-slate-500 mt-1 mb-1">Mainly due to disruptions in Pune and Chennai routes</p>
                <button className="text-blue-600 font-bold text-[11px] hover:underline flex items-center gap-1">View Report <span className="material-symbols-outlined text-[12px]">arrow_forward</span></button>
              </div>
            </div>
          </div>

          {/* Chart 2: Disruption Severity */}
          <div className="bg-white rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-200 p-6 flex flex-col">
            <h3 className="font-bold text-slate-900 text-[13px] mb-6">Disruption Severity</h3>
            <div className="flex-1 flex min-h-[160px]">
              {/* Pie Chart Area */}
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "Normal" ? "#22c55e" : entry.name === "At Risk" ? "#eab308" : "#ef4444"} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTheme.tooltip} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900 leading-none">{totalDisrupted > 0 ? totalDisrupted : statusDistribution.reduce((a,b)=>a+b.value,0)}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Total</span>
                </div>
              </div>
              {/* Legend Area */}
              <div className="w-32 flex flex-col justify-center gap-4 shrink-0 pl-4 border-l border-slate-100">
                {statusDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: entry.name === "Normal" ? "#22c55e" : entry.name === "At Risk" ? "#eab308" : "#ef4444" }} />
                    <span className="text-[12px] font-semibold text-slate-600">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
            {totalDisrupted > 0 && (
              <div className="mt-4 bg-red-50/40 rounded-lg p-3 border border-red-100 flex flex-col relative">
                <span className="text-[10px] font-bold uppercase text-red-600 mb-1 tracking-wider">Top Affected Region</span>
                <span className="text-[13px] font-bold text-slate-900">{disruptedNodes[0]?.name || "Pune, Maharashtra"}</span>
                <span className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px] text-slate-400">location_on</span> {totalDisrupted} active disruptions</span>
                <span className="absolute right-3 top-3 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Critical</span>
              </div>
            )}
          </div>


        </div>

        {/* AI Recommendations */}
        <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6 mb-10 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-blue-600 text-lg">lightbulb</span>
            <h3 className="text-blue-600 font-bold text-sm tracking-wide">AI Recommendation</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">alt_route</span>
                </div>
                <p className="text-[12px] font-semibold text-slate-700 leading-snug">Reroute shipments <span className="font-bold text-slate-900">from Pune via Bangalore to reduce delay</span></p>
              </div>
              <span className="material-symbols-outlined text-blue-600 text-[18px] ml-2 shrink-0">arrow_forward</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">factory</span>
                </div>
                <p className="text-[12px] font-semibold text-slate-700 leading-snug">Alternative supplier available for <span className="font-bold text-slate-900">Adani Ports Materials</span></p>
              </div>
              <span className="material-symbols-outlined text-blue-600 text-[18px] ml-2 shrink-0">arrow_forward</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                </div>
                <p className="text-[12px] font-semibold text-slate-700 leading-snug">Expect <span className="font-bold text-slate-900">5-8% increase</span> in transit time for Chennai routes</p>
              </div>
              <span className="material-symbols-outlined text-blue-600 text-[18px] ml-2 shrink-0">arrow_forward</span>
            </div>
          </div>
        </div>


        {/* ═══════════════════════════════════════════════════════ */}
        {/* COST IMPACT + BEFORE/AFTER + AUTO-RESOLVE             */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div style={{ ...card, marginBottom: spacing.sectionGap }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <h3 style={{ ...typography.cardTitle, margin: 0 }}>Cost Impact Analysis</h3>

            {uniqueDisruptedIds.length > 0 && (
              <button
                id="auto-resolve-btn"
                onClick={handleResolveAll}
                disabled={isResolving}
                style={{
                  background: isResolving ? `${colors.accentGreen}60` : colors.accentGreen,
                  color: "#ffffff",
                  fontFamily: typography.fontFamily,
                  fontWeight: 700,
                  fontSize: "14px",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  border: "none",
                  cursor: isResolving ? "wait" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => { if (!isResolving) e.currentTarget.style.background = "#0D9E68"; }}
                onMouseLeave={(e) => { if (!isResolving) e.currentTarget.style.background = colors.accentGreen; }}
              >
                {isResolving ? (
                  <>
                    <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Resolving...
                  </>
                ) : (
                  <>⚡ Auto-Resolve All Disruptions</>
                )}
              </button>
            )}
          </div>

          {/* Before vs After Comparison */}
          {(uniqueDisruptedIds.length > 0 || beforeSnapshot) ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "16px", alignItems: "stretch", marginBottom: "20px" }}>
                {/* BEFORE Column */}
                <div style={{
                  background: beforeBg,
                  border: `1px solid ${isResolved ? colors.textMuted : colors.accentRed}40`,
                  borderRadius: "12px",
                  padding: "20px",
                  transition: "all 0.8s ease",
                  opacity: isResolved ? 0.55 : 1,
                }}>
                  <div style={{ ...typography.small, color: isResolved ? colors.textMuted : colors.accentRed, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, transition: "color 0.8s ease" }}>
                    Before Resolution
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <div style={{ ...typography.small, color: colors.textMuted, marginBottom: "2px" }}>Potential Loss</div>
                      <AnimatedNumber
                        value={beforeSnapshot?.costImpact?.potentialLoss ?? costImpact.potentialLoss}
                        prefix="₹"
                        duration={1200}
                        style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: "22px", color: isResolved ? colors.textMuted : colors.accentRed, transition: "color 0.8s ease" }}
                      />
                    </div>
                    <div>
                      <div style={{ ...typography.small, color: colors.textMuted, marginBottom: "2px" }}>Disruptions</div>
                      <div style={{ fontFamily: typography.fontFamily, fontWeight: 600, fontSize: "16px", color: isResolved ? colors.textMuted : colors.accentRed, transition: "color 0.8s ease" }}>
                        {beforeSnapshot?.count ?? costImpact.disruptedCount} active
                      </div>
                    </div>
                    <div>
                      <div style={{ ...typography.small, color: colors.textMuted, marginBottom: "2px" }}>Health Score</div>
                      <div style={{ fontFamily: typography.fontFamily, fontWeight: 600, fontSize: "16px", color: isResolved ? colors.textMuted : getScoreColor(beforeSnapshot?.healthScore ?? currentHealthScore), transition: "color 0.8s ease" }}>
                        {beforeSnapshot?.healthScore ?? currentHealthScore}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Arrow */}
                <AnimatedArrow resolved={isResolved} />

                {/* AFTER Column */}
                <div style={{
                  background: afterBg,
                  border: `1px solid ${colors.accentGreen}${isResolved ? "60" : "30"}`,
                  borderRadius: "12px",
                  padding: "20px",
                  transition: "all 0.8s ease",
                  opacity: isResolved ? 1 : 0.55,
                  boxShadow: isResolved ? `0 0 20px ${colors.accentGreen}15` : "none",
                }}>
                  <div style={{ ...typography.small, color: colors.accentGreen, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                    After Resolution
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <div style={{ ...typography.small, color: colors.textMuted, marginBottom: "2px" }}>Savings</div>
                      <AnimatedNumber
                        value={isResolved ? (beforeSnapshot?.costImpact?.netSavings ?? costImpact.netSavings) : 0}
                        prefix="₹"
                        duration={1500}
                        style={{ fontFamily: typography.fontFamily, fontWeight: 700, fontSize: "22px", color: colors.accentGreen }}
                      />
                    </div>
                    <div>
                      <div style={{ ...typography.small, color: colors.textMuted, marginBottom: "2px" }}>Disruptions</div>
                      <div style={{ fontFamily: typography.fontFamily, fontWeight: 600, fontSize: "16px", color: colors.accentGreen }}>
                        0 active
                      </div>
                    </div>
                    <div>
                      <div style={{ ...typography.small, color: colors.textMuted, marginBottom: "2px" }}>Health Score</div>
                      <AnimatedNumber
                        value={isResolved ? resolvedHealthScore : (beforeSnapshot?.healthScore ?? currentHealthScore)}
                        suffix="/100"
                        duration={1200}
                        style={{ fontFamily: typography.fontFamily, fontWeight: 600, fontSize: "16px", color: isResolved ? getScoreColor(resolvedHealthScore) : colors.textMuted, transition: "color 0.8s ease" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insight + Confidence */}
              <div style={{ padding: "14px 18px", borderRadius: "8px", background: `${colors.accentBlue}08`, border: `1px solid ${colors.border}`, marginBottom: "12px" }}>
                <span style={{ fontFamily: typography.fontFamily, fontSize: "13px", fontWeight: 400, color: colors.textSecondary, fontStyle: "italic", lineHeight: 1.6 }}>
                  {aiInsightText}
                </span>
                <ConfidenceIndicator value={isResolved ? 99 : 92} visible={isResolved || uniqueDisruptedIds.length > 0} />
              </div>

              {/* ETA Impact */}
              <div style={{ padding: "12px 18px", borderRadius: "8px", background: `${colors.accentYellow}08`, border: `1px solid ${colors.border}` }}>
                <span style={{ fontFamily: typography.fontFamily, fontSize: "13px", fontWeight: 500, lineHeight: 1.6 }}>
                  <span style={{ color: isResolved ? colors.textMuted : colors.accentYellow, textDecoration: isResolved ? "line-through" : "none", transition: "all 0.5s ease" }}>
                    ⏱️ Estimated delay: {delayHours > 0 || delayMins > 0 ? `${delayHours}h ${delayMins}m` : "0h 0m"}
                  </span>
                  <span style={{ color: colors.textMuted }}> → </span>
                  <span style={{ color: colors.accentGreen, fontWeight: isResolved ? 700 : 500, transition: "font-weight 0.5s ease" }}>
                    reduced to 40m after rerouting
                  </span>
                </span>
              </div>
            </>
          ) : (
            <div style={{ padding: "14px 18px", borderRadius: "8px", background: `${colors.accentGreen}10`, border: `1px solid ${colors.accentGreen}30` }}>
              <span style={{ fontFamily: typography.fontFamily, fontSize: "13px", fontWeight: 500, color: colors.accentGreen, lineHeight: 1.5 }}>
                ✅ All systems normal. No financial impact detected.
              </span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ENTITY TABLE — with green flash + reliability boost   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div ref={tableRef} style={{ ...card, marginBottom: spacing.sectionGap }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Network Entities</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {statusFilter !== "all" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: colors.textMuted }}>Filtered by:</span>
                  <span style={badges[statusFilter]}>{statusFilter.replace("_", " ")}</span>
                  <button onClick={() => setStatusFilter("all")} style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", fontSize: "16px", padding: 0 }}>×</button>
                </div>
              )}
              <div style={{ display: "flex", gap: "4px", background: "#f8fafc", padding: "4px", borderRadius: "8px" }}>
                {["suppliers", "warehouses", "retailers"].map((tab) => {
                  const isActive = selectedTab === tab;
                  return (
                    <button 
                      key={tab} 
                      onClick={() => setSelectedTab(tab)} 
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        textTransform: "capitalize",
                        color: isActive ? "#2563eb" : "#64748b",
                        background: isActive ? "#ffffff" : "transparent",
                        boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
              <button className="text-blue-600 font-semibold text-xs flex items-center gap-1 hover:text-blue-800 transition-colors">
                Export CSV <span className="material-symbols-outlined text-[14px]">download</span>
              </button>
            </div>
          </div>

          <div style={tableStyles.wrapper}>
            <table style={tableStyles.table}>
              <thead>
                <tr>
                  {["ID", "Name", "City", "Status", "Reliability"].map((h) => (
                    <th key={h} style={tableStyles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabMap[selectedTab]
                  .filter(item => {
                    const es = getEffectiveStatus(item);
                    if (statusFilter === "all") return true;
                    if (statusFilter === "disrupted" && es === "restored") return true;
                    return es === statusFilter;
                  })
                  .map((item) => {
                    const effectiveStatus = getEffectiveStatus(item);
                    const isFlashing = flashingRows.includes(item.id);
                    const isRestored = effectiveStatus === "restored";
                    const reliability = getEffectiveReliability(item);
                    const reliabilityColor = reliability > 80 ? colors.accentGreen : reliability > 60 ? colors.accentYellow : colors.accentRed;

                    return (
                      <tr
                        key={item.id}
                        style={{
                          background: isFlashing ? "#d1fae5" : isRestored ? `${colors.accentGreen}06` : "transparent",
                          transition: "background 1.2s ease",
                          borderLeft: isRestored ? `3px solid ${colors.accentGreen}` : "3px solid transparent",
                        }}
                        onMouseEnter={(e) => { if (!isFlashing) e.currentTarget.style.background = isRestored ? `${colors.accentGreen}10` : colors.surface; }}
                        onMouseLeave={(e) => { if (!isFlashing) e.currentTarget.style.background = isRestored ? `${colors.accentGreen}06` : "transparent"; }}
                      >
                        <td style={{ ...tableStyles.tdMuted, fontFamily: "monospace", fontSize: "13px" }}>{item.id}</td>
                        <td style={{ ...tableStyles.td, fontWeight: 500 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {item.name}
                            {disruptedNodes.includes(item.id) && item.status !== "disrupted" && (
                              <span style={{ background: `${colors.accentRed}20`, color: colors.accentRed, border: `1px solid ${colors.accentRed}50`, borderRadius: "4px", padding: "1px 6px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em" }}>SIM</span>
                            )}
                            {isRestored && (
                              <span style={{ background: `${colors.accentGreen}20`, color: colors.accentGreen, border: `1px solid ${colors.accentGreen}50`, borderRadius: "4px", padding: "1px 6px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em" }}>FIXED</span>
                            )}
                          </div>
                        </td>
                        <td style={tableStyles.tdMuted}>{item.city}</td>
                        <td style={tableStyles.td}>
                          {isRestored ? (
                            <span style={restoredBadge}>restored</span>
                          ) : (
                            <span style={badges[effectiveStatus]}>{effectiveStatus.replace("_", " ")}</span>
                          )}
                        </td>
                        <td style={tableStyles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "60px", height: "4px", borderRadius: "2px", background: colors.border, overflow: "hidden" }}>
                              <div style={{
                                width: `${reliability}%`,
                                height: "100%",
                                borderRadius: "2px",
                                background: reliabilityColor,
                                transition: "width 1.2s ease, background 0.8s ease",
                              }} />
                            </div>
                            <span style={{
                              fontFamily: "monospace",
                              fontSize: "13px",
                              color: isRestored ? colors.accentGreen : colors.textSecondary,
                              fontWeight: isRestored ? 700 : 400,
                              transition: "color 0.5s ease",
                            }}>
                              {reliability}%
                            </span>
                            {isRestored && reliability > item.reliability_score && (
                              <span style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: colors.accentGreen,
                                animation: "fadeInUp 0.5s ease both",
                              }}>
                                +{reliability - item.reliability_score}%
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Routes Table with ETA */}
        <div style={{ ...card, marginBottom: activeAlerts.length > 0 ? spacing.sectionGap : 0 }}>
          <h3 style={{ ...typography.cardTitle, marginBottom: "20px" }}>Routes & ETA Predictions</h3>
          <div style={tableStyles.wrapper}>
            <table style={tableStyles.table}>
              <thead>
                <tr>
                  {["Route", "From", "To", "Distance", "Risk", "ETA", "Status"].map((h) => (
                    <th key={h} style={tableStyles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => {
                  const isDisrupted = route.status === "disrupted";
                  const eta = calculateETA(route, isDisrupted, route.risk_score);
                  const etaColor = isDisrupted ? colors.accentRed : route.risk_score > 70 ? colors.accentRed : route.risk_score > 40 ? colors.accentYellow : colors.accentGreen;
                  return (
                    <tr key={route.id} onMouseEnter={(e) => (e.currentTarget.style.background = colors.surface)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ ...tableStyles.tdMuted, fontFamily: "monospace", fontSize: "13px" }}>{route.id}</td>
                      <td style={tableStyles.td}>{route.from}</td>
                      <td style={tableStyles.td}>{route.to}</td>
                      <td style={tableStyles.tdMuted}>{route.distance_km} km</td>
                      <td style={tableStyles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: colors.border, overflow: "hidden" }}>
                            <div style={{ width: `${route.risk_score}%`, height: "100%", borderRadius: "2px", background: route.risk_score > 70 ? colors.accentRed : route.risk_score > 40 ? colors.accentYellow : colors.accentGreen }} />
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: "11px", color: colors.textSecondary }}>{route.risk_score}</span>
                        </div>
                      </td>
                      <td style={tableStyles.td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 500, color: etaColor, fontFamily: typography.fontFamily }}>In {formatETA(eta.totalHours)}</span>
                          {eta.delayHours > 0 && <span style={{ fontSize: "10px", color: etaColor, opacity: 0.8, fontFamily: typography.fontFamily }}>(+{formatETA(eta.delayHours)} delay)</span>}
                          {!eta.isDelayed && route.risk_score > 40 && <span style={{ fontSize: "10px", color: colors.accentYellow, opacity: 0.8, fontFamily: typography.fontFamily }}>(estimated)</span>}
                        </div>
                      </td>
                      <td style={tableStyles.td}><span style={badges[route.status]}>{route.status.replace("_", " ")}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div style={{ ...card, marginTop: spacing.sectionGap }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ ...typography.cardTitle, margin: 0 }}>
                Active Alerts
                <span style={{ marginLeft: "10px", background: `${colors.accentRed}20`, color: colors.accentRed, borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: 700 }}>{activeAlerts.length}</span>
              </h3>
            </div>
            <div style={tableStyles.wrapper}>
              <table style={tableStyles.table}>
                <thead>
                  <tr>{["Alert ID", "Type", "Message", "Time"].map((h) => (<th key={h} style={tableStyles.th}>{h}</th>))}</tr>
                </thead>
                <tbody>
                  {activeAlerts.map((alert) => (
                    <tr key={alert.id} onMouseEnter={(e) => (e.currentTarget.style.background = colors.surface)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ ...tableStyles.tdMuted, fontFamily: "monospace", fontSize: "12px" }}>{alert.id.substring(0, 16)}...</td>
                      <td style={tableStyles.td}><span style={badges.disrupted}>{alert.type}</span></td>
                      <td style={tableStyles.td}>{alert.message}</td>
                      <td style={tableStyles.tdMuted}>{new Date(alert.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
