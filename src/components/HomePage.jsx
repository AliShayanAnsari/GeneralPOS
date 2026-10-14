"use client";

import React, { useState } from "react";
import {
  HeroArchitectureDiagram,
  InteractiveSystemDiagrams,
} from "./AnimatedDiagrams";
import {
  Terminal,
  ShieldCheck,
  Zap,
  ScanBarcode,
  Printer,
  Layers,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Lock,
  UserPlus,
  LogIn,
  Sparkles,
  Globe,
  GitBranch,
  Rocket,
  CreditCard,
  Package,
  RefreshCw,
} from "lucide-react";
import { CURRENCY_OPTIONS } from "../data/initialData";

export default function HomePage({
  onAuthenticatedLaunch,
  currentUser,
  onOpenDeployModal,
  storeSettings,
}) {
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("admin@progeneralpos.com");
  const [password, setPassword] = useState("••••••••••••");
  const [fullName, setFullName] = useState("Alex Morgan");
  const [customStoreName, setCustomStoreName] = useState(
    storeSettings?.storeName || "Pro General POS"
  );
  const [role, setRole] = useState("Store Manager (Full Admin)");
  const [selectedCurrency, setSelectedCurrency] = useState(
    storeSettings?.currency || "$"
  );
  const [authError, setAuthError] = useState("");

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    if (!email.trim()) {
      setAuthError("Please enter a valid work email address.");
      return;
    }
    const userPayload = {
      name: authMode === "signup" ? fullName || "Store Owner" : "Alex Morgan",
      email: email.trim(),
      role: role,
      storeName:
        authMode === "signup" && customStoreName.trim()
          ? customStoreName.trim()
          : storeSettings?.storeName || "Pro General POS",
      currency: selectedCurrency,
    };
    onAuthenticatedLaunch(userPayload);
  };

  const handleQuickRoleLaunch = (presetName, presetRole, presetEmail) => {
    onAuthenticatedLaunch({
      name: presetName,
      email: presetEmail,
      role: presetRole,
      storeName: storeSettings?.storeName || "Pro General POS",
      currency: selectedCurrency,
    });
  };

  return (
    <div className="pos-homepage-root">
      {/* Top Sticky Glass Header */}
      <header className="pos-home-header">
        <div className="pos-home-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="pos-brand-logo">
              <ScanBarcode size={22} color="#090D16" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
                  Pro General POS
                </span>
                <span className="pos-version-pill">v2.4 ENTERPRISE</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                Next.js • React 18 • Cloud & Offline-First Retail OS
              </div>
            </div>
          </div>

          <nav className="pos-home-nav">
            <a href="#live-diagrams" className="pos-home-nav-link">
              Animated Diagrams
            </a>
            <a href="#features-matrix" className="pos-home-nav-link">
              All Features
            </a>
            <a href="#auth-portal" className="pos-home-nav-link">
              Sign In / Sign Up
            </a>
            <button
              type="button"
              onClick={onOpenDeployModal}
              className="pos-btn-secondary"
              style={{ padding: "8px 14px", fontSize: "12.5px" }}
            >
              <GitBranch size={14} />
              <span>GitHub & Vercel Setup</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickRoleLaunch(
                  currentUser?.name || "Alex Morgan",
                  currentUser?.role || "Store Manager (Full Admin)",
                  currentUser?.email || "admin@progeneralpos.com"
                )
              }
              className="pos-btn-primary"
              style={{ padding: "9px 18px", fontSize: "13px" }}
            >
              <Terminal size={15} />
              <span>Launch Live POS Terminal</span>
              <ArrowRight size={14} />
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION WITH ANIMATED ARCHITECTURE DIAGRAM + AUTH PORTAL */}
      <section className="pos-hero-section">
        <div className="pos-hero-container">
          {/* Left Column: Brand Value Prop + Live Animated Diagram */}
          <div className="pos-hero-left">
            <div className="pos-hero-eyebrow">
              <Sparkles size={14} color="#10B981" />
              <span>BUILT FOR SUPERMARKETS, GENERAL STORES, PHARMACIES & B2B WHOLESALE</span>
            </div>

            <h1 className="pos-hero-title">
              The Fastest, Most Complete{" "}
              <span className="pos-gradient-text">Pro General POS</span>{" "}
              Ever Built for Modern Retail.
            </h1>

            <p className="pos-hero-subtitle">
              Engineered with Next.js and React for zero-latency barcode checkout, dual
              Retail & Wholesale pricing tiers, multi-tender split payments, customer
              credit ledgers, printable barcode label sheets, and automated Shift Z-Reports.
            </p>

            {/* Quick Action Row */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "26px" }}>
              <button
                type="button"
                onClick={() =>
                  handleQuickRoleLaunch(
                    "Alex Morgan",
                    "Store Manager (Full Admin)",
                    "admin@progeneralpos.com"
                  )
                }
                className="pos-btn-primary pos-btn-lg"
              >
                <Zap size={18} />
                <span>Open Live POS Terminal Instantly</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="#auth-portal"
                className="pos-btn-secondary pos-btn-lg"
                style={{ textDecoration: "none" }}
              >
                <UserPlus size={17} />
                <span>Create Store Account (Free)</span>
              </a>

              <button
                type="button"
                onClick={onOpenDeployModal}
                className="pos-btn-secondary pos-btn-lg"
              >
                <Rocket size={17} color="#38BDF8" />
                <span>Deploy to Vercel & GitHub</span>
              </button>
            </div>

            {/* Interactive Hero Animated Diagram */}
            <HeroArchitectureDiagram
              onLaunchPos={() =>
                handleQuickRoleLaunch(
                  "Alex Morgan",
                  "Store Manager (Full Admin)",
                  "admin@progeneralpos.com"
                )
              }
            />
          </div>

          {/* Right Column: Sign In / Sign Up Card + 1-Click Cashier Launch */}
          <div id="auth-portal" className="pos-auth-card">
            <div className="pos-auth-tabs">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`pos-auth-tab ${authMode === "login" ? "active" : ""}`}
              >
                <LogIn size={15} />
                <span>Sign In to Terminal</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`pos-auth-tab ${authMode === "signup" ? "active" : ""}`}
              >
                <UserPlus size={15} />
                <span>Register New Store</span>
              </button>
            </div>

            <div style={{ padding: "22px" }}>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#F8FAFC" }}>
                  {authMode === "login"
                    ? "Access Pro General POS"
                    : "Create Your Free Store Account"}
                </h2>
                <p style={{ margin: "5px 0 0", fontSize: "12.5px", color: "#94A3B8" }}>
                  {authMode === "login"
                    ? "Sign in with your operator credentials or use 1-Click Instant Cashier Access below."
                    : "Configure your store name, default currency, and operator profile in seconds."}
                </p>
              </div>

              {authError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.14)",
                    border: "1px solid #EF4444",
                    color: "#FCA5A5",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    marginBottom: "14px",
                  }}
                >
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                {authMode === "signup" && (
                  <>
                    <div>
                      <label className="pos-field-label">Store / Business Name</label>
                      <input
                        type="text"
                        value={customStoreName}
                        onChange={(e) => setCustomStoreName(e.target.value)}
                        placeholder="e.g., Pro General POS Supermarket"
                        className="pos-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="pos-field-label">Full Name (Manager / Cashier)</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Alex Morgan"
                        className="pos-input"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="pos-field-label">Operator Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@progeneralpos.com"
                    className="pos-input"
                    required
                  />
                </div>

                <div>
                  <label className="pos-field-label">Security Password / PIN</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password or 4-digit PIN"
                    className="pos-input"
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label className="pos-field-label">Operator Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="pos-input"
                    >
                      <option value="Store Manager (Full Admin)">Store Manager (Admin)</option>
                      <option value="Head Cashier (Register)">Head Cashier</option>
                      <option value="Inventory Supervisor">Inventory Supervisor</option>
                    </select>
                  </div>
                  <div>
                    <label className="pos-field-label">Store Currency</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="pos-input"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.symbol}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="pos-btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "14px", marginTop: "4px" }}
                >
                  <Lock size={15} />
                  <span>
                    {authMode === "login"
                      ? "Sign In & Launch POS Terminal"
                      : "Create Account & Launch POS"}
                  </span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Divider */}
              <div className="pos-auth-divider">
                <span>OR 1-CLICK INSTANT DEMO OPERATOR ACCESS</span>
              </div>

              {/* 1-Click Role Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickRoleLaunch(
                      "Alex Morgan",
                      "Store Manager (Full Admin)",
                      "alex.morgan@progeneralpos.com"
                    )
                  }
                  className="pos-quick-role-btn"
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#F8FAFC", fontSize: "13px" }}>
                      Instant Login: Store Manager (Full Admin)
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                      All 8 Modules • POS Register, Inventory, Z-Report, Analytics
                    </div>
                  </div>
                  <ArrowRight size={15} color="#10B981" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickRoleLaunch(
                      "Jordan Lee",
                      "Head Cashier (Express Counter)",
                      "jordan.lee@progeneralpos.com"
                    )
                  }
                  className="pos-quick-role-btn"
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#F8FAFC", fontSize: "13px" }}>
                      Instant Login: Head Cashier (Express Counter)
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "11px", color: "#60A5FA" }}>
                      High-Speed Barcode Checkout • Split Tender • Thermal Print
                    </div>
                  </div>
                  <ArrowRight size={15} color="#3B82F6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SYSTEM DIAGRAMS SECTION */}
      <section id="live-diagrams" className="pos-section-block">
        <div className="pos-section-container">
          <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 28px" }}>
            <span className="pos-section-tag">LIVE ANIMATED SYSTEM ARCHITECTURE</span>
            <h2 className="pos-section-heading">
              Visualizing the Engineering Behind Pro General POS
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "14.5px", lineHeight: 1.6, margin: 0 }}>
              Explore our interactive, real-time animated diagrams illustrating the 0.2-second
              express checkout pipeline, hybrid offline-first storage engine, and closed-loop
              inventory & profit waterfall.
            </p>
          </div>

          <InteractiveSystemDiagrams />
        </div>
      </section>

      {/* ALL-INCLUSIVE FREE FEATURES & MARKET COMPARISON SECTION */}
      <section id="features-matrix" className="pos-section-block" style={{ background: "rgba(15, 23, 42, 0.45)" }}>
        <div className="pos-section-container">
          <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 32px" }}>
            <span className="pos-section-tag">100% UNLOCKED ENTERPRISE CAPABILITIES</span>
            <h2 className="pos-section-heading">
              Every Feature You Need to Outperform Legacy POS Systems
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "14.5px", lineHeight: 1.6, margin: 0 }}>
              Zero monthly subscription lock-ins, zero per-terminal fees, and zero artificial
              SKU limits. Everything is built right in and ready to deploy on Vercel & GitHub.
            </p>
          </div>

          <div className="pos-feature-grid">
            {[
              {
                icon: ScanBarcode,
                color: "#3B82F6",
                title: "Laser Barcode & Acoustic Wedge",
                desc: "Scan EAN-13/UPC barcodes via hardware laser scanner or simulate scans in 1 click with synthesized Web Audio beep feedback.",
              },
              {
                icon: Layers,
                color: "#10B981",
                title: "Dual Retail & Wholesale Tiers",
                desc: "Switch any transaction between standard Retail pricing and B2B Wholesale tier pricing with a single toggle on the register.",
              },
              {
                icon: CreditCard,
                color: "#8B5CF6",
                title: "5-Way Multi-Tender & Split Pay",
                desc: "Accept Cash (with quick denomination change calculator), Card, Dynamic QR Wallet, Customer Credit Ledger, or Split Cash + Card.",
              },
              {
                icon: RefreshCw,
                color: "#F59E0B",
                title: "Hold / Park & Recall Bills",
                desc: "Park an active customer cart in 1 click while they grab another item, serve the next shopper immediately, and recall the parked bill anytime.",
              },
              {
                icon: Printer,
                color: "#06B6D4",
                title: "80mm Thermal Receipt & Barcode Studio",
                desc: "Print standard 80mm thermal receipts with itemized tax breakdowns, plus generate printable barcode price sticker sheets for shelves.",
              },
              {
                icon: Users,
                color: "#EC4899",
                title: "Customer Loyalty & Credit Ledger",
                desc: "Track VIP customer points, manage B2B credit limits (Buy Now, Pay Later), and record credit settlement payments with full audit history.",
              },
              {
                icon: Package,
                color: "#22C55E",
                title: "1-Click Returns & Auto-Restock",
                desc: "Process full or partial invoice refunds in seconds—returned items are automatically added back to live inventory counts.",
              },
              {
                icon: BarChart3,
                color: "#38BDF8",
                title: "Cash Drawer & Shift Z-Report",
                desc: "Track opening float, petty cash store expenses, expected vs. counted drawer cash, gross margin, COGS, and printable Shift Z-Reports.",
              },
            ].map((feat, i) => {
              const IconComp = feat.icon;
              return (
                <div key={i} className="pos-feature-card">
                  <div
                    className="pos-feature-icon"
                    style={{ background: `${feat.color}18`, borderColor: `${feat.color}40` }}
                  >
                    <IconComp size={20} color={feat.color} />
                  </div>
                  <h3 style={{ margin: "14px 0 6px", fontSize: "15.5px", fontWeight: 700, color: "#F8FAFC" }}>
                    {feat.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", lineHeight: 1.55 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pos-home-footer">
        <div className="pos-section-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="pos-brand-logo" style={{ width: "30px", height: "30px" }}>
              <ScanBarcode size={17} color="#090D16" />
            </div>
            <span style={{ fontWeight: 800, color: "#F8FAFC", fontSize: "15px" }}>
              Pro General POS
            </span>
            <span style={{ color: "#64748B", fontSize: "12.5px" }}>
              © 2026 Pro General POS • Built with Next.js & React • Ready for Vercel & GitHub
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={onOpenDeployModal}
              className="pos-btn-secondary"
              style={{ padding: "8px 14px", fontSize: "12px" }}
            >
              <GitBranch size={14} />
              <span>GitHub & Vercel Deployment Guide</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickRoleLaunch(
                  "Alex Morgan",
                  "Store Manager (Full Admin)",
                  "admin@progeneralpos.com"
                )
              }
              className="pos-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              <span>Launch POS Terminal →</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
