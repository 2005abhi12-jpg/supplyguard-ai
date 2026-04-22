"use client";

import { useState, useRef, useEffect } from "react";
import { suppliers, warehouses, retailers, routes, kpiData } from "@/data/mockData";
import { useSupplyChain } from "@/context/SupplyChainContext";
import { APIKeyMissingCard } from "@/components/ErrorCard";
import {
  colors,
  typography,
  card,
  buttons,
  pageHeader,
  pageWrapper,
  spacing,
} from "@/styles/designSystem";

// Updated quick prompts for real Gemini conversations
const quickPrompts = [
  "Which supplier has the highest risk right now?",
  "Mumbai supplier is down — suggest alternatives",
  "What are the top 3 routes I should monitor?",
  "How do I reduce my overall supply chain risk?",
  "Give me a daily risk briefing",
];

// Build a structured supply chain context string to send with every request
function buildSupplyChainContext(disruptedNodes) {
  const supplierSummary = suppliers
    .map((s) => {
      const isSimDisrupted = disruptedNodes.includes(s.id);
      const effectiveStatus = isSimDisrupted ? "disrupted (SIMULATED)" : s.status;
      return `  - ${s.name} (${s.city}): status=${effectiveStatus}, reliability=${s.reliability_score}%`;
    })
    .join("\n");

  const warehouseSummary = warehouses
    .map((w) => {
      const isSimDisrupted = disruptedNodes.includes(w.id);
      const effectiveStatus = isSimDisrupted ? "disrupted (SIMULATED)" : w.status;
      return `  - ${w.name} (${w.city}): status=${effectiveStatus}, reliability=${w.reliability_score}%`;
    })
    .join("\n");

  const retailerSummary = retailers
    .map((r) => {
      const isSimDisrupted = disruptedNodes.includes(r.id);
      const effectiveStatus = isSimDisrupted ? "disrupted (SIMULATED)" : r.status;
      return `  - ${r.name} (${r.city}): status=${effectiveStatus}, reliability=${r.reliability_score}%`;
    })
    .join("\n");

  const routeSummary = routes
    .map((r) => `  - ${r.id}: ${r.from} -> ${r.to}, risk=${r.risk_score}/100, status=${r.status}, distance=${r.distance_km}km`)
    .join("\n");

  const avgRisk = Math.round(routes.reduce((sum, r) => sum + r.risk_score, 0) / routes.length);
  const disruptedRoutes = routes.filter((r) => r.status === "disrupted").length;

  let disruptionNotice = "";
  if (disruptedNodes.length > 0) {
    const allEntities = [...suppliers, ...warehouses, ...retailers];
    const disrupted = disruptedNodes
      .map((id) => allEntities.find((e) => e.id === id))
      .filter(Boolean)
      .map((e) => `${e.name} (${e.city})`)
      .join(", ");
    disruptionNotice = `\n\n⚠️ ACTIVE SIMULATED DISRUPTIONS: ${disrupted}. These nodes are currently offline and need immediate rerouting.`;
  }

  return `Suppliers (${suppliers.length}):
${supplierSummary}

Warehouses (${warehouses.length}):
${warehouseSummary}

Retailers (${retailers.length}):
${retailerSummary}

Routes (${routes.length}, avg risk: ${avgRisk}/100, disrupted: ${disruptedRoutes}):
${routeSummary}

KPIs: ${kpiData.atRiskSuppliers} at-risk suppliers, ${kpiData.disruptedSuppliers} disrupted suppliers, avg reliability ${kpiData.avgReliability}%, ${kpiData.highRiskRoutes} high-risk routes.${disruptionNotice}`;
}

function MessageTimestamp({ timestamp }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    if (timestamp) {
      setTime(new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
  }, [timestamp]);
  return <span suppressHydrationWarning={true}>{time}</span>;
}

