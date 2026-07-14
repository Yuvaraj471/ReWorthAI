"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  QrCode,
  ArrowRight,
  Sparkles,
  Coins,
  Trophy,
  History,
  TrendingUp,
  Cpu,
  Coffee,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  X,
  ChevronDown,
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const { addToast } = useToastStore();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Thank you for your message! Our campus eco team will get back to you.", "success");
    (e.target as HTMLFormElement).reset();
  };

  const faqItems = [
    {
      q: "How do EcoCredits work?",
      a: "For every item you deposit in a ReWorth slot, our camera identifies the material (e.g. plastic bottle, metal can, glass) and awards corresponding EcoCredits to your campus student wallet based on weights and categories.",
    },
    {
      q: "Which waste categories are accepted?",
      a: "We currently verify Plastic Bottles, Plastic Bags, Cardboard, Glass Containers, Paper, Biodegradables, and Metal Cans. Non-recyclables are flagged by the AI and returned or routed to appropriate landfills without credit rewards.",
    },
    {
      q: "How rewards are redeemed?",
      a: "Once you have accumulated enough credits, visit the Rewards Shop in your dashboard to purchase Cafe vouchers, stationery discount cards, and university merchandise. A unique code is generated for in-person campus store collections.",
    },
    {
      q: "How does AI detection work?",
      a: "The smart slots use a YOLO (You Only Look Once) computer vision model running locally on the IoT gateway to analyze the camera feed, detect target recyclables in real time, and verify deposit counts.",
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent -z-10" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl -z-10" />

      {/* Header Navbar */}
      <header className="sticky top-0 z-40 w-full glass border-b border-border py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-lime-500 flex items-center justify-center shadow-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
            ReWorth AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold hover:text-emerald-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-4.5 py-2.5 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:scale-[1.02] cursor-pointer"
          >
            Enter Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-500 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            AI-Powered Smart Recycling
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            Turn Campus Waste <br />
            Into <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">Eco Rewards</span>
          </h1>

          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl">
            ReWorth AI bridges computer vision and campus sustainability. Scan the QR code on any smart recycling slot, deposit your containers, and earn instant credits for coffee, books, and merchandise.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/5 font-semibold transition-all text-xs cursor-pointer text-foreground bg-transparent"
            >
              <QrCode className="w-4 h-4 text-emerald-500" />
              Scan Slot QR Code
            </button>
          </div>

          {/* Quick Statistics preview grid */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/80 max-w-md">
            <div>
              <span className="block text-2xl md:text-3xl font-extrabold text-foreground font-mono">0</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Active Students</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-extrabold text-foreground font-mono">0</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Units Deposited</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-extrabold text-foreground font-mono">0</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Credits Distributed</span>
            </div>
          </div>
        </div>

        {/* Hero visual mock layout */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Main glass frame previewing dashboard UI */}
          <div className="relative w-full max-w-md aspect-[4/3] glass-card rounded-2xl p-6 border border-emerald-500/15 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/5 rounded-full blur-2xl -z-10" />
            
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">IoT Recycling Active Feed</span>
              <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded text-[8px] text-emerald-500 font-extrabold uppercase animate-pulse">
                Live YOLO Scan
              </div>
            </div>

            {/* Simulated AI box tracking bottle */}
            <div className="relative w-full aspect-video rounded-xl bg-black flex items-center justify-center overflow-hidden border border-border">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20" />
              
              {/* Bounding box mock overlay */}
              <div className="absolute border-2 border-emerald-500 p-2.5 rounded bg-emerald-500/5 shadow-lg shadow-emerald-500/10 text-center select-none scale-105">
                <span className="block text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 mb-0.5">
                  PLASTIC BOTTLE
                </span>
                <span className="text-[8px] text-white/80 font-mono">
                  CONFIDENCE: 94.8%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mt-4 font-semibold text-muted-foreground">
              <span>Slot ID: SLOT-SOUTH-04</span>
              <span className="text-emerald-500 font-bold">+15 Credits Distributed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 md:px-12 bg-black/10 dark:bg-white/1">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-black tracking-tight">Eco-friendly Technology Stack</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore the system features designed to automate and promote sustainable recycling practices on campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feat 1 */}
            <div className="glass-card p-6 rounded-2xl border border-border/80 hover:border-emerald-500/30 hover:scale-[1.02] transition-all">
              <Cpu className="w-8 h-8 text-emerald-500 mb-4" />
              <h4 className="font-bold text-base mb-1.5">AI Object Detection</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                YOLO computer vision models identify container types, verify materials, and avoid credit frauds instantly.
              </p>
            </div>
            {/* Feat 2 */}
            <div className="glass-card p-6 rounded-2xl border border-border/80 hover:border-emerald-500/30 hover:scale-[1.02] transition-all">
              <Coins className="w-8 h-8 text-lime-500 mb-4" />
              <h4 className="font-bold text-base mb-1.5">Instant EcoCredits</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                EcoCredits are calculated and wired straight to your student account within seconds of depositing materials.
              </p>
            </div>
            {/* Feat 3 */}
            <div className="glass-card p-6 rounded-2xl border border-border/80 hover:border-emerald-500/30 hover:scale-[1.02] transition-all">
              <Coffee className="w-8 h-8 text-cyan-500 mb-4" />
              <h4 className="font-bold text-base mb-1.5">Smart Rewards</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spend credits on organic cafe items, campus stationery shops, and university bookstore discount cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-black tracking-tight">How ReWorth AI Works</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Follow these five simple steps to deposit materials and start earning rewards.
          </p>
        </div>

        {/* Timeline representation */}
        <div className="relative border-l-2 border-emerald-500/20 max-w-2xl mx-auto pl-8 space-y-10">
          {[
            { step: "01", title: "Scan Slot QR Code", desc: "Locate any smart recycling slot on campus and scan its QR code using your phone camera." },
            { step: "02", title: "Initiate Active Session", desc: "Unlock the slot container hatch door by tapping 'Start Recycling Session' inside the portal." },
            { step: "03", title: "Deposit Waste Containers", desc: "Drop your empty plastic bottles, metal cans, or glassware into the deposit slot slot one by one." },
            { step: "04", title: "AI Object Detection", desc: "Our local YOLO vision gateway identifies the items in real time and calculates credit payouts." },
            { step: "05", title: "Collect Eco Vouchers", desc: "Finalize deposit, accumulate credits, and redeem vouchers instantly in the shop catalog." },
          ].map((item, idx) => (
            <div key={idx} className="relative">
              {/* Dot marker */}
              <div className="absolute -left-[41px] top-1.5 bg-gradient-to-tr from-emerald-500 to-lime-500 w-5 h-5 rounded-full border-4 border-background shadow" />
              <div>
                <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">{item.step}</span>
                <h4 className="font-bold text-base mt-0.5">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12 bg-black/10 dark:bg-white/1">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about EcoCredits, YOLO recognition, and rewards verification.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="glass-card rounded-xl border border-border/80 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {faq.q}
                    <ChevronDown className={`w-4 h-4 text-emerald-500 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-border/40 text-xs text-muted-foreground leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight">Contact Eco Team</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Have questions regarding recycling operations, rewards partnerships, or hardware issues? Reach out to our campus office.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3.5">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span>support@reworth.ai</span>
              </div>
              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-emerald-500" />
                <span>+1 (555) 231-1082</span>
              </div>
              <div className="flex items-center gap-3.5">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <span>Green Campus Office, Hub 4, Suite 120</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-2xl border border-border/80">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <input required type="text" className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                  <input required type="email" className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                <input required type="text" className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Message</label>
                <textarea required rows={4} className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none" />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-black/10 dark:bg-white/1 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-400 to-lime-500 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm text-foreground">ReWorth AI</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-semibold">
            <Link href="/" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Globe className="w-4 h-4" /> Github
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Share2 className="w-4 h-4" /> Linkedin
            </a>
          </div>

          <p className="font-medium">&copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> ReWorth AI. All campus rights reserved.</p>
        </div>
      </footer>

      {/* Interactive QR Scan Simulator Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm glass-card p-6 rounded-2xl border border-border text-center z-10"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                <QrCode className="w-6 h-6 text-emerald-500" />
              </div>

              <h3 className="font-extrabold text-base mb-1">Recycle Terminal Scanner</h3>
              <p className="text-xs text-muted-foreground mb-6">
                Point your phone at the slot machine screen to establish a WebSocket deposit link.
              </p>

              {/* QR representation */}
              <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-border mx-auto mb-6 flex items-center justify-center shadow-lg">
                {/* Simulated QR block dots */}
                <div className="w-full h-full bg-[radial-gradient(#000_3.5px,transparent_3.5px)] [background-size:12px_12px] opacity-80" />
              </div>

              <Link
                href="/login"
                className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign In to Link Session
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
