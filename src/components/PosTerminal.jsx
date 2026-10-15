"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ScanBarcode,
  ShoppingCart,
  Package,
  FileText,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  PauseCircle,
  PlayCircle,
  CreditCard,
  Banknote,
  QrCode,
  Split,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Home,
  GitBranch,
  Tag,
  X,
  Edit3,
  Info,
  Scale,
  MessageSquare,
  Layers,
  Delete,
  Lock,
  Grid,
  ArrowRightLeft,
} from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  CURRENCY_OPTIONS,
  PROMO_CODES,
  ODOO_PRICELISTS,
  ODOO_FISCAL_POSITIONS,
} from "../data/initialData";
import { posSound } from "../utils/sound";
import {
  HeroArchitectureDiagram,
  InteractiveSystemDiagrams,
} from "./AnimatedDiagrams";

// Helper to render a crisp SVG Code-128 style barcode for receipts & shelf labels
function SvgBarcode({ value = "8901023001014", width = 180, height = 42 }) {
  const bars = useMemo(() => {
    const str = String(value || "8901023001014");
    const result = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      result.push((code % 3) + 1);
      result.push(((code >> 2) % 2) + 1);
    }
    return result;
  }, [value]);

  let currentX = 6;
  return (
    <svg
      viewBox={`0 0 ${width} ${height + 16}`}
      style={{ width: "100%", maxWidth: `${width}px`, height: "auto", display: "block", margin: "0 auto" }}
    >
      <rect width={width} height={height + 16} rx="4" fill="#FFFFFF" />
      {bars.map((w, idx) => {
        const barWidth = w * 1.65;
        const x = currentX;
        currentX += barWidth + (idx % 2 === 0 ? 1.4 : 2.1);
        if (x + barWidth > width - 6) return null;
        return (
          <rect
            key={idx}
            x={x}
            y={4}
            width={barWidth}
            height={height - 6}
            fill="#0F172A"
          />
        );
      })}
      <text
        x={width / 2}
        y={height + 12}
        textAnchor="middle"
        fill="#0F172A"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="700"
        letterSpacing="2"
      >
        {value}
      </text>
    </svg>
  );
}

// Helper to render a dynamic SVG QR code for Mobile Wallet checkout
function SvgQrCode({ payload = "PRO-GENERAL-POS" }) {
  const cells = useMemo(() => {
    const grid = [];
    let seed = 0;
    for (let i = 0; i < payload.length; i++) {
      seed = (seed * 31 + payload.charCodeAt(i)) % 999983;
    }
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const isFinder =
          (r < 4 && c < 4) ||
          (r < 4 && c > 10) ||
          (r > 10 && c < 4);
        if (isFinder) {
          grid.push({ r, c, on: true });
        } else {
          const val = (seed + r * 17 + c * 31 + r * c) % 7;
          grid.push({ r, c, on: val < 3 });
        }
      }
    }
    return grid;
  }, [payload]);

  return (
    <svg viewBox="0 0 170 170" style={{ width: "145px", height: "145px", margin: "0 auto", display: "block", border: "1px solid #E2E8F0", borderRadius: "10px" }}>
      <rect width="170" height="170" rx="10" fill="#FFFFFF" />
      {cells.map((cell, idx) =>
        cell.on ? (
          <rect
            key={idx}
            x={10 + cell.c * 10}
            y={10 + cell.r * 10}
            width="8.5"
            height="8.5"
            rx="1.5"
            fill="#0F172A"
          />
        ) : null
      )}
    </svg>
  );
}

