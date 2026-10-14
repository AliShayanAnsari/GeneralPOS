"use client";

import React, { useState } from "react";
import {
  X,
  GitBranch,
  Rocket,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Download,
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
        style={{ maxWidth: "680px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pos-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.16)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Rocket size={18} color="#60A5FA" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#F8FAFC" }}>
                GitHub & Vercel Cloud Deployment Hub
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94A3B8" }}>
                Pro General POS is pre-configured with Git, GitHub Actions CI/CD, and vercel.json
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="pos-icon-btn">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "78vh", overflowY: "auto" }}>
          {/* Status Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px" }}>
            <div className="pos-mini-stat-box" style={{ borderColor: "rgba(16, 185, 129, 0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10B981", fontSize: "12px", fontWeight: 700 }}>
                <CheckCircle2 size={14} />
                <span>Git Repository Initialized</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Branch: <code style={{ color: "#F8FAFC" }}>main</code> • Clean Commit Ready
              </div>
            </div>

            <div className="pos-mini-stat-box" style={{ borderColor: "rgba(59, 130, 246, 0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#60A5FA", fontSize: "12px", fontWeight: 700 }}>
                <CheckCircle2 size={14} />
                <span>Vercel Edge Config Ready</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                Includes <code style={{ color: "#F8FAFC" }}>vercel.json</code> & Next.js Build
              </div>
            </div>

            <div className="pos-mini-stat-box" style={{ borderColor: "rgba(139, 92, 246, 0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#C084FC", fontSize: "12px", fontWeight: 700 }}>
                <CheckCircle2 size={14} />
                <span>GitHub Actions CI/CD</span>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                <code style={{ color: "#F8FAFC" }}>.github/workflows/deploy.yml</code>
              </div>
            </div>
          </div>

          {/* Step 1: GitHub */}
          <div className="pos-deploy-step-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GitBranch size={16} color="#60A5FA" />
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#F8FAFC" }}>
                  Step 1: Push Pre-Built Git Repository to Your GitHub
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText("git", gitCommands)}
                className="pos-btn-secondary"
                style={{ padding: "5px 10px", fontSize: "11.5px" }}
              >
                {copiedKey === "git" ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                <span>{copiedKey === "git" ? "Copied!" : "Copy Commands"}</span>
              </button>
            </div>
            <pre className="pos-code-pre">{gitCommands}</pre>
          </div>

          {/* Step 2: Vercel */}
          <div className="pos-deploy-step-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Rocket size={16} color="#10B981" />
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#F8FAFC" }}>
                  Step 2: 1-Click Deploy to Vercel Production
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText("vercel", vercelCommands)}
                className="pos-btn-secondary"
                style={{ padding: "5px 10px", fontSize: "11.5px" }}
              >
                {copiedKey === "vercel" ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                <span>{copiedKey === "vercel" ? "Copied!" : "Copy CLI Command"}</span>
              </button>
            </div>
            <pre className="pos-code-pre">{vercelCommands}</pre>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              <a
                href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAliShayanAnsari%2FGeneralPOS"
                target="_blank"
                rel="noopener noreferrer"
                className="pos-btn-primary"
                style={{ textDecoration: "none", fontSize: "12.5px", padding: "8px 14px" }}
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
                style={{ textDecoration: "none", fontSize: "12.5px", padding: "8px 14px" }}
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
            Done & Return to Pro General POS
          </button>
        </div>
      </div>
    </div>
  );
}
