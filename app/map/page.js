"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  useSupplyChain,
  TRIGGER_DISRUPTION,
  ADD_ALERT,
} from "@/context/SupplyChainContext";

// Mercator projection for India
function project(lat, lng) {
  const mapLeft = 68, mapRight = 92, mapTop = 35, mapBottom = 8;
  const svgW = 800, svgH = 800;
  return {
    x: ((lng - mapLeft) / (mapRight - mapLeft)) * svgW,
    y: ((mapTop - lat) / (mapTop - mapBottom)) * svgH,
  };
}

export default function MapView() {
  const { state, dispatch } = useSupplyChain();
  const { suppliers, warehouses, retailers, routes, activeAlerts } = state;
  const [selectedEntity, setSelectedEntity] = useState(null);

  const allEntities = [
    ...suppliers.map((s) => ({ ...s, type: "supplier" })),
    ...warehouses.map((w) => ({ ...w, type: "warehouse" })),
    ...retailers.map((r) => ({ ...r, type: "retailer" })),
  ];

  const isNodeDisrupted = (id) => state.disruptedNodes.includes(id);

  const getEffectiveStatus = (entity) => {
    if (state.isAllResolved) return "normal";
    if (isNodeDisrupted(entity.id)) return "disrupted";
    return entity.status;
  };

  const handleSimulateDisruption = (entity) => {
    if (isNodeDisrupted(entity.id)) return;
    dispatch({ type: TRIGGER_DISRUPTION, payload: entity.id });
    dispatch({
      type: ADD_ALERT,
      payload: {
        id: Date.now().toString(),
        type: "disruption",
        title: "Network Event",
        message: `${entity.name} in ${entity.city} has reported a sudden operational failure. Severe supply chain delays expected.`,
        timestamp: new Date().toISOString(),
      },
    });
  };

  // Build route lines
  const [networkLoad, setNetworkLoad] = useState(62);
  const [altRoutesReady, setAltRoutesReady] = useState(3);

  const totalDisrupted = allEntities.filter(e => getEffectiveStatus(e) === "disrupted").length;

  // Simulate live network load fluctuations
  useEffect(() => {
    const baseLoad = totalDisrupted > 0 ? 82 : 58;
    setAltRoutesReady(totalDisrupted > 0 ? Math.floor(Math.random() * 4) + 1 : 4);
    
    const interval = setInterval(() => {
      setNetworkLoad(baseLoad + Math.floor(Math.random() * 5) - 2); 
    }, 2500);
    return () => clearInterval(interval);
  }, [totalDisrupted]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const routePaths = routes.map((rte) => {
    const origin = allEntities.find((e) => e.name === rte.from);
    const dest = allEntities.find((e) => e.name === rte.to);
    if (!origin || !dest) return null;

    const oPos = project(origin.lat, origin.lng);
    const dPos = project(dest.lat, dest.lng);
    // Check if route is affected/blocked currently
    const isBlocked = getEffectiveStatus(origin) === "disrupted" || getEffectiveStatus(dest) === "disrupted";
    const isAiRoute = state.resolvedRouteIds?.includes(rte.id);
    
    return {
      ...rte,
      oPos,
      dPos,
      isBlocked,
      isAiRoute
    };
  }).filter(Boolean);



  return (
    <main className="relative w-full h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden pb-20">
      
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 map-mesh opacity-10"></div>
      
      {/* Main Map Container */}
      <div className="absolute inset-0 flex items-center justify-center md:pl-[100px] lg:pl-[120px]">
        <div className="relative w-[800px] h-[800px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800">
            {/* Routes */}
            {routePaths.map((rte, idx) => {
              if (rte.isBlocked) {
                 return (
                   <path 
                     key={idx}
                     d={`M${rte.oPos.x},${rte.oPos.y} Q${(rte.oPos.x + rte.dPos.x)/2},${rte.oPos.y - 50} ${rte.dPos.x},${rte.dPos.y}`} 
                     fill="none" 
                     stroke="#FF3B30" 
                     strokeWidth="3"
                     className="glow-error animate-pulse"
                   />
                 )
              }
              if (rte.isAiRoute) {
                 return (
                   <g key={idx}>
                     {/* Faded old route underneath to show the "avoided" path */}
                     <path 
                       d={`M${rte.oPos.x},${rte.oPos.y} Q${(rte.oPos.x + rte.dPos.x)/2},${rte.oPos.y - 50} ${rte.dPos.x},${rte.dPos.y}`} 
                       fill="none" 
                       stroke="#ef4444" 
                       strokeWidth="1"
                       strokeDasharray="4 4"
                       opacity="0.3"
                     />
                     {/* Dramatic AI Bypass Route */}
                     <path 
                       d={`M${rte.oPos.x},${rte.oPos.y} Q${(rte.oPos.x + rte.dPos.x)/2 + 140},${rte.oPos.y - 120} ${rte.dPos.x},${rte.dPos.y}`} 
                       fill="none" 
                       stroke="#2563eb" 
                       strokeDasharray="8 6" 
                       strokeWidth="3"
                       className="glow-primary animate-pulse"
                     />
                   </g>
                 )
              }
              return (
                <path 
                  key={idx}
                  d={`M${rte.oPos.x},${rte.oPos.y} Q${(rte.oPos.x + rte.dPos.x)/2},${rte.oPos.y - 50} ${rte.dPos.x},${rte.dPos.y}`} 
                  fill="none" 
                  stroke="#94a3b8" 
                  strokeDasharray="4 4" 
                  strokeWidth="1.5"
                />
              )
            })}

            {/* Nodes */}
            {allEntities.map((entity) => {
              const pos = project(entity.lat, entity.lng);
              const status = getEffectiveStatus(entity);
              const isSelected = selectedEntity?.id === entity.id;

              if (status === "disrupted") {
                return (
                  <g key={entity.id} onClick={() => setSelectedEntity(entity)} className="cursor-pointer">
                    <circle className="animate-pulse" cx={pos.x} cy={pos.y} fill="#ef4444" fillOpacity="0.2" r="14"></circle>
                    <circle className="glow-error" cx={pos.x} cy={pos.y} fill="#ef4444" r={isSelected ? "6" : "4"}></circle>
                  </g>
                );
              }
              if (status === "at_risk") {
                return (
                  <circle key={entity.id} cx={pos.x} cy={pos.y} fill="#f59e0b" r={isSelected ? "6" : "5"} onClick={() => setSelectedEntity(entity)} className="cursor-pointer glow-tertiary" />
                );
              }
              return (
                <circle key={entity.id} className="glow-primary cursor-pointer" cx={pos.x} cy={pos.y} fill="#2563eb" r={isSelected ? "8" : "6"} onClick={() => setSelectedEntity(entity)} />
              );
            })}
          </svg>

          {/* Dynamic Annotations for Disrupted Nodes */}
          {allEntities.map((entity) => {
             const status = getEffectiveStatus(entity);
             if (status === "disrupted") {
                const pos = project(entity.lat, entity.lng);
                return (
                  <div key={`anno-${entity.id}`} className="absolute bg-red-50/90 backdrop-blur-md px-3 py-2 rounded border border-red-200 border-l-4 border-l-red-500 shadow-sm pointer-events-none" style={{ left: pos.x + 15, top: pos.y - 20 }}>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">DISRUPTION DETECTED</p>
                    <p className="text-xs font-bold text-slate-800">{entity.name}</p>
                    <p className="text-[9px] text-slate-500">Congestion / Delay Risk</p>
                  </div>
                )
             }
             return null;
          })}
        </div>
      </div>

      {/* Operational Overlay Panels */}
      <div className="absolute top-8 left-8 flex flex-col gap-4 w-72 pointer-events-none z-10">
        
        {/* Dynamic Summary Card depending on selection */}
        {selectedEntity ? (
          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-lg border border-gray-200 shadow-lg pointer-events-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface uppercase">{selectedEntity.name}</h2>
              <span className="material-symbols-outlined text-primary text-sm">factory</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Reliability</span>
                <span className={`text-2xl font-headline font-bold ${getEffectiveStatus(selectedEntity) === 'disrupted' ? 'text-red-500' : 'text-blue-600'}`}>
                  {selectedEntity.reliability_score}<span className="text-xs ml-1">%</span>
                </span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Status</span>
                 <span className={`text-[11px] font-bold mt-2 uppercase ${getEffectiveStatus(selectedEntity) === 'disrupted' ? 'text-red-500' : getEffectiveStatus(selectedEntity) === 'at_risk' ? 'text-amber-500' : 'text-blue-600'}`}>
                   {getEffectiveStatus(selectedEntity)}
                 </span>
              </div>
            </div>
            
            {getEffectiveStatus(selectedEntity) !== "disrupted" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                   onClick={() => handleSimulateDisruption(selectedEntity)}
                   className="w-full mt-2 bg-red-50 text-red-600 border border-red-200 font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-red-100 active:scale-[0.98] transition-all"
                >
                  <span className="text-xs uppercase tracking-widest">Simulate Event</span>
                  <span className="material-symbols-outlined text-sm">warning</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-lg border border-gray-200 shadow-lg pointer-events-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface">NETWORK STATUS</h2>
              <span className="material-symbols-outlined text-primary text-sm">hub</span>
            </div>
            <div className="flex flex-col mb-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Total Load</span>
              <span className="text-2xl font-headline font-bold text-blue-600">OP-STABLE</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">Select any node on the map to view detailed analytics or simulate industrial disruptions.</p>
          </div>
        )}

        {/* Mini Metrics Grid */}
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-surface-container-high/40 backdrop-blur-md p-3 flex items-center justify-between rounded border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">anchor</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Disruptions</span>
            </div>
            <span className={`text-[10px] font-bold ${totalDisrupted > 0 ? 'text-error' : 'text-primary'}`}>
               {totalDisrupted > 0 ? `${totalDisrupted} CRITICAL` : "0 ISSUES"}
            </span>
          </div>
          <div className="bg-surface-container-high/40 backdrop-blur-md p-3 flex items-center justify-between rounded border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">route</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Alt-Routes</span>
            </div>
            <span className={`text-[10px] font-bold ${totalDisrupted > 0 ? 'text-tertiary' : 'text-primary'}`}>{altRoutesReady} READY</span>
          </div>
        </div>
      </div>

      {/* Right Side Data Feed */}
      <div className="absolute top-8 right-8 w-80 h-[calc(100vh-220px)] flex flex-col gap-4 pointer-events-none z-10">
        <div className="bg-surface-container-low/40 backdrop-blur-md flex-1 rounded-lg border border-outline-variant/10 p-4 pointer-events-auto overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Live Intelligence</span>
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
             {activeAlerts.map((alert, idx) => (
                <div key={idx} className={`relative pl-3 border-l ${alert.type === 'disruption' ? 'border-error/50' : 'border-tertiary/50'}`}>
                  <p className="text-[9px] text-on-surface-variant font-bold">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                  <p className={`text-xs font-semibold ${alert.type === 'disruption' ? 'text-error' : 'text-tertiary'}`}>{alert.title || "Network Alert"}</p>
                  <p className="text-[10px] text-on-surface/70 mt-1 leading-relaxed">{alert.message}</p>
                </div>
             ))}
             {activeAlerts.length === 0 && (
                 <div className="relative pl-3 border-l border-primary/50">
                    <p className="text-[9px] text-on-surface-variant font-bold">LIVE</p>
                    <p className="text-xs font-semibold text-primary">System Monitoring Active</p>
                    <p className="text-[10px] text-on-surface/70 mt-1 leading-relaxed">No network anomalies detected. All nodes operating normally.</p>
                 </div>
             )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-outline-variant/20">
            <div className="bg-surface-container-highest/60 p-3 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold uppercase text-on-surface-variant">Network Load</span>
                <span className={`text-[10px] font-bold ${networkLoad > 75 ? 'text-tertiary' : 'text-primary'} transition-colors duration-500`}>
                  {networkLoad}%
                </span>
              </div>
              <div className="w-full bg-surface-container-low h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${networkLoad > 75 ? 'bg-tertiary' : 'bg-primary'} transition-all duration-1000 ease-in-out`}
                  style={{ width: `${networkLoad}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-surface-container-highest/90 backdrop-blur-md px-6 py-3 rounded-full border border-outline-variant/20 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary glow-primary"></span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface">Active Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-error glow-error"></span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface">Disruption</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary/40 border-t border-dashed border-primary"></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface">AI Path</span>
        </div>
      </div>
      
    </main>
  );
}
