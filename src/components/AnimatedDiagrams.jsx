"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Zap,
  Database,
  TrendingUp,
} from "lucide-react";

const HERO_NODES = [
  {
    id: "scanner",
    step: "01",
    title: "Barcode & Scale Input",
    subtitle: "pos.session • EAN-13 & Weight",
    latency: "8ms",
    throughput: "Barcode + Scale",
    color: "#714B67",
    x: 95,
    y: 110,
    details:
      "Odoo-style barcode scanner wedge & electronic scale integration. Automatically weighs fresh produce (kg) or scans packaged SKUs with instant audio feedback.",
    metrics: [
      { label: "Odoo Model", value: "pos.session" },
      { label: "Electronic Scale", value: "Auto Weight (kg)" },
      { label: "Barcode Wedge", value: "EAN-13 / Code128" },
    ],
  },
  {
    id: "cart",
    step: "02",
    title: "Numpad & Pricelist Core",
    subtitle: "Qty • % Disc • Price • Notes",
    latency: "4ms",
    throughput: "product.pricelist",
    color: "#017E84",
    x: 360,
    y: 75,
    details:
      "Authentic Odoo interactive Numpad switching seamlessly between Qty, % Disc, and Price override modes, plus Dynamic Pricelists (Public, VIP Gold, Wholesale B2B) and Customer/Internal Notes.",
    metrics: [
      { label: "Numpad Modes", value: "Qty / %Disc / Price" },
      { label: "Pricelists", value: "Retail / VIP / B2B" },
      { label: "Fiscal Tax", value: "Auto Tax Mapping" },
    ],
  },
  {
    id: "payment",
    step: "03",
    title: "Payment & Invoice Engine",
    subtitle: "Cash • Card • Customer Account",
    latency: "12ms",
    throughput: "account.move",
    color: "#059669",
    x: 625,
    y: 110,
    details:
      "Odoo Payment Screen supporting Cash with quick coin/bill tenders, Bank Card terminal, Dynamic QR Wallet, Split Payments, Customer Credit Account, and 1-Click Formal Tax Invoice generation.",
    metrics: [
      { label: "Invoice Toggle", value: " Formal Tax Invoice" },
      { label: "Split Tender", value: "Cash + Bank Card" },
      { label: "Partner Ledger", value: "Credit Limit Check" },
    ],
  },
  {
    id: "inventory",
    step: "04",
    title: "Warehouse Stock Move",
    subtitle: "stock.picking • On-Hand Sync",
    latency: "6ms",
    throughput: "WH/Stock Sync",
    color: "#D97706",
    x: 230,
    y: 285,
    details:
      "Every POS sale or Refund / Credit Note automatically triggers an Odoo stock move (WH/Stock), updating On-Hand & Forecasted quantities, warehouse bin locations, and low-stock alerts.",
    metrics: [
      { label: "Stock Move", value: "WH/Stock → Customer" },
      { label: "Refund Action", value: "Auto Reverse Picking" },
      { label: "Product Info", value: "Live Margin & Stock" },
    ],
  },
  {
    id: "receipt",
    step: "05",
    title: "Receipt & Session Closing",
    subtitle: "Cash In/Out • Closing Control",
    latency: "10ms",
    throughput: "Z-Report Audit",
    color: "#2563EB",
    x: 500,
    y: 285,
    details:
      "Prints 80mm Odoo POS receipts with Customer Notes & Tax IDs, tracks petty Cash In / Cash Out movements, and reconciles physical drawer cash at Session Closing.",
    metrics: [
      { label: "Cash Control", value: "Cash In / Cash Out" },
      { label: "Session Close", value: "Denomination Count" },
      { label: "Receipt Output", value: "80mm Thermal & PDF" },
    ],
  },
];

