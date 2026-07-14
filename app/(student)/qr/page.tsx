"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { QrCode, Copy, CheckCheck, Wifi, Smartphone, Info } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

const APP_URL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}/login`
  : "http://localhost:3000/login";

const WASTE_CATEGORIES = [
  { icon: "🍶", label: "Plastic Bottle", credits: 10 },
  { icon: "🛍️", label: "Plastic Bag", credits: 5 },
  { icon: "♻️", label: "Plastic Other", credits: 10 },
  { icon: "📦", label: "Cardboard", credits: 5 },
  { icon: "🥛", label: "Glass", credits: 15 },
  { icon: "🌿", label: "Biodegradable Waste", credits: 3 },
  { icon: "📄", label: "Paper", credits: 5 },
  { icon: "🔩", label: "Metal", credits: 20 },
];

export default function QRCodePage() {
  const { addToast } = useToastStore();
  const [copied, setCopied] = useState(false);

  const qrUrl = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}/login`
    : "http://localhost:3000/login";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    addToast("Link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/60 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Smart Bin QR Code</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Print and attach this QR code to the recycling bin. Students scan it to start their 60-second recycling session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 flex flex-col items-center text-center border border-emerald-500/20"
        >
          {/* Glowing halo */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-white p-5 rounded-2xl shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
              <QRCodeSVG
                value={qrUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#0d1117"
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-500 text-xs font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Ready to Scan
          </div>

          <p className="text-xs text-muted-foreground mb-1 font-mono break-all px-2">{qrUrl}</p>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer"
          >
            {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Link Copied!" : "Copy Link"}
          </button>

          {/* Print tip */}
          <p className="text-[10px] text-muted-foreground mt-5 leading-relaxed">
            Right-click the QR code and &quot;Save Image As&quot; to download, or use browser print (Ctrl+P) for a physical copy.
          </p>
        </motion.div>

        {/* Info Panel */}
        <div className="space-y-5">
          {/* How it works */}
          <div className="glass-card rounded-2xl p-6 border border-border/60">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              How Students Use This
            </h3>
            <ol className="space-y-3">
              {[
                "Student points their phone camera at this QR code",
                "Browser opens the ReWorth AI login page",
                "Student logs in with their campus credentials",
                "A secure 60-second recycling session is created",
                "Live webcam detects and classifies deposited waste",
                "EcoCredits are awarded instantly via WebSocket",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-muted-foreground">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Credits reference */}
          <div className="glass-card rounded-2xl p-6 border border-border/60">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-lime-500" />
              Credit Values (Display on Bin)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {WASTE_CATEGORIES.map((w) => (
                <div key={w.label} className="flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>{w.icon}</span>
                    <span className="text-muted-foreground font-medium truncate max-w-[90px]">{w.label}</span>
                  </div>
                  <span className="font-bold text-emerald-500 flex-shrink-0">+{w.credits}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Network notice */}
          <div className="glass-card rounded-2xl p-5 flex items-start gap-3 border border-cyan-500/10">
            <Wifi className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-bold text-xs mb-1">Network Requirement</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The recycling bin and student smartphones must be on the same campus Wi-Fi network for WebSocket communication to work properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
