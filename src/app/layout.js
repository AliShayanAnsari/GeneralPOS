import "./globals.css";

export const metadata = {
  title: "Pro General POS — Next.js & React Enterprise Retail Point of Sale",
  description:
    "Pro General POS is a high-velocity Cloud & Offline-First Point of Sale built with Next.js and React. Features animated architecture diagrams, barcode scanning, dual retail/wholesale tiers, multi-tender checkout, credit ledger, and 80mm thermal receipts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