export function HeroArchitectureDiagram() {
  const [selectedNodeId, setSelectedNodeId] = useState("cart");
  const [pulseCount, setPulseCount] = useState(2480);
  const [simulatingPulse, setSimulatingPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((c) => c + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerTransactionPulse = () => {
    setSimulatingPulse(true);
    setPulseCount((c) => c + 1);
    const sequence = ["scanner", "cart", "payment", "inventory", "receipt"];
    sequence.forEach((id, idx) => {
      setTimeout(() => {
        setSelectedNodeId(id);
      }, idx * 420);
    });
    setTimeout(() => {
      setSimulatingPulse(false);
    }, 2200);
  };

  const activeNode =
    HERO_NODES.find((n) => n.id === selectedNodeId) || HERO_NODES[1];

  return (
    <div className="pos-diagram-shell">
      {/* Top Bar */}
      <div className="pos-diagram-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span className="pos-live-dot" />
          <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#714B67" }}>
            LIVE ANIMATED ODOO-STYLE POS WORKFLOW DIAGRAM
          </span>
          <span className="pos-mono-badge">
            CLICK ANY NODE TO INSPECT FIELDS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "#475569", fontFamily: "monospace" }}>
            ORDERS SYNCED: <strong style={{ color: "#017E84" }}>{pulseCount.toLocaleString()}</strong>
          </span>
          <button
            type="button"
            onClick={triggerTransactionPulse}
            className="pos-pulse-btn"
          >
            <Activity size={13} />
            {simulatingPulse ? "Running Flow..." : "Simulate Order Flow"}
          </button>
        </div>
      </div>

      {/* Bright SVG Canvas */}
      <div className="pos-svg-wrapper">
        <svg
          viewBox="0 0 720 385"
          style={{ width: "100%", height: "auto", display: "block" }}
          aria-label="Pro General POS Bright Animated Odoo Workflow Diagram"
        >
          <defs>
            <linearGradient id="brightBgGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>

            <pattern id="brightGridPattern" width="28" height="28" patternUnits="userSpaceOnUse">
              <path
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Clean Bright Background */}
          <rect width="720" height="385" rx="12" fill="url(#brightBgGrad)" stroke="#E2E8F0" />
          <rect width="720" height="385" rx="12" fill="url(#brightGridPattern)" />

          {/* Soft Pastel Highlights */}
          <circle cx="360" cy="85" r="95" fill="rgba(1, 126, 132, 0.05)" />
          <circle cx="500" cy="285" r="95" fill="rgba(113, 75, 103, 0.05)" />

          {/* Animated Flow Lines */}
          <path
            d="M 165 110 C 230 110, 260 75, 290 75"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3.5"
          />
          <path
            d="M 165 110 C 230 110, 260 75, 290 75"
            fill="none"
            stroke="#714B67"
            strokeWidth="2.5"
            strokeDasharray="7 7"
            className="pos-animated-dash"
          />

          <path
            d="M 430 75 C 480 75, 510 110, 555 110"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3.5"
          />
          <path
            d="M 430 75 C 480 75, 510 110, 555 110"
            fill="none"
            stroke="#017E84"
            strokeWidth="2.5"
            strokeDasharray="7 7"
            className="pos-animated-dash"
          />

          <path
            d="M 340 120 C 320 185, 260 195, 230 240"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3"
          />
          <path
            d="M 340 120 C 320 185, 260 195, 230 240"
            fill="none"
            stroke="#D97706"
            strokeWidth="2.2"
            strokeDasharray="6 6"
            className="pos-animated-dash"
          />

          <path
            d="M 605 155 C 585 205, 535 205, 500 240"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3"
          />
          <path
            d="M 605 155 C 585 205, 535 205, 500 240"
            fill="none"
            stroke="#059669"
            strokeWidth="2.2"
            strokeDasharray="6 6"
            className="pos-animated-dash"
          />

          <path
            d="M 305 285 L 425 285"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3"
          />
          <path
            d="M 305 285 L 425 285"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="pos-animated-dash"
          />

          {/* Moving Data Packets */}
          <circle r="5.5" fill="#714B67">
            <animateMotion dur="2.1s" repeatCount="indefinite" path="M 165 110 C 230 110, 260 75, 290 75" />
          </circle>
          <circle r="5.5" fill="#017E84">
            <animateMotion dur="2.3s" repeatCount="indefinite" path="M 430 75 C 480 75, 510 110, 555 110" />
          </circle>
          <circle r="5" fill="#D97706">
            <animateMotion dur="2.5s" repeatCount="indefinite" path="M 340 120 C 320 185, 260 195, 230 240" />
          </circle>
          <circle r="5" fill="#059669">
            <animateMotion dur="2.0s" repeatCount="indefinite" path="M 605 155 C 585 205, 535 205, 500 240" />
          </circle>
          <circle r="5" fill="#2563EB">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M 305 285 L 425 285" />
          </circle>

          {/* Callout Tags */}
          <g transform="translate(192, 62)">
            <rect width="80" height="20" rx="10" fill="#FDF2F8" stroke="#714B67" strokeWidth="1" />
            <text x="40" y="13.5" textAnchor="middle" fill="#714B67" fontSize="9.5" fontFamily="monospace" fontWeight="700">
              SCAN / SCALE
            </text>
          </g>

          <g transform="translate(460, 62)">
            <rect width="84" height="20" rx="10" fill="#F0FDFA" stroke="#017E84" strokeWidth="1" />
            <text x="42" y="13.5" textAnchor="middle" fill="#017E84" fontSize="9.5" fontFamily="monospace" fontWeight="700">
              PRICELIST OK
            </text>
          </g>

          <g transform="translate(325, 260)">
            <rect width="80" height="20" rx="10" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" />
            <text x="40" y="13.5" textAnchor="middle" fill="#2563EB" fontSize="9.5" fontFamily="monospace" fontWeight="700">
              STOCK.PICKING
            </text>
          </g>

          {/* Interactive Nodes */}
          {HERO_NODES.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const boxWidth = 152;
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
                {isSelected && (
                  <rect
                    x="-4"
                    y="-4"
                    width={boxWidth + 8}
                    height={boxHeight + 8}
                    rx="14"
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.9;0.25;0.9"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}

                <rect
                  width={boxWidth}
                  height={boxHeight}
                  rx="11"
                  fill="#FFFFFF"
                  stroke={isSelected ? node.color : "#CBD5E1"}
                  strokeWidth={isSelected ? "2.2" : "1.4"}
                />

                {/* Top Color Bar */}
                <rect
                  x="0"
                  y="0"
                  width={boxWidth}
                  height="5"
                  rx="3"
                  fill={node.color}
                />

                {/* Step Badge */}
                <rect
                  x="10"
                  y="12"
                  width="36"
                  height="18"
                  rx="5"
                  fill={`${node.color}15`}
                />
                <text
                  x="28"
                  y="24"
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="800"
                >
                  #{node.step}
                </text>

                <text
                  x={boxWidth - 10}
                  y="24"
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {node.latency}
                </text>

                <text
                  x="10"
                  y="47"
                  fill="#0F172A"
                  fontSize="11.5"
                  fontWeight="800"
                >
                  {node.title}
                </text>

                <text
                  x="10"
                  y="62"
                  fill="#64748B"
                  fontSize="9.8"
                >
                  {node.subtitle}
                </text>

                <circle cx="15" cy="76" r="3.5" fill={node.color} />
                <text
                  x="23"
                  y="79"
                  fill="#334155"
                  fontSize="9.2"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {node.throughput}
                </text>
              </g>
            );
          })}

          {/* Bottom Banner inside SVG */}
          <g transform="translate(20, 348)">
            <rect width="680" height="26" rx="7" fill="#F1F5F9" stroke="#CBD5E1" />
            <text x="14" y="17" fill="#334155" fontSize="10.5" fontFamily="monospace" fontWeight="600">
              ODOO 18 ENTERPRISE POS ARCHITECTURE • CLICK ANY NODE TO VIEW SUBSYSTEM FIELDS
            </text>
            <text x="666" y="17" textAnchor="end" fill="#017E84" fontSize="10.5" fontFamily="monospace" fontWeight="800">
              ACTIVE & SYNCED
            </text>
          </g>
        </svg>
      </div>

      {/* Node Inspector Footer */}
      <div className="pos-node-inspector" style={{ borderTopColor: activeNode.color }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  background: activeNode.color,
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "5px",
                  fontFamily: "monospace",
                }}
              >
                STEP #{activeNode.step}
              </span>
              <h4 style={{ margin: 0, fontSize: "15.5px", fontWeight: 800, color: "#0F172A" }}>
                {activeNode.title}
              </h4>
              <span style={{ fontSize: "12px", color: "#64748B", fontFamily: "monospace" }}>
                ({activeNode.subtitle})
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.55 }}>
              {activeNode.details}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {activeNode.metrics.map((m, i) => (
              <div key={i} className="pos-metric-mini-card">
                <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0F172A", fontFamily: "monospace", marginTop: "3px" }}>
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
      <div className="pos-diagram-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("pipeline")}
          className={`pos-diagram-tab ${activeTab === "pipeline" ? "active" : ""}`}
        >
          <Zap size={15} />
          <span>1. Odoo POS Checkout Pipeline</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("offline")}
          className={`pos-diagram-tab ${activeTab === "offline" ? "active" : ""}`}
        >
          <Database size={15} />
          <span>2. Offline-First & Pricelist Sync</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profit")}
          className={`pos-diagram-tab ${activeTab === "profit" ? "active" : ""}`}
        >
          <TrendingUp size={15} />
          <span>3. Stock Moves, Refunds & Accounting</span>
        </button>
      </div>

      {activeTab === "pipeline" && (
        <div style={{ padding: "22px", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0F172A" }}>
                Odoo POS Express Order-to-Receipt Pipeline
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569" }}>
                From Barcode / Electronic Scale scan to Numpad Qty/Discount adjustments, Pricelist application, and 80mm receipt generation.
              </p>
            </div>
            <span className="pos-mono-badge" style={{ color: "#714B67", borderColor: "#714B67" }}>
              ACTIVE STAGE: 0{activeStepIndex + 1} / 05
            </span>
          </div>

          <svg viewBox="0 0 900 220" style={{ width: "100%", height: "auto", display: "block" }}>
            <rect width="900" height="220" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
            <line x1="95" y1="98" x2="805" y2="98" stroke="#CBD5E1" strokeWidth="4" />
            <line
              x1="95"
              y1="98"
              x2="805"
              y2="98"
              stroke="#714B67"
              strokeWidth="3.5"
              strokeDasharray="10 8"
              className="pos-animated-dash"
            />
            <circle r="7" fill="#017E84">
              <animateMotion dur="3.4s" repeatCount="indefinite" path="M 95 98 L 805 98" />
            </circle>

            {[
              { title: "Scan / Weigh Item", sub: "Barcode or Scale (kg)", time: "Step 1", color: "#714B67", x: 95 },
              { title: "Odoo Numpad Edit", sub: "Qty • %Disc • Price", time: "Step 2", color: "#017E84", x: 272 },
              { title: "Pricelist & Fiscal", sub: "Public / VIP / B2B", time: "Step 3", color: "#059669", x: 450 },
              { title: "Payment & Invoice", sub: "Cash / Card / Credit", time: "Step 4", color: "#D97706", x: 628 },
              { title: "Receipt & Picking", sub: "80mm Print + Stock", time: "Step 5", color: "#2563EB", x: 805 },
            ].map((item, idx) => {
              const isCurrent = idx === activeStepIndex;
              return (
                <g
                  key={idx}
                  transform={`translate(${item.x}, 98)`}
                  onClick={() => setActiveStepIndex(idx)}
                  style={{ cursor: "pointer" }}
                >
                  {isCurrent && (
                    <circle r="40" fill="none" stroke={item.color} strokeWidth="2">
                      <animate attributeName="r" values="33;43;33" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r="31"
                    fill="#FFFFFF"
                    stroke={item.color}
                    strokeWidth={isCurrent ? "3.5" : "2"}
                  />
                  <text y="4" textAnchor="middle" fill={item.color} fontSize="11.5" fontWeight="800" fontFamily="monospace">
                    {item.time}
                  </text>
                  <text y="56" textAnchor="middle" fill="#0F172A" fontSize="12.5" fontWeight="800">
                    {item.title}
                  </text>
                  <text y="73" textAnchor="middle" fill="#64748B" fontSize="10.5">
                    {item.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {activeTab === "offline" && (
        <div style={{ padding: "22px", background: "#FFFFFF" }}>
          <svg viewBox="0 0 900 220" style={{ width: "100%", height: "auto", display: "block" }}>
            <rect width="900" height="220" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
            {[
              { x: 40, title: "Odoo POS Register UI", sub: "Numpad • Pricelists • Floating Orders", color: "#714B67", badge: "FRONT-OF-HOUSE" },
              { x: 340, title: "Browser Local Vault", sub: "Works 100% Offline without Internet", color: "#017E84", badge: "ZERO-LATENCY CACHE" },
              { x: 640, title: "Vercel & GitHub Cloud", sub: "Instant Global Edge Deployment", color: "#059669", badge: "PRODUCTION LIVE" },
            ].map((b, i) => (
              <g key={i} transform={`translate(${b.x}, 40)`}>
                <rect width="220" height="140" rx="12" fill="#FFFFFF" stroke={b.color} strokeWidth="2" />
                <rect width="220" height="6" rx="3" fill={b.color} />
                <text x="18" y="34" fill={b.color} fontSize="10.5" fontFamily="monospace" fontWeight="800">
                  {b.badge}
                </text>
                <text x="18" y="62" fill="#0F172A" fontSize="15" fontWeight="800">
                  {b.title}
                </text>
                <text x="18" y="88" fill="#475569" fontSize="11.5">
                  {b.sub}
                </text>
              </g>
            ))}
            <path d="M 260 110 L 340 110" stroke="#714B67" strokeWidth="3" strokeDasharray="6 6" className="pos-animated-dash" />
            <path d="M 560 110 L 640 110" stroke="#017E84" strokeWidth="3" strokeDasharray="6 6" className="pos-animated-dash" />
          </svg>
        </div>
      )}

      {activeTab === "profit" && (
        <div style={{ padding: "22px", background: "#FFFFFF" }}>
          <svg viewBox="0 0 900 220" style={{ width: "100%", height: "auto", display: "block" }}>
            <rect width="900" height="220" rx="12" fill="#F8FAFC" stroke="#E2E8F0" />
            {[
              { x: 35, w: 185, title: "1. Purchase Order", sub: "Vendor Receipt → WH/Stock", color: "#D97706" },
              { x: 255, w: 185, title: "2. Odoo Product Form", sub: "On-Hand • Forecasted • Tax", color: "#714B67" },
              { x: 475, w: 185, title: "3. POS Order / Refund", sub: "Auto Stock Move & Credit Note", color: "#017E84" },
              { x: 695, w: 170, title: "4. Session Closing", sub: "Cash Control & Z-Report", color: "#059669" },
            ].map((b, i) => (
              <g key={i} transform={`translate(${b.x}, 50)`}>
                <rect width={b.w} height="120" rx="10" fill="#FFFFFF" stroke={b.color} strokeWidth="2" />
                <rect width={b.w} height="5" rx="2.5" fill={b.color} />
                <text x="14" y="45" fill="#0F172A" fontSize="13.5" fontWeight="800">
                  {b.title}
                </text>
                <text x="14" y="68" fill="#475569" fontSize="11">
                  {b.sub}
                </text>
              </g>
            ))}
            <path d="M 220 110 L 255 110" stroke="#D97706" strokeWidth="3" strokeDasharray="5 5" className="pos-animated-dash" />
            <path d="M 440 110 L 475 110" stroke="#714B67" strokeWidth="3" strokeDasharray="5 5" className="pos-animated-dash" />
            <path d="M 660 110 L 695 110" stroke="#017E84" strokeWidth="3" strokeDasharray="5 5" className="pos-animated-dash" />
          </svg>
        </div>
      )}
    </div>
  );
}
