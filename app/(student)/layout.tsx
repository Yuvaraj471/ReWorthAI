"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Loader2 } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
    } else if (isAdmin) {
      // If admin, redirect to admin dashboard
      router.push("/admin/dashboard");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#040906]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-emerald-500/80 font-medium animate-pulse text-sm">
          Securing session and establishing IoT gateways...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block flex-shrink-0 h-full">
        <Sidebar isAdmin={false} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar isAdmin={false} />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