export default function PosTerminal({
  currentUser,
  storeSettings,
  setStoreSettings,
  products,
  setProducts,
  customers,
  setCustomers,
  suppliers,
  orders,
  setOrders,
  expenses,
  setExpenses,
  parkedBills,
  setParkedBills,
  onBackToHome,
  onOpenDeployModal,
  onResetDemoData,
}) {
  // Active Top Module
  const [activeModule, setActiveModule] = useState("pos"); // pos | inventory | orders | customers | suppliers | drawer | analytics | settings

  // POS Register State
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Odoo Pricelist & Fiscal Position
  const [selectedPricelistId, setSelectedPricelistId] = useState("pl-public");
  const [selectedFiscalId, setSelectedFiscalId] = useState("fp-standard");
  const [selectedCustomerId, setSelectedCustomerId] = useState("cust-walkin");

  // Cart & Selected Orderline for Odoo Numpad
  const [cart, setCart] = useState([
    {
      id: "prd-101",
      name: "Artisan Cold Brew Coffee 330ml",
      sku: "BEV-101",
      barcode: "8901023001014",
      retailPrice: 4.5,
      wholesalePrice: 3.6,
      customUnitPrice: null,
      costPrice: 2.4,
      unit: "Units",
      qty: 2,
      itemDiscountPercent: 0,
      customerNote: "",
    },
    {
      id: "prd-201",
      name: "Extra Virgin Cold-Pressed Olive Oil 750ml",
      sku: "GRC-201",
      barcode: "8901023002011",
      retailPrice: 16.5,
      wholesalePrice: 13.8,
      customUnitPrice: null,
      costPrice: 10.2,
      unit: "Units",
      qty: 1,
      itemDiscountPercent: 0,
      customerNote: "",
    },
  ]);
  const [selectedLineId, setSelectedLineId] = useState("prd-101");

  // Odoo Numpad Mode: "qty" | "disc" | "price"
  const [numpadMode, setNumpadMode] = useState("qty");
  const [numpadBuffer, setNumpadBuffer] = useState("");

  // Odoo Modals on Register
  const [infoModalProduct, setInfoModalProduct] = useState(null);
  const [scaleModalProduct, setScaleModalProduct] = useState(null);
  const [scaleWeightKg, setScaleWeightKg] = useState(0.75);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [pricelistModalOpen, setPricelistModalOpen] = useState(false);
  const [cashInOutModalOpen, setCashInOutModalOpen] = useState(false);
  const [cashMoveType, setCashMoveType] = useState("Cash Out"); // "Cash In" | "Cash Out"
  const [cashMoveAmount, setCashMoveAmount] = useState("");
  const [cashMoveReason, setCashMoveReason] = useState("");
  const [closeSessionModalOpen, setCloseSessionModalOpen] = useState(false);
  const [countedCashClosing, setCountedCashClosing] = useState("");

  // Promo & Discounts
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [lastScannedBanner, setLastScannedBanner] = useState(null);

  // Payment Screen Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashTendered, setCashTendered] = useState("");
  const [splitCashAmount, setSplitCashAmount] = useState("");
  const [generateFormalInvoice, setGenerateFormalInvoice] = useState(true);
  const [orderNote, setOrderNote] = useState("");
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);
  const [showParkedDrawer, setShowParkedDrawer] = useState(false);

  // Odoo Product Form Sheet Modal (Inventory Module)
  const [invSearch, setInvSearch] = useState("");
  const [invStockFilter, setInvStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormTab, setProductFormTab] = useState("general"); // general | pos | inventory
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [barcodeLabelProduct, setBarcodeLabelProduct] = useState(null);

  // Orders Module State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilterMethod, setOrderFilterMethod] = useState("All");

  // Customers Module State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    vatNumber: "",
    pricelistId: "pl-public",
    tier: "VIP Gold",
    creditLimit: 500,
    notes: "",
  });
  const [settlingCustomer, setSettlingCustomer] = useState(null);
  const [settleAmount, setSettleAmount] = useState("");

  // Suppliers & Purchase Orders
  const [stockInProductId, setStockInProductId] = useState(
    products[0]?.id || "prd-101"
  );
  const [stockInQty, setStockInQty] = useState(25);
  const [stockInHistory, setStockInHistory] = useState([
    {
      id: "PO/2026/0081",
      productName: "Artisan Cold Brew Coffee 330ml",
      supplier: "Prime Beverage Co.",
      qty: 40,
      unitCost: 2.4,
      totalCost: 96.0,
      timestamp: "2026-10-15T08:15:00.000Z",
    },
  ]);

  const [toast, setToast] = useState(null);
  const searchInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    posSound.enabled = Boolean(storeSettings?.enableSoundEffects);
  }, [storeSettings?.enableSoundEffects]);

  // Reset numpad buffer when switching selected line or numpad mode
  useEffect(() => {
    setNumpadBuffer("");
  }, [selectedLineId, numpadMode]);

  const activePricelist =
    ODOO_PRICELISTS.find((p) => p.id === selectedPricelistId) ||
    ODOO_PRICELISTS[0];
  const activeFiscal =
    ODOO_FISCAL_POSITIONS.find((f) => f.id === selectedFiscalId) ||
    ODOO_FISCAL_POSITIONS[0];
  const activeCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const currency = storeSettings?.currency || "$";
  const formatMoney = (val) => `${currency}${Number(val || 0).toFixed(2)}`;

  // Helper to get active unit price for an item based on Odoo Pricelist + custom override
  const getEffectiveUnitPrice = (item) => {
    if (item.customUnitPrice !== null && item.customUnitPrice !== undefined) {
      return Number(item.customUnitPrice);
    }
    const base =
      activePricelist.mode === "wholesale"
        ? item.wholesalePrice
        : item.retailPrice;
    const afterPl = base * (1 - (activePricelist.discountPct || 0) / 100);
    return Number(afterPl.toFixed(2));
  };

  // Filtered products for POS grid
  const filteredPosProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add item to cart (or open Electronic Scale if product.toWeight is true)
  const addToCart = (product, viaScanner = false, customQty = null) => {
    if (product.toWeight && customQty === null && !viaScanner) {
      setScaleModalProduct(product);
      setScaleWeightKg(0.75);
      return;
    }

    if (product.stock <= 0) {
      posSound.playErrorBeep();
      showToast(`Out of stock: ${product.name}`, "error");
      return;
    }

    const qtyToAdd = customQty !== null ? Number(customQty) : 1;
    posSound.playScanBeep();

    if (viaScanner) {
      setLastScannedBanner({
        name: product.name,
        barcode: product.barcode,
        price:
          activePricelist.mode === "wholesale"
            ? product.wholesalePrice
            : product.retailPrice,
      });
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const nextQty = Number((existing.qty + qtyToAdd).toFixed(3));
        if (nextQty > product.stock) {
          showToast(
            `Max available On-Hand stock (${product.stock}) reached`,
            "warning"
          );
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: nextQty } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          retailPrice: product.retailPrice,
          wholesalePrice: product.wholesalePrice,
          customUnitPrice: null,
          costPrice: product.costPrice,
          unit: product.unit || "Units",
          qty: qtyToAdd,
          itemDiscountPercent: 0,
          customerNote: "",
        },
      ];
    });
    setSelectedLineId(product.id);
    setNumpadBuffer("");
  };

  // Handle Odoo Numpad Key Press
  const handleNumpadKey = (key) => {
    if (!selectedLineId || cart.length === 0) {
      showToast("Select an orderline in the ticket first", "warning");
      return;
    }
    posSound.playScanBeep();

    if (key === "BACKSPACE") {
      const nextBuf = numpadBuffer.slice(0, -1);
      setNumpadBuffer(nextBuf);
      applyNumpadValue(nextBuf === "" ? null : Number(nextBuf));
      return;
    }

    if (key === "+/-") {
      if (numpadMode === "qty") {
        setCart((prev) =>
          prev.map((item) =>
            item.id === selectedLineId ? { ...item, qty: item.qty * -1 } : item
          )
        );
      }
      return;
    }

    if (key === "." && numpadBuffer.includes(".")) return;

    const nextBuf = `${numpadBuffer}${key}`;
    setNumpadBuffer(nextBuf);
    const parsed = parseFloat(nextBuf);
    if (!Number.isNaN(parsed)) {
      applyNumpadValue(parsed);
    }
  };

  const applyNumpadValue = (val) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== selectedLineId) return item;
          if (numpadMode === "qty") {
            if (val === null || val === 0) return { ...item, qty: 1 };
            return { ...item, qty: val };
          }
          if (numpadMode === "disc") {
            const clamped = Math.max(0, Math.min(100, val || 0));
            return { ...item, itemDiscountPercent: clamped };
          }
          if (numpadMode === "price") {
            return {
              ...item,
              customUnitPrice: val === null ? null : Math.max(0, val),
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Barcode submit
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    const found = products.find(
      (p) =>
        p.barcode === code ||
        p.sku.toLowerCase() === code.toLowerCase() ||
        p.name.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      addToCart(found, true);
      setBarcodeInput("");
    } else {
      posSound.playErrorBeep();
      showToast(`Barcode/SKU "${code}" not found in Odoo catalog`, "error");
    }
  };

  const handleSimulateBarcodeScan = () => {
    const inStockItems = products.filter((p) => p.stock > 0);
    if (inStockItems.length === 0) return;
    const randomProduct =
      inStockItems[Math.floor(Math.random() * inStockItems.length)];
    addToCart(randomProduct, true, 1);
    showToast(
      `Scanned [${randomProduct.barcode}] ${randomProduct.name}`,
      "success"
    );
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = Number((item.qty + delta).toFixed(3));
          if (nextQty <= 0) return null;
          return { ...item, qty: nextQty };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Cart Calculations
  const cartSummary = useMemo(() => {
    let rawSubtotal = 0;
    let lineDiscountTotal = 0;

    cart.forEach((item) => {
      const unitPrice = getEffectiveUnitPrice(item);
      const lineGross = unitPrice * item.qty;
      const lineDisc = lineGross * ((item.itemDiscountPercent || 0) / 100);
      rawSubtotal += lineGross;
      lineDiscountTotal += lineDisc;
    });

    const afterLineSubtotal = rawSubtotal - lineDiscountTotal;

    let promoDiscount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === "percent") {
        promoDiscount = afterLineSubtotal * (appliedPromo.value / 100);
      } else {
        promoDiscount = appliedPromo.value;
      }
    }

    const totalDiscount = lineDiscountTotal + promoDiscount;
    const taxableAmount = rawSubtotal - totalDiscount;
    const effectiveTaxRate = activeFiscal.rate;
    const taxAmount = taxableAmount * (effectiveTaxRate / 100);
    const grandTotal = taxableAmount + taxAmount;

    return {
      subtotal: rawSubtotal,
      discountAmount: totalDiscount,
      taxAmount,
      grandTotal,
      totalItems: cart.reduce((acc, i) => acc + Math.abs(i.qty), 0),
    };
  }, [cart, activePricelist, appliedPromo, activeFiscal]);

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;
    const found = PROMO_CODES.find((p) => p.code === code);
    if (found) {
      setAppliedPromo(found);
      posSound.playScanBeep();
      showToast(`Applied Coupon ${found.code} (${found.description})`, "success");
    } else {
      posSound.playErrorBeep();
      showToast(`Invalid Coupon "${code}". Try ODOO20 or WELCOME10`, "error");
    }
  };

  // Hold / Floating Order
  const handleHoldBill = () => {
    if (cart.length === 0) {
      showToast("Order is empty", "warning");
      return;
    }
    const parked = {
      id: `Order 000${parkedBills.length + 2}`,
      timestamp: new Date().toISOString(),
      customerName: activeCustomer.name,
      customerId: activeCustomer.id,
      pricelistId: selectedPricelistId,
      cart,
      total: cartSummary.grandTotal,
    };
    setParkedBills((prev) => [parked, ...prev]);
    setCart([]);
    setAppliedPromo(null);
    showToast(`${parked.id} parked in Floating Orders`, "success");
  };

  const handleRecallBill = (parked) => {
    setCart(parked.cart);
    setSelectedCustomerId(parked.customerId);
    if (parked.pricelistId) setSelectedPricelistId(parked.pricelistId);
    setParkedBills((prev) => prev.filter((b) => b.id !== parked.id));
    setShowParkedDrawer(false);
    posSound.playScanBeep();
    showToast(`Restored ${parked.id}`, "success");
  };

  // Complete Odoo Payment
  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === "Customer Credit") {
      if (activeCustomer.id === "cust-walkin") {
        posSound.playErrorBeep();
        showToast("Please select a registered Partner/Customer for Credit Account.", "error");
        return;
      }
      const projectedCredit = activeCustomer.creditBalance + cartSummary.grandTotal;
      if (projectedCredit > activeCustomer.creditLimit) {
        posSound.playErrorBeep();
        showToast(
          `Credit limit exceeded! Available: ${formatMoney(
            Math.max(0, activeCustomer.creditLimit - activeCustomer.creditBalance)
          )}`,
          "error"
        );
        return;
      }
    }

    const tenderedNum =
      paymentMethod === "Cash"
        ? Number(cashTendered) || cartSummary.grandTotal
        : cartSummary.grandTotal;

    const changeDue =
      paymentMethod === "Cash"
        ? Math.max(0, tenderedNum - cartSummary.grandTotal)
        : 0;

    const orderNum = 1000 + orders.length + 1;
    const newOrder = {
      id: `Order 00014-001-${orderNum}`,
      invoiceRef: generateFormalInvoice ? `INV/2026/${orderNum}` : "Receipt Only",
      timestamp: new Date().toISOString(),
      cashier: currentUser?.name || "Alex Morgan",
      customerName: activeCustomer.name,
      customerId: activeCustomer.id,
      pricelistName: activePricelist.name,
      fiscalPosition: activeFiscal.name,
      pricingMode: activePricelist.mode,
      paymentMethod,
      isInvoiced: generateFormalInvoice,
      status: generateFormalInvoice ? "Invoiced" : "Paid",
      note: orderNote,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: getEffectiveUnitPrice(item),
        costPrice: item.costPrice,
        qty: item.qty,
        discount: item.itemDiscountPercent || 0,
        customerNote: item.customerNote || "",
      })),
      subtotal: cartSummary.subtotal,
      discountAmount: cartSummary.discountAmount,
      taxAmount: cartSummary.taxAmount,
      total: cartSummary.grandTotal,
      amountTendered: tenderedNum,
      changeDue,
    };

    // Deduct stock from WH/Stock
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = cart.find((c) => c.id === prod.id);
        if (!soldItem) return prod;
        return {
          ...prod,
          stock: Math.max(0, Number((prod.stock - soldItem.qty).toFixed(2))),
        };
      })
    );

    // Update Partner loyalty & receivables
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== activeCustomer.id) return c;
        const earnedPoints = Math.max(0, Math.floor(cartSummary.grandTotal));
        return {
          ...c,
          loyaltyPoints: c.loyaltyPoints + earnedPoints,
          totalSpent: c.totalSpent + cartSummary.grandTotal,
          creditBalance:
            paymentMethod === "Customer Credit"
              ? c.creditBalance + cartSummary.grandTotal
              : c.creditBalance,
        };
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    posSound.playSuccessChime();
    setIsCheckoutOpen(false);
    setActiveReceiptOrder(newOrder);
    setCart([]);
    setAppliedPromo(null);
    setCashTendered("");
    setSplitCashAmount("");
    setOrderNote("");
    showToast(`Validated ${newOrder.id} (${formatMoney(newOrder.total)})`, "success");
  };

  // Odoo Refund / Credit Note
  const handleRefundOrder = (order) => {
    if (order.status === "Refunded") {
      showToast("Order already refunded", "warning");
      return;
    }
    setProducts((prev) =>
      prev.map((prod) => {
        const returnedLine = order.items.find((i) => i.id === prod.id);
        if (!returnedLine) return prod;
        return {
          ...prod,
          stock: Number((prod.stock + returnedLine.qty).toFixed(2)),
        };
      })
    );
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: "Refunded" } : o
      )
    );
    posSound.playScanBeep();
    showToast(
      `Credit Note issued for ${order.id} & items returned to WH/Stock!`,
      "success"
    );
  };

  // Save Odoo Product Form
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim() || !editingProduct.sku.trim()) return;

    const normalized = {
      ...editingProduct,
      retailPrice: Number(editingProduct.retailPrice) || 0,
      wholesalePrice: Number(editingProduct.wholesalePrice) || 0,
      costPrice: Number(editingProduct.costPrice) || 0,
      stock: Number(editingProduct.stock) || 0,
      forecastedStock:
        Number(editingProduct.forecastedStock) || Number(editingProduct.stock) || 0,
      minStock: Number(editingProduct.minStock) || 5,
    };

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === normalized.id);
      if (exists) {
        return prev.map((p) => (p.id === normalized.id ? normalized : p));
      }
      return [normalized, ...prev];
    });

    setIsProductModalOpen(false);
    setEditingProduct(null);
    showToast(`Saved Product Template: ${normalized.name}`, "success");
  };

  // Record Cash In / Cash Out
  const handleRecordCashInOut = (e) => {
    e.preventDefault();
    const amt = Number(cashMoveAmount) || 0;
    if (!cashMoveReason.trim() || amt <= 0) return;

    const entry = {
      id: `CSH-${Date.now().toString().slice(-4)}`,
      type: cashMoveType,
      title: cashMoveReason.trim(),
      category: cashMoveType,
      amount: amt,
      paidVia: "Cash Drawer",
      timestamp: new Date().toISOString(),
      recordedBy: currentUser?.name || "Alex Morgan",
    };
    setExpenses((prev) => [entry, ...prev]);
    setCashMoveAmount("");
    setCashMoveReason("");
    setCashInOutModalOpen(false);
    posSound.playSuccessChime();
    showToast(`${cashMoveType}: ${formatMoney(amt)} (${entry.title})`, "success");
  };

  // Receive Purchase Order
  const handleReceiveStockOrder = (e) => {
    e.preventDefault();
    const target = products.find((p) => p.id === stockInProductId);
    const qtyNum = Number(stockInQty) || 0;
    if (!target || qtyNum <= 0) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === target.id
          ? {
              ...p,
              stock: p.stock + qtyNum,
              forecastedStock: (p.forecastedStock || p.stock) + qtyNum,
            }
          : p
      )
    );

    const poEntry = {
      id: `PO/2026/00${82 + stockInHistory.length}`,
      productName: target.name,
      supplier: target.supplier || "Global Foods Distribution",
      qty: qtyNum,
      unitCost: target.costPrice,
      totalCost: qtyNum * target.costPrice,
      timestamp: new Date().toISOString(),
    };
    setStockInHistory((prev) => [poEntry, ...prev]);
    posSound.playSuccessChime();
    showToast(
      `Validated Receipt ${poEntry.id}: +${qtyNum} ${target.unit} of ${target.name}`,
      "success"
    );
  };

  // Create Customer / Partner
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;
    const created = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      name: newCustomerForm.name.trim(),
      phone: newCustomerForm.phone.trim() || "N/A",
      email: newCustomerForm.email.trim() || "partner@store.local",
      address: newCustomerForm.address.trim() || "Main Street",
      vatNumber: newCustomerForm.vatNumber.trim() || "N/A",
      pricelistId: newCustomerForm.pricelistId || "pl-public",
      tier: newCustomerForm.tier,
      loyaltyPoints: 50,
      totalSpent: 0,
      creditBalance: 0,
      creditLimit: Number(newCustomerForm.creditLimit) || 500,
      notes: newCustomerForm.notes,
    };
    setCustomers((prev) => [...prev, created]);
    setSelectedCustomerId(created.id);
    setSelectedPricelistId(created.pricelistId);
    setIsCustomerModalOpen(false);
    showToast(`Partner "${created.name}" created in res.partner`, "success");
  };

  // Settle Customer Credit
  const handleSettleCredit = (e) => {
    e.preventDefault();
    if (!settlingCustomer) return;
    const amt = Number(settleAmount) || 0;
    if (amt <= 0) return;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === settlingCustomer.id
          ? { ...c, creditBalance: Math.max(0, c.creditBalance - amt) }
          : c
      )
    );
    posSound.playSuccessChime();
    showToast(
      `Posted ${formatMoney(amt)} payment for ${settlingCustomer.name}`,
      "success"
    );
    setSettlingCustomer(null);
    setSettleAmount("");
  };

  // Financial & Session Metrics
  const financialMetrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "Refunded");
    const grossRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const totalTaxCollected = activeOrders.reduce(
      (sum, o) => sum + (o.taxAmount || 0),
      0
    );
    let totalCogs = 0;
    activeOrders.forEach((o) => {
      o.items.forEach((item) => {
        totalCogs += (item.costPrice || 0) * item.qty;
      });
    });
    const grossProfit = grossRevenue - totalTaxCollected - totalCogs;

    const cashInTotal = expenses
      .filter((e) => e.type === "Cash In")
      .reduce((s, e) => s + e.amount, 0);
    const cashOutTotal = expenses
      .filter((e) => e.type !== "Cash In")
      .reduce((s, e) => s + e.amount, 0);

    const netProfit = grossProfit - cashOutTotal;

    const cashSales = activeOrders
      .filter((o) => o.paymentMethod === "Cash")
      .reduce((s, o) => s + o.total, 0);
    const cardSales = activeOrders
      .filter((o) => o.paymentMethod === "Card")
      .reduce((s, o) => s + o.total, 0);
    const qrSales = activeOrders
      .filter((o) => o.paymentMethod === "Mobile QR Wallet")
      .reduce((s, o) => s + o.total, 0);
    const creditSales = activeOrders
      .filter((o) => o.paymentMethod === "Customer Credit")
      .reduce((s, o) => s + o.total, 0);
    const splitSales = activeOrders
      .filter((o) => o.paymentMethod.includes("Split"))
      .reduce((s, o) => s + o.total, 0);

    const inventoryCostValue = products.reduce(
      (sum, p) => sum + p.costPrice * p.stock,
      0
    );
    const inventoryRetailValue = products.reduce(
      (sum, p) => sum + p.retailPrice * p.stock,
      0
    );
    const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

    const expectedDrawerCash =
      Number(storeSettings?.openingCashFloat || 500) +
      cashSales +
      splitSales * 0.5 +
      cashInTotal -
      cashOutTotal;

    return {
      activeOrderCount: activeOrders.length,
      grossRevenue,
      totalTaxCollected,
      totalCogs,
      grossProfit,
      cashInTotal,
      cashOutTotal,
      totalExpenses: cashOutTotal,
      netProfit,
      cashSales,
      cardSales,
      qrSales,
      creditSales,
      splitSales,
      inventoryCostValue,
      inventoryRetailValue,
      lowStockProducts,
      expectedDrawerCash,
      avgOrderValue:
        activeOrders.length > 0 ? grossRevenue / activeOrders.length : 0,
    };
  }, [orders, expenses, products, storeSettings?.openingCashFloat]);

  const selectedLineObj =
    cart.find((c) => c.id === selectedLineId) || cart[cart.length - 1] || null;

  return (
    <div className="pos-terminal-shell">
      {/* ================================================================== */}
      {/* ODOO PLUM TOP NAVBAR (#714B67)                                     */}
      {/* ================================================================== */}
      <header className="pos-topbar">
        {/* Left: Odoo App Switcher + Brand + Module Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", overflowX: "auto" }}>
          <button
            type="button"
            onClick={onBackToHome}
            className="pos-odoo-app-grid-btn"
            title="Switch to Homepage & Animated Diagrams"
          >
            <Grid size={18} color="#FFFFFF" />
          </button>

          <span style={{ fontWeight: 800, fontSize: "15px", color: "#FFFFFF", whiteSpace: "nowrap", marginRight: "6px" }}>
            {storeSettings?.storeName || "Pro General POS"}
          </span>

          {/* Top Odoo Navigation Tabs */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {[
              { id: "pos", label: "POS Register", icon: ShoppingCart },
              { id: "orders", label: "Orders", icon: FileText },
              { id: "inventory", label: "Products", icon: Package },
              { id: "customers", label: "Customers", icon: Users },
              { id: "suppliers", label: "Purchase (PO)", icon: Truck },
              { id: "drawer", label: "Cash & Z-Report", icon: Wallet },
              { id: "analytics", label: "Reporting & Flow", icon: BarChart3 },
              { id: "settings", label: "Configuration", icon: Settings },
            ].map((nav) => {
              const IconComp = nav.icon;
              const isActive = activeModule === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => setActiveModule(nav.id)}
                  className={`pos-odoo-top-tab ${isActive ? "active" : ""}`}
                >
                  <IconComp size={14} />
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Odoo Session Actions (Cash In/Out, Floating Orders, Currency, Close Session) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setCashInOutModalOpen(true)}
            className="pos-odoo-header-pill"
          >
            <ArrowRightLeft size={13} />
            <span>Cash In/Out</span>
          </button>

          <button
            type="button"
            onClick={() => setShowParkedDrawer((v) => !v)}
            className="pos-odoo-header-pill"
          >
            <PauseCircle size={13} />
            <span>Floating Orders ({parkedBills.length})</span>
          </button>

          <select
            value={storeSettings?.currency || "$"}
            onChange={(e) =>
              setStoreSettings((prev) => ({ ...prev, currency: e.target.value }))
            }
            className="pos-odoo-currency-select"
            title="Switch Currency"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.symbol} style={{ color: "#0F172A" }}>
                {c.code} ({c.symbol.trim()})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setCountedCashClosing(financialMetrics.expectedDrawerCash.toFixed(2));
              setCloseSessionModalOpen(true);
            }}
            className="pos-odoo-close-btn"
          >
            <Lock size={13} />
            <span>Close Session</span>
          </button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN MODULE VIEWPORT                                               */}
      {/* ================================================================== */}
      <div className="pos-main-body">
        <main className="pos-workspace-content">
          {/* ============================================================== */}
          {/* MODULE 1: AUTHENTIC ODOO POS REGISTER SCREEN                   */}
          {/* ============================================================== */}
          {activeModule === "pos" && (
            <div className="pos-odoo-register-grid">
              {/* LEFT PANE: ORDER TICKET + ODOO ACTION PAD + NUMPAD */}
              <div className="pos-odoo-left-ticket">
                {/* Orderlines Scroll Area */}
                <div className="pos-odoo-orderlines">
                  {cart.length === 0 ? (
                    <div className="pos-empty-cart">
                      <ShoppingCart size={38} color="#94A3B8" />
                      <div style={{ fontWeight: 800, color: "#334155", fontSize: "14.5px", marginTop: "8px" }}>
                        Start Adding Products
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#64748B", maxWidth: "240px", textAlign: "center", marginTop: "4px" }}>
                        Click any product card on the right, scan a barcode, or click &ldquo;Simulate Scan&rdquo;.
                      </div>
                    </div>
                  ) : (
                    cart.map((item) => {
                      const isSelected = item.id === selectedLineId;
                      const unitPrice = getEffectiveUnitPrice(item);
                      const gross = unitPrice * item.qty;
                      const disc =
                        gross * ((item.itemDiscountPercent || 0) / 100);
                      const netLine = gross - disc;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedLineId(item.id)}
                          className={`pos-odoo-line ${isSelected ? "selected" : ""}`}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: "13.5px", color: "#0F172A" }}>
                                {item.name}
                              </span>
                              <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "2px" }}>
                                <strong>{item.qty}</strong> {item.unit} × {formatMoney(unitPrice)} / {item.unit}
                                {item.itemDiscountPercent > 0 && (
                                  <span style={{ color: "#059669", fontWeight: 700, marginLeft: "6px" }}>
                                    With a {item.itemDiscountPercent}% discount
                                  </span>
                                )}
                              </div>
                              {item.customerNote && (
                                <div className="pos-odoo-line-note">
                                  <MessageSquare size={11} />
                                  <span>Customer Note: {item.customerNote}</span>
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span className="pos-mono" style={{ fontWeight: 800, fontSize: "14px", color: "#0F172A" }}>
                                {formatMoney(netLine)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(item.id);
                                }}
                                className="pos-line-trash-btn"
                                title="Remove Line"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Subtotal & Tax Summary Bar */}
                <div className="pos-odoo-totals-strip">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569" }}>
                    <span>
                      Taxes ({activeFiscal.name}):{" "}
                      <strong className="pos-mono">{formatMoney(cartSummary.taxAmount)}</strong>
                    </span>
                    {cartSummary.discountAmount > 0 && (
                      <span style={{ color: "#059669", fontWeight: 700 }}>
                        Discount: -{formatMoney(cartSummary.discountAmount)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>
                      Total
                    </span>
                    <span className="pos-mono" style={{ fontSize: "24px", fontWeight: 900, color: "#017E84" }}>
                      {formatMoney(cartSummary.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* ODOO ACTION BUTTONS PAD (Above Numpad) */}
                <div className="pos-odoo-control-buttons">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedLineObj) {
                        showToast("Select an orderline first to add a Customer Note", "warning");
                        return;
                      }
                      setNoteDraft(selectedLineObj.customerNote || "");
                      setNoteModalOpen(true);
                    }}
                    className="pos-odoo-ctrl-btn"
                  >
                    <MessageSquare size={14} color="#714B67" />
                    <span>Customer Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPricelistModalOpen(true)}
                    className="pos-odoo-ctrl-btn"
                  >
                    <Layers size={14} color="#017E84" />
                    <span>{activePricelist.name.split(" (")[0]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const prod = products.find(
                        (p) => p.id === (selectedLineObj?.id || "prd-101")
                      );
                      if (prod) setInfoModalProduct(prod);
                    }}
                    className="pos-odoo-ctrl-btn"
                  >
                    <Info size={14} color="#2563EB" />
                    <span>Product Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModule("orders")}
                    className="pos-odoo-ctrl-btn"
                  >
                    <RotateCcw size={14} color="#D97706" />
                    <span>Refund</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleHoldBill}
                    className="pos-odoo-ctrl-btn"
                  >
                    <PauseCircle size={14} color="#7C3AED" />
                    <span>Hold Order</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCart([]);
                      setAppliedPromo(null);
                    }}
                    className="pos-odoo-ctrl-btn"
                    style={{ color: "#DC2626" }}
                  >
                    <Trash2 size={14} />
                    <span>Clear</span>
                  </button>
                </div>

                {/* AUTHENTIC ODOO INTERACTIVE BOTTOM PAD: CUSTOMER + PAYMENT + 4x4 NUMPAD */}
                <div className="pos-odoo-bottom-pad">
                  {/* Left Sub-Column: Customer Select + Giant Payment Button */}
                  <div className="pos-odoo-pay-col">
                    <div className="pos-odoo-customer-box">
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => {
                          const cid = e.target.value;
                          setSelectedCustomerId(cid);
                          const cObj = customers.find((c) => c.id === cid);
                          if (cObj?.pricelistId) {
                            setSelectedPricelistId(cObj.pricelistId);
                          }
                        }}
                        className="pos-odoo-customer-select"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            👤 {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCustomerModalOpen(true)}
                        className="pos-odoo-new-cust-btn"
                        title="Create New Partner / Customer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => {
                        setCashTendered(cartSummary.grandTotal.toFixed(2));
                        setSplitCashAmount((cartSummary.grandTotal / 2).toFixed(2));
                        setIsCheckoutOpen(true);
                      }}
                      className="pos-odoo-giant-pay-btn"
                    >
                      <span style={{ fontSize: "19px", fontWeight: 900 }}>Payment</span>
                      <span className="pos-mono" style={{ fontSize: "14px", opacity: 0.92 }}>
                        {formatMoney(cartSummary.grandTotal)}
                      </span>
                    </button>
                  </div>

                  {/* Right Sub-Column: Authentic 4x4 Odoo Numpad */}
                  <div className="pos-odoo-numpad-grid">
                    {["1", "2", "3"].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleNumpadKey(n)}
                        className="pos-numpad-key"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNumpadMode("qty")}
                      className={`pos-numpad-mode ${numpadMode === "qty" ? "active" : ""}`}
                    >
                      Qty
                    </button>

                    {["4", "5", "6"].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleNumpadKey(n)}
                        className="pos-numpad-key"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNumpadMode("disc")}
                      className={`pos-numpad-mode ${numpadMode === "disc" ? "active" : ""}`}
                    >
                      % Disc
                    </button>

                    {["7", "8", "9"].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleNumpadKey(n)}
                        className="pos-numpad-key"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNumpadMode("price")}
                      className={`pos-numpad-mode ${numpadMode === "price" ? "active" : ""}`}
                    >
                      Price
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNumpadKey("+/-")}
                      className="pos-numpad-key"
                    >
                      +/-
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumpadKey("0")}
                      className="pos-numpad-key"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumpadKey(".")}
                      className="pos-numpad-key"
                    >
                      .
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumpadKey("BACKSPACE")}
                      className="pos-numpad-key"
                      title="Backspace"
                    >
                      <Delete size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PANE: CATEGORY BREADCRUMBS + SEARCH + BRIGHT ODOO PRODUCT CARDS */}
              <div className="pos-catalog-pane">
                {/* Search + Barcode Wedge + Coupon Bar */}
                <div className="pos-scanner-bar">
                  <div className="pos-search-input-wrap">
                    <Search size={16} color="#64748B" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Products by Name, Internal Ref, or Category..."
                      className="pos-clean-input"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="pos-clear-x"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleBarcodeSubmit} className="pos-barcode-form">
                    <ScanBarcode size={16} color="#714B67" />
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Scan Barcode + Enter..."
                      className="pos-clean-input"
                    />
                  </form>

                  <button
                    type="button"
                    onClick={handleSimulateBarcodeScan}
                    className="pos-simulate-scan-btn"
                  >
                    <ScanBarcode size={15} />
                    <span>Simulate Scan</span>
                  </button>
                </div>

                {/* Odoo Category Breadcrumbs & Pills */}
                <div className="pos-category-strip">
                  {PRODUCT_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const count =
                      cat.id === "All"
                        ? products.length
                        : products.filter((p) => p.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`pos-category-pill ${isSelected ? "active" : ""}`}
                      >
                        <span>{cat.label}</span>
                        <span className="pos-cat-count">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Bright Odoo Product Cards Grid */}
                <div className="pos-product-grid">
                  {filteredPosProducts.map((product) => {
                    const inCartItem = cart.find((c) => c.id === product.id);
                    const basePrice =
                      activePricelist.mode === "wholesale"
                        ? product.wholesalePrice
                        : product.retailPrice;
                    const activePrice =
                      basePrice * (1 - (activePricelist.discountPct || 0) / 100);
                    const isLowStock =
                      product.stock > 0 && product.stock <= product.minStock;
                    const isOut = product.stock <= 0;

                    return (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product, false)}
                        className={`pos-product-card ${
                          inCartItem ? "in-cart" : ""
                        } ${isOut ? "out-of-stock" : ""}`}
                      >
                        {/* Top Bar: Price Tag + Odoo Info "i" Icon */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className="pos-odoo-price-tag">
                            {formatMoney(activePrice)}
                            {product.toWeight ? ` / ${product.unit}` : ""}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInfoModalProduct(product);
                            }}
                            className="pos-odoo-info-icon"
                            title="Odoo Product Info (Warehouse Stock, Margins, Tax)"
                          >
                            <Info size={13} />
                          </button>
                        </div>

                        {/* Middle: Product Name & Category */}
                        <div style={{ margin: "10px 0" }}>
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: 800,
                              color: product.colorAccent || "#714B67",
                              textTransform: "uppercase",
                              marginBottom: "2px",
                            }}
                          >
                            [{product.sku}] {product.category}
                          </div>
                          <div className="pos-product-name">{product.name}</div>
                        </div>

                        {/* Bottom: Stock Status & Scale / Cart Indicator */}
                        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            className={`pos-stock-badge ${
                              isOut
                                ? "stock-out"
                                : isLowStock
                                ? "stock-low"
                                : "stock-ok"
                            }`}
                          >
                            {isOut
                              ? "Out of Stock"
                              : `${product.stock} ${product.unit}`}
                          </span>

                          {product.toWeight ? (
                            <span className="pos-scale-pill">
                              <Scale size={11} /> Scale
                            </span>
                          ) : inCartItem ? (
                            <span className="pos-in-cart-qty-pill">
                              {inCartItem.qty} in ticket
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 2: PRODUCTS (ODOO PRODUCT FORM & KANBAN / LIST)         */}
          {/* ============================================================== */}
          {activeModule === "inventory" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Products (`product.template`) — Odoo Inventory & Barcode Studio
                  </h2>
                  <p className="pos-module-subtitle">
                    Click any product to open its Odoo Product Form Sheet (On-Hand, Forecasted, Sales Price, Customer Taxes, Warehouse Location).
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setBarcodeLabelProduct(products[0])}
                    className="pos-btn-secondary"
                  >
                    <Printer size={15} />
                    <span>Print Shelf Barcode Labels</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct({
                        id: `prd-${Date.now().toString().slice(-4)}`,
                        name: "",
                        sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
                        barcode: `890102300${Math.floor(1000 + Math.random() * 8999)}`,
                        category: "Grocery & Staples",
                        productType: "Storable Product",
                        invoicingPolicy: "Ordered quantities",
                        availableInPos: true,
                        canBeSold: true,
                        canBePurchased: true,
                        toWeight: false,
                        retailPrice: 9.99,
                        wholesalePrice: 7.99,
                        costPrice: 5.5,
                        stock: 50,
                        forecastedStock: 50,
                        minStock: 10,
                        unit: "Units",
                        customerTax: "8% GST",
                        supplier: "Global Foods Distribution",
                        warehouseLocation: "WH/Stock/Aisle-01",
                        expiryDate: "2027-12-31",
                        colorAccent: "#714B67",
                      });
                      setProductFormTab("general");
                      setIsProductModalOpen(true);
                    }}
                    className="pos-btn-primary"
                  >
                    <Plus size={15} />
                    <span>New Product (Odoo Form)</span>
                  </button>
                </div>
              </div>

              {/* KPIs */}
              <div className="pos-kpi-grid">
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Total Products</span>
                  <strong className="pos-kpi-value">{products.length}</strong>
                  <span className="pos-kpi-sub">Available in POS Session</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Total On-Hand Units</span>
                  <strong className="pos-kpi-value">
                    {products.reduce((s, p) => s + p.stock, 0).toLocaleString()}
                  </strong>
                  <span className="pos-kpi-sub">Warehouse: WH/Stock</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Stock Valuation (Cost)</span>
                  <strong className="pos-kpi-value">
                    {formatMoney(financialMetrics.inventoryCostValue)}
                  </strong>
                  <span className="pos-kpi-sub">
                    Retail Value: {formatMoney(financialMetrics.inventoryRetailValue)}
                  </span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Replenishment Alerts</span>
                  <strong className="pos-kpi-value" style={{ color: "#D97706" }}>
                    {financialMetrics.lowStockProducts.length} SKUs
                  </strong>
                  <span className="pos-kpi-sub">Below Min Reorder Rule</span>
                </div>
              </div>

              <div className="pos-table-container">
                <table className="pos-table">
                  <thead>
                    <tr>
                      <th>Internal Ref / Barcode</th>
                      <th>Product Name</th>
                      <th>POS Category</th>
                      <th>Sales Price</th>
                      <th>B2B Wholesale</th>
                      <th>Cost</th>
                      <th>On Hand</th>
                      <th>Forecasted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="pos-mono">
                          <div style={{ fontWeight: 700, color: "#0F172A" }}>{p.sku}</div>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>{p.barcode}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: "#0F172A" }}>
                            {p.name}
                            {p.toWeight && (
                              <span className="pos-scale-pill" style={{ marginLeft: "6px" }}>
                                To Weigh (kg)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>
                            {p.productType || "Storable Product"} • {p.warehouseLocation || "WH/Stock"}
                          </div>
                        </td>
                        <td>
                          <span className="pos-sku-tag">{p.category}</span>
                        </td>
                        <td className="pos-mono" style={{ fontWeight: 800, color: "#017E84" }}>
                          {formatMoney(p.retailPrice)}
                        </td>
                        <td className="pos-mono">{formatMoney(p.wholesalePrice)}</td>
                        <td className="pos-mono">{formatMoney(p.costPrice)}</td>
                        <td>
                          <span
                            className={`pos-stock-badge ${
                              p.stock <= 0
                                ? "stock-out"
                                : p.stock <= p.minStock
                                ? "stock-low"
                                : "stock-ok"
                            }`}
                          >
                            {p.stock} {p.unit}
                          </span>
                        </td>
                        <td className="pos-mono">
                          {p.forecastedStock || p.stock} {p.unit}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(p);
                                setProductFormTab("general");
                                setIsProductModalOpen(true);
                              }}
                              className="pos-btn-secondary"
                              style={{ padding: "5px 10px", fontSize: "11.5px" }}
                            >
                              <Edit3 size={13} />
                              <span>Odoo Form</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBarcodeLabelProduct(p)}
                              className="pos-btn-secondary"
                              style={{ padding: "5px 8px", fontSize: "11.5px" }}
                              title="Print Barcode Labels"
                            >
                              <ScanBarcode size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 3: ORDERS (`pos.order`) & REFUNDS                       */}
          {/* ============================================================== */}
          {activeModule === "orders" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    POS Orders (`pos.order`), Tax Invoices & Refund / Credit Notes
                  </h2>
                  <p className="pos-module-subtitle">
                    View all session orders, reprint 80mm thermal receipts, or issue an Odoo Credit Note / Refund that reverses the warehouse stock move.
                  </p>
                </div>
              </div>

              <div className="pos-table-container">
                <table className="pos-table">
                  <thead>
                    <tr>
                      <th>Order Ref</th>
                      <th>Invoice Number</th>
                      <th>Date</th>
                      <th>Customer / Partner</th>
                      <th>Pricelist</th>
                      <th>Payment Method</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="pos-mono" style={{ fontWeight: 800, color: "#714B67" }}>
                          {order.id}
                        </td>
                        <td className="pos-mono">{order.invoiceRef || "Receipt"}</td>
                        <td style={{ fontSize: "12px", color: "#64748B" }}>
                          {new Date(order.timestamp).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 700, color: "#0F172A" }}>
                          {order.customerName}
                        </td>
                        <td style={{ fontSize: "12px" }}>
                          {order.pricelistName || "Public Pricelist"}
                        </td>
                        <td>{order.paymentMethod}</td>
                        <td className="pos-mono" style={{ fontWeight: 800, color: "#017E84" }}>
                          {formatMoney(order.total)}
                        </td>
                        <td>
                          <span
                            className={`pos-stock-badge ${
                              order.status === "Refunded" ? "stock-out" : "stock-ok"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => setActiveReceiptOrder(order)}
                              className="pos-btn-secondary"
                              style={{ padding: "5px 10px", fontSize: "11.5px" }}
                            >
                              <Printer size={13} />
                              <span>Receipt</span>
                            </button>
                            {order.status !== "Refunded" && (
                              <button
                                type="button"
                                onClick={() => handleRefundOrder(order)}
                                className="pos-btn-secondary"
                                style={{
                                  padding: "5px 10px",
                                  fontSize: "11.5px",
                                  color: "#DC2626",
                                  borderColor: "#FCA5A5",
                                }}
                              >
                                <RotateCcw size={13} />
                                <span>Refund Order</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 4: CUSTOMERS / PARTNERS (`res.partner`)                 */}
          {/* ============================================================== */}
          {activeModule === "customers" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Customers / Partners (`res.partner`) — Pricelists, Loyalty & Receivables
                  </h2>
                  <p className="pos-module-subtitle">
                    Manage customer addresses, tax IDs (VAT), default pricelists, loyalty points, and credit balances.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="pos-btn-primary"
                >
                  <Plus size={15} />
                  <span>Create Partner</span>
                </button>
              </div>

              <div className="pos-table-container">
                <table className="pos-table">
                  <thead>
                    <tr>
                      <th>Partner Name</th>
                      <th>Phone & Email</th>
                      <th>Address & VAT</th>
                      <th>Assigned Pricelist</th>
                      <th>Loyalty Points</th>
                      <th>Receivable Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => {
                      const pl = ODOO_PRICELISTS.find((p) => p.id === c.pricelistId);
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 800, color: "#0F172A" }}>{c.name}</td>
                          <td style={{ fontSize: "12px" }}>
                            <div>{c.phone}</div>
                            <div style={{ color: "#64748B" }}>{c.email}</div>
                          </td>
                          <td style={{ fontSize: "12px" }}>
                            <div>{c.address || "Main Street"}</div>
                            <div style={{ color: "#64748B" }}>Tax ID: {c.vatNumber || "N/A"}</div>
                          </td>
                          <td>
                            <span className="pos-sku-tag">
                              {pl ? pl.name.split(" (")[0] : c.tier}
                            </span>
                          </td>
                          <td className="pos-mono" style={{ color: "#059669", fontWeight: 700 }}>
                            {c.loyaltyPoints} pts
                          </td>
                          <td
                            className="pos-mono"
                            style={{
                              fontWeight: 800,
                              color: c.creditBalance > 0 ? "#D97706" : "#64748B",
                            }}
                          >
                            {formatMoney(c.creditBalance)}
                          </td>
                          <td>
                            {c.creditBalance > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSettlingCustomer(c);
                                  setSettleAmount(c.creditBalance.toFixed(2));
                                }}
                                className="pos-btn-primary"
                                style={{ padding: "5px 10px", fontSize: "11.5px" }}
                              >
                                <Banknote size={13} />
                                <span>Register Payment</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: "11.5px", color: "#64748B" }}>
                                Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 5: PURCHASE ORDERS & WAREHOUSE RECEIPTS                 */}
          {/* ============================================================== */}
          {activeModule === "suppliers" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Purchase Orders (`purchase.order`) & Warehouse Stock Receipts (`WH/In`)
                  </h2>
                  <p className="pos-module-subtitle">
                    Receive products from vendors and immediately increase On-Hand & Forecasted warehouse quantities.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "18px" }}>
                <div className="pos-card-panel">
                  <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>
                    Validate Incoming Shipment (`WH/In`)
                  </h3>
                  <form onSubmit={handleReceiveStockOrder} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label className="pos-field-label">Product to Receive</label>
                      <select
                        value={stockInProductId}
                        onChange={(e) => setStockInProductId(e.target.value)}
                        className="pos-input"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.sku}] {p.name} (On Hand: {p.stock} {p.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="pos-field-label">Quantity Done</label>
                      <input
                        type="number"
                        min="1"
                        value={stockInQty}
                        onChange={(e) => setStockInQty(e.target.value)}
                        className="pos-input"
                        required
                      />
                    </div>
                    <button type="submit" className="pos-btn-primary" style={{ justifyContent: "center" }}>
                      <Truck size={15} />
                      <span>Validate Receipt & Update Stock</span>
                    </button>
                  </form>
                </div>

                <div className="pos-card-panel">
                  <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>
                    Validated Purchase Receipts
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {stockInHistory.map((po) => (
                      <div key={po.id} className="pos-mini-stat-box">
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "13px" }}>
                          <span>{po.productName}</span>
                          <span style={{ color: "#059669", fontFamily: "monospace" }}>
                            +{po.qty} Units ({formatMoney(po.totalCost)})
                          </span>
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "3px" }}>
                          {po.id} • Vendor: {po.supplier}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 6: CASH IN/OUT & SESSION CLOSING Z-REPORT               */}
          {/* ============================================================== */}
          {activeModule === "drawer" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Session Cash Control, Cash In/Out Log & Z-Report
                  </h2>
                  <p className="pos-module-subtitle">
                    Reconcile opening cash, cash sales, and petty Cash In / Cash Out movements.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setCashInOutModalOpen(true)}
                    className="pos-btn-secondary"
                  >
                    <ArrowRightLeft size={15} />
                    <span>New Cash In / Out</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="pos-btn-primary"
                  >
                    <Printer size={15} />
                    <span>Print Session Z-Report</span>
                  </button>
                </div>
              </div>

              <div className="pos-kpi-grid">
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Opening Cash Control</span>
                  <strong className="pos-kpi-value">
                    {formatMoney(storeSettings?.openingCashFloat || 500)}
                  </strong>
                  <span className="pos-kpi-sub">Session Starting Float</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Cash Sales Collected</span>
                  <strong className="pos-kpi-value" style={{ color: "#059669" }}>
                    +{formatMoney(financialMetrics.cashSales + financialMetrics.splitSales * 0.5)}
                  </strong>
                  <span className="pos-kpi-sub">From POS Cash Journal</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Net Cash In / Out</span>
                  <strong className="pos-kpi-value" style={{ color: "#D97706" }}>
                    {formatMoney(financialMetrics.cashInTotal - financialMetrics.cashOutTotal)}
                  </strong>
                  <span className="pos-kpi-sub">{expenses.length} drawer movements</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Expected in Cash Drawer</span>
                  <strong className="pos-kpi-value" style={{ color: "#714B67" }}>
                    {formatMoney(financialMetrics.expectedDrawerCash)}
                  </strong>
                  <span className="pos-kpi-sub">Ready for Session Closing</span>
                </div>
              </div>

              <div className="pos-card-panel">
                <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 800 }}>
                  Cash In / Cash Out Register Log
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {expenses.map((exp) => (
                    <div key={exp.id} className="pos-mini-stat-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span
                          className={`pos-stock-badge ${
                            exp.type === "Cash In" ? "stock-ok" : "stock-out"
                          }`}
                          style={{ marginRight: "8px" }}
                        >
                          {exp.type || "Cash Out"}
                        </span>
                        <strong style={{ color: "#0F172A" }}>{exp.title}</strong>
                      </div>
                      <span className="pos-mono" style={{ fontWeight: 800 }}>
                        {exp.type === "Cash In" ? "+" : "-"}
                        {formatMoney(exp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 7: REPORTING & ANIMATED ARCHITECTURE DIAGRAMS           */}
          {/* ============================================================== */}
          {activeModule === "analytics" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Odoo POS Reporting & Interactive Animated Architecture Diagrams
                  </h2>
                  <p className="pos-module-subtitle">
                    Real-time sales analytics and animated system diagrams.
                  </p>
                </div>
              </div>

              <div className="pos-kpi-grid">
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Gross Sales Revenue</span>
                  <strong className="pos-kpi-value" style={{ color: "#017E84" }}>
                    {formatMoney(financialMetrics.grossRevenue)}
                  </strong>
                  <span className="pos-kpi-sub">{financialMetrics.activeOrderCount} Orders</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Net Profit Margin</span>
                  <strong className="pos-kpi-value" style={{ color: "#059669" }}>
                    {formatMoney(financialMetrics.netProfit)}
                  </strong>
                  <span className="pos-kpi-sub">After COGS & Cash Out</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Average Order Value</span>
                  <strong className="pos-kpi-value">
                    {formatMoney(financialMetrics.avgOrderValue)}
                  </strong>
                  <span className="pos-kpi-sub">Across all pricelists</span>
                </div>
              </div>

              <div style={{ marginBottom: "22px" }}>
                <HeroArchitectureDiagram />
              </div>

              <InteractiveSystemDiagrams />
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 8: CONFIGURATION / POS SETTINGS                         */}
          {/* ============================================================== */}
          {activeModule === "settings" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Point of Sale Configuration (`res.config.settings`)
                  </h2>
                  <p className="pos-module-subtitle">
                    Configure store details, default taxes, receipt header/footer, and database reset.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onResetDemoData}
                  className="pos-btn-secondary"
                  style={{ color: "#DC2626" }}
                >
                  <RotateCcw size={14} />
                  <span>Reset Demo Database</span>
                </button>
              </div>

              <div className="pos-card-panel" style={{ maxWidth: "740px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="pos-field-label">Point of Sale Name</label>
                    <input
                      type="text"
                      value={storeSettings?.storeName || ""}
                      onChange={(e) =>
                        setStoreSettings((p) => ({ ...p, storeName: e.target.value }))
                      }
                      className="pos-input"
                    />
                  </div>
                  <div>
                    <label className="pos-field-label">Session / Shop Floor Name</label>
                    <input
                      type="text"
                      value={storeSettings?.branchName || ""}
                      onChange={(e) =>
                        setStoreSettings((p) => ({ ...p, branchName: e.target.value }))
                      }
                      className="pos-input"
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="pos-field-label">Receipt Footer Custom Text</label>
                    <input
                      type="text"
                      value={storeSettings?.receiptFooter || ""}
                      onChange={(e) =>
                        setStoreSettings((p) => ({
                          ...p,
                          receiptFooter: e.target.value,
                        }))
                      }
                      className="pos-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================================================================== */}
      {/* ODOO PRODUCT INFORMATION ("i") MODAL                               */}
      {/* ================================================================== */}
      {infoModalProduct && (
        <div className="pos-modal-backdrop" onClick={() => setInfoModalProduct(null)}>
          <div className="pos-modal-card" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0F172A" }}>
                  Product Information — {infoModalProduct.name}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748B", fontFamily: "monospace" }}>
                  Internal Ref: [{infoModalProduct.sku}] • Barcode: {infoModalProduct.barcode}
                </span>
              </div>
              <button type="button" onClick={() => setInfoModalProduct(null)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="pos-mini-stat-box">
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>FINANCIALS & PRICING</div>
                  <div style={{ marginTop: "6px", fontSize: "13px" }}>
                    <div>Public Price: <strong>{formatMoney(infoModalProduct.retailPrice)}</strong></div>
                    <div>B2B Wholesale: <strong>{formatMoney(infoModalProduct.wholesalePrice)}</strong></div>
                    <div>Cost Price: <strong>{formatMoney(infoModalProduct.costPrice)}</strong></div>
                    <div style={{ color: "#059669", fontWeight: 700 }}>
                      Margin: {(((infoModalProduct.retailPrice - infoModalProduct.costPrice) / infoModalProduct.retailPrice) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="pos-mini-stat-box">
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700 }}>INVENTORY & WAREHOUSE</div>
                  <div style={{ marginTop: "6px", fontSize: "13px" }}>
                    <div>Warehouse: <strong>{infoModalProduct.warehouseLocation || "WH/Stock"}</strong></div>
                    <div>On Hand: <strong style={{ color: "#017E84" }}>{infoModalProduct.stock} {infoModalProduct.unit}</strong></div>
                    <div>Forecasted: <strong>{infoModalProduct.forecastedStock || infoModalProduct.stock} {infoModalProduct.unit}</strong></div>
                    <div>Supplier: <strong>{infoModalProduct.supplier}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pos-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(infoModalProduct);
                  setInfoModalProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="pos-btn-secondary"
              >
                <Edit3 size={14} />
                <span>Edit in Odoo Product Form</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCart(infoModalProduct, false, 1);
                  setInfoModalProduct(null);
                }}
                className="pos-btn-primary"
              >
                <Plus size={14} />
                <span>Add to Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ODOO ELECTRONIC SCALE WEIGHING MODAL                               */}
      {/* ================================================================== */}
      {scaleModalProduct && (
        <div className="pos-modal-backdrop" onClick={() => setScaleModalProduct(null)}>
          <div className="pos-modal-card" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Scale size={18} color="#16A34A" />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                  Odoo Electronic Scale — {scaleModalProduct.name}
                </h3>
              </div>
              <button type="button" onClick={() => setScaleModalProduct(null)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ background: "#F0FDF4", border: "2px solid #16A34A", borderRadius: "12px", padding: "16px", marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#15803D" }}>DIGITAL SCALE READOUT</div>
                <div className="pos-mono" style={{ fontSize: "32px", fontWeight: 900, color: "#0F172A", margin: "6px 0" }}>
                  {Number(scaleWeightKg).toFixed(3)} kg
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#16A34A" }}>
                  Computed Price: {formatMoney(scaleWeightKg * scaleModalProduct.retailPrice)} ({formatMoney(scaleModalProduct.retailPrice)}/kg)
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setScaleWeightKg(w)}
                    className="pos-btn-secondary"
                    style={{ fontFamily: "monospace" }}
                  >
                    {w.toFixed(2)} kg
                  </button>
                ))}
              </div>
            </div>
            <div className="pos-modal-footer">
              <button type="button" onClick={() => setScaleModalProduct(null)} className="pos-btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCart(scaleModalProduct, false, scaleWeightKg);
                  setScaleModalProduct(null);
                }}
                className="pos-btn-primary"
              >
                Buy / Add Weighed Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ODOO CUSTOMER NOTE MODAL                                           */}
      {/* ================================================================== */}
      {noteModalOpen && selectedLineObj && (
        <div className="pos-modal-backdrop" onClick={() => setNoteModalOpen(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Add Customer Note — {selectedLineObj.name}
              </h3>
              <button type="button" onClick={() => setNoteModalOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "18px" }}>
              <input
                type="text"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="e.g., Gift wrap, Extra cold, Sliced thin, Fragile..."
                className="pos-input"
              />
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                {["Gift Wrap", "Extra Cold", "Fragile — Handle with Care", "No Plastic Bag", "Urgent Delivery"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNoteDraft(tag)}
                    className="pos-btn-secondary"
                    style={{ padding: "4px 9px", fontSize: "11.5px" }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="pos-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setCart((prev) =>
                    prev.map((item) =>
                      item.id === selectedLineObj.id
                        ? { ...item, customerNote: noteDraft }
                        : item
                    )
                  );
                  setNoteModalOpen(false);
                  showToast("Customer note attached to orderline", "success");
                }}
                className="pos-btn-primary"
              >
                Apply Customer Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ODOO PRICELIST & FISCAL POSITION SELECTOR MODAL                    */}
      {/* ================================================================== */}
      {pricelistModalOpen && (
        <div className="pos-modal-backdrop" onClick={() => setPricelistModalOpen(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Select Odoo Pricelist & Fiscal Tax Position
              </h3>
              <button type="button" onClick={() => setPricelistModalOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="pos-field-label">Active Pricelist (`product.pricelist`)</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {ODOO_PRICELISTS.map((pl) => (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => {
                        setSelectedPricelistId(pl.id);
                        showToast(`Switched to ${pl.name}`, "success");
                      }}
                      className={`pos-quick-role-btn ${
                        selectedPricelistId === pl.id ? "active-pl" : ""
                      }`}
                    >
                      <span style={{ fontWeight: 700, color: "#0F172A" }}>{pl.name}</span>
                      {selectedPricelistId === pl.id && (
                        <CheckCircle2 size={16} color="#017E84" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="pos-field-label">Fiscal Tax Position (`account.fiscal.position`)</label>
                <select
                  value={selectedFiscalId}
                  onChange={(e) => setSelectedFiscalId(e.target.value)}
                  className="pos-input"
                >
                  {ODOO_FISCAL_POSITIONS.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pos-modal-footer">
              <button type="button" onClick={() => setPricelistModalOpen(false)} className="pos-btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ODOO CASH IN / CASH OUT MODAL                                      */}
      {/* ================================================================== */}
      {cashInOutModalOpen && (
        <div className="pos-modal-backdrop" onClick={() => setCashInOutModalOpen(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Odoo Cash In / Cash Out (`pos.session`)
              </h3>
              <button type="button" onClick={() => setCashInOutModalOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordCashInOut} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setCashMoveType("Cash In")}
                  className={`pos-tender-option ${cashMoveType === "Cash In" ? "active" : ""}`}
                >
                  <span>➕ Cash In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCashMoveType("Cash Out")}
                  className={`pos-tender-option ${cashMoveType === "Cash Out" ? "active" : ""}`}
                >
                  <span>➖ Cash Out</span>
                </button>
              </div>
              <div>
                <label className="pos-field-label">Amount ({currency.trim()})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={cashMoveAmount}
                  onChange={(e) => setCashMoveAmount(e.target.value)}
                  placeholder="0.00"
                  className="pos-input"
                  required
                />
              </div>
              <div>
                <label className="pos-field-label">Reason / Reference</label>
                <input
                  type="text"
                  value={cashMoveReason}
                  onChange={(e) => setCashMoveReason(e.target.value)}
                  placeholder="e.g., Petty cash for carrier bags, Added change coins..."
                  className="pos-input"
                  required
                />
              </div>
              <button type="submit" className="pos-btn-primary" style={{ justifyContent: "center" }}>
                Confirm {cashMoveType}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ODOO CLOSING SESSION CONTROL MODAL                                 */}
      {/* ================================================================== */}
      {closeSessionModalOpen && (
        <div className="pos-modal-backdrop" onClick={() => setCloseSessionModalOpen(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800 }}>
                Closing Session Control — {storeSettings?.branchName}
              </h3>
              <button type="button" onClick={() => setCloseSessionModalOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="pos-mini-stat-box">
                <div className="pos-summary-row">
                  <span>Total Orders Validated:</span>
                  <strong>{financialMetrics.activeOrderCount} orders ({formatMoney(financialMetrics.grossRevenue)})</strong>
                </div>
                <div className="pos-summary-row">
                  <span>Opening Cash Float:</span>
                  <span className="pos-mono">{formatMoney(storeSettings?.openingCashFloat || 500)}</span>
                </div>
                <div className="pos-summary-row">
                  <span>+ Cash Payments Received:</span>
                  <span className="pos-mono">+{formatMoney(financialMetrics.cashSales + financialMetrics.splitSales * 0.5)}</span>
                </div>
                <div className="pos-summary-row">
                  <span>+/- Cash In / Out Movements:</span>
                  <span className="pos-mono">{formatMoney(financialMetrics.cashInTotal - financialMetrics.cashOutTotal)}</span>
                </div>
                <div className="pos-grand-total-row">
                  <span>Expected Cash in Drawer:</span>
                  <span className="pos-grand-total-val">{formatMoney(financialMetrics.expectedDrawerCash)}</span>
                </div>
              </div>

              <div>
                <label className="pos-field-label">Counted Physical Cash in Drawer ({currency.trim()})</label>
                <input
                  type="number"
                  step="0.01"
                  value={countedCashClosing}
                  onChange={(e) => setCountedCashClosing(e.target.value)}
                  className="pos-input"
                />
              </div>
            </div>
            <div className="pos-modal-footer">
              <button type="button" onClick={() => setCloseSessionModalOpen(false)} className="pos-btn-secondary">
                Keep Session Open
              </button>
              <button
                type="button"
                onClick={() => {
                  setCloseSessionModalOpen(false);
                  showToast("Session Closing Journal Entries Posted!", "success");
                }}
                className="pos-btn-primary"
              >
                Close Session & Post Entries
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ODOO PRODUCT FORM SHEET MODAL (WITH SMART BUTTONS & TABS)          */}
      {/* ================================================================== */}
      {isProductModalOpen && editingProduct && (
        <div className="pos-modal-backdrop" onClick={() => setIsProductModalOpen(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800 }}>
                Odoo Product Form (`product.template`)
              </h3>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: "18px" }}>
              {/* Odoo Smart Stat Buttons Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "14px" }}>
                <div className="pos-mini-stat-box">
                  <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 700 }}>ON HAND</div>
                  <div className="pos-mono" style={{ fontSize: "16px", fontWeight: 800, color: "#017E84" }}>
                    {editingProduct.stock} {editingProduct.unit || "Units"}
                  </div>
                </div>
                <div className="pos-mini-stat-box">
                  <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 700 }}>FORECASTED</div>
                  <div className="pos-mono" style={{ fontSize: "16px", fontWeight: 800, color: "#714B67" }}>
                    {editingProduct.forecastedStock || editingProduct.stock} {editingProduct.unit || "Units"}
                  </div>
                </div>
                <div className="pos-mini-stat-box">
                  <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 700 }}>WAREHOUSE BIN</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                    {editingProduct.warehouseLocation || "WH/Stock"}
                  </div>
                </div>
              </div>

              {/* Product Name + Odoo Checkboxes */}
              <div style={{ marginBottom: "14px" }}>
                <label className="pos-field-label">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="pos-input"
                  style={{ fontSize: "16px", fontWeight: 800 }}
                  required
                />
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px", fontSize: "12.5px", fontWeight: 600, color: "#334155" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <input
                      type="checkbox"
                      checked={editingProduct.canBeSold !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, canBeSold: e.target.checked })}
                    />
                    Can be Sold
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <input
                      type="checkbox"
                      checked={editingProduct.availableInPos !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, availableInPos: e.target.checked })}
                    />
                    Available in POS
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.toWeight)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, toWeight: e.target.checked })}
                    />
                    To Weigh With Scale (kg)
                  </label>
                </div>
              </div>

              {/* Fields Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="pos-field-label">Product Type</label>
                  <select
                    value={editingProduct.productType || "Storable Product"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productType: e.target.value })}
                    className="pos-input"
                  >
                    <option value="Storable Product">Storable Product</option>
                    <option value="Consumable">Consumable</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="pos-field-label">POS Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="pos-input"
                  >
                    {PRODUCT_CATEGORIES.filter((c) => c.id !== "All").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pos-field-label">Internal Reference (SKU)</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="pos-input"
                    required
                  />
                </div>
                <div>
                  <label className="pos-field-label">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    value={editingProduct.barcode}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="pos-input"
                    required
                  />
                </div>
                <div>
                  <label className="pos-field-label">Sales Price ({currency.trim()})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.retailPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, retailPrice: e.target.value })}
                    className="pos-input"
                    required
                  />
                </div>
                <div>
                  <label className="pos-field-label">Wholesale B2B Price ({currency.trim()})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.wholesalePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesalePrice: e.target.value })}
                    className="pos-input"
                    required
                  />
                </div>
                <div>
                  <label className="pos-field-label">Cost ({currency.trim()})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.costPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: e.target.value })}
                    className="pos-input"
                    required
                  />
                </div>
                <div>
                  <label className="pos-field-label">On-Hand Stock Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    className="pos-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="pos-btn-secondary">
                  Discard
                </button>
                <button type="submit" className="pos-btn-primary">
                  Save Odoo Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* FLOATING ORDERS MODAL                                              */}
      {/* ================================================================== */}
      {showParkedDrawer && (
        <div className="pos-modal-backdrop" onClick={() => setShowParkedDrawer(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Floating / Parked Orders ({parkedBills.length})
              </h3>
              <button type="button" onClick={() => setShowParkedDrawer(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {parkedBills.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748B", padding: "20px 0" }}>
                  No floating orders held right now.
                </div>
              ) : (
                parkedBills.map((b) => (
                  <div key={b.id} className="pos-mini-stat-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "#0F172A" }}>
                        {b.id} • {b.customerName}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {b.cart.length} line(s) • {formatMoney(b.total)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRecallBill(b)}
                      className="pos-btn-primary"
                    >
                      <PlayCircle size={14} />
                      <span>Load Order</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ODOO PAYMENT SCREEN MODAL                                          */}
      {/* ================================================================== */}
      {isCheckoutOpen && (
        <div className="pos-modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
          <div
            className="pos-modal-card"
            style={{ maxWidth: "620px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pos-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
                  Odoo Payment Screen — {formatMoney(cartSummary.grandTotal)}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
                  Partner: {activeCustomer?.name} • Pricelist: {activePricelist.name}
                </p>
              </div>
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Payment Methods */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
                {[
                  { id: "Cash", label: "Cash", icon: Banknote },
                  { id: "Card", label: "Bank Card", icon: CreditCard },
                  { id: "Mobile QR Wallet", label: "QR Wallet", icon: QrCode },
                  { id: "Split (Cash + Card)", label: "Split Tender", icon: Split },
                  { id: "Customer Credit", label: "Customer Account", icon: BookOpen },
                ].map((m) => {
                  const IconComp = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`pos-tender-option ${active ? "active" : ""}`}
                    >
                      <IconComp size={18} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "Cash" && (
                <div className="pos-mini-stat-box">
                  <label className="pos-field-label">Cash Tendered ({currency.trim()})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="pos-input"
                    style={{ fontSize: "18px", fontWeight: 800, fontFamily: "monospace" }}
                  />
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                    {[
                      cartSummary.grandTotal,
                      Math.ceil(cartSummary.grandTotal / 10) * 10,
                      50,
                      100,
                      200,
                    ].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashTendered(amt.toFixed(2))}
                        className="pos-btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "12px", fontFamily: "monospace" }}
                      >
                        {idx === 0 ? `Exact (${formatMoney(amt)})` : `+${formatMoney(amt)}`}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #E2E8F0" }}>
                    <span style={{ fontWeight: 700, color: "#475569" }}>CHANGE DUE:</span>
                    <span style={{ fontSize: "20px", fontWeight: 900, color: "#059669", fontFamily: "monospace" }}>
                      {formatMoney(Math.max(0, (Number(cashTendered) || 0) - cartSummary.grandTotal))}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === "Mobile QR Wallet" && (
                <div className="pos-mini-stat-box" style={{ textAlign: "center" }}>
                  <SvgQrCode
                    payload={`PRO-POS|${storeSettings?.storeName}|${cartSummary.grandTotal.toFixed(2)}`}
                  />
                </div>
              )}

              {/* Odoo Formal Invoice Toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "13.5px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={generateFormalInvoice}
                    onChange={(e) => setGenerateFormalInvoice(e.target.checked)}
                  />
                  <span>📄 Generate Formal Odoo Tax Invoice (`account.move`)</span>
                </label>
                <span style={{ fontSize: "11.5px", color: "#017E84", fontWeight: 700 }}>
                  {generateFormalInvoice ? "INVOICED" : "RECEIPT ONLY"}
                </span>
              </div>
            </div>

            <div className="pos-modal-footer">
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="pos-btn-secondary">
                Back to Order
              </button>
              <button type="button" onClick={handleCompleteSale} className="pos-btn-primary" style={{ padding: "12px 24px", fontSize: "14px" }}>
                <CheckCircle2 size={17} />
                <span>Validate & Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 80MM THERMAL RECEIPT PREVIEW MODAL                                 */}
      {/* ================================================================== */}
      {activeReceiptOrder && (
        <div className="pos-modal-backdrop" onClick={() => setActiveReceiptOrder(null)}>
          <div className="pos-modal-card" style={{ maxWidth: "430px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <span style={{ fontWeight: 800, fontSize: "15px" }}>
                Odoo POS 80mm Receipt — {activeReceiptOrder.id}
              </span>
              <button type="button" onClick={() => setActiveReceiptOrder(null)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "18px", background: "#F1F5F9", maxHeight: "75vh", overflowY: "auto" }}>
              <div className="pos-thermal-paper">
                <div style={{ textAlign: "center", borderBottom: "1px dashed #64748B", paddingBottom: "10px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 900 }}>
                    {storeSettings?.storeName || "PRO GENERAL POS"}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#475569" }}>
                    {storeSettings?.address}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#475569" }}>
                    Tel: {storeSettings?.phone} • {storeSettings?.taxId}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: 700, marginTop: "4px" }}>
                    Served by {activeReceiptOrder.cashier}
                  </div>
                </div>

                <div style={{ fontSize: "11px", marginBottom: "8px", borderBottom: "1px dashed #64748B", paddingBottom: "8px" }}>
                  <div><strong>{activeReceiptOrder.id}</strong></div>
                  <div>Invoice: {activeReceiptOrder.invoiceRef}</div>
                  <div>Customer: {activeReceiptOrder.customerName}</div>
                  <div>Date: {new Date(activeReceiptOrder.timestamp).toLocaleString()}</div>
                </div>

                <div style={{ fontSize: "11px", borderBottom: "1px dashed #64748B", paddingBottom: "8px", marginBottom: "8px" }}>
                  {activeReceiptOrder.items.map((item, i) => (
                    <div key={i} style={{ marginBottom: "6px" }}>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>
                          {item.qty} × {formatMoney(item.price)}
                          {item.discount > 0 ? ` (-${item.discount}%)` : ""}
                        </span>
                        <strong>
                          {formatMoney(item.qty * item.price * (1 - (item.discount || 0) / 100))}
                        </strong>
                      </div>
                      {item.customerNote && (
                        <div style={{ fontSize: "10px", fontStyle: "italic", color: "#475569" }}>
                          Note: {item.customerNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: "11.5px", borderBottom: "1px dashed #64748B", paddingBottom: "10px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Subtotal:</span>
                    <span>{formatMoney(activeReceiptOrder.subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Taxes:</span>
                    <span>{formatMoney(activeReceiptOrder.taxAmount)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 900, marginTop: "4px" }}>
                    <span>TOTAL:</span>
                    <span>{formatMoney(activeReceiptOrder.total)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{activeReceiptOrder.paymentMethod}:</span>
                    <span>{formatMoney(activeReceiptOrder.amountTendered)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Change:</span>
                    <strong>{formatMoney(activeReceiptOrder.changeDue)}</strong>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <SvgBarcode value="8901023009912" width={180} height={36} />
                  <p style={{ fontSize: "10px", color: "#475569", marginTop: "8px" }}>
                    {storeSettings?.receiptFooter}
                  </p>
                </div>
              </div>
            </div>

            <div className="pos-modal-footer">
              <button type="button" onClick={() => window.print()} className="pos-btn-secondary">
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
              <button type="button" onClick={() => setActiveReceiptOrder(null)} className="pos-btn-primary">
                <span>Next Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* BARCODE STICKER STUDIO MODAL                                       */}
      {/* ================================================================== */}
      {barcodeLabelProduct && (
        <div className="pos-modal-backdrop" onClick={() => setBarcodeLabelProduct(null)}>
          <div className="pos-modal-card" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Barcode Shelf Labels — {barcodeLabelProduct.name}
              </h3>
              <button type="button" onClick={() => setBarcodeLabelProduct(null)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: "10px", background: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      padding: "10px",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 800 }}>{barcodeLabelProduct.name}</div>
                    <SvgBarcode value={barcodeLabelProduct.barcode} width={145} height={32} />
                    <div style={{ fontSize: "13px", fontWeight: 900, marginTop: "4px", color: "#017E84" }}>
                      {formatMoney(barcodeLabelProduct.retailPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pos-modal-footer">
              <button type="button" onClick={() => window.print()} className="pos-btn-primary">
                <Printer size={15} />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* CREATE PARTNER / CUSTOMER MODAL                                    */}
      {/* ================================================================== */}
      {isCustomerModalOpen && (
        <div className="pos-modal-backdrop" onClick={() => setIsCustomerModalOpen(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Create Customer / Partner (`res.partner`)
              </h3>
              <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="pos-field-label">Customer / Company Name</label>
                <input
                  type="text"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="Horizon Retail Mart"
                  className="pos-input"
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="pos-field-label">Phone</label>
                  <input
                    type="text"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="pos-input"
                  />
                </div>
                <div>
                  <label className="pos-field-label">Tax ID / NTN / VAT</label>
                  <input
                    type="text"
                    value={newCustomerForm.vatNumber}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, vatNumber: e.target.value })}
                    className="pos-input"
                  />
                </div>
              </div>
              <div>
                <label className="pos-field-label">Street Address</label>
                <input
                  type="text"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  className="pos-input"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="pos-field-label">Default Pricelist</label>
                  <select
                    value={newCustomerForm.pricelistId}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, pricelistId: e.target.value })}
                    className="pos-input"
                  >
                    {ODOO_PRICELISTS.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pos-field-label">Credit Limit ({currency.trim()})</label>
                  <input
                    type="number"
                    value={newCustomerForm.creditLimit}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, creditLimit: e.target.value })}
                    className="pos-input"
                  />
                </div>
              </div>
              <button type="submit" className="pos-btn-primary" style={{ justifyContent: "center" }}>
                Save Partner
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SETTLE CUSTOMER CREDIT MODAL                                       */}
      {/* ================================================================== */}
      {settlingCustomer && (
        <div className="pos-modal-backdrop" onClick={() => setSettlingCustomer(null)}>
          <div className="pos-modal-card" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Register Partner Payment — {settlingCustomer.name}
              </h3>
              <button type="button" onClick={() => setSettlingCustomer(null)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSettleCredit} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="pos-field-label">Amount Received ({currency.trim()})</label>
                <input
                  type="number"
                  step="0.01"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="pos-input"
                  required
                />
              </div>
              <button type="submit" className="pos-btn-primary" style={{ justifyContent: "center" }}>
                Validate Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`pos-toast pos-toast-${toast.type}`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
