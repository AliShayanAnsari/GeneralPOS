# Pro General POS (v2.4 Enterprise Edition)

**Next-Generation Cloud & Offline-First Point of Sale System built with Next.js & React 18.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAliShayanAnsari%2FGeneralPOS)

**GitHub Repository:** [https://github.com/AliShayanAnsari/GeneralPOS](https://github.com/AliShayanAnsari/GeneralPOS)

---

## ✨ Key Capabilities Included (100% Free & Unlocked)

1. **Interactive Homepage with Animated SVG Architecture Diagrams**:
   - **Live Neural POS Telemetry Diagram**: Animated data packets flowing across *Omni-Scanner Input → Smart Cart & Dual-Tier Pricing → Multi-Tender Checkout → Atomic Inventory Sync → 80mm Thermal Receipt & Z-Report*.
   - **3-Mode Interactive System Architecture Switcher**:
     - *0.2s Express Checkout Pipeline*
     - *Zero-Downtime Hybrid Offline-First & Cloud Sync Topology*
     - *Closed-Loop Inventory, Partial Return Restock & Net Profit Waterfall*
   - **Sign In & Register New Store Portal** + **1-Click Instant Operator Access** (*Store Manager* & *Head Cashier*).

2. **High-Velocity POS Register (`F1`)**:
   - **Laser Barcode Scanner Wedge & Simulator**: Scan EAN-13/Code-128 barcodes or click **Simulate Scan** with Web Audio synthesized laser beep feedback.
   - **Dual Pricing Tiers**: Toggle between **Standard Retail Pricing** and **Wholesale B2B Pricing** in 1 click.
   - **Hold / Park & Recall Customer Bills**: Park active carts and recall them anytime.
   - **Promo Codes & Per-Item Discounts**: Supports `WELCOME10`, `VIP15`, `WHOLESALE5`, `SAVE10`, custom line discounts, and dynamic tax toggling.
   - **5-Way Multi-Tender Checkout**:
     - **Cash** (with quick denomination tenders & automatic **Change Due** calculator)
     - **Card POS Terminal**
     - **Mobile QR Wallet** (generates a dynamic SVG QR code for the exact invoice total)
     - **Split Payment (Cash + Card)**
     - **Customer Credit Ledger (Khata / B2B Receivables)**

3. **Inventory, SKUs & Printable Barcode Sticker Studio (`F3`)**:
   - Full SKU CRUD, cost/wholesale/retail margin calculator, low-stock alerts, quick `+10`/`+50` restock buttons, and a **Printable Barcode Shelf Label Generator**.

4. **Orders, Receipt Reprints & 1-Click Returns (`F4`)**:
   - Reprint 80mm thermal receipts or process 1-click refunds that automatically restore returned item quantities back into warehouse inventory.

5. **Customer CRM, Loyalty Points & Credit Ledger (`F5`)**:
   - Track VIP loyalty points, B2B credit limits, and record credit balance settlements.

6. **Suppliers & Stock-In Purchase Orders (`F6`)**:
   - Receive stock shipments from suppliers and immediately increment product stock counts.

7. **Cash Drawer, Store Expenses & Shift Z-Report (`F7`)**:
   - Track opening float, petty cash expenses, expected drawer cash, COGS, gross margin, and net profit with printable **Shift Z-Reports**.

8. **Store Settings, Multi-Currency & JSON/CSV Backup (`F9`)**:
   - Switch currency (`$`, `PKR`, `£`, `€`, `AED`) in 1 click, customize store details, and export/backup full JSON or CSV ledgers.

---

## 🚀 Deploy to GitHub & Vercel

### 1. Push to GitHub
This workspace is already initialized as a clean Git repository (`main` branch):

```bash
git remote add origin https://github.com/YOUR_USERNAME/pro-general-pos.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel
Run the Vercel CLI or import your GitHub repository at [vercel.com/new](https://vercel.com/new):

```bash
npx vercel --prod
```

---

## 🛠️ Local Development

```bash
npm install
npm run dev
```
