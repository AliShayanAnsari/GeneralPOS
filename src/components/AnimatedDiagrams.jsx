"use client";

import React, { useState, useEffect } from "react";
import {
  ScanBarcode,
  ShoppingCart,
  CreditCard,
  PackageCheck,
  Printer,
  Cpu,
  Wifi,
  Database,
  RefreshCw,
  ArrowRight,
  Zap,
  CheckCircle2,
  TrendingUp,
  Layers,
  ShieldCheck,
  Play,
  Activity,
} from "lucide-react";

const HERO_NODES = [
  {
    id: "scanner",
    step: "01",
    title: "Omni-Scanner Input",
    subtitle: "Laser Barcode • SKU • Touch",
    latency: "8ms",
    throughput: "120 scans/min",
    color: "#3B82F6",
    x: 95,
    y: 110,
    details:
      "Supports USB/Bluetooth laser barcode wedges, keyboard shortcut search (/ or F2), and instant 1-tap category grid filtering with Web Audio acoustic beep confirmation.",
    metrics: [
      { label: "Scan Recognition", value: "99.98%" },
      { label: "Wedge Latency", value: "< 8 ms" },
      { label: "Formats", value: "EAN-13 / Code128" },
    ],
  },
  {
    id: "cart",
    step: "02",
    title: "Smart Cart & Pricing Core",
    subtitle: "Retail / Wholesale • Hold Bill",
    latency: "4ms",
    throughput: "Zero-Lag State",
    color: "#10B981",
    x: 360,
    y: 75,
    details:
      "Real-time calculation engine handling Retail vs. Wholesale price tiers, per-line custom discounts, promo codes, tax toggling, and multi-slot Bill Parking (Hold & Recall).",
    metrics: [
      { label: "Pricing Tiers", value: "Retail + Wholesale" },
      { label: "Parked Bills", value: "Unlimited Slots" },
      { label: "Math Precision", value: "Exact Tabular" },
    ],
  },
  {
    id: "payment",
    step: "03",
    title: "Multi-Tender & Credit Hub",
    subtitle: "Cash • Card • QR • Ledger",
    latency: "15ms",
    throughput: "5 Tender Modes",
    color: "#8B5CF6",
    x: 625,
    y: 110,
    details:
      "Accept exact or quick-denomination Cash with instant Change Due calculation, Card terminal, Dynamic QR Wallet, Split Payments (Cash + Card), or Customer Credit Ledger.",
    metrics: [
      { label: "Split Tender", value: "Cash + Card" },
      { label: "Credit Ledger", value: "B2B & VIP Limits" },
      { label: "QR Generation", value: "Dynamic SVG" },
    ],
  },
  {
    id: "inventory",
    step: "04",
    title: "Live Inventory & Batch Sync",
    subtitle: "Stock Deduction • Expiry Alert",
    latency: "6ms",
    throughput: "Atomic Sync",
    color: "#F59E0B",
    x: 230,
    y: 285,
    details:
      "Every completed sale or partial return atomically adjusts SKU stock levels, triggers low-stock reorder badges, monitors batch expiry dates, and updates inventory valuation.",
    metrics: [
      { label: "Stock Sync", value: "Real-Time Atomic" },
      { label: "Barcode Labels", value: "Printable Studio" },
      { label: "Return Restock", value: "1-Click Auto" },
    ],
  },
  {
    id: "receipt",
    step: "05",
    title: "Thermal Receipt & Z-Report",
    subtitle: "80mm Print • Profit Analytics",
    latency: "12ms",
    throughput: "Instant Render",
    color: "#06B6D4",
    x: 500,
    y: 285,
    details:
      "Generates crisp 80mm thermal receipts with custom store headers, itemized tax breakdowns, scannable invoice barcodes, plus real-time Cash Drawer & Shift Z-Reports.",
    metrics: [
      { label: "Receipt Format", value: "80mm Thermal / PDF" },
      { label: "Profit Tracking", value: "Gross & Net Margin" },
      { label: "Audit Trail", value: "Full Shift Z-Report" },
    ],
  },
];

