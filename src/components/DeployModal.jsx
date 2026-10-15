"use client";

import React, { useState } from "react";
import {
  X,
  GitBranch,
  Rocket,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Globe,
} from "lucide-react";

export default function DeployModal({ isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const copyText = (key, text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const gitCommands = `# Official GitHub Repository (Already Pushed & Live!)
https://github.com/AliShayanAnsari/GeneralPOS

# To push future updates:
git add .
git commit -m "update Pro General POS"
git push origin main`;

  const vercelCommands = `# Deploy directly to Vercel Production in 1 command
npx vercel --prod --yes`;

  return (
    <div className="pos-modal-backdrop" onClick={onClose}>
      <div
        className="pos-modal-card"
        style={{ maxWidth: "660px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pos-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: "#F5F3FF",
                border: "1px solid #714B67",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Rocket size={18} color="#714B67" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0F172A" }}>
                GitHub & Vercel Cloud Deployment Hub
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
                Pushed to AliShayanAnsari/GeneralPOS • Ready for 1-Click Vercel Import
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="pos-icon-btn">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "78vh", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px" }}>
            <div className="pos-mini-stat-box">
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontSize: "12px", fontWeight: 700 }}>
                <CheckCircle2 size={14} />
                <span>GitHub Repo Live</span>
              </div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                Repo: <strong>AliShayanAnsari/GeneralPOS</strong>
              </div>
            </div>

            <div className="pos-mini-stat-box">
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#714B67", fontSize: "12px", fontWeight: 700 }}>
                <CheckCircle2 size={14} />
                <span>Vercel Edge Ready</span>
              </div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                Includes <strong>vercel.json</strong> & Next.js Build
              </div>
            </div>
          </div>

          <div className="pos-deploy-step-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GitBranch size={16} color="#714B67" />
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#0F172A" }}>
                  Step 1: Live GitHub Repository
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText("git", gitCommands)}
                className="pos-btn-secondary"
                style={{ padding: "5px 10px", fontSize: "11.5px" }}
              >
                {copiedKey === "git" ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                <span>{copiedKey === "git" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <pre className="pos-code-pre">{gitCommands}</pre>
          </div>

          <div className="pos-deploy-step-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Rocket size={16} color="#017E84" />
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#0F172A" }}>
                  Step 2: 1-Click Deploy on Vercel
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText("vercel", vercelCommands)}
                className="pos-btn-secondary"
                style={{ padding: "5px 10px", fontSize: "11.5px" }}
              >
                {copiedKey === "vercel" ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                <span>{copiedKey === "vercel" ? "Copied!" : "Copy CLI Command"}</span>
              </button>
            </div>
            <pre className="pos-code-pre">{vercelCommands}</pre>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              <a
                href="https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2FAliShayanAnsari%2FGeneralPOS"
                target="_blank"
                rel="noopener noreferrer"
                className="pos-btn-primary"
                style={{ textDecoration: "none", fontSize: "12.5px", padding: "9px 14px" }}
              >
                <Globe size={14} />
                <span>1-Click Deploy GeneralPOS on Vercel</span>
                <ExternalLink size={13} />
              </a>
              <a
                href="https://github.com/AliShayanAnsari/GeneralPOS"
                target="_blank"
                rel="noopener noreferrer"
                className="pos-btn-secondary"
                style={{ textDecoration: "none", fontSize: "12.5px", padding: "9px 14px" }}
              >
                <GitBranch size={14} />
                <span>Open GitHub Repo (AliShayanAnsari/GeneralPOS)</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        <div className="pos-modal-footer">
          <button type="button" onClick={onClose} className="pos-btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