export default function AIAdvisor() {
  const { state } = useSupplyChain();
  const { disruptedNodes, activeAlerts } = state;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to SupplyGuard AI Advisor.\n\nI have access to your full supply chain data including 8 suppliers, 4 warehouses, 3 retailers, and 10 routes across India. Ask me anything about risk assessment, route optimization, or disruption management.\n\nWhat would you like to analyze?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasAutoPopulated, setHasAutoPopulated] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-populate input when disruptions exist and user hasn't already typed
  useEffect(() => {
    if (disruptedNodes.length > 0 && !hasAutoPopulated && !input) {
      const allEntities = [...suppliers, ...warehouses, ...retailers];
      const firstDisrupted = allEntities.find((e) => disruptedNodes.includes(e.id));
      if (firstDisrupted) {
        setInput(
          `${firstDisrupted.name} in ${firstDisrupted.city} is disrupted. Suggest immediate rerouting options.`
        );
        setHasAutoPopulated(true);
      }
    }
  }, [disruptedNodes, hasAutoPopulated, input]);

  const handleSend = async (text) => {
    const query = text || input;
    if (!query.trim() || isTyping) return;

    const userMessage = { role: "user", content: query, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setApiKeyMissing(false);

    try {
      const contextStr = buildSupplyChainContext(disruptedNodes);
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          supplyChainContext: contextStr,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Unable to get response. Please try again.";

      // Detect API key issues
      if (
        reply.includes("Check your API key") ||
        reply.includes("API key") ||
        res.status === 502 ||
        res.status === 500
      ) {
        setApiKeyMissing(true);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply, timestamp: new Date() }]);
    } catch (error) {
      console.error("API call failed:", error);
      setApiKeyMissing(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection issue. Check your API key in .env.local", timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Render multiline text
  const renderContent = (text) => {
    return text.split("\n").map((line, i) => (
      <p key={i} style={{ margin: line.trim() === "" ? "6px 0" : "2px 0", lineHeight: 1.6 }}>
        {line}
      </p>
    ));
  };

  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  // Disruption banner data
  const disruptions = activeAlerts.filter((a) => a.type === "disruption");

  return (
    <div style={pageWrapper}>
      {/* Disruption Banner */}
      {disruptedNodes.length > 0 && (
        <div
          style={{
            background: `linear-gradient(90deg, ${colors.accentYellow}18, ${colors.accentYellow}08, ${colors.accentYellow}18)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 4s linear infinite",
            border: `1px solid ${colors.accentYellow}40`,
            borderRadius: "10px",
            padding: "12px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <span
            style={{
              fontFamily: typography.fontFamily,
              fontWeight: 600,
              fontSize: "13px",
              color: colors.accentYellow,
            }}
          >
            {disruptedNodes.length} active disruption{disruptedNodes.length > 1 ? "s" : ""} detected
            — ask AI for help
          </span>
        </div>
      )}

      {/* Page Header */}
      <div style={pageHeader.wrapper}>
        <div>
          <h1 style={pageHeader.title}>AI Supply Chain Advisor</h1>
          <p style={pageHeader.subtitle}>Powered by Gemini — real-time analysis of your supply chain data</p>
        </div>
        <div suppressHydrationWarning={true} style={pageHeader.rightSide}>Session active since {time}</div>
      </div>

      {/* API Key Missing Card */}
      {apiKeyMissing && <APIKeyMissingCard />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: spacing.cardGap, height: "calc(100vh - 200px)" }}>
        {/* Chat area */}
        <div style={{ ...card, display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    background: msg.role === "user" ? colors.accentBlue : colors.bgMain,
                    border: msg.role === "user" ? "none" : `1px solid ${colors.border}`,
                    ...typography.body,
                    color: msg.role === "user" ? "#ffffff" : colors.textSecondary,
                    position: "relative",
                  }}
                >
                  {msg.role === "assistant" && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: colors.accentBlue, letterSpacing: "0.04em", fontFamily: typography.fontFamily }}>
                        SUPPLYGUARD AI
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", padding: "0" }}
                        title="Copy response"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  )}
                  {renderContent(msg.content)}
                  <div suppressHydrationWarning={true} style={{ fontSize: "10px", marginTop: "8px", textAlign: "right", opacity: "0.7" }}>
                    {msg.timestamp && <MessageTimestamp timestamp={msg.timestamp} />}
                  </div>
                </div>
              </div>
            ))}

            {/* Enhanced typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: "12px 12px 12px 4px",
                    background: colors.bgMain,
                    border: `1px solid ${colors.border}`,
                    minWidth: "220px",
                  }}
                >
                  {/* SUPPLYGUARD AI label */}
                  <div style={{ fontSize: "11px", fontWeight: 600, color: colors.accentBlue, marginBottom: "10px", letterSpacing: "0.04em", fontFamily: typography.fontFamily }}>
                    SUPPLYGUARD AI
                  </div>
                  {/* Animated dots */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: colors.accentBlue,
                          display: "inline-block",
                          animation: "blink 1.4s infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                  {/* Analyzing text */}
                  <div
                    style={{
                      fontFamily: typography.fontFamily,
                      fontSize: "12px",
                      color: colors.textMuted,
                      animation: "analyzePulse 2s ease-in-out infinite",
                    }}
                  >
                    SupplyGuard AI is analyzing...
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about your supply chain..."
              disabled={isTyping}
              rows={1}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "8px",
                border: `1px solid ${disruptedNodes.length > 0 && input ? colors.accentYellow : colors.border}`,
                background: colors.bgMain,
                color: colors.textPrimary,
                fontFamily: typography.fontFamily,
                fontSize: "14px",
                outline: "none",
                opacity: isTyping ? 0.5 : 1,
                transition: "border-color 0.2s ease",
                resize: "none",
                minHeight: "42px",
                maxHeight: "120px",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isTyping}
              style={{
                ...buttons.primary,
                opacity: isTyping ? 0.5 : 1,
                cursor: isTyping ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Quick Prompts Sidebar */}
        <div style={{ ...card, padding: "16px" }}>
          <h3 style={{ ...typography.cardTitle, marginBottom: "16px" }}>Quick Queries</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
                style={{
                  ...buttons.ghost,
                  textAlign: "left",
                  fontSize: "13px",
                  padding: "10px 12px",
                  lineHeight: 1.4,
                  opacity: isTyping ? 0.5 : 1,
                  cursor: isTyping ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isTyping) {
                    e.currentTarget.style.borderColor = colors.accentBlue;
                    e.currentTarget.style.color = colors.accentBlue;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Data coverage */}
          <div style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "8px",
            background: colors.bgMain,
            border: `1px solid ${colors.border}`,
          }}>
            <h4 style={{ ...typography.cardTitle, fontSize: "11px", marginBottom: "12px" }}>Data Coverage</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Suppliers", value: kpiData.totalSuppliers },
                { label: "Warehouses", value: kpiData.totalWarehouses },
                { label: "Retailers", value: kpiData.totalRetailers },
                { label: "Routes", value: kpiData.totalRoutes },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={typography.small}>{item.label}</span>
                  <span style={{ ...typography.small, color: colors.textPrimary, fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live disruptions in sidebar */}
          {disruptions.length > 0 && (
            <div style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius: "8px",
              background: `${colors.accentRed}0D`,
              border: `1px solid ${colors.accentRed}30`,
            }}>
              <h4 style={{ ...typography.cardTitle, fontSize: "11px", color: colors.accentRed, marginBottom: "8px" }}>
                Active Disruptions
              </h4>
              {disruptions.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    ...typography.small,
                    color: colors.textSecondary,
                    padding: "4px 0",
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* API status indicator */}
          <div style={{
            marginTop: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span
              className={apiKeyMissing ? "" : "live-dot"}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: apiKeyMissing ? colors.accentRed : colors.accentGreen,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ ...typography.small, color: apiKeyMissing ? colors.accentRed : colors.textSecondary }}>
              {apiKeyMissing ? "API key issue detected" : "Gemini API connected"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
