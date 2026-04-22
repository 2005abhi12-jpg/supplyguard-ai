"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupplyChain, DISMISS_TOAST } from "@/context/SupplyChainContext";
import { colors, typography } from "@/styles/designSystem";

export default function Toast() {
  const { state, dispatch } = useSupplyChain();
  const router = useRouter();
  const toast = state.toast;

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch({ type: DISMISS_TOAST }), 8000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${colors.accentYellow}`,
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        maxWidth: "420px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
        animation: "toastSlideIn 0.35s ease-out both",
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: typography.fontFamily,
            fontWeight: 600,
            fontSize: "13px",
            color: colors.textPrimary,
            marginBottom: "4px",
          }}
        >
          Disruption Triggered
        </div>
        <div
          style={{
            fontFamily: typography.fontFamily,
            fontWeight: 400,
            fontSize: "12px",
            color: colors.textSecondary,
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </div>
      </div>

      {/* Ask AI Now button */}
      <button
        onClick={() => {
          dispatch({ type: DISMISS_TOAST });
          router.push(toast.link || "/advisor");
        }}
        style={{
          background: colors.accentBlue,
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "6px 14px",
          fontFamily: typography.fontFamily,
          fontWeight: 600,
          fontSize: "12px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#2D5BC7")}
        onMouseLeave={(e) => (e.currentTarget.style.background = colors.accentBlue)}
      >
        Ask AI Now
      </button>

      {/* Close */}
      <button
        onClick={() => dispatch({ type: DISMISS_TOAST })}
        style={{
          background: "none",
          border: "none",
          color: colors.textMuted,
          cursor: "pointer",
          fontSize: "16px",
          padding: "0 2px",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
