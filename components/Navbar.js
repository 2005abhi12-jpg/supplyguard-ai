"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSupplyChain, CLEAR_ALL_ALERTS } from "@/context/SupplyChainContext";
import { typography, colors } from "@/styles/designSystem";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useSupplyChain();
  const { activeAlerts } = state;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const links = [
    { href: "/", label: "Operations", icon: "dashboard" },
    { href: "/map", label: "Network", icon: "hub" },
    { href: "/advisor", label: "Chat Bot", icon: "smart_toy" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* ─── LEFT SIDEBAR ────────────────────────────────────────────── */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-[#f8fafc] border-r border-gray-200 z-50 flex flex-col justify-between">
        
        <div className="p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 pl-2">
            <span className="material-symbols-outlined text-green-500 text-[28px]">gpp_good</span>
            <h1 className="text-sm font-black tracking-widest text-[#0f172a] font-headline uppercase leading-tight">
              SUPPLYGUARD <br/> <span className="text-[#334155]">ENTERPRISE</span>
            </h1>
          </Link>


          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href === '/' && pathname === '/dashboard');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg text-[13px] font-bold transition-all ${
                    isActive 
                      ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-white" : "text-slate-400"}`}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Options */}
        <div className="p-6 pb-8 border-t border-gray-100 bg-white">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 mb-6 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all text-[13px] font-bold">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Settings
          </button>
          
          <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-900 mb-2">System Status</h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
              <span className="text-[10px] font-bold text-green-600">All Systems Operational</span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium" suppressHydrationWarning>
              Last checked: {mounted ? currentTime : "--:--:--"}
            </p>
          </div>
        </div>
      </aside>

      {/* ─── TOP HEADER ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-white z-40 flex items-center justify-between px-8 border-b border-gray-100">
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search orders, shipments, or fleets..." 
              className="w-full bg-[#f1f5f9] border-none rounded-full py-2.5 pl-12 pr-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          {/* Notifications / Alerts */}
          <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors ${activeAlerts.length > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeAlerts.length > 0 && 'animate-pulse'}`}>
                notifications
              </span>
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-[2000] overflow-hidden animate-[contentReveal_0.2s_ease-out_both] origin-top-right">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h4 className="font-bold text-xs uppercase text-gray-500 tracking-widest m-0">Alerts</h4>
                  {activeAlerts.length > 0 && (
                    <button
                      onClick={() => dispatch({ type: CLEAR_ALL_ALERTS })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {activeAlerts.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-3xl mb-2 text-green-500 opacity-50">check_circle</span>
                      <p className="text-sm font-medium">All caught up!</p>
                      <p className="text-xs mt-1">Network is stable.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {activeAlerts.map((alert) => (
                        <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-red-500">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{alert.title}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed mt-1">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>

          {/* Profile / Logout */}
          <button 
            onClick={() => router.push("/login")}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:hidden">account_circle</span>
            <span className="material-symbols-outlined text-[20px] hidden group-hover:block">logout</span>
          </button>
        </div>

      </header>
    </>
  );
}
