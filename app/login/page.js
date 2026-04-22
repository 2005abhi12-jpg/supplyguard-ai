"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("admin@supplyguard.ai");
  const [password, setPassword] = useState("admin123");

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);
    setIsAuthenticating(true);
    
    if (!email || !password) {
      setTimeout(() => {
        setIsAuthenticating(false);
        setError("Invalid credentials. Please enter email and password.");
      }, 800);
      return;
    }

    // Advanced loading state simulation
    setTimeout(() => {
      router.push("/");
    }, 1800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 font-sans">
      
      <div className="w-full max-w-md p-8 md:p-10 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Logistics Portal</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Sign in to manage your supply chain</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Work Email</label>
            <input 
              type="email" 
              required
              disabled={isAuthenticating}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot?</a>
            </div>
            <input 
              type="password" 
              required
              disabled={isAuthenticating}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-mono tracking-widest"
              placeholder="••••••••"
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500/20 cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none font-medium">Keep me signed in</label>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isAuthenticating}
            className={`
              mt-2 w-full py-3.5 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2
              ${isAuthenticating 
                ? 'bg-blue-400 text-white cursor-wait' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
              }
            `}
          >
            {isAuthenticating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer / Hint */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 font-medium tracking-wide text-center">
            SupplyGuard Enterprise v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
