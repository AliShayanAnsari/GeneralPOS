"use client";

import React, { useState } from "react";
import {
  HeroArchitectureDiagram,
  InteractiveSystemDiagrams,
} from "./AnimatedDiagrams";
import {
  Terminal,
  Zap,
  ScanBarcode,
  Printer,
  Layers,
  Users,
  BarChart3,
  ArrowRight,
  Lock,
  UserPlus,
  LogIn,
  Sparkles,
  GitBranch,
  Rocket,
  CreditCard,
  Package,
  RefreshCw,
  Calculator,
  Scale,
  Info,
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
  const [role, setRole] = useState("Point of Sale Administrator");
  const [selectedCurrency, setSelectedCurrency] = useState(
    storeSettings?.currency || "$"
  );

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    onAuthenticatedLaunch({
      name: authMode === "signup" ? fullName || "Store Manager" : "Alex Morgan",
      email: email.trim() || "admin@progeneralpos.com",
      role,
      storeName:
        authMode === "signup" && customStoreName.trim()
          ? customStoreName.trim()
          : storeSettings?.storeName || "Pro General POS",
      currency: selectedCurrency,
    });
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
      {/* Top Bright Odoo-Styled Header */}
      <header className="pos-home-header">
        <div className="pos-home-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="pos-brand-logo">
              <ScanBarcode size={21} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18.5px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
                  Pro General POS
                </span>
                <span className="pos-version-pill">ODOO 18 EDITION</span>
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                Bright & Simple Retail POS • Next.js + React
              </div>
            </div>
          </div>

          <nav className="pos-home-nav">
            <a href="#live-diagrams" className="pos-home-nav-link">
              Animated Diagrams
            </a>
            <a href="#features-matrix" className="pos-home-nav-link">
              Odoo POS Features
            </a>
            <a href="#auth-portal" className="pos-home-nav-link">
              Sign In / Sign Up
            </a>
            <button
              type="button"
              onClick={onOpenDeployModal}
              className="pos-btn-secondary"
            >
              <GitBranch size={14} />
              <span>GitHub & Vercel</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickRoleLaunch(
                  currentUser?.name || "Alex Morgan",
                  currentUser?.role || "Point of Sale Administrator",
                  currentUser?.email || "admin@progeneralpos.com"
                )
              }
              className="pos-btn-primary"
            >
              <Terminal size={15} />
              <span>Open POS Session</span>
              <ArrowRight size={14} />
            </button>
          </nav>
        </div>
      </header>

      {/* BRIGHT HERO SECTION */}
      <section className="pos-hero-section">
        <div className="pos-hero-container">
          {/* Left Column */}
          <div className="pos-hero-left">
            <div className="pos-hero-eyebrow">
              <Sparkles size={14} color="#714B67" />
              <span>SIMPLE, BRIGHT & ODOO-STYLE POINT OF SALE SYSTEM</span>
            </div>

            <h1 className="pos-hero-title">
              Run Your Store Effortlessly with{" "}
              <span className="pos-gradient-text">Pro General POS</span>
            </h1>

            <p className="pos-hero-subtitle">
              Designed with a clean, bright interface inspired by Odoo Point of Sale:
              interactive Numpad (<strong>Qty, % Disc, Price</strong>), Dynamic Pricelists,
              Product Info popups, Electronic Scale weighing, Refund / Credit Notes,
              Cash In/Out control, and Odoo-style Product Form sheets.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
              <button
                type="button"
                onClick={() =>
                  handleQuickRoleLaunch(
                    "Alex Morgan",
                    "Point of Sale Administrator",
                    "admin@progeneralpos.com"
                  )
                }
                className="pos-btn-primary pos-btn-lg"
              >
                <Zap size={17} />
                <span>Open POS Register Session</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="#auth-portal"
                className="pos-btn-secondary pos-btn-lg"
                style={{ textDecoration: "none" }}
              >
                <UserPlus size={16} />
                <span>Sign Up New Store</span>
              </a>

              <button
                type="button"
                onClick={onOpenDeployModal}
                className="pos-btn-secondary pos-btn-lg"
              >
                <Rocket size={16} color="#017E84" />
                <span>GitHub & Vercel Links</span>
              </button>
            </div>

            {/* Bright Animated Diagram */}
            <HeroArchitectureDiagram />
          </div>

          {/* Right Column: Bright Clean Sign In / Sign Up Card */}
          <div id="auth-portal" className="pos-auth-card">
            <div className="pos-auth-tabs">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`pos-auth-tab ${authMode === "login" ? "active" : ""}`}
              >
                <LogIn size={15} />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`pos-auth-tab ${authMode === "signup" ? "active" : ""}`}
              >
                <UserPlus size={15} />
                <span>Sign Up Store</span>
              </button>
            </div>

            <div style={{ padding: "22px" }}>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "#0F172A" }}>
                  {authMode === "login"
                    ? "Sign In to Pro General POS"
                    : "Create Your Free Store Account"}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748B" }}>
                  {authMode === "login"
                    ? "Enter your operator details or click 1-Click Demo Login below."
                    : "Set up your store name, default currency, and POS operator role."}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {authMode === "signup" && (
                  <>
                    <div>
                      <label className="pos-field-label">Store / Shop Name</label>
                      <input
                        type="text"
                        value={customStoreName}
                        onChange={(e) => setCustomStoreName(e.target.value)}
                        placeholder="Pro General POS"
                        className="pos-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="pos-field-label">Your Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="pos-input"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="pos-field-label">Email Address</label>
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
                  <label className="pos-field-label">Password / Cashier PIN</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password or PIN"
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
                      <option value="Point of Sale Administrator">POS Administrator</option>
                      <option value="Shop Floor Cashier">Shop Floor Cashier</option>
                      <option value="Inventory Manager">Inventory Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="pos-field-label">Default Currency</label>
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
                  style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "14px", marginTop: "4px" }}
                >
                  <Lock size={15} />
                  <span>
                    {authMode === "login"
                      ? "Sign In & Open POS Session"
                      : "Register & Launch POS"}
                  </span>
                  <ArrowRight size={15} />
                </button>
              </form>

              <div className="pos-auth-divider">
                <span>OR 1-CLICK INSTANT DEMO LOGIN</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickRoleLaunch(
                      "Alex Morgan",
                      "Point of Sale Administrator",
                      "alex@progeneralpos.com"
                    )
                  }
                  className="pos-quick-role-btn"
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "13px" }}>
                      1-Click Login: POS Administrator (All Odoo Modules)
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                      Register, Numpad, Products Form, Cash In/Out, Closing Control
                    </div>
                  </div>
                  <ArrowRight size={15} color="#714B67" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickRoleLaunch(
                      "Jordan Lee",
                      "Shop Floor Cashier",
                      "jordan@progeneralpos.com"
                    )
                  }
                  className="pos-quick-role-btn"
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "13px" }}>
                      1-Click Login: Shop Floor Cashier (Fast Checkout)
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#017E84", fontWeight: 600 }}>
                      Barcode Scan • Electronic Scale • Split Payment • 80mm Receipt
                    </div>
                  </div>
                  <ArrowRight size={15} color="#017E84" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED DIAGRAMS SECTION */}
      <section id="live-diagrams" className="pos-section-block">
        <div className="pos-section-container">
          <div style={{ textAlign: "center", maxWidth: "740px", margin: "0 auto 26px" }}>
            <span className="pos-section-tag">INTERACTIVE ANIMATED DIAGRAMS</span>
            <h2 className="pos-section-heading">
              How Pro General POS Connects Checkout, Inventory & Accounting
            </h2>
            <p style={{ color: "#475569", fontSize: "14.5px", lineHeight: 1.6, margin: 0 }}>
              Click through the three animated diagrams below to see the real-time checkout
              flow, offline-first browser storage, and automated warehouse stock moves.
            </p>
          </div>

          <InteractiveSystemDiagrams />
        </div>
      </section>

      {/* ODOO POS FEATURES MATRIX */}
      <section id="features-matrix" className="pos-section-block" style={{ background: "#FFFFFF" }}>
        <div className="pos-section-container">
          <div style={{ textAlign: "center", maxWidth: "740px", margin: "0 auto 30px" }}>
            <span className="pos-section-tag">AUTHENTIC ODOO POS CAPABILITIES</span>
            <h2 className="pos-section-heading">
              Every Odoo Point of Sale Feature Built Right In
            </h2>
            <p style={{ color: "#475569", fontSize: "14.5px", lineHeight: 1.6, margin: 0 }}>
              Simple, bright, fast, and packed with the exact fields and tools store owners love in Odoo.
            </p>
          </div>

          <div className="pos-feature-grid">
            {[
              {
                icon: Calculator,
                color: "#714B67",
                title: "Odoo Interactive Numpad (Qty, % Disc, Price)",
                desc: "Tap any orderline and use the built-in Odoo Numpad to type exact quantities, percentage discounts, or unit price overrides.",
              },
              {
                icon: Info,
                color: "#017E84",
                title: "Product Info 'i' Popup & Odoo Product Form",
                desc: "Inspect On-Hand & Forecasted warehouse stock, profit margins, tax rates, internal references, and supplier details right from the register.",
              },
              {
                icon: Layers,
                color: "#059669",
                title: "Dynamic Pricelists & Fiscal Positions",
                desc: "Switch between Public Retail, VIP Gold (-10%), B2B Wholesale, and Employee Pricelists, plus Domestic vs. Tax-Exempt Fiscal Positions.",
              },
              {
                icon: Scale,
                color: "#16A34A",
                title: "Electronic Scale Weighing (kg)",
                desc: "Sell weighted fresh produce & grocery items with the built-in Electronic Scale simulator that calculates price by exact weight (kg).",
              },
              {
                icon: RefreshCw,
                color: "#D97706",
                title: "Odoo Refund / Credit Note & Floating Orders",
                desc: "Hold multiple floating orders in the top bar (`0001`, `0002`), or click Refund to reverse any past order and restock warehouse inventory.",
              },
              {
                icon: CreditCard,
                color: "#2563EB",
                title: "Payment Screen with Formal Invoice Toggle",
                desc: "Accept Cash, Card, QR Wallet, Split Tenders, or Customer Credit Account, and toggle 'Invoice' to print a formal Tax Invoice.",
              },
              {
                icon: Package,
                color: "#7C3AED",
                title: "Cash In / Cash Out & Closing Session Control",
                desc: "Record petty cash movements with reasons during the shift and reconcile expected vs. counted drawer cash at Session Closing.",
              },
              {
                icon: Printer,
                color: "#DB2777",
                title: "80mm Thermal Receipt & Barcode Label Studio",
                desc: "Print clean 80mm receipts with Customer Notes & Order Notes, or generate printable barcode shelf sticker sheets.",
              },
            ].map((feat, i) => {
              const IconComp = feat.icon;
              return (
                <div key={i} className="pos-feature-card">
                  <div
                    className="pos-feature-icon"
                    style={{ background: `${feat.color}12`, borderColor: `${feat.color}35` }}
                  >
                    <IconComp size={20} color={feat.color} />
                  </div>
                  <h3 style={{ margin: "12px 0 6px", fontSize: "15.5px", fontWeight: 800, color: "#0F172A" }}>
                    {feat.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.55 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BRIGHT FOOTER */}
      <footer className="pos-home-footer">
        <div className="pos-section-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="pos-brand-logo" style={{ width: "30px", height: "30px" }}>
              <ScanBarcode size={16} color="#FFFFFF" />
            </div>
            <span style={{ fontWeight: 800, color: "#0F172A", fontSize: "15px" }}>
              Pro General POS
            </span>
            <span style={{ color: "#64748B", fontSize: "12.5px" }}>
              © 2026 Pro General POS • Bright Odoo-Style Retail Edition
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onOpenDeployModal}
              className="pos-btn-secondary"
            >
              <GitBranch size={14} />
              <span>GitHub & Vercel Deployment</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickRoleLaunch(
                  "Alex Morgan",
                  "Point of Sale Administrator",
                  "admin@progeneralpos.com"
                )
              }
              className="pos-btn-primary"
            >
              <span>Open POS Session →</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
