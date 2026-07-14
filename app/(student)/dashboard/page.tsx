"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useWebSocketStore } from "@/store/useWebSocketStore";
import { useRewardsStore } from "@/store/useRewardsStore";
import { useCameraStore } from "@/store/useCameraStore";
import { cameraService } from "@/services/CameraService";
import { detectionService } from "@/api/DetectionService";
import { DetectionOverlay, BoundingBox } from "@/components/shared/DetectionOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useCallback } from "react";
import {
  Coins,
  Trophy,
  Activity,
  Flame,
  Camera,
  Play,
  XCircle,
  Clock,
  Sparkles,
  TreePine,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { activeSession, startSession, cancelSession, completeSession, history, loadHistory, setLatestDetection } = useSessionStore();
  const { isConnected } = useWebSocketStore();
  const { rewards, loadRewards } = useRewardsStore();
  const { isActive, error, devices, selectedDeviceId, setDevices, setSelectedDeviceId } = useCameraStore();

  const [counter, setCounter] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSeenMap = useRef<Map<string, number>>(new Map());
  const lastAddedMap = useRef<Map<string, number>>(new Map());
  const [liveDetections, setLiveDetections] = useState<BoundingBox[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load state and history on mount
  useEffect(() => {
    setIsMounted(true);
    loadHistory();
    loadRewards();

    // Fetch available cameras
    cameraService.getCameras().then(cams => {
      setDevices(cams);
      const savedId = localStorage.getItem("rw_camera_id");
      if (savedId && cams.some(c => c.deviceId === savedId)) {
        setSelectedDeviceId(savedId);
      } else if (cams.length > 0) {
        // Prefer back camera if available
        const backCam = cams.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
        setSelectedDeviceId(backCam ? backCam.deviceId : cams[0].deviceId);
      }
    });
  }, [loadHistory, loadRewards, setDevices, setSelectedDeviceId]);

  // Handle number animation for EcoCredits
  useEffect(() => {
    if (!user) return;
    const start = 0;
    const end = user.ecoCredits;
    if (start === end) return;

    let startTime: number | null = null;
    const duration = 1000; // 1 second animation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const rate = Math.min(progress / duration, 1);
      setCounter(Math.floor(rate * end));
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [user?.ecoCredits, user]);

  const MIN_CONFIDENCE = 0.60;

  // Reset maps when session is idle
  useEffect(() => {
    if (activeSession.status === "idle") {
      lastSeenMap.current.clear();
      lastAddedMap.current.clear();
      setLiveDetections([]);
    }
  }, [activeSession.status]);

  // Camera Hardware Initialization
  useEffect(() => {
    let isMounted = true;
    
    if (videoRef.current) {
      cameraService.startCamera(videoRef.current, "environment", selectedDeviceId || undefined).catch(err => {
        if (isMounted) useCameraStore.getState().setError("Could not access camera");
        console.error(err);
      });
      
      cameraService.setFrameCallback(async (base64) => {
        const state = useSessionStore.getState();
        if (state.activeSession.status !== "scanning") return;

        try {
          const res = await detectionService.detectFrame(base64);
          if (res && res.detections && res.detections.length > 0) {
            const boxes = res.detections.map(d => ({
              id: Math.random().toString(),
              className: d.class,
              confidence: d.confidence,
              credits: d.credits,
              x: d.x,
              y: d.y,
              width: d.width,
              height: d.height
            }));
            setLiveDetections(boxes);
            
            const now = Date.now();
            
            // Re-check status in case it changed during the API call
            if (useSessionStore.getState().activeSession.status === "scanning") {
              res.detections.forEach(det => {
                if (det.confidence >= MIN_CONFIDENCE) {
                  const lastSeen = lastSeenMap.current.get(det.class) || 0;
                  const lastAdded = lastAddedMap.current.get(det.class) || 0;
                  
                  if (now - lastSeen > 2000 || !lastAdded) {
                     useSessionStore.getState().addDetection(det.class, det.confidence * 100, det.credits);
                     lastAddedMap.current.set(det.class, now);
                  }
                  
                  lastSeenMap.current.set(det.class, now);
                }
              });
            }
          } else {
            setLiveDetections(prev => prev.length > 0 ? [] : prev);
          }
        } catch (error) {
          console.warn("Detection error", error);
        }
      });
    }
    
    return () => {
      isMounted = false;
      cameraService.stopCamera();
    };
  }, [selectedDeviceId]);

  // Capture Loop Management
  useEffect(() => {
    if (activeSession.status === "scanning") {
      cameraService.startCapture(500);
    } else {
      cameraService.stopCapture();
      detectionService.cancelOngoingDetection();
      setLiveDetections([]);
    }
    
    return () => {
      cameraService.stopCapture();
      detectionService.cancelOngoingDetection();
    };
  }, [activeSession.status]);

  if (!isMounted || !user) {
    return (
      <div className="space-y-8 pb-12 animate-pulse px-4 md:px-0">
        <div className="h-32 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
          <div className="h-44 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
          <div className="h-44 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
          <div className="h-96 bg-black/5 dark:bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Calculate progress toward next reward
  const nextReward = rewards
    .filter((r) => r.cost > user.ecoCredits)
    .sort((a, b) => a.cost - b.cost)[0] || rewards.sort((a, b) => b.cost - a.cost)[0];

  const creditsNeeded = nextReward ? nextReward.cost : 500;
  const progressPercent = Math.min((user.ecoCredits / creditsNeeded) * 100, 100);

  // Filter local history for today
  const todayDate = new Date().toISOString().split("T")[0];
  const todayRecycled = history.filter((h) => h.date === todayDate).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-emerald-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-lime-500/10 rounded-full blur-2xl -z-10" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider">
              Student Dashboard
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Updated live</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Welcome back, <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">{user.name}</span>!
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg">
            Your recycling sessions on campus have saved <span className="text-emerald-500 font-semibold">{user.carbonSaved} kg of CO2</span>. Keep it up!
          </p>
        </div>

        {/* Start Deposit Session Trigger */}
        {activeSession.status === "idle" ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={startSession}
            aria-label="Start Recycling Session"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all text-sm w-full md:w-auto justify-center cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            Start Recycling Session
          </motion.button>
        ) : (
          <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-emerald-500 font-semibold text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Active Session: {activeSession.id}
          </div>
        )}
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* EcoCredits Balance Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute top-4 right-4 p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">EcoCredits Balance</p>
            <h3 className="text-4xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white to-gray-300 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {counter}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active student balance</span>
          </div>
        </div>

        {/* Global Rank Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute top-4 right-4 p-3 bg-lime-500/10 rounded-xl text-lime-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Leaderboard Rank</p>
            <h3 className="text-4xl font-extrabold tracking-tight mt-2">
              #{user.rank}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Top <span className="text-lime-500 font-semibold">12%</span> on campus leaderboard
          </p>
        </div>

        {/* Carbon Offset Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute top-4 right-4 p-3 bg-cyan-500/10 rounded-xl text-cyan-500">
            <TreePine className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Carbon Offset Saved</p>
            <h3 className="text-4xl font-extrabold tracking-tight mt-2 text-cyan-400">
              {user.carbonSaved} kg
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Equivalent to planting <span className="text-cyan-400 font-semibold">{(user.carbonSaved * 0.04).toFixed(1)} trees</span>
          </p>
        </div>
      </div>

      {/* Active Recycling Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Camera/Scanner Feed Module */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative flex flex-col border border-emerald-500/30 active-ring overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <h4 className="font-bold text-sm">Live AI Camera Feed</h4>
                </div>
                <div className="flex items-center gap-4">
                  {devices.length > 0 && (
                    <select
                      className="bg-black/20 border border-emerald-500/20 text-emerald-500 text-xs rounded-lg px-2 py-1 outline-none max-w-[150px] truncate"
                      value={selectedDeviceId || ""}
                      onChange={(e) => {
                        setSelectedDeviceId(e.target.value);
                        localStorage.setItem("rw_camera_id", e.target.value);
                      }}
                    >
                      {devices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.substring(0, 5)}...`}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="flex items-center gap-2 bg-emerald-500/15 px-3 py-1 rounded-full text-emerald-500 text-xs font-semibold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Stream active
                  </div>
                </div>
              </div>

              {/* REAL CAMERA FEED VIEWPORT */}
              <div className="relative aspect-video w-full rounded-xl bg-black flex items-center justify-center border border-border overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent top-0 animate-[bounce_3s_infinite_linear] pointer-events-none" />

                <DetectionOverlay detections={liveDetections} />

                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20" role="alert" aria-live="assertive">
                    <div className="text-center p-6 bg-black/50 rounded-2xl border border-rose-500/20 backdrop-blur-sm max-w-[80%]">
                      <Camera className="w-10 h-10 text-rose-500 mb-3 mx-auto opacity-80" aria-hidden="true" />
                      <p className="text-rose-500 text-sm font-semibold">{error}</p>
                      <p className="text-rose-400/80 text-xs mt-2">Please check browser permissions.</p>
                    </div>
                  </div>
                )}
                
                {liveDetections.length === 0 && !error && (
                  <div className="text-center text-muted-foreground p-6 z-10 pointer-events-none absolute" aria-hidden="true">
                    <Sparkles className="w-8 h-8 mx-auto text-emerald-500/40 mb-2 animate-bounce" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500/80 mb-1 drop-shadow-md">
                      Ready for Deposit
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons inside the active console */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/80">
                <button
                  onClick={cancelSession}
                  disabled={activeSession.status !== "scanning"}
                  aria-label="Cancel Deposit Session"
                  aria-disabled={activeSession.status !== "scanning"}
                  className="flex items-center gap-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/5 px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" aria-hidden="true" />
                  Cancel Deposit Session
                </button>
                
                <button
                  onClick={completeSession}
                  disabled={activeSession.status !== "scanning"}
                  aria-label={activeSession.status === "completed" ? "Finalizing Session" : "Finalize and Collect Credits"}
                  aria-disabled={activeSession.status !== "scanning"}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activeSession.status === "completed" ? "Finalizing..." : "Finalize & Collect Credits"}
                </button>
              </div>
            </div>

            {/* Session Timer & Current Session Items */}
            <div className="space-y-6">
              {/* Timer Card */}
              <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center relative border border-emerald-500/20">
                <Clock className="w-8 h-8 text-emerald-500 mb-2 animate-[pulse_2s_infinite]" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Session Timer Remaining
                </p>
                <h4 className="text-4xl font-extrabold tracking-tighter text-emerald-400 font-mono mb-4">
                  {activeSession.timeLeft}s
                </h4>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-1000"
                    style={{ width: `${(activeSession.timeLeft / 60) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Session Scanned List */}
              <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col justify-between min-h-[220px]">
                <div>
                  <h4 className="font-bold text-sm mb-4 border-b border-border/80 pb-2">
                    Current Session Deposits
                  </h4>
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {activeSession.detections.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">
                        No deposits detected yet.
                      </p>
                    ) : (
                      activeSession.detections.map((det) => (
                        <div
                          key={det.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 text-xs"
                        >
                          <div>
                            <p className="font-semibold">{det.category}</p>
                            <p className="text-[10px] text-muted-foreground">{det.timestamp}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-500">+{det.credits}</span>
                            <p className="text-[10px] text-muted-foreground">{det.confidence}%</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {activeSession.detections.length > 0 && (
                  <div className="border-t border-border/80 pt-3 mt-3 flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Session Total:</span>
                    <span className="text-emerald-500 font-bold">{activeSession.totalCredits} EcoCredits</span>
                  </div>
                )}
              </div>
            </div>
      </div>

      {/* Main Grid: Left = Progress & History, Right = Mini Leaderboard & Profile summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress toward Next Reward */}
          {nextReward && (
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-md mb-1 flex items-center gap-2">
                    EcoCredits Reward Road
                    <Sparkles className="w-4 h-4 text-emerald-500 fill-current" />
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Unlock <span className="font-semibold text-foreground">{nextReward.title}</span> ({nextReward.cost} credits)
                  </p>
                </div>
                <Link
                  href="/rewards"
                  className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 group"
                >
                  Rewards Shop
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-border rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-lime-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{user.ecoCredits} credits earned</span>
                <span className="text-emerald-500 font-bold">
                  {Math.max(0, creditsNeeded - user.ecoCredits)} credits until unlock
                </span>
              </div>
            </div>
          )}

          {/* Recycling History */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border/80 pb-3">
              <h4 className="font-bold text-md">Recent Recycling Activity</h4>
              <Link
                href="/activity"
                className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 group"
              >
                View Full Logs
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase border-b border-border/60">
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Credits</th>
                    <th className="pb-3 font-semibold">Confidence</th>
                    <th className="pb-3 font-semibold">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {history.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-medium">{log.category}</td>
                      <td className="py-3.5">
                        <span className="text-emerald-500 font-bold">+{log.credits}</span>
                      </td>
                      <td className="py-3.5 font-mono text-xs">{log.confidence}%</td>
                      <td className="py-3.5 text-muted-foreground text-xs">
                        {log.date} at {log.time}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                        No recycling logs recorded yet. Start a session above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Pane: Profile card & Streak summary */}
        <div className="space-y-8">
          {/* Quick Profile Summary */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 rounded-full blur-xl" />
            <h4 className="font-bold text-sm mb-4">Student Profile Summary</h4>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-lime-500/10 border border-emerald-500/25 flex items-center justify-center font-bold text-xl text-emerald-500">
                {user.name.charAt(0)}
              </div>
              <div>
                <h5 className="font-bold leading-tight">{user.name}</h5>
                <p className="text-xs text-muted-foreground mt-0.5">{user.registerNumber}</p>
                <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full mt-1.5">
                  {user.department}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/80 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-semibold">{user.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year Level:</span>
                <span className="font-semibold">{user.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sessions:</span>
                <span className="font-semibold">{user.totalSessions} deposits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recycled Items:</span>
                <span className="font-semibold">{user.bottlesRecycled} units</span>
              </div>
            </div>
          </div>

          {/* Quick Stats / Streak Indicator */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-lime-500/10">
            <div className="absolute top-4 right-4 text-lime-500">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="font-bold text-sm mb-2">Recycling Fire Streak</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Recycle at least once a week to keep your multiplier burning!
            </p>
            
            <div className="bg-black/10 dark:bg-white/5 border border-border/60 rounded-xl p-4 flex items-center gap-4">
              <div className="text-center">
                <span className="block text-3xl font-extrabold text-lime-400 font-mono">5</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Weeks</span>
              </div>
              <div className="border-l border-border h-10" />
              <div className="text-xs">
                <p className="font-bold text-foreground">1.2x Credit Multiplier</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Active bonus! You are earning extra credits per deposit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
