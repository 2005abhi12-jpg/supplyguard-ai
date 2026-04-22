"use client";

import { createContext, useContext, useReducer } from "react";
import { suppliers, warehouses, retailers, routes } from "@/data/mockData";

// --- Action types ---
const TRIGGER_DISRUPTION = "TRIGGER_DISRUPTION";
const RESOLVE_DISRUPTION = "RESOLVE_DISRUPTION";
const RESOLVE_ALL = "RESOLVE_ALL";
const RESET_ALL = "RESET_ALL";
const ADD_ALERT = "ADD_ALERT";
const CLEAR_ALERT = "CLEAR_ALERT";
const CLEAR_ALL_ALERTS = "CLEAR_ALL_ALERTS";
const DISMISS_TOAST = "DISMISS_TOAST";

// --- Initial state ---
const initialState = {
  suppliers,
  warehouses,
  retailers,
  routes,
  disruptedNodes: [],   // array of entity ids that have been manually disrupted
  activeAlerts: [],     // array of { id, type, message, timestamp }
  toast: null,          // { message, link } — shown bottom-right, auto-dismiss
  resolvedCount: 0,     // total disruptions resolved this session
  lastResolvedAt: null, // ISO timestamp of last resolution
  resolvedRouteIds: [], // routes that were dynamically optimized by AI
};

// --- Reducer ---
function supplyChainReducer(state, action) {
  switch (action.type) {
    case TRIGGER_DISRUPTION: {
      const nodeId = action.payload;
      // Avoid duplicates
      if (state.disruptedNodes.includes(nodeId)) return state;
      return {
        ...state,
        disruptedNodes: [...state.disruptedNodes, nodeId],
      };
    }

    case RESOLVE_DISRUPTION: {
      const nodeId = action.payload;
      return {
        ...state,
        disruptedNodes: state.disruptedNodes.filter((id) => id !== nodeId),
        activeAlerts: state.activeAlerts.filter(
          (a) => !a.message.includes(nodeId) && !a.id.includes(nodeId)
        ),
        resolvedCount: state.resolvedCount + 1,
        lastResolvedAt: new Date().toISOString(),
      };
    }

    case RESOLVE_ALL: {
      const resolveEntities = (arr) => arr.map(e => (["disrupted", "at_risk"].includes(e.status) ? { ...e, status: "normal" } : e));
      const hardcodedDisruptedCount = state.suppliers.filter(e => e.status === "disrupted").length + 
                                      state.warehouses.filter(e => e.status === "disrupted").length + 
                                      state.retailers.filter(e => e.status === "disrupted").length;

      const resolveRoutes = (arr) => arr.map(e => {
        const isProblematic = ["disrupted", "at_risk"].includes(e.status) || e.risk_score > 70;
        return isProblematic ? { ...e, status: "normal", risk_score: 15 } : e;
      });

      const problematicRouteIds = state.routes.filter(e => e.status === "disrupted").map(e => e.id);

      return {
        ...state,
        suppliers: resolveEntities(state.suppliers),
        warehouses: resolveEntities(state.warehouses),
        retailers: resolveEntities(state.retailers),
        routes: resolveRoutes(state.routes),
        disruptedNodes: [],
        activeAlerts: [],
        resolvedCount: state.resolvedCount + state.disruptedNodes.length + hardcodedDisruptedCount,
        lastResolvedAt: new Date().toISOString(),
        resolvedRouteIds: [...(state.resolvedRouteIds || []), ...problematicRouteIds],
      };
    }

    case RESET_ALL:
      return {
        ...state,
        disruptedNodes: [],
        activeAlerts: [],
        toast: null,
        resolvedRouteIds: [],
      };

    case ADD_ALERT:
      return {
        ...state,
        activeAlerts: [action.payload, ...state.activeAlerts],
        toast: {
          message: "Disruption logged — check AI Advisor for rerouting",
          link: "/advisor",
        },
      };

    case CLEAR_ALERT:
      return {
        ...state,
        activeAlerts: state.activeAlerts.filter((a) => a.id !== action.payload),
      };

    case CLEAR_ALL_ALERTS:
      return { ...state, activeAlerts: [] };

    case DISMISS_TOAST:
      return { ...state, toast: null };

    default:
      return state;
  }
}

// --- Context ---
const SupplyChainContext = createContext(null);

export function SupplyChainProvider({ children }) {
  const [state, dispatch] = useReducer(supplyChainReducer, initialState);

  return (
    <SupplyChainContext.Provider value={{ state, dispatch }}>
      {children}
    </SupplyChainContext.Provider>
  );
}

// --- Custom hook for consuming ---
export function useSupplyChain() {
  const ctx = useContext(SupplyChainContext);
  if (!ctx) throw new Error("useSupplyChain must be used inside SupplyChainProvider");
  return ctx;
}

// Re-export action types for consumers
export { TRIGGER_DISRUPTION, RESOLVE_DISRUPTION, RESOLVE_ALL, RESET_ALL, ADD_ALERT, CLEAR_ALERT, CLEAR_ALL_ALERTS, DISMISS_TOAST };
