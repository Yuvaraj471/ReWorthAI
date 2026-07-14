"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // Guard administration paths
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (!isAdmin) {
      router.push("/unauthorized");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, router, isLoginPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040906]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-emerald-500/80 font-medium animate-pulse text-sm">
          Loading Admin Context & Metrics Database...
        </p>
      </div>
    );
  }

  // Render raw login card for the login route
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Admin Sidebar */}
      <div className="hidden md:block flex-shrink-0 h-full">
        <Sidebar isAdmin={true} />
      </div>

      {/* Main Administrative Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar isAdmin={true} />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
