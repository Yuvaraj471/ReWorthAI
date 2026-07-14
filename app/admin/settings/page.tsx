"use client";

import React, { useState, useEffect } from "react";
import { useWebSocketStore } from "@/store/useWebSocketStore";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Settings, Sliders, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

export default function CreditSettingsPage() {
  const { config, updateConfig } = useWebSocketStore();
  const { addToast } = useToastStore();
  const { useBackend } = useAuthStore();

  const [plasticBottle, setPlasticBottle] = useState(config.credits["Plastic Bottle"] || 10);
  const [plasticBag, setPlasticBag] = useState(config.credits["Plastic Bag"] || 5);
  const [plasticOther, setPlasticOther] = useState(config.credits["Plastic Other"] || 10);
  const [cardboard, setCardboard] = useState(config.credits["Cardboard"] || 5);
  const [glass, setGlass] = useState(config.credits["Glass"] || 15);
  const [biodegradable, setBiodegradable] = useState(config.credits["Biodegradable Waste"] || 3);
  const [paper, setPaper] = useState(config.credits["Paper"] || 5);
  const [metal, setMetal] = useState(config.credits["Metal"] || 20);
  const [yoloThreshold, setYoloThreshold] = useState(config.confidenceThreshold || 75);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [loadingBackend, setLoadingBackend] = useState(false);

  // Load credit config from backend on mount
  useEffect(() => {
    if (!useBackend) return;
    const loadCredits = async () => {
      setLoadingBackend(true);
      try {
        const { data } = await api.get("/api/v1/admin/credits");
        const creditsMap: Record<string, number> = {};
        (data as Array<{ waste_type: string; credits: number }>).forEach((c) => {
          creditsMap[c.waste_type] = c.credits;
        });
        if (creditsMap["Plastic Bottle"]) setPlasticBottle(creditsMap["Plastic Bottle"]);
        if (creditsMap["Plastic Bag"]) setPlasticBag(creditsMap["Plastic Bag"]);
        if (creditsMap["Plastic Other"]) setPlasticOther(creditsMap["Plastic Other"]);
        if (creditsMap["Cardboard"]) setCardboard(creditsMap["Cardboard"]);
        if (creditsMap["Glass"]) setGlass(creditsMap["Glass"]);
        if (creditsMap["Biodegradable Waste"]) setBiodegradable(creditsMap["Biodegradable Waste"]);
        if (creditsMap["Paper"]) setPaper(creditsMap["Paper"]);
        if (creditsMap["Metal"]) setMetal(creditsMap["Metal"]);
      } catch (err) {
        console.warn("[Settings] Could not load backend credit config:", err);
      } finally {
        setLoadingBackend(false);
      }
    };
    loadCredits();
  }, [useBackend]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newCredits = {
      "Plastic Bottle": plasticBottle,
      "Plastic Bag": plasticBag,
      "Plastic Other": plasticOther,
      Cardboard: cardboard,
      Glass: glass,
      "Biodegradable Waste": biodegradable,
      Paper: paper,
      Metal: metal,
    };

    // Persist to backend if reachable
    if (useBackend) {
      try {
        await api.put("/api/v1/admin/credits", newCredits);
        addToast("Credit config saved to backend!", "success");
      } catch (err) {
        console.warn("[Settings] Backend save failed, saving locally:", err);
        addToast("Saved locally. Backend sync failed.", "warning");
      }
    } else {
      addToast("IoT thresholds and credit configs updated locally!", "success");
    }

    // Always sync the WS store (used for mock simulations)
    updateConfig({ credits: newCredits, confidenceThreshold: yoloThreshold });
  };

  const categoriesList = [
    { label: "Plastic Bottle", val: plasticBottle, setVal: setPlasticBottle },
    { label: "Plastic Bag", val: plasticBag, setVal: setPlasticBag },
    { label: "Plastic Other", val: plasticOther, setVal: setPlasticOther },
    { label: "Cardboard", val: cardboard, setVal: setCardboard },
    { label: "Glass", val: glass, setVal: setGlass },
    { label: "Biodegradable Waste", val: biodegradable, setVal: setBiodegradable },
    { label: "Paper", val: paper, setVal: setPaper },
    { label: "Metal", val: metal, setVal: setMetal },
  ];


  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className="border-b border-border/60 pb-6">
        <h2 className="text-3xl font-bold tracking-tight">Credit Settings & IoT Parameters</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Adjust credit reward structures, modify AI confidence filters, and set session durations.
          {useBackend && (
            <span className="ml-2 text-emerald-500 font-semibold">
              {loadingBackend ? "Loading from backend..." : "● Live backend config loaded"}
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Credit Multipliers */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-md mb-6 flex items-center gap-2 border-b border-border/60 pb-3">
              <Sliders className="w-5 h-5 text-emerald-500" />
              EcoCredits per Waste Category
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoriesList.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">{cat.label} Payout</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={cat.val}
                      onChange={(e) => cat.setVal(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono pr-12"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-muted-foreground">
                      Credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: YOLO and Duration */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground border-b border-border/60 pb-2">
              IoT Gateway Configuration
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">YOLO Threshold</span>
                <span className="font-mono font-bold text-emerald-500">{yoloThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={yoloThreshold}
                onChange={(e) => setYoloThreshold(parseInt(e.target.value) || 75)}
                className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Objects detected with confidence below this threshold will be rejected.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-muted-foreground">Session Duration</span>
                <span className="font-mono font-bold text-emerald-500">{sessionDuration}s</span>
              </div>
              <input
                type="range"
                min="30"
                max="180"
                step="30"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(parseInt(e.target.value) || 60)}
                className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Length of the active slot deposit window in seconds before automated timeout.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Commit System Settings
            </button>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-start gap-3 border border-emerald-500/10">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-bold text-xs">Safe Configuration</h5>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                These configs are transmitted to university smart recycling terminal slots via WebSockets.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