export function HeroArchitectureDiagram({ onLaunchPos }) {
  const [selectedNodeId, setSelectedNodeId] = useState("cart");
  const [pulseCount, setPulseCount] = useState(1428);
  const [simulatingPulse, setSimulatingPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((c) => c + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const triggerTransactionPulse = () => {
    setSimulatingPulse(true);
    setPulseCount((c) => c + 1);
    const sequence = ["scanner", "cart", "payment", "inventory", "receipt"];
    sequence.forEach((id, idx) => {
      setTimeout(() => {
        setSelectedNodeId(id);
      }, idx * 450);
    });
    setTimeout(() => {
      setSimulatingPulse(false);
    }, 2400);
  };

  const activeNode =
    HERO_NODES.find((n) => n.id === selectedNodeId) || HERO_NODES[1];

  return (
    <div className="pos-diagram-shell">
      {/* Top Telemetry Bar */}
      <div className="pos-diagram-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span className="pos-live-dot" />
          <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93C5FD" }}>
            LIVE INTERACTIVE POS ARCHITECTURE DIAGRAM
          </span>
          <span className="pos-mono-badge">
            ENGINE: NEXT.JS + REACT STATE CORE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "#94A3B8", fontFamily: "monospace" }}>
            TX PULSES: <strong style={{ color: "#10B981" }}>{pulseCount.toLocaleString()}</strong>
          </span>
          <button
            type="button"
            onClick={triggerTransactionPulse}
            className="pos-pulse-btn"
          >
            <Activity size={13} />
            {simulatingPulse ? "Simulating Flow..." : "Simulate Sale Flow"}
          </button>
        </div>
      </div>

      {/* Main Animated SVG Canvas */}
      <div className="pos-svg-wrapper">
        <svg
          viewBox="0 0 720 390"
          style={{ width: "100%", height: "auto", display: "block" }}
          aria-label="Pro General POS Interactive Animated Architecture Diagram"
        >
          <defs>
            <linearGradient id="bgGridGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#090D16" />
            </linearGradient>

            <linearGradient id="pipeBlueGreen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="pipeGreenPurple" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>

            <linearGradient id="pipeAmberCyan" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            <filter id="glowFilter" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <pattern id="posGridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(148, 163, 184, 0.07)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Background */}
          <rect width="720" height="390" rx="14" fill="url(#bgGridGrad)" />
          <rect width="720" height="390" rx="14" fill="url(#posGridPattern)" />

          {/* Ambient Decorative Glows */}
          <circle cx="360" cy="90" r="110" fill="rgba(16, 185, 129, 0.06)" />
          <circle cx="500" cy="285" r="110" fill="rgba(59, 130, 246, 0.06)" />

          {/* Connection Paths */}
          {/* Path 1: Scanner (95,110) -> Smart Cart (360,75) */}
          <path
            id="flowPath1"
            d="M 165 110 C 230 110, 260 75, 290 75"
            fill="none"
            stroke="rgba(59, 130, 246, 0.25)"
            strokeWidth="3"
          />
          <path
            d="M 165 110 C 230 110, 260 75, 290 75"
            fill="none"
            stroke="url(#pipeBlueGreen)"
            strokeWidth="2.5"
            strokeDasharray="7 7"
            className="pos-animated-dash"
          />

          {/* Path 2: Smart Cart (360,75) -> Payment Hub (625,110) */}
          <path
            id="flowPath2"
            d="M 430 75 C 480 75, 510 110, 555 110"
            fill="none"
            stroke="rgba(139, 92, 246, 0.25)"
            strokeWidth="3"
          />
          <path
            d="M 430 75 C 480 75, 510 110, 555 110"
            fill="none"
            stroke="url(#pipeGreenPurple)"
            strokeWidth="2.5"
            strokeDasharray="7 7"
            className="pos-animated-dash"
          />

          {/* Path 3: Smart Cart (360,125) -> Inventory Sync (230,240) */}
          <path
            id="flowPath3"
            d="M 340 125 C 320 185, 260 195, 230 240"
            fill="none"
            stroke="rgba(245, 158, 11, 0.25)"
            strokeWidth="3"
          />
          <path
            d="M 340 125 C 320 185, 260 195, 230 240"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.2"
            strokeDasharray="6 6"
            className="pos-animated-dash"
          />

          {/* Path 4: Payment Hub (625,155) -> Receipt & Analytics (500,240) */}
          <path
            id="flowPath4"
            d="M 605 155 C 585 205, 535 205, 500 240"
            fill="none"
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="3"
          />
          <path
            d="M 605 155 C 585 205, 535 205, 500 240"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2.2"
            strokeDasharray="6 6"
            className="pos-animated-dash"
          />

          {/* Path 5: Inventory Sync (305,285) <-> Receipt & Analytics (425,285) */}
          <path
            id="flowPath5"
            d="M 305 285 L 425 285"
            fill="none"
            stroke="rgba(16, 185, 129, 0.25)"
            strokeWidth="3"
          />
          <path
            d="M 305 285 L 425 285"
            fill="none"
            stroke="url(#pipeAmberCyan)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="pos-animated-dash"
          />

          {/* Animated Glowing Data Packets Moving Along Paths */}
          <circle r="5" fill="#60A5FA" filter="url(#glowFilter)">
            <animateMotion dur="2.2s" repeatCount="indefinite" path="M 165 110 C 230 110, 260 75, 290 75" />
          </circle>
          <circle r="5" fill="#34D399" filter="url(#glowFilter)">
            <animateMotion dur="2.4s" repeatCount="indefinite" path="M 430 75 C 480 75, 510 110, 555 110" />
          </circle>
          <circle r="4.5" fill="#FBBF24" filter="url(#glowFilter)">
            <animateMotion dur="2.6s" repeatCount="indefinite" path="M 340 125 C 320 185, 260 195, 230 240" />
          </circle>
          <circle r="4.5" fill="#22D3EE" filter="url(#glowFilter)">
            <animateMotion dur="2.1s" repeatCount="indefinite" path="M 605 155 C 585 205, 535 205, 500 240" />
          </circle>
          <circle r="4.5" fill="#10B981" filter="url(#glowFilter)">
            <animateMotion dur="1.9s" repeatCount="indefinite" path="M 305 285 L 425 285" />
          </circle>

          {/* Pipeline Labels on Canvas */}
          <g transform="translate(195, 65)">
            <rect width="74" height="19" rx="9" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(59, 130, 246, 0.4)" />
            <text x="37" y="13" textAnchor="middle" fill="#93C5FD" fontSize="9.5" fontFamily="monospace" fontWeight="600">
              BARCODE 8ms
            </text>
          </g>

          <g transform="translate(462, 65)">
            <rect width="78" height="19" rx="9" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(16, 185, 129, 0.4)" />
            <text x="39" y="13" textAnchor="middle" fill="#6EE7B7" fontSize="9.5" fontFamily="monospace" fontWeight="600">
              CHECKOUT 15ms
            </text>
          </g>

          <g transform="translate(328, 262)">
            <rect width="74" height="19" rx="9" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(245, 158, 11, 0.4)" />
            <text x="37" y="13" textAnchor="middle" fill="#FCD34D" fontSize="9.5" fontFamily="monospace" fontWeight="600">
              ATOMIC SYNC
            </text>
          </g>

          {/* Render the 5 Interactive Nodes */}
          {HERO_NODES.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const boxWidth = 148;
            const boxHeight = 88;
            const left = node.x - boxWidth / 2;
            const top = node.y - boxHeight / 2;

            return (
              <g
                key={node.id}
                transform={`translate(${left}, ${top})`}
                onClick={() => setSelectedNodeId(node.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Selection Pulse Halo */}
                {isSelected && (
                  <rect
                    x="-5"
                    y="-5"
                    width={boxWidth + 10}
                    height={boxHeight + 10}
                    rx="16"
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity="0.65"
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.85;0.2;0.85"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}

                {/* Card Body */}
                <rect
                  width={boxWidth}
                  height={boxHeight}
                  rx="12"
                  fill={isSelected ? "#162238" : "#111A2E"}
                  stroke={isSelected ? node.color : "rgba(148, 163, 184, 0.25)"}
                  strokeWidth={isSelected ? "2" : "1.2"}
                />

                {/* Top Accent Strip */}
                <rect
                  x="12"
                  y="0"
                  width={boxWidth - 24}
                  height="3"
                  rx="1.5"
                  fill={node.color}
                />

                {/* Step Pill */}
                <rect
                  x="10"
                  y="10"
                  width="36"
                  height="18"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.85)"
                  stroke={node.color}
                  strokeWidth="1"
                />
                <text
                  x="28"
                  y="22.5"
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  #{node.step}
                </text>

                {/* Latency Badge */}
                <text
                  x={boxWidth - 10}
                  y="22"
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {node.latency}
                </text>

                {/* Title */}
                <text
                  x="12"
                  y="46"
                  fill="#F8FAFC"
                  fontSize="11.5"
                  fontWeight="700"
                >
                  {node.title}
                </text>

                {/* Subtitle */}
                <text
                  x="12"
                  y="63"
                  fill="#94A3B8"
                  fontSize="9.8"
                >
                  {node.subtitle}
                </text>

                {/* Bottom Status Bar */}
                <circle cx="16" cy="76" r="3" fill={node.color} />
                <text
                  x="24"
                  y="79"
                  fill="#CBD5E1"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {node.throughput}
                </text>
              </g>
            );
          })}

          {/* Bottom Legend Bar inside SVG */}
          <g transform="translate(20, 354)">
            <rect width="680" height="26" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(148, 163, 184, 0.14)" />
            <text x="14" y="17" fill="#94A3B8" fontSize="10.5" fontFamily="monospace">
              CLICK ANY NODE ABOVE TO INSPECT SUBSYSTEM TELEMETRY • ZERO-LATENCY LOCAL + CLOUD ARCHITECTURE
            </text>
            <text x="666" y="17" textAnchor="end" fill="#10B981" fontSize="10.5" fontFamily="monospace" fontWeight="700">
              100% ONLINE READY
            </text>
          </g>
        </svg>
      </div>

      {/* Selected Node Inspector Drawer */}
      <div className="pos-node-inspector" style={{ borderColor: activeNode.color }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  background: activeNode.color,
                  color: "#090D16",
                  fontWeight: 800,
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                }}
              >
                SUBSYSTEM #{activeNode.step}
              </span>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#F8FAFC" }}>
                {activeNode.title}
              </h4>
              <span style={{ fontSize: "12px", color: "#94A3B8", fontFamily: "monospace" }}>
                ({activeNode.subtitle})
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#CBD5E1", lineHeight: 1.55 }}>
              {activeNode.details}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {activeNode.metrics.map((m, i) => (
              <div key={i} className="pos-metric-mini-card">
                <div style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {m.label}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#F8FAFC", fontFamily: "monospace", marginTop: "3px" }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveSystemDiagrams() {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % 5);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pos-system-diagrams-card">
      {/* Diagram Mode Switcher */}
      <div className="pos-diagram-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("pipeline")}
          className={`pos-diagram-tab ${activeTab === "pipeline" ? "active" : ""}`}
        >
          <Zap size={15} />
          <span>1. 0.2s Express Checkout Pipeline</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("offline")}
          className={`pos-diagram-tab ${activeTab === "offline" ? "active" : ""}`}
        >
          <Database size={15} />
          <span>2. Offline-First & Cloud Sync Engine</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profit")}
          className={`pos-diagram-tab ${activeTab === "profit" ? "active" : ""}`}
        >
          <TrendingUp size={15} />
          <span>3. Inventory, Returns & Profit Loop</span>
        </button>
      </div>

      {/* TAB 1: Express Checkout Pipeline */}
      {activeTab === "pipeline" && (
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#F8FAFC" }}>
                Real-Time Express Checkout Sequence (0.2s End-to-End)
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94A3B8" }}>
                Watch how Pro General POS processes barcode scans, wholesale/retail pricing tiers, split tenders, and thermal receipts without page reloads.
              </p>
            </div>
            <span className="pos-mono-badge" style={{ color: "#10B981", borderColor: "rgba(16,185,129,0.3)" }}>
              ACTIVE STAGE: STEP 0{activeStepIndex + 1} / 05
            </span>
          </div>

          <svg viewBox="0 0 900 230" style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <linearGradient id="pipelineLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <rect width="900" height="230" rx="14" fill="#0B111E" stroke="rgba(148,163,184,0.14)" />

            {/* Connecting Backbone */}
            <line x1="95" y1="105" x2="805" y2="105" stroke="rgba(148,163,184,0.2)" strokeWidth="4" />
            <line
              x1="95"
              y1="105"
              x2="805"
              y2="105"
              stroke="url(#pipelineLine)"
              strokeWidth="4"
              strokeDasharray="10 8"
              className="pos-animated-dash"
            />

            {/* Moving High-Speed Packet */}
            <circle r="7" fill="#10B981">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M 95 105 L 805 105" />
            </circle>

            {[
              { title: "Barcode / SKU Scan", sub: "Laser or Keyboard /", time: "0.02s", color: "#3B82F6", x: 95 },
              { title: "Tier Price Lookup", sub: "Retail vs Wholesale", time: "0.04s", color: "#06B6D4", x: 272 },
              { title: "Promo & Tax Math", sub: "Auto GST + Discounts", time: "0.06s", color: "#10B981", x: 450 },
              { title: "Multi-Tender Split", sub: "Cash / Card / Credit", time: "0.12s", color: "#8B5CF6", x: 628 },
              { title: "80mm Thermal Print", sub: "Stock & Z-Report Sync", time: "0.20s", color: "#F59E0B", x: 805 },
            ].map((item, idx) => {
              const isCurrent = idx === activeStepIndex;
              return (
                <g
                  key={idx}
                  transform={`translate(${item.x}, 105)`}
                  onClick={() => setActiveStepIndex(idx)}
                  style={{ cursor: "pointer" }}
                >
                  {isCurrent && (
                    <circle r="42" fill="none" stroke={item.color} strokeWidth="2" strokeOpacity="0.6">
                      <animate attributeName="r" values="34;46;34" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r="32"
                    fill={isCurrent ? "#17253B" : "#111A2E"}
                    stroke={item.color}
                    strokeWidth={isCurrent ? "3" : "1.8"}
                  />
                  <text y="-3" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="800" fontFamily="monospace">
                    0{idx + 1}
                  </text>
                  <text y="12" textAnchor="middle" fill={item.color} fontSize="10" fontFamily="monospace" fontWeight="700">
                    {item.time}
                  </text>
                  <text y="60" textAnchor="middle" fill="#F8FAFC" fontSize="12.5" fontWeight="700">
                    {item.title}
                  </text>
                  <text y="78" textAnchor="middle" fill="#94A3B8" fontSize="10.5">
                    {item.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* TAB 2: Offline-First & Cloud Sync Engine */}
      {activeTab === "offline" && (
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#F8FAFC" }}>
                Zero-Downtime Hybrid Offline-First + Vercel Edge Architecture
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94A3B8" }}>
                Even if internet connectivity drops in the middle of peak rush hour, Pro General POS continues ringing sales at 100% speed with local persistence.
              </p>
            </div>
            <span className="pos-mono-badge" style={{ color: "#38BDF8" }}>
              UPTIME GUARANTEE: 100.0% LOCAL + CLOUD
            </span>
          </div>

          <svg viewBox="0 0 900 240" style={{ width: "100%", height: "auto", display: "block" }}>
            <rect width="900" height="240" rx="14" fill="#0B111E" stroke="rgba(148,163,184,0.14)" />

            {/* Left Node: Cashier Register UI */}
            <g transform="translate(40, 45)">
              <rect width="220" height="150" rx="12" fill="#111A2E" stroke="#3B82F6" strokeWidth="2" />
              <text x="20" y="32" fill="#60A5FA" fontSize="11" fontFamily="monospace" fontWeight="700">
                CLIENT TERMINAL LAYER
              </text>
              <text x="20" y="56" fill="#F8FAFC" fontSize="15" fontWeight="700">
                React 18 + Next.js POS UI
              </text>
              <text x="20" y="80" fill="#94A3B8" fontSize="11.5">
                • 60fps Instant Cart State
              </text>
              <text x="20" y="100" fill="#94A3B8" fontSize="11.5">
                • Web Audio Scanner Synth
              </text>
              <text x="20" y="120" fill="#94A3B8" fontSize="11.5">
                • 80mm Print Spooler Engine
              </text>
            </g>

            {/* Center Node: Local Persistence Engine */}
            <g transform="translate(340, 45)">
              <rect width="220" height="150" rx="12" fill="#111A2E" stroke="#10B981" strokeWidth="2" />
              <text x="20" y="32" fill="#34D399" fontSize="11" fontFamily="monospace" fontWeight="700">
                OFFLINE-FIRST STORAGE ENGINE
              </text>
              <text x="20" y="56" fill="#F8FAFC" fontSize="15" fontWeight="700">
                Persistent Local Vault
              </text>
              <text x="20" y="80" fill="#94A3B8" fontSize="11.5">
                • Zero-Latency Read/Write
              </text>
              <text x="20" y="100" fill="#94A3B8" fontSize="11.5">
                • Works 100% Without Wi-Fi
              </text>
              <text x="20" y="120" fill="#94A3B8" fontSize="11.5">
                • 1-Click JSON/CSV Backup
              </text>
            </g>

            {/* Right Node: Cloud & Multi-Branch Export */}
            <g transform="translate(640, 45)">
              <rect width="220" height="150" rx="12" fill="#111A2E" stroke="#8B5CF6" strokeWidth="2" />
              <text x="20" y="32" fill="#C084FC" fontSize="11" fontFamily="monospace" fontWeight="700">
                VERCEL + GITHUB DEPLOYMENT
              </text>
              <text x="20" y="56" fill="#F8FAFC" fontSize="15" fontWeight="700">
                Global Edge & CI/CD
              </text>
              <text x="20" y="80" fill="#94A3B8" fontSize="11.5">
                • Instant Global CDN Load
              </text>
              <text x="20" y="100" fill="#94A3B8" fontSize="11.5">
                • GitHub Automated Builds
              </text>
              <text x="20" y="120" fill="#94A3B8" fontSize="11.5">
                • Multi-Device Responsive
              </text>
            </g>

            {/* Bi-directional Animated Pipes */}
            <path d="M 260 105 L 340 105" stroke="#3B82F6" strokeWidth="3" strokeDasharray="6 6" className="pos-animated-dash" />
            <path d="M 340 135 L 260 135" stroke="#10B981" strokeWidth="3" strokeDasharray="6 6" className="pos-animated-dash" />
            <path d="M 560 105 L 640 105" stroke="#10B981" strokeWidth="3" strokeDasharray="6 6" className="pos-animated-dash" />
            <path d="M 640 135 L 560 135" stroke="#8B5CF6" strokeWidth="3" strokeDasharray="6 6" className="pos-animated-dash" />

            <circle r="5" fill="#60A5FA">
              <animateMotion dur="1.4s" repeatCount="indefinite" path="M 260 105 L 340 105" />
            </circle>
            <circle r="5" fill="#34D399">
              <animateMotion dur="1.4s" repeatCount="indefinite" path="M 340 135 L 260 135" />
            </circle>
            <circle r="5" fill="#C084FC">
              <animateMotion dur="1.8s" repeatCount="indefinite" path="M 560 105 L 640 105" />
            </circle>
          </svg>
        </div>
      )}

      {/* TAB 3: Inventory, Returns & Profit Loop */}
      {activeTab === "profit" && (
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#F8FAFC" }}>
                Closed-Loop Inventory, Partial Return Restock & Net Profit Waterfall
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94A3B8" }}>
                Every purchase order, retail/wholesale invoice, customer credit payment, and item refund feeds directly into your real-time Net Margin & Z-Report.
              </p>
            </div>
            <span className="pos-mono-badge" style={{ color: "#F59E0B" }}>
              REAL-TIME COGS & MARGIN ENGINE
            </span>
          </div>

          <svg viewBox="0 0 900 240" style={{ width: "100%", height: "auto", display: "block" }}>
            <rect width="900" height="240" rx="14" fill="#0B111E" stroke="rgba(148,163,184,0.14)" />

            {[
              { x: 35, y: 60, w: 175, title: "1. Supplier Stock-In", sub: "Purchase Orders + Cost Price", color: "#F59E0B", metric: "+Stock Qty" },
              { x: 255, y: 60, w: 175, title: "2. Active SKU Vault", sub: "Barcode Labels & Expiry Alert", color: "#3B82F6", metric: "Live Valuation" },
              { x: 475, y: 60, w: 175, title: "3. POS Sale / Return", sub: "Auto Deduct or Refund Restock", color: "#10B981", metric: "Gross Margin" },
              { x: 695, y: 60, w: 170, title: "4. Shift Z-Report", sub: "Revenue - COGS - Expenses", color: "#06B6D4", metric: "Net Profit" },
            ].map((box, i) => (
              <g key={i} transform={`translate(${box.x}, ${box.y})`}>
                <rect width={box.w} height="125" rx="12" fill="#111A2E" stroke={box.color} strokeWidth="2" />
                <text x="16" y="28" fill={box.color} fontSize="10.5" fontFamily="monospace" fontWeight="700">
                  {box.metric}
                </text>
                <text x="16" y="55" fill="#F8FAFC" fontSize="13.5" fontWeight="700">
                  {box.title}
                </text>
                <text x="16" y="77" fill="#94A3B8" fontSize="11">
                  {box.sub}
                </text>
                <rect x="16" y="92" width={box.w - 32} height="18" rx="5" fill="rgba(15,23,42,0.9)" />
                <text x={box.w / 2} y="104" textAnchor="middle" fill="#CBD5E1" fontSize="9.5" fontFamily="monospace">
                  100% AUTOMATED
                </text>
              </g>
            ))}

            {/* Forward Arrows */}
            <path d="M 210 120 L 255 120" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5 5" className="pos-animated-dash" />
            <path d="M 430 120 L 475 120" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5 5" className="pos-animated-dash" />
            <path d="M 650 120 L 695 120" stroke="#10B981" strokeWidth="3" strokeDasharray="5 5" className="pos-animated-dash" />

            {/* Return Restock Feedback Loop Arc */}
            <path
              d="M 562 60 C 562 18, 342 18, 342 60"
              fill="none"
              stroke="#EC4899"
              strokeWidth="2.2"
              strokeDasharray="6 6"
              className="pos-animated-dash"
            />
            <rect x="385" y="14" width="135" height="18" rx="9" fill="#111A2E" stroke="#EC4899" />
            <text x="452" y="26" textAnchor="middle" fill="#F472B6" fontSize="9.5" fontFamily="monospace" fontWeight="700">
              AUTO-RESTOCK ON REFUND
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
