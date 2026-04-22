"use client";

import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorCard";
import { SupplyChainProvider } from "@/context/SupplyChainContext";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <SupplyChainProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {!isLoginPage && <Navbar />}
        <div className={`flex-1 flex flex-col ${!isLoginPage ? "ml-64" : ""} transition-all duration-300 h-full overflow-hidden`}>
          <ErrorBoundary>
             <main key={pathname} className={`flex-1 overflow-y-auto w-full relative ${!isLoginPage ? "pt-24 pb-12 px-10" : ""}`}>{children}</main>
          </ErrorBoundary>
        </div>
      </div>
      <Toast />
    </SupplyChainProvider>
  );
}
