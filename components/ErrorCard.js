"use client";

import { Component } from "react";
import { colors, typography, card, buttons } from "@/styles/designSystem";

// ─── Static Error Card (used as fallback UI) ────────────────
export function ErrorCard({ title, message, onRetry }) {
  return (
    <div
      style={{
        ...card,
        borderLeft: `3px solid ${colors.accentRed}`,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "600px",
        margin: "40px auto",
      }}
    >
      {/* Icon + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: `${colors.accentRed}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accentRed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h3
          style={{
            fontFamily: typography.fontFamily,
            fontWeight: 600,
            fontSize: "16px",
            color: colors.textPrimary,
            margin: 0,
          }}
        >
          {title || "Something went wrong"}
        </h3>
      </div>

      {/* Error message */}
      {message && (
        <div
          style={{
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontSize: "12px",
            lineHeight: 1.6,
            color: colors.textSecondary,
            background: colors.bgMain,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "12px 16px",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </div>
      )}

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            ...buttons.primary,
            alignSelf: "flex-start",
            padding: "8px 20px",
            fontSize: "13px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2D5BC7")}
          onMouseLeave={(e) => (e.currentTarget.style.background = colors.accentBlue)}
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Error Boundary (class component) ───────────────────────
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: colors.bgMain,
            padding: "32px",
            fontFamily: typography.fontFamily,
          }}
        >
          <ErrorCard
            title="Something went wrong"
            message={this.state.error?.message || "An unexpected error occurred."}
            onRetry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── API Key Missing Card (Advisor-specific) ────────────────
export function APIKeyMissingCard() {
  return (
    <div
      style={{
        ...card,
        borderLeft: `3px solid ${colors.accentYellow}`,
        maxWidth: "520px",
        margin: "20px auto",
      }}
    >
      {/* Icon + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: `${colors.accentYellow}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accentYellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3
          style={{
            fontFamily: typography.fontFamily,
            fontWeight: 600,
            fontSize: "16px",
            color: colors.textPrimary,
            margin: 0,
          }}
        >
          API Key Required
        </h3>
      </div>

      {/* Steps */}
      <div
        style={{
          fontFamily: typography.fontFamily,
          fontSize: "13px",
          color: colors.textSecondary,
          lineHeight: 1.8,
        }}
      >
        <p style={{ marginBottom: "12px" }}>
          To connect to the Gemini AI advisor, add your API key:
        </p>
        <ol style={{ paddingLeft: "20px", margin: 0 }}>
          <li style={{ marginBottom: "6px" }}>
            Open <code style={{ background: colors.bgMain, padding: "2px 6px", borderRadius: "4px", fontSize: "12px", color: colors.accentBlue }}>.env.local</code> in your project root
          </li>
          <li style={{ marginBottom: "6px" }}>
            Add the line:{" "}
            <code style={{ background: colors.bgMain, padding: "2px 6px", borderRadius: "4px", fontSize: "12px", color: colors.accentGreen }}>
              GEMINI_API_KEY=your_api_key_here
            </code>
          </li>
          <li style={{ marginBottom: "6px" }}>
            Get a key from{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.accentBlue, textDecoration: "none" }}
            >
              aistudio.google.com/apikey
            </a>
          </li>
          <li>
            Restart the dev server:{" "}
            <code style={{ background: colors.bgMain, padding: "2px 6px", borderRadius: "4px", fontSize: "12px", color: colors.accentGreen }}>
              npm run dev
            </code>
          </li>
        </ol>
      </div>
    </div>
  );
}
