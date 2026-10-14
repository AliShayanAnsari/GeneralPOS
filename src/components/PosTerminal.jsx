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
  Upload,
  Volume2,
  VolumeX,
  Home,
  GitBranch,
  Tag,
  Sparkles,
  X,
  Edit3,
  ArrowUpRight,
  Layers,
  ShieldCheck,
  Clock,
  Filter,
} from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  CURRENCY_OPTIONS,
  PROMO_CODES,
} from "../data/initialData";
import { posSound } from "../utils/sound";
import {
  HeroArchitectureDiagram,
  InteractiveSystemDiagrams,
} from "./AnimatedDiagrams";

// Helper to render a crisp SVG Code-128 style barcode for receipts & shelf labels
function SvgBarcode({ value = "8901023001014", width = 180, height = 44 }) {
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
            fill="#090D16"
          />
        );
      })}
      <text
        x={width / 2}
        y={height + 12}
        textAnchor="middle"
        fill="#090D16"
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
    <svg viewBox="0 0 170 170" style={{ width: "150px", height: "150px", margin: "0 auto", display: "block" }}>
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
            fill="#090D16"
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
  setSuppliers,
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
  // Navigation module state
  const [activeModule, setActiveModule] = useState("pos"); // pos | inventory | orders | customers | suppliers | drawer | analytics | settings

  // POS Register State
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [pricingMode, setPricingMode] = useState("retail"); // "retail" | "wholesale"
  const [selectedCustomerId, setSelectedCustomerId] = useState("cust-walkin");
  const [cart, setCart] = useState([
    {
      id: "prd-101",
      name: "Artisan Cold Brew Coffee 330ml",
      sku: "BEV-101",
      barcode: "8901023001014",
      retailPrice: 4.5,
      wholesalePrice: 3.6,
      costPrice: 2.4,
      unit: "btl",
      qty: 2,
      itemDiscountPercent: 0,
    },
    {
      id: "prd-201",
      name: "Extra Virgin Cold-Pressed Olive Oil 750ml",
      sku: "GRC-201",
      barcode: "8901023002011",
      retailPrice: 16.5,
      wholesalePrice: 13.8,
      costPrice: 10.2,
      unit: "btl",
      qty: 1,
      itemDiscountPercent: 0,
    },
  ]);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [manualDiscountValue, setManualDiscountValue] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [lastScannedBanner, setLastScannedBanner] = useState(null);

  // Modals in POS Register
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Cash | Card | Mobile QR Wallet | Customer Credit | Split (Cash + Card)
  const [cashTendered, setCashTendered] = useState("");
  const [splitCashAmount, setSplitCashAmount] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);
  const [showParkedDrawer, setShowParkedDrawer] = useState(false);

  // Inventory Module State
  const [invSearch, setInvSearch] = useState("");
  const [invStockFilter, setInvStockFilter] = useState("all"); // all | low | out
  const [editingProduct, setEditingProduct] = useState(null);
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
    tier: "VIP Gold",
    creditLimit: 500,
    notes: "",
  });
  const [settlingCustomer, setSettlingCustomer] = useState(null);
  const [settleAmount, setSettleAmount] = useState("");

  // Suppliers & Purchase Order State
  const [stockInProductId, setStockInProductId] = useState(
    products[0]?.id || "prd-101"
  );
  const [stockInQty, setStockInQty] = useState(25);
  const [stockInHistory, setStockInHistory] = useState([
    {
      id: "PO-2026-881",
      productName: "Artisan Cold Brew Coffee 330ml",
      supplier: "Prime Beverage Co.",
      qty: 40,
      unitCost: 2.4,
      totalCost: 96.0,
      timestamp: "2026-10-15T08:15:00.000Z",
    },
  ]);

  // Expenses & Cash Drawer State
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Store Supplies");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [actualCountedCash, setActualCountedCash] = useState("");

  // Notification Toast
  const [toast, setToast] = useState(null);
  const searchInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  // Sync sound setting
  useEffect(() => {
    posSound.enabled = Boolean(storeSettings?.enableSoundEffects);
  }, [storeSettings?.enableSoundEffects]);

  // Keyboard shortcuts F1-F9 and "/" for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F1") {
        e.preventDefault();
        setActiveModule("pos");
      } else if (e.key === "F2") {
        e.preventDefault();
        setActiveModule("pos");
        searchInputRef.current?.focus();
      } else if (e.key === "F3") {
        e.preventDefault();
        setActiveModule("inventory");
      } else if (e.key === "F4") {
        e.preventDefault();
        setActiveModule("orders");
      } else if (e.key === "F5") {
        e.preventDefault();
        setActiveModule("customers");
      } else if (e.key === "F6") {
        e.preventDefault();
        setActiveModule("suppliers");
      } else if (e.key === "F7") {
        e.preventDefault();
        setActiveModule("drawer");
      } else if (e.key === "F8") {
        e.preventDefault();
        setActiveModule("analytics");
      } else if (e.key === "F9") {
        e.preventDefault();
        setActiveModule("settings");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currency = storeSettings?.currency || "$";
  const formatMoney = (val) => `${currency}${Number(val || 0).toFixed(2)}`;

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

  // Add item to cart
  const addToCart = (product, viaScanner = false) => {
    if (product.stock <= 0) {
      posSound.playErrorBeep();
      showToast(`Out of stock: ${product.name}`, "error");
      return;
    }

    posSound.playScanBeep();
    if (viaScanner) {
      setLastScannedBanner({
        name: product.name,
        barcode: product.barcode,
        price:
          pricingMode === "wholesale"
            ? product.wholesalePrice
            : product.retailPrice,
      });
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty + 1 > product.stock) {
          showToast(
            `Maximum available stock (${product.stock}) reached for ${product.name}`,
            "warning"
          );
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
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
          costPrice: product.costPrice,
          unit: product.unit,
          qty: 1,
          itemDiscountPercent: 0,
        },
      ];
    });
  };

  // Handle physical or typed barcode scan
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
      showToast(`No SKU/Barcode matched "${code}"`, "error");
    }
  };

  // Simulate laser barcode scan for instant demo delight
  const handleSimulateBarcodeScan = () => {
    const inStockItems = products.filter((p) => p.stock > 0);
    if (inStockItems.length === 0) return;
    const randomProduct =
      inStockItems[Math.floor(Math.random() * inStockItems.length)];
    addToCart(randomProduct, true);
    showToast(
      `Scanned [${randomProduct.barcode}] ${randomProduct.name}`,
      "success"
    );
  };

  const updateCartQty = (id, delta) => {
    const product = products.find((p) => p.id === id);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          if (product && nextQty > product.stock) {
            showToast(`Only ${product.stock} units available in stock`, "warning");
            return item;
          }
          return { ...item, qty: nextQty };
        })
        .filter(Boolean)
    );
  };

  const updateItemDiscount = (id, percent) => {
    const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, itemDiscountPercent: clamped } : item
      )
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
      const unitPrice =
        pricingMode === "wholesale" ? item.wholesalePrice : item.retailPrice;
      const lineGross = unitPrice * item.qty;
      const lineDisc = lineGross * ((item.itemDiscountPercent || 0) / 100);
      rawSubtotal += lineGross;
      lineDiscountTotal += lineDisc;
    });

    const afterLineSubtotal = Math.max(0, rawSubtotal - lineDiscountTotal);

    let promoDiscount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === "percent") {
        promoDiscount = afterLineSubtotal * (appliedPromo.value / 100);
      } else {
        promoDiscount = appliedPromo.value;
      }
    }

    const totalDiscount = Math.min(
      rawSubtotal,
      lineDiscountTotal + promoDiscount + (Number(manualDiscountValue) || 0)
    );

    const taxableAmount = Math.max(0, rawSubtotal - totalDiscount);
    const effectiveTaxRate = taxEnabled
      ? Number(storeSettings?.taxRate || 0)
      : 0;
    const taxAmount = taxableAmount * (effectiveTaxRate / 100);
    const grandTotal = taxableAmount + taxAmount;

    return {
      subtotal: rawSubtotal,
      discountAmount: totalDiscount,
      taxAmount,
      grandTotal,
      totalItems: cart.reduce((acc, i) => acc + i.qty, 0),
    };
  }, [
    cart,
    pricingMode,
    appliedPromo,
    manualDiscountValue,
    taxEnabled,
    storeSettings?.taxRate,
  ]);

  // Apply Promo Code
  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;
    const found = PROMO_CODES.find((p) => p.code === code);
    if (found) {
      setAppliedPromo(found);
      posSound.playScanBeep();
      showToast(`Promo ${found.code} applied (${found.description})`, "success");
    } else {
      posSound.playErrorBeep();
      showToast(`Invalid Promo Code "${code}". Try WELCOME10 or VIP15`, "error");
    }
  };

  // Park / Hold Current Bill
  const handleHoldBill = () => {
    if (cart.length === 0) {
      showToast("Cart is empty — add items before holding a bill", "warning");
      return;
    }
    const customer =
      customers.find((c) => c.id === selectedCustomerId) || customers[0];
    const parked = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      customerName: customer.name,
      customerId: customer.id,
      pricingMode,
      cart,
      total: cartSummary.grandTotal,
    };
    setParkedBills((prev) => [parked, ...prev]);
    setCart([]);
    setAppliedPromo(null);
    setManualDiscountValue(0);
    showToast(`Bill ${parked.id} parked (${customer.name})`, "success");
  };

  const handleRecallBill = (parked) => {
    setCart(parked.cart);
    setSelectedCustomerId(parked.customerId);
    setPricingMode(parked.pricingMode || "retail");
    setParkedBills((prev) => prev.filter((b) => b.id !== parked.id));
    setShowParkedDrawer(false);
    posSound.playScanBeep();
    showToast(`Recalled parked bill ${parked.id}`, "success");
  };

  // Complete Checkout Transaction
  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    const customer =
      customers.find((c) => c.id === selectedCustomerId) || customers[0];

    // Check Credit Limit if paying on Customer Credit
    if (paymentMethod === "Customer Credit") {
      if (customer.id === "cust-walkin") {
        posSound.playErrorBeep();
        showToast(
          "Please select a registered customer to use Credit Ledger checkout.",
          "error"
        );
        return;
      }
      const projectedCredit = customer.creditBalance + cartSummary.grandTotal;
      if (projectedCredit > customer.creditLimit) {
        posSound.playErrorBeep();
        showToast(
          `Credit limit exceeded! Available credit: ${formatMoney(
            Math.max(0, customer.creditLimit - customer.creditBalance)
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

    if (paymentMethod === "Cash" && tenderedNum < cartSummary.grandTotal - 0.01) {
      posSound.playErrorBeep();
      showToast("Cash tendered is less than the Grand Total", "error");
      return;
    }

    const changeDue =
      paymentMethod === "Cash"
        ? Math.max(0, tenderedNum - cartSummary.grandTotal)
        : 0;

    const newOrder = {
      id: `INV-2026-${1000 + orders.length + 1}`,
      timestamp: new Date().toISOString(),
      cashier: `${currentUser?.name || "Alex Morgan"} (${
        currentUser?.role || "Store Manager"
      })`,
      customerName: customer.name,
      customerId: customer.id,
      pricingMode,
      paymentMethod,
      status: "Completed",
      note: orderNote,
      items: cart.map((item) => {
        const unitPrice =
          pricingMode === "wholesale" ? item.wholesalePrice : item.retailPrice;
        return {
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: unitPrice,
          costPrice: item.costPrice,
          qty: item.qty,
          discount: item.itemDiscountPercent || 0,
        };
      }),
      subtotal: cartSummary.subtotal,
      discountAmount: cartSummary.discountAmount,
      taxAmount: cartSummary.taxAmount,
      total: cartSummary.grandTotal,
      amountTendered: tenderedNum,
      changeDue,
    };

    // 1. Deduct inventory stock atomically
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = cart.find((c) => c.id === prod.id);
        if (!soldItem) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - soldItem.qty),
        };
      })
    );

    // 2. Update customer loyalty points, total spent & credit ledger
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== customer.id) return c;
        const earnedPoints = Math.floor(cartSummary.grandTotal);
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

    // 3. Save Order
    setOrders((prev) => [newOrder, ...prev]);

    // 4. Play success chime & show thermal receipt
    posSound.playSuccessChime();
    setIsCheckoutOpen(false);
    setActiveReceiptOrder(newOrder);
    setCart([]);
    setAppliedPromo(null);
    setManualDiscountValue(0);
    setCashTendered("");
    setSplitCashAmount("");
    setOrderNote("");
    showToast(`Sale ${newOrder.id} completed (${formatMoney(newOrder.total)})`, "success");
  };

  // Process Return / Refund on an Order
  const handleRefundOrder = (order) => {
    if (order.status === "Refunded") {
      showToast("This invoice has already been refunded.", "warning");
      return;
    }
    // Restore stock back into inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const returnedLine = order.items.find((i) => i.id === prod.id);
        if (!returnedLine) return prod;
        return {
          ...prod,
          stock: prod.stock + returnedLine.qty,
        };
      })
    );

    // Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: "Refunded" } : o
      )
    );

    posSound.playScanBeep();
    showToast(
      `Invoice ${order.id} refunded & ${order.items.length} SKU(s) restored to stock!`,
      "success"
    );
  };

  // Save or Create Product in Inventory
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim() || !editingProduct.sku.trim()) return;

    const normalized = {
      ...editingProduct,
      retailPrice: Number(editingProduct.retailPrice) || 0,
      wholesalePrice: Number(editingProduct.wholesalePrice) || 0,
      costPrice: Number(editingProduct.costPrice) || 0,
      stock: Number(editingProduct.stock) || 0,
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
    showToast(`Saved SKU: ${normalized.name}`, "success");
  };

  // Receive Stock via Purchase Order
  const handleReceiveStockOrder = (e) => {
    e.preventDefault();
    const target = products.find((p) => p.id === stockInProductId);
    const qtyNum = Number(stockInQty) || 0;
    if (!target || qtyNum <= 0) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === target.id ? { ...p, stock: p.stock + qtyNum } : p
      )
    );

    const poEntry = {
      id: `PO-2026-${882 + stockInHistory.length}`,
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
      `Received +${qtyNum} ${target.unit} of ${target.name} into Inventory`,
      "success"
    );
  };

  // Create New Customer
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;
    const created = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      name: newCustomerForm.name.trim(),
      phone: newCustomerForm.phone.trim() || "N/A",
      email: newCustomerForm.email.trim() || "customer@store.local",
      tier: newCustomerForm.tier,
      loyaltyPoints: 50,
      totalSpent: 0,
      creditBalance: 0,
      creditLimit: Number(newCustomerForm.creditLimit) || 500,
      notes: newCustomerForm.notes,
    };
    setCustomers((prev) => [...prev, created]);
    setSelectedCustomerId(created.id);
    setIsCustomerModalOpen(false);
    setNewCustomerForm({
      name: "",
      phone: "",
      email: "",
      tier: "VIP Gold",
      creditLimit: 500,
      notes: "",
    });
    showToast(`Customer "${created.name}" registered with 50 bonus points!`, "success");
  };

  // Settle Customer Credit Balance
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
      `Recorded ${formatMoney(amt)} credit payment from ${settlingCustomer.name}`,
      "success"
    );
    setSettlingCustomer(null);
    setSettleAmount("");
  };

  // Add Store Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amt = Number(expenseAmount) || 0;
    if (!expenseTitle.trim() || amt <= 0) return;
    const exp = {
      id: `exp-${Date.now().toString().slice(-4)}`,
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: amt,
      paidVia: "Cash Drawer",
      timestamp: new Date().toISOString(),
      recordedBy: currentUser?.name || "Alex Morgan",
    };
    setExpenses((prev) => [exp, ...prev]);
    setExpenseTitle("");
    setExpenseAmount("");
    showToast(`Recorded store expense: ${exp.title} (${formatMoney(amt)})`, "success");
  };

  // Analytics & Financial Metrics
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
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

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
      splitSales * 0.5 -
      totalExpenses;

    return {
      activeOrderCount: activeOrders.length,
      grossRevenue,
      totalTaxCollected,
      totalCogs,
      grossProfit,
      totalExpenses,
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

  // Export JSON Backup
  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      product: "Pro General POS v2.4",
      storeSettings,
      products,
      customers,
      suppliers,
      orders,
      expenses,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pro-general-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Full POS database exported as JSON", "success");
  };

  // Export Orders CSV
  const handleExportCsv = () => {
    const headers = [
      "Invoice_ID",
      "Timestamp",
      "Customer",
      "Pricing_Tier",
      "Payment_Method",
      "Status",
      "Subtotal",
      "Discount",
      "Tax",
      "Total",
    ];
    const rows = orders.map((o) => [
      o.id,
      o.timestamp,
      `"${o.customerName}"`,
      o.pricingMode,
      `"${o.paymentMethod}"`,
      o.status,
      o.subtotal.toFixed(2),
      o.discountAmount.toFixed(2),
      o.taxAmount.toFixed(2),
      o.total.toFixed(2),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pro-general-pos-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Sales ledger exported as CSV", "success");
  };

  const activeCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="pos-terminal-shell">
      {/* Top Global Command Bar */}
      <header className="pos-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            className="pos-brand-logo"
            onClick={onBackToHome}
            title="Return to Pro General POS Homepage"
            style={{ cursor: "pointer" }}
          >
            <ScanBarcode size={20} color="#090D16" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 800, fontSize: "15.5px", color: "#F8FAFC" }}>
                {storeSettings?.storeName || "Pro General POS"}
              </span>
              <span className="pos-live-pill">
                <span className="pos-live-dot" />
                TERMINAL ONLINE
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#94A3B8" }}>
              Operator: <strong style={{ color: "#E2E8F0" }}>{currentUser?.name || "Alex Morgan"}</strong> • {currentUser?.role || "Store Manager"}
            </div>
          </div>
        </div>

        {/* Center Quick Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Retail vs Wholesale Mode Switcher */}
          <div className="pos-segmented-control">
            <button
              type="button"
              onClick={() => {
                setPricingMode("retail");
                showToast("Switched to Standard Retail Pricing Tier", "success");
              }}
              className={`pos-segment-btn ${pricingMode === "retail" ? "active" : ""}`}
            >
              Retail Tier
            </button>
            <button
              type="button"
              onClick={() => {
                setPricingMode("wholesale");
                showToast("Switched to Wholesale B2B Pricing Tier", "success");
              }}
              className={`pos-segment-btn ${pricingMode === "wholesale" ? "active-wholesale" : ""}`}
            >
              Wholesale B2B
            </button>
          </div>

          {/* Currency Quick Switcher */}
          <select
            value={storeSettings?.currency || "$"}
            onChange={(e) =>
              setStoreSettings((prev) => ({ ...prev, currency: e.target.value }))
            }
            className="pos-topbar-select"
            title="Switch Store Currency"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.symbol}>
                {c.code} ({c.symbol.trim()})
              </option>
            ))}
          </select>

          {/* Parked Bills Recall Button */}
          <button
            type="button"
            onClick={() => setShowParkedDrawer((v) => !v)}
            className="pos-topbar-btn"
          >
            <PauseCircle size={15} color="#F59E0B" />
            <span>Parked Bills</span>
            <span className="pos-count-badge">{parkedBills.length}</span>
          </button>

          {/* Low Stock Alert Indicator */}
          {financialMetrics.lowStockProducts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveModule("inventory");
                setInvStockFilter("low");
              }}
              className="pos-topbar-btn"
              style={{ borderColor: "rgba(245, 158, 11, 0.4)", color: "#FCD34D" }}
            >
              <AlertTriangle size={14} color="#F59E0B" />
              <span>{financialMetrics.lowStockProducts.length} Low Stock</span>
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() =>
              setStoreSettings((prev) => ({
                ...prev,
                enableSoundEffects: !prev.enableSoundEffects,
              }))
            }
            className="pos-icon-btn"
            title={
              storeSettings?.enableSoundEffects
                ? "POS Audio Beep Enabled"
                : "POS Audio Muted"
            }
          >
            {storeSettings?.enableSoundEffects ? (
              <Volume2 size={16} color="#10B981" />
            ) : (
              <VolumeX size={16} color="#94A3B8" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenDeployModal}
            className="pos-topbar-btn"
            style={{ borderColor: "rgba(59, 130, 246, 0.45)", color: "#93C5FD" }}
          >
            <GitBranch size={14} />
            <span>Vercel & Git</span>
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="pos-topbar-btn"
          >
            <Home size={14} />
            <span>Homepage & Diagrams</span>
          </button>
        </div>
      </header>

      {/* Main Body: Left Navigation Rail + Active Module Viewport */}
      <div className="pos-main-body">
        {/* Left Navigation Rail */}
        <aside className="pos-nav-rail">
          {[
            { id: "pos", label: "POS Register", shortcut: "F1", icon: ShoppingCart },
            { id: "inventory", label: "Inventory & SKUs", shortcut: "F3", icon: Package },
            { id: "orders", label: "Orders & Returns", shortcut: "F4", icon: FileText },
            { id: "customers", label: "Customers & Credit", shortcut: "F5", icon: Users },
            { id: "suppliers", label: "Suppliers & POs", shortcut: "F6", icon: Truck },
            { id: "drawer", label: "Cash & Z-Report", shortcut: "F7", icon: Wallet },
            { id: "analytics", label: "Analytics & Flow", shortcut: "F8", icon: BarChart3 },
            { id: "settings", label: "Settings & Backup", shortcut: "F9", icon: Settings },
          ].map((nav) => {
            const IconComp = nav.icon;
            const isActive = activeModule === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveModule(nav.id)}
                className={`pos-rail-item ${isActive ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <IconComp size={18} />
                  <span className="pos-kbd-mini">{nav.shortcut}</span>
                </div>
                <span className="pos-rail-label">{nav.label}</span>
              </button>
            );
          })}
        </aside>

        {/* ACTIVE WORKSPACE VIEWPORT */}
        <main className="pos-workspace-content">
          {/* ============================================================== */}
          {/* MODULE 1: POS REGISTER TERMINAL                                */}
          {/* ============================================================== */}
          {activeModule === "pos" && (
            <div className="pos-register-split">
              {/* LEFT 65%: PRODUCT CATALOG & BARCODE SCANNER BAR */}
              <div className="pos-catalog-pane">
                {/* Search + Barcode Wedge Bar */}
                <div className="pos-scanner-bar">
                  <div className="pos-search-input-wrap">
                    <Search size={16} color="#94A3B8" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search product name, SKU, or category (F2)..."
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

                  {/* Direct Barcode Scanner Form */}
                  <form onSubmit={handleBarcodeSubmit} className="pos-barcode-form">
                    <ScanBarcode size={16} color="#3B82F6" />
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Scan or type Barcode / SKU + Enter..."
                      className="pos-clean-input"
                    />
                  </form>

                  {/* 1-Click Simulate Barcode Scan Button */}
                  <button
                    type="button"
                    onClick={handleSimulateBarcodeScan}
                    className="pos-simulate-scan-btn"
                    title="Simulate Hardware Laser Barcode Scan"
                  >
                    <ScanBarcode size={15} />
                    <span>Simulate Scan</span>
                  </button>
                </div>

                {/* Live Laser Scan Feedback Strip */}
                {lastScannedBanner && (
                  <div className="pos-scan-feedback-banner">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="pos-live-dot" />
                      <span style={{ fontFamily: "monospace", fontSize: "11.5px", color: "#6EE7B7" }}>
                        BARCODE SCANNED [{lastScannedBanner.barcode}]
                      </span>
                      <strong style={{ color: "#F8FAFC", fontSize: "12.5px" }}>
                        {lastScannedBanner.name}
                      </strong>
                    </div>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#10B981", fontSize: "12.5px" }}>
                      +{formatMoney(lastScannedBanner.price)}
                    </span>
                  </div>
                )}

                {/* Category Filter Pills */}
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
                        <span className="pos-cat-count">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* High-Density Product Grid */}
                <div className="pos-product-grid">
                  {filteredPosProducts.map((product) => {
                    const inCartItem = cart.find((c) => c.id === product.id);
                    const activePrice =
                      pricingMode === "wholesale"
                        ? product.wholesalePrice
                        : product.retailPrice;
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
                        {/* Top Row: SKU & Stock Badge */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                          <span className="pos-sku-tag">{product.sku}</span>
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
                              ? "OUT OF STOCK"
                              : `${product.stock} ${product.unit}`}
                          </span>
                        </div>

                        {/* Category Color Bar + Product Title */}
                        <div style={{ marginTop: "8px", marginBottom: "10px" }}>
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: product.colorAccent || "#60A5FA",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              marginBottom: "3px",
                            }}
                          >
                            {product.category}
                          </div>
                          <div className="pos-product-name">{product.name}</div>
                        </div>

                        {/* Bottom Price & Active Cart Quantity Badge */}
                        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                          <div>
                            <div className="pos-product-price">
                              {formatMoney(activePrice)}
                            </div>
                            <div style={{ fontSize: "10px", color: "#64748B", fontFamily: "monospace" }}>
                              {pricingMode === "wholesale"
                                ? `Retail: ${formatMoney(product.retailPrice)}`
                                : `W/S: ${formatMoney(product.wholesalePrice)}`}
                            </div>
                          </div>

                          {inCartItem ? (
                            <div className="pos-in-cart-qty-pill">
                              {inCartItem.qty} in cart
                            </div>
                          ) : (
                            <div className="pos-add-plus-circle">
                              <Plus size={14} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT 35%: SMART CART & ACTIVE RECEIPT DOCK */}
              <div className="pos-cart-dock">
                {/* Customer & Pricing Tier Header */}
                <div className="pos-cart-header">
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="pos-input"
                      style={{ flex: 1, padding: "7px 10px", fontSize: "12.5px" }}
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.tier})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="pos-btn-secondary"
                      style={{ padding: "7px 10px", fontSize: "12px" }}
                      title="Register New Customer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {activeCustomer && activeCustomer.id !== "cust-walkin" && (
                    <div className="pos-customer-mini-bar">
                      <span>
                        Loyalty: <strong style={{ color: "#10B981" }}>{activeCustomer.loyaltyPoints} pts</strong>
                      </span>
                      <span>
                        Credit Due: <strong style={{ color: activeCustomer.creditBalance > 0 ? "#F59E0B" : "#94A3B8" }}>{formatMoney(activeCustomer.creditBalance)}</strong>
                      </span>
                      <span>
                        Limit: <strong>{formatMoney(activeCustomer.creditLimit)}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Cart Line Items List */}
                <div className="pos-cart-items-scroll">
                  {cart.length === 0 ? (
                    <div className="pos-empty-cart">
                      <ScanBarcode size={38} color="#475569" />
                      <div style={{ fontWeight: 700, color: "#CBD5E1", fontSize: "14px", marginTop: "8px" }}>
                        Ready to Scan or Tap Items
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B", maxWidth: "230px", textAlign: "center", marginTop: "4px" }}>
                        Tap any product card on the left or click &ldquo;Simulate Scan&rdquo; to ring up an order.
                      </div>
                    </div>
                  ) : (
                    cart.map((item) => {
                      const unitPrice =
                        pricingMode === "wholesale"
                          ? item.wholesalePrice
                          : item.retailPrice;
                      const gross = unitPrice * item.qty;
                      const disc =
                        gross * ((item.itemDiscountPercent || 0) / 100);
                      const netLine = gross - disc;

                      return (
                        <div key={item.id} className="pos-cart-line">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "13px", color: "#F8FAFC" }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "monospace" }}>
                                {formatMoney(unitPrice)} × {item.qty} {item.unit} ({item.sku})
                              </div>
                            </div>
                            <div style={{ textAlign: "right", fontFamily: "monospace" }}>
                              <div style={{ fontWeight: 800, fontSize: "13.5px", color: "#F8FAFC" }}>
                                {formatMoney(netLine)}
                              </div>
                              {item.itemDiscountPercent > 0 && (
                                <div style={{ fontSize: "10px", color: "#10B981" }}>
                                  -{item.itemDiscountPercent}% off
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stepper + Item Discount + Delete */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                            <div className="pos-qty-stepper">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, -1)}
                                className="pos-step-btn"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="pos-step-val">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, 1)}
                                className="pos-step-btn"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "10.5px", color: "#64748B" }}>Disc %</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.itemDiscountPercent || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  updateItemDiscount(item.id, e.target.value)
                                }
                                className="pos-mini-disc-input"
                              />
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="pos-line-trash-btn"
                                title="Remove Item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Promo Code & Tax Toggle Strip */}
                <div className="pos-cart-promo-strip">
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="Promo (WELCOME10, VIP15)"
                      className="pos-input"
                      style={{ padding: "6px 9px", fontSize: "11.5px", flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="pos-btn-secondary"
                      style={{ padding: "6px 10px", fontSize: "11.5px" }}
                    >
                      <Tag size={12} />
                      <span>Apply</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "11.5px", color: "#94A3B8" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={taxEnabled}
                        onChange={(e) => setTaxEnabled(e.target.checked)}
                      />
                      <span>Apply Tax ({storeSettings?.taxRate || 8}%)</span>
                    </label>

                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span>Extra Disc ({currency.trim()}):</span>
                      <input
                        type="number"
                        min="0"
                        value={manualDiscountValue || ""}
                        placeholder="0.00"
                        onChange={(e) => setManualDiscountValue(e.target.value)}
                        className="pos-mini-disc-input"
                        style={{ width: "58px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sticky Totals & Checkout CTA Footer */}
                <div className="pos-cart-footer">
                  <div className="pos-summary-row">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span className="pos-mono">{formatMoney(cartSummary.subtotal)}</span>
                  </div>
                  <div className="pos-summary-row" style={{ color: "#10B981" }}>
                    <span>
                      Total Discounts{" "}
                      {appliedPromo ? `(${appliedPromo.code})` : ""}
                    </span>
                    <span className="pos-mono">
                      -{formatMoney(cartSummary.discountAmount)}
                    </span>
                  </div>
                  <div className="pos-summary-row">
                    <span>
                      Sales Tax ({taxEnabled ? `${storeSettings?.taxRate || 8}%` : "0%"})
                    </span>
                    <span className="pos-mono">{formatMoney(cartSummary.taxAmount)}</span>
                  </div>

                  <div className="pos-grand-total-row">
                    <span>GRAND TOTAL</span>
                    <span className="pos-grand-total-val">
                      {formatMoney(cartSummary.grandTotal)}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "8px", marginTop: "10px" }}>
                    <button
                      type="button"
                      onClick={handleHoldBill}
                      disabled={cart.length === 0}
                      className="pos-btn-secondary"
                      style={{ justifyContent: "center", padding: "11px 8px", fontSize: "12px" }}
                    >
                      <PauseCircle size={14} color="#F59E0B" />
                      <span>Hold</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCart([]);
                        setAppliedPromo(null);
                        setManualDiscountValue(0);
                      }}
                      disabled={cart.length === 0}
                      className="pos-btn-secondary"
                      style={{ justifyContent: "center", padding: "11px 8px", fontSize: "12px", color: "#FCA5A5" }}
                    >
                      <Trash2 size={14} />
                      <span>Clear</span>
                    </button>

                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => {
                        setCashTendered(cartSummary.grandTotal.toFixed(2));
                        setSplitCashAmount((cartSummary.grandTotal / 2).toFixed(2));
                        setIsCheckoutOpen(true);
                      }}
                      className="pos-btn-charge"
                    >
                      <span>Charge {formatMoney(cartSummary.grandTotal)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 2: INVENTORY, SKUs & BARCODE LABEL STUDIO               */}
          {/* ============================================================== */}
          {activeModule === "inventory" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Inventory, SKU Pricing & Barcode Sticker Studio
                  </h2>
                  <p className="pos-module-subtitle">
                    Manage retail & wholesale price tiers, stock levels, cost margins, expiry dates, and printable barcode shelf labels.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setBarcodeLabelProduct(products[0])}
                    className="pos-btn-secondary"
                  >
                    <Printer size={15} />
                    <span>Barcode Label Studio</span>
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
                        retailPrice: 9.99,
                        wholesalePrice: 7.99,
                        costPrice: 5.5,
                        stock: 50,
                        minStock: 10,
                        unit: "pcs",
                        supplier: "Global Foods Distribution",
                        expiryDate: "2027-12-31",
                        colorAccent: "#3B82F6",
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="pos-btn-primary"
                  >
                    <Plus size={15} />
                    <span>Add New SKU Product</span>
                  </button>
                </div>
              </div>

              {/* Inventory KPIs */}
              <div className="pos-kpi-grid">
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Active Catalog SKUs</span>
                  <strong className="pos-kpi-value">{products.length}</strong>
                  <span className="pos-kpi-sub">Across 8 store departments</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Total Units in Warehouse</span>
                  <strong className="pos-kpi-value">
                    {products.reduce((s, p) => s + p.stock, 0).toLocaleString()}
                  </strong>
                  <span className="pos-kpi-sub">Real-time atomic stock count</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Inventory Cost Valuation</span>
                  <strong className="pos-kpi-value">
                    {formatMoney(financialMetrics.inventoryCostValue)}
                  </strong>
                  <span className="pos-kpi-sub">
                    Retail Value: {formatMoney(financialMetrics.inventoryRetailValue)}
                  </span>
                </div>
                <div className="pos-kpi-card" style={{ borderColor: financialMetrics.lowStockProducts.length > 0 ? "rgba(245,158,11,0.45)" : undefined }}>
                  <span className="pos-kpi-label">Low Stock Alerts</span>
                  <strong className="pos-kpi-value" style={{ color: "#F59E0B" }}>
                    {financialMetrics.lowStockProducts.length} SKUs
                  </strong>
                  <span className="pos-kpi-sub">Below minimum threshold</span>
                </div>
              </div>

              {/* Filter Bar */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  placeholder="Search SKU, Product Name, Barcode, or Supplier..."
                  className="pos-input"
                  style={{ maxWidth: "360px" }}
                />
                <div className="pos-segmented-control">
                  <button
                    type="button"
                    onClick={() => setInvStockFilter("all")}
                    className={`pos-segment-btn ${invStockFilter === "all" ? "active" : ""}`}
                  >
                    All SKUs ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvStockFilter("low")}
                    className={`pos-segment-btn ${invStockFilter === "low" ? "active" : ""}`}
                  >
                    Low Stock ({financialMetrics.lowStockProducts.length})
                  </button>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="pos-table-container">
                <table className="pos-table">
                  <thead>
                    <tr>
                      <th>SKU / Barcode</th>
                      <th>Product Name & Category</th>
                      <th>Cost</th>
                      <th>Wholesale</th>
                      <th>Retail</th>
                      <th>Margin</th>
                      <th>Stock Level</th>
                      <th>Quick Restock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => {
                        const q = invSearch.trim().toLowerCase();
                        const matchQ =
                          !q ||
                          p.name.toLowerCase().includes(q) ||
                          p.sku.toLowerCase().includes(q) ||
                          p.barcode.includes(q);
                        const matchStock =
                          invStockFilter === "all" || p.stock <= p.minStock;
                        return matchQ && matchStock;
                      })
                      .map((p) => {
                        const marginPct =
                          p.retailPrice > 0
                            ? (((p.retailPrice - p.costPrice) / p.retailPrice) * 100).toFixed(1)
                            : "0.0";
                        const isLow = p.stock <= p.minStock;

                        return (
                          <tr key={p.id}>
                            <td className="pos-mono">
                              <div style={{ fontWeight: 700, color: "#F8FAFC" }}>{p.sku}</div>
                              <div style={{ fontSize: "11px", color: "#64748B" }}>{p.barcode}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: "#F8FAFC" }}>{p.name}</div>
                              <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                                {p.category} • Exp: {p.expiryDate}
                              </div>
                            </td>
                            <td className="pos-mono">{formatMoney(p.costPrice)}</td>
                            <td className="pos-mono" style={{ color: "#38BDF8" }}>
                              {formatMoney(p.wholesalePrice)}
                            </td>
                            <td className="pos-mono" style={{ fontWeight: 700, color: "#10B981" }}>
                              {formatMoney(p.retailPrice)}
                            </td>
                            <td className="pos-mono">
                              <span className="pos-margin-pill">{marginPct}%</span>
                            </td>
                            <td>
                              <span
                                className={`pos-stock-badge ${
                                  p.stock <= 0
                                    ? "stock-out"
                                    : isLow
                                    ? "stock-low"
                                    : "stock-ok"
                                }`}
                              >
                                {p.stock} {p.unit}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "5px" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProducts((prev) =>
                                      prev.map((item) =>
                                        item.id === p.id
                                          ? { ...item, stock: item.stock + 10 }
                                          : item
                                      )
                                    );
                                    showToast(`Added +10 ${p.unit} to ${p.name}`, "success");
                                  }}
                                  className="pos-btn-secondary"
                                  style={{ padding: "4px 8px", fontSize: "11px" }}
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProducts((prev) =>
                                      prev.map((item) =>
                                        item.id === p.id
                                          ? { ...item, stock: item.stock + 50 }
                                          : item
                                      )
                                    );
                                    showToast(`Added +50 ${p.unit} to ${p.name}`, "success");
                                  }}
                                  className="pos-btn-secondary"
                                  style={{ padding: "4px 8px", fontSize: "11px" }}
                                >
                                  +50
                                </button>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="pos-btn-secondary"
                                  style={{ padding: "5px 8px", fontSize: "11px" }}
                                  title="Edit Product"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBarcodeLabelProduct(p)}
                                  className="pos-btn-secondary"
                                  style={{ padding: "5px 8px", fontSize: "11px" }}
                                  title="Print Barcode Sticker Labels"
                                >
                                  <ScanBarcode size={13} />
                                </button>
                              </div>
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
          {/* MODULE 3: SALES HISTORY, INVOICES & 1-CLICK RETURNS            */}
          {/* ============================================================== */}
          {activeModule === "orders" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Completed Sales Invoices, Receipt Reprints & Automated Refunds
                  </h2>
                  <p className="pos-module-subtitle">
                    Inspect itemized invoices, reprint 80mm thermal receipts, or process 1-click returns that automatically restore stock to inventory.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="pos-btn-secondary"
                >
                  <Download size={15} />
                  <span>Export Sales CSV</span>
                </button>
              </div>

              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search Invoice ID (e.g. INV-2026-1001) or Customer..."
                  className="pos-input"
                  style={{ maxWidth: "360px" }}
                />
                <select
                  value={orderFilterMethod}
                  onChange={(e) => setOrderFilterMethod(e.target.value)}
                  className="pos-input"
                  style={{ maxWidth: "200px" }}
                >
                  <option value="All">All Payment Tenders</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Mobile QR Wallet">Mobile QR Wallet</option>
                  <option value="Customer Credit">Customer Credit</option>
                  <option value="Split (Cash + Card)">Split (Cash + Card)</option>
                </select>
              </div>

              <div className="pos-table-container">
                <table className="pos-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date & Time</th>
                      <th>Customer</th>
                      <th>Tier</th>
                      <th>Payment Method</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter((o) => {
                        const q = orderSearch.trim().toLowerCase();
                        const matchQ =
                          !q ||
                          o.id.toLowerCase().includes(q) ||
                          o.customerName.toLowerCase().includes(q);
                        const matchMethod =
                          orderFilterMethod === "All" ||
                          o.paymentMethod === orderFilterMethod;
                        return matchQ && matchMethod;
                      })
                      .map((order) => (
                        <tr key={order.id}>
                          <td className="pos-mono" style={{ fontWeight: 700, color: "#60A5FA" }}>
                            {order.id}
                          </td>
                          <td style={{ fontSize: "12px", color: "#94A3B8" }}>
                            {new Date(order.timestamp).toLocaleString()}
                          </td>
                          <td style={{ fontWeight: 600, color: "#F8FAFC" }}>
                            {order.customerName}
                          </td>
                          <td>
                            <span className="pos-sku-tag" style={{ textTransform: "uppercase" }}>
                              {order.pricingMode}
                            </span>
                          </td>
                          <td>{order.paymentMethod}</td>
                          <td className="pos-mono">
                            {order.items.reduce((s, i) => s + i.qty, 0)} units
                          </td>
                          <td className="pos-mono" style={{ fontWeight: 800, color: "#10B981" }}>
                            {formatMoney(order.total)}
                          </td>
                          <td>
                            <span
                              className={`pos-stock-badge ${
                                order.status === "Refunded"
                                  ? "stock-out"
                                  : "stock-ok"
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
                                    color: "#FCA5A5",
                                    borderColor: "rgba(239,68,68,0.35)",
                                  }}
                                >
                                  <RotateCcw size={13} />
                                  <span>Refund & Restock</span>
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
          {/* MODULE 4: CUSTOMERS, LOYALTY & CREDIT LEDGER (KHATA)           */}
          {/* ============================================================== */}
          {activeModule === "customers" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Customer CRM, VIP Loyalty Points & Credit Ledger (Receivables)
                  </h2>
                  <p className="pos-module-subtitle">
                    Track regular shoppers and B2B wholesale accounts, manage credit limits, and settle outstanding customer balances.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="pos-btn-primary"
                >
                  <Plus size={15} />
                  <span>Add New Customer Account</span>
                </button>
              </div>

              <div className="pos-table-container">
                <table className="pos-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone & Email</th>
                      <th>Membership Tier</th>
                      <th>Loyalty Points</th>
                      <th>Total Lifetime Spent</th>
                      <th>Credit Balance Due</th>
                      <th>Credit Limit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: "#F8FAFC" }}>{c.name}</td>
                        <td style={{ fontSize: "12px", color: "#94A3B8" }}>
                          <div>{c.phone}</div>
                          <div>{c.email}</div>
                        </td>
                        <td>
                          <span className="pos-margin-pill">{c.tier}</span>
                        </td>
                        <td className="pos-mono" style={{ color: "#10B981", fontWeight: 700 }}>
                          {c.loyaltyPoints.toLocaleString()} pts
                        </td>
                        <td className="pos-mono">{formatMoney(c.totalSpent)}</td>
                        <td
                          className="pos-mono"
                          style={{
                            fontWeight: 800,
                            color: c.creditBalance > 0 ? "#F59E0B" : "#94A3B8",
                          }}
                        >
                          {formatMoney(c.creditBalance)}
                        </td>
                        <td className="pos-mono">{formatMoney(c.creditLimit)}</td>
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
                              <span>Settle Credit</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#64748B" }}>
                              No Balance Due
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 5: SUPPLIERS & STOCK-IN PURCHASE ORDERS                 */}
          {/* ============================================================== */}
          {activeModule === "suppliers" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Suppliers Directory & Instant Stock-In Purchase Orders
                  </h2>
                  <p className="pos-module-subtitle">
                    Receive incoming inventory shipments from distributors and automatically increment live warehouse stock counts.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "18px", marginBottom: "22px" }}>
                {/* Receive Stock Form Card */}
                <div className="pos-card-panel">
                  <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 700, color: "#F8FAFC" }}>
                    Receive New Stock Shipment (Purchase Order)
                  </h3>
                  <form onSubmit={handleReceiveStockOrder} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label className="pos-field-label">Select Product SKU to Restock</label>
                      <select
                        value={stockInProductId}
                        onChange={(e) => setStockInProductId(e.target.value)}
                        className="pos-input"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.sku}] {p.name} (Current Stock: {p.stock} {p.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="pos-field-label">Quantity Received</label>
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
                      <span>Receive Stock & Update Inventory</span>
                    </button>
                  </form>
                </div>

                {/* Recent Stock-In Log */}
                <div className="pos-card-panel">
                  <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 700, color: "#F8FAFC" }}>
                    Recent Stock-In Purchase Orders
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {stockInHistory.map((po) => (
                      <div key={po.id} className="pos-mini-stat-box">
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "13px", color: "#F8FAFC" }}>
                          <span>{po.productName}</span>
                          <span style={{ color: "#10B981", fontFamily: "monospace" }}>
                            +{po.qty} units ({formatMoney(po.totalCost)})
                          </span>
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#94A3B8", marginTop: "3px" }}>
                          {po.id} • Supplier: {po.supplier} • {new Date(po.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suppliers Table */}
              <div className="pos-table-container">
                <table className="pos-table">
                  <thead>
                    <tr>
                      <th>Supplier Name</th>
                      <th>Contact Person</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Lead Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700, color: "#F8FAFC" }}>{s.name}</td>
                        <td>{s.contactPerson}</td>
                        <td className="pos-mono">{s.phone}</td>
                        <td>{s.email}</td>
                        <td>
                          <span className="pos-sku-tag">{s.category}</span>
                        </td>
                        <td className="pos-mono">{s.leadTimeDays} Day(s)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 6: CASH DRAWER, EXPENSES & SHIFT Z-REPORT               */}
          {/* ============================================================== */}
          {activeModule === "drawer" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Cash Drawer Reconciliation, Petty Expenses & Shift Z-Report
                  </h2>
                  <p className="pos-module-subtitle">
                    Monitor physical drawer cash, log daily store operating expenses, and print end-of-shift Z-Reports.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="pos-btn-primary"
                >
                  <Printer size={15} />
                  <span>Print Shift Z-Report</span>
                </button>
              </div>

              <div className="pos-kpi-grid">
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Opening Cash Float</span>
                  <strong className="pos-kpi-value">
                    {formatMoney(storeSettings?.openingCashFloat || 500)}
                  </strong>
                  <span className="pos-kpi-sub">Starting register drawer cash</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Cash Sales Collected</span>
                  <strong className="pos-kpi-value" style={{ color: "#10B981" }}>
                    +{formatMoney(financialMetrics.cashSales + financialMetrics.splitSales * 0.5)}
                  </strong>
                  <span className="pos-kpi-sub">Includes cash portion of split orders</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Petty Cash Expenses</span>
                  <strong className="pos-kpi-value" style={{ color: "#EF4444" }}>
                    -{formatMoney(financialMetrics.totalExpenses)}
                  </strong>
                  <span className="pos-kpi-sub">{expenses.length} recorded payouts</span>
                </div>
                <div className="pos-kpi-card" style={{ borderColor: "rgba(59,130,246,0.5)" }}>
                  <span className="pos-kpi-label">Expected Cash in Drawer</span>
                  <strong className="pos-kpi-value" style={{ color: "#60A5FA" }}>
                    {formatMoney(financialMetrics.expectedDrawerCash)}
                  </strong>
                  <span className="pos-kpi-sub">Float + Cash Sales - Expenses</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "18px" }}>
                {/* Record Store Expense */}
                <div className="pos-card-panel">
                  <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 700, color: "#F8FAFC" }}>
                    Log Petty Cash Store Expense
                  </h3>
                  <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label className="pos-field-label">Expense Description</label>
                      <input
                        type="text"
                        value={expenseTitle}
                        onChange={(e) => setExpenseTitle(e.target.value)}
                        placeholder="e.g., Packaging Bags, Utility Bill, Staff Refreshment"
                        className="pos-input"
                        required
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label className="pos-field-label">Category</label>
                        <select
                          value={expenseCategory}
                          onChange={(e) => setExpenseCategory(e.target.value)}
                          className="pos-input"
                        >
                          <option value="Store Supplies">Store Supplies</option>
                          <option value="Utilities">Utilities & Electricity</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Logistics">Delivery & Logistics</option>
                        </select>
                      </div>
                      <div>
                        <label className="pos-field-label">Amount ({currency.trim()})</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          placeholder="0.00"
                          className="pos-input"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="pos-btn-primary" style={{ justifyContent: "center" }}>
                      <Plus size={15} />
                      <span>Record Store Expense</span>
                    </button>
                  </form>

                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {expenses.map((exp) => (
                      <div key={exp.id} className="pos-mini-stat-box">
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "13px" }}>
                          <span>{exp.title}</span>
                          <span style={{ color: "#FCA5A5", fontFamily: "monospace" }}>
                            -{formatMoney(exp.amount)}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                          {exp.category} • Logged by {exp.recordedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shift Z-Report Summary Card */}
                <div className="pos-card-panel">
                  <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 700, color: "#F8FAFC" }}>
                    Official Shift Z-Report Audit Summary
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "13px" }}>
                    <div className="pos-summary-row">
                      <span>Completed Invoices</span>
                      <strong className="pos-mono">{financialMetrics.activeOrderCount}</strong>
                    </div>
                    <div className="pos-summary-row">
                      <span>Gross Sales Revenue (Incl. Tax)</span>
                      <strong className="pos-mono">{formatMoney(financialMetrics.grossRevenue)}</strong>
                    </div>
                    <div className="pos-summary-row">
                      <span>Sales Tax Collected</span>
                      <strong className="pos-mono">{formatMoney(financialMetrics.totalTaxCollected)}</strong>
                    </div>
                    <div className="pos-summary-row">
                      <span>Cost of Goods Sold (COGS)</span>
                      <strong className="pos-mono">-{formatMoney(financialMetrics.totalCogs)}</strong>
                    </div>
                    <div className="pos-summary-row" style={{ color: "#10B981" }}>
                      <span>Gross Margin Profit</span>
                      <strong className="pos-mono">{formatMoney(financialMetrics.grossProfit)}</strong>
                    </div>
                    <div className="pos-summary-row" style={{ color: "#FCA5A5" }}>
                      <span>Operating Store Expenses</span>
                      <strong className="pos-mono">-{formatMoney(financialMetrics.totalExpenses)}</strong>
                    </div>
                    <div className="pos-grand-total-row" style={{ marginTop: "6px" }}>
                      <span>NET SHIFT PROFIT</span>
                      <span className="pos-grand-total-val">
                        {formatMoney(financialMetrics.netProfit)}
                      </span>
                    </div>

                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(148,163,184,0.14)" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#94A3B8", marginBottom: "8px", textTransform: "uppercase" }}>
                        Tender Breakdown
                      </div>
                      <div className="pos-summary-row">
                        <span>Cash Tender</span>
                        <span className="pos-mono">{formatMoney(financialMetrics.cashSales)}</span>
                      </div>
                      <div className="pos-summary-row">
                        <span>Card POS Terminal</span>
                        <span className="pos-mono">{formatMoney(financialMetrics.cardSales)}</span>
                      </div>
                      <div className="pos-summary-row">
                        <span>Mobile QR Wallet</span>
                        <span className="pos-mono">{formatMoney(financialMetrics.qrSales)}</span>
                      </div>
                      <div className="pos-summary-row">
                        <span>Split Tender (Cash + Card)</span>
                        <span className="pos-mono">{formatMoney(financialMetrics.splitSales)}</span>
                      </div>
                      <div className="pos-summary-row">
                        <span>Customer Credit Ledger</span>
                        <span className="pos-mono">{formatMoney(financialMetrics.creditSales)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 7: ANALYTICS & ANIMATED ARCHITECTURE DIAGRAMS           */}
          {/* ============================================================== */}
          {activeModule === "analytics" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Executive Business Intelligence & Live System Architecture Diagrams
                  </h2>
                  <p className="pos-module-subtitle">
                    Real-time revenue telemetry, net margin waterfall, and interactive animated POS data-flow diagrams.
                  </p>
                </div>
              </div>

              <div className="pos-kpi-grid">
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Gross Revenue</span>
                  <strong className="pos-kpi-value" style={{ color: "#10B981" }}>
                    {formatMoney(financialMetrics.grossRevenue)}
                  </strong>
                  <span className="pos-kpi-sub">
                    {financialMetrics.activeOrderCount} completed transactions
                  </span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Net Profit (After COGS & Exp)</span>
                  <strong className="pos-kpi-value" style={{ color: "#38BDF8" }}>
                    {formatMoney(financialMetrics.netProfit)}
                  </strong>
                  <span className="pos-kpi-sub">
                    COGS: {formatMoney(financialMetrics.totalCogs)}
                  </span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Average Basket Value</span>
                  <strong className="pos-kpi-value">
                    {formatMoney(financialMetrics.avgOrderValue)}
                  </strong>
                  <span className="pos-kpi-sub">Retail + Wholesale blended</span>
                </div>
                <div className="pos-kpi-card">
                  <span className="pos-kpi-label">Customer Credit Receivables</span>
                  <strong className="pos-kpi-value" style={{ color: "#F59E0B" }}>
                    {formatMoney(
                      customers.reduce((s, c) => s + c.creditBalance, 0)
                    )}
                  </strong>
                  <span className="pos-kpi-sub">Active B2B & VIP ledger</span>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <HeroArchitectureDiagram />
              </div>

              <InteractiveSystemDiagrams />
            </div>
          )}

          {/* ============================================================== */}
          {/* MODULE 8: STORE SETTINGS, BACKUP & CLOUD DEPLOY                */}
          {/* ============================================================== */}
          {activeModule === "settings" && (
            <div className="pos-module-page">
              <div className="pos-module-header">
                <div>
                  <h2 className="pos-module-title">
                    Store Configuration, Database Backup & Cloud Deployment
                  </h2>
                  <p className="pos-module-subtitle">
                    Customize your store identity, tax rate, receipt footer, JSON/CSV backups, and GitHub/Vercel deployment settings.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="pos-btn-secondary"
                  >
                    <Download size={15} />
                    <span>Export Full JSON Backup</span>
                  </button>
                  <button
                    type="button"
                    onClick={onResetDemoData}
                    className="pos-btn-secondary"
                    style={{ color: "#FCA5A5" }}
                  >
                    <RotateCcw size={15} />
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              </div>

              <div className="pos-card-panel" style={{ maxWidth: "740px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="pos-field-label">Store / Brand Name</label>
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
                    <label className="pos-field-label">Branch / Terminal Name</label>
                    <input
                      type="text"
                      value={storeSettings?.branchName || ""}
                      onChange={(e) =>
                        setStoreSettings((p) => ({ ...p, branchName: e.target.value }))
                      }
                      className="pos-input"
                    />
                  </div>
                  <div>
                    <label className="pos-field-label">Default Sales Tax / GST (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={storeSettings?.taxRate ?? 8}
                      onChange={(e) =>
                        setStoreSettings((p) => ({
                          ...p,
                          taxRate: Number(e.target.value) || 0,
                        }))
                      }
                      className="pos-input"
                    />
                  </div>
                  <div>
                    <label className="pos-field-label">Opening Cash Drawer Float ({currency.trim()})</label>
                    <input
                      type="number"
                      step="1"
                      value={storeSettings?.openingCashFloat ?? 500}
                      onChange={(e) =>
                        setStoreSettings((p) => ({
                          ...p,
                          openingCashFloat: Number(e.target.value) || 0,
                        }))
                      }
                      className="pos-input"
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="pos-field-label">Store Address (Printed on 80mm Receipt)</label>
                    <input
                      type="text"
                      value={storeSettings?.address || ""}
                      onChange={(e) =>
                        setStoreSettings((p) => ({ ...p, address: e.target.value }))
                      }
                      className="pos-input"
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="pos-field-label">Thermal Receipt Footer Policy</label>
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

                <div style={{ marginTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={onOpenDeployModal}
                    className="pos-btn-secondary"
                  >
                    <GitBranch size={15} />
                    <span>Open GitHub & Vercel Deployment Instructions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      showToast("Store settings saved to persistent storage!", "success")
                    }
                    className="pos-btn-primary"
                  >
                    <CheckCircle2 size={15} />
                    <span>Save Store Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================================================================== */}
      {/* PARKED / HELD BILLS DRAWER MODAL                                   */}
      {/* ================================================================== */}
      {showParkedDrawer && (
        <div className="pos-modal-backdrop" onClick={() => setShowParkedDrawer(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Parked / Held Customer Bills ({parkedBills.length})
              </h3>
              <button type="button" onClick={() => setShowParkedDrawer(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {parkedBills.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94A3B8", padding: "24px 0" }}>
                  No parked bills right now. Click &ldquo;Hold&rdquo; on any active cart to park a bill.
                </div>
              ) : (
                parkedBills.map((b) => (
                  <div key={b.id} className="pos-mini-stat-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#F8FAFC" }}>
                        {b.id} • {b.customerName}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#94A3B8" }}>
                        {b.cart.length} SKU(s) • Total: {formatMoney(b.total)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRecallBill(b)}
                      className="pos-btn-primary"
                      style={{ padding: "7px 12px", fontSize: "12px" }}
                    >
                      <PlayCircle size={14} />
                      <span>Recall Bill</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MULTI-TENDER CHECKOUT MODAL                                        */}
      {/* ================================================================== */}
      {isCheckoutOpen && (
        <div className="pos-modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
          <div
            className="pos-modal-card"
            style={{ maxWidth: "600px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pos-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
                  Multi-Tender Checkout — {formatMoney(cartSummary.grandTotal)}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94A3B8" }}>
                  Customer: {activeCustomer?.name} • Pricing Tier: {pricingMode.toUpperCase()}
                </p>
              </div>
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* 5 Tender Mode Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: "8px" }}>
                {[
                  { id: "Cash", label: "Cash", icon: Banknote },
                  { id: "Card", label: "Card POS", icon: CreditCard },
                  { id: "Mobile QR Wallet", label: "QR Wallet", icon: QrCode },
                  { id: "Split (Cash + Card)", label: "Split Pay", icon: Split },
                  { id: "Customer Credit", label: "Credit Ledger", icon: BookOpen },
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

              {/* Tender-Specific Controls */}
              {paymentMethod === "Cash" && (
                <div className="pos-mini-stat-box">
                  <label className="pos-field-label">Cash Amount Tendered ({currency.trim()})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="pos-input"
                    style={{ fontSize: "18px", fontWeight: 800, fontFamily: "monospace" }}
                  />
                  {/* Quick Denomination Buttons */}
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
                        {idx === 0 ? `Exact (${formatMoney(amt)})` : formatMoney(amt)}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(148,163,184,0.15)" }}>
                    <span style={{ fontWeight: 700, color: "#94A3B8" }}>CHANGE DUE TO CUSTOMER:</span>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", fontFamily: "monospace" }}>
                      {formatMoney(Math.max(0, (Number(cashTendered) || 0) - cartSummary.grandTotal))}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === "Mobile QR Wallet" && (
                <div className="pos-mini-stat-box" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12.5px", color: "#94A3B8", marginBottom: "10px" }}>
                    Scan Dynamic Invoice QR Code for Instant Payment ({formatMoney(cartSummary.grandTotal)})
                  </div>
                  <SvgQrCode
                    payload={`PRO-POS|${storeSettings?.storeName}|${cartSummary.grandTotal.toFixed(2)}`}
                  />
                </div>
              )}

              {paymentMethod === "Split (Cash + Card)" && (
                <div className="pos-mini-stat-box">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="pos-field-label">Cash Portion ({currency.trim()})</label>
                      <input
                        type="number"
                        step="0.01"
                        value={splitCashAmount}
                        onChange={(e) => setSplitCashAmount(e.target.value)}
                        className="pos-input"
                      />
                    </div>
                    <div>
                      <label className="pos-field-label">Remaining on Card ({currency.trim()})</label>
                      <input
                        type="text"
                        readOnly
                        value={formatMoney(
                          Math.max(0, cartSummary.grandTotal - (Number(splitCashAmount) || 0))
                        )}
                        className="pos-input"
                        style={{ color: "#60A5FA", fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "Customer Credit" && (
                <div className="pos-mini-stat-box">
                  <div style={{ fontSize: "13px", color: "#F8FAFC", fontWeight: 700 }}>
                    Account: {activeCustomer?.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>
                    Current Credit Balance: {formatMoney(activeCustomer?.creditBalance)} • Limit: {formatMoney(activeCustomer?.creditLimit)}
                  </div>
                </div>
              )}

              <div>
                <label className="pos-field-label">Invoice / Cashier Note (Optional)</label>
                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Add warranty note, delivery instruction, or PO reference..."
                  className="pos-input"
                />
              </div>
            </div>

            <div className="pos-modal-footer">
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="pos-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleCompleteSale} className="pos-btn-charge" style={{ padding: "12px 24px" }}>
                <CheckCircle2 size={17} />
                <span>Complete Sale & Generate 80mm Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 80MM THERMAL RECEIPT PREVIEW & PRINT MODAL                         */}
      {/* ================================================================== */}
      {activeReceiptOrder && (
        <div className="pos-modal-backdrop" onClick={() => setActiveReceiptOrder(null)}>
          <div
            className="pos-modal-card"
            style={{ maxWidth: "430px", width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pos-modal-header">
              <span style={{ fontWeight: 800, fontSize: "15px" }}>
                80mm Thermal Receipt — {activeReceiptOrder.id}
              </span>
              <button type="button" onClick={() => setActiveReceiptOrder(null)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "18px", background: "#0B111E", maxHeight: "75vh", overflowY: "auto" }}>
              {/* Realistic White 80mm Thermal Paper Ticket */}
              <div className="pos-thermal-paper">
                <div style={{ textAlign: "center", borderBottom: "1px dashed #334155", paddingBottom: "10px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 900, letterSpacing: "0.02em" }}>
                    {storeSettings?.storeName || "PRO GENERAL POS"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                    {storeSettings?.branchName}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#475569" }}>
                    {storeSettings?.address}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#475569" }}>
                    Tel: {storeSettings?.phone} • {storeSettings?.taxId}
                  </div>
                </div>

                <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "3px", borderBottom: "1px dashed #334155", paddingBottom: "8px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>INVOICE:</span>
                    <strong>{activeReceiptOrder.id}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>DATE:</span>
                    <span>{new Date(activeReceiptOrder.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>CASHIER:</span>
                    <span>{activeReceiptOrder.cashier}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>CUSTOMER:</span>
                    <strong>{activeReceiptOrder.customerName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>TENDER:</span>
                    <strong>{activeReceiptOrder.paymentMethod}</strong>
                  </div>
                </div>

                {/* Itemized Table */}
                <div style={{ fontSize: "11px", borderBottom: "1px dashed #334155", paddingBottom: "8px", marginBottom: "8px" }}>
                  {activeReceiptOrder.items.map((item, i) => (
                    <div key={i} style={{ marginBottom: "6px" }}>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#334155" }}>
                        <span>
                          {item.qty} × {formatMoney(item.price)}
                          {item.discount > 0 ? ` (-${item.discount}%)` : ""}
                        </span>
                        <strong>
                          {formatMoney(
                            item.qty * item.price * (1 - (item.discount || 0) / 100)
                          )}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ fontSize: "11.5px", display: "flex", flexDirection: "column", gap: "4px", borderBottom: "1px dashed #334155", paddingBottom: "10px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Subtotal:</span>
                    <span>{formatMoney(activeReceiptOrder.subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Discount:</span>
                    <span>-{formatMoney(activeReceiptOrder.discountAmount)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Tax:</span>
                    <span>{formatMoney(activeReceiptOrder.taxAmount)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 900, marginTop: "4px" }}>
                    <span>TOTAL PAID:</span>
                    <span>{formatMoney(activeReceiptOrder.total)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Amount Tendered:</span>
                    <span>{formatMoney(activeReceiptOrder.amountTendered)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Change Due:</span>
                    <strong>{formatMoney(activeReceiptOrder.changeDue)}</strong>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <SvgBarcode value={activeReceiptOrder.id.replace(/[^0-9]/g, "") || "20261001"} width={190} height={38} />
                  <p style={{ fontSize: "10px", color: "#475569", marginTop: "8px", lineHeight: 1.4 }}>
                    {storeSettings?.receiptFooter}
                  </p>
                </div>
              </div>
            </div>

            <div className="pos-modal-footer">
              <button
                type="button"
                onClick={() => window.print()}
                className="pos-btn-secondary"
              >
                <Printer size={15} />
                <span>Print 80mm Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveReceiptOrder(null)}
                className="pos-btn-primary"
              >
                <span>Start Next Sale</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ADD / EDIT PRODUCT SKU MODAL                                       */}
      {/* ================================================================== */}
      {isProductModalOpen && editingProduct && (
        <div className="pos-modal-backdrop" onClick={() => setIsProductModalOpen(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Configure SKU Product & Pricing Tiers
              </h3>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ padding: "18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="pos-field-label">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="pos-input"
                  required
                />
              </div>
              <div>
                <label className="pos-field-label">SKU Code</label>
                <input
                  type="text"
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  className="pos-input"
                  required
                />
              </div>
              <div>
                <label className="pos-field-label">EAN-13 Barcode</label>
                <input
                  type="text"
                  value={editingProduct.barcode}
                  onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                  className="pos-input"
                  required
                />
              </div>
              <div>
                <label className="pos-field-label">Department Category</label>
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
                <label className="pos-field-label">Cost Price ({currency.trim()})</label>
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
                <label className="pos-field-label">Wholesale Price ({currency.trim()})</label>
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
                <label className="pos-field-label">Retail Price ({currency.trim()})</label>
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
                <label className="pos-field-label">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  className="pos-input"
                  required
                />
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="pos-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="pos-btn-primary">
                  Save SKU to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* BARCODE STICKER LABEL STUDIO MODAL                                 */}
      {/* ================================================================== */}
      {barcodeLabelProduct && (
        <div className="pos-modal-backdrop" onClick={() => setBarcodeLabelProduct(null)}>
          <div className="pos-modal-card" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Printable Barcode Shelf Sticker Studio — {barcodeLabelProduct.name}
              </h3>
              <button type="button" onClick={() => setBarcodeLabelProduct(null)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "18px" }}>
              <div style={{ marginBottom: "14px" }}>
                <label className="pos-field-label">Select Product for Sticker Sheet</label>
                <select
                  value={barcodeLabelProduct.id}
                  onChange={(e) => {
                    const p = products.find((item) => item.id === e.target.value);
                    if (p) setBarcodeLabelProduct(p);
                  }}
                  className="pos-input"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} — {formatMoney(p.retailPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "10px", background: "#0B111E", padding: "14px", borderRadius: "10px" }}>
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#FFFFFF",
                      color: "#090D16",
                      padding: "10px",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", color: "#475569" }}>
                      {storeSettings?.storeName}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 800, margin: "3px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {barcodeLabelProduct.name}
                    </div>
                    <SvgBarcode value={barcodeLabelProduct.barcode} width={150} height={34} />
                    <div style={{ fontSize: "13px", fontWeight: 900, marginTop: "4px" }}>
                      {formatMoney(barcodeLabelProduct.retailPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pos-modal-footer">
              <button type="button" onClick={() => window.print()} className="pos-btn-primary">
                <Printer size={15} />
                <span>Print Barcode Sticker Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* ADD NEW CUSTOMER MODAL                                             */}
      {/* ================================================================== */}
      {isCustomerModalOpen && (
        <div className="pos-modal-backdrop" onClick={() => setIsCustomerModalOpen(false)}>
          <div className="pos-modal-card" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="pos-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                Register New Customer & Credit Account
              </h3>
              <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="pos-field-label">Customer / Business Name</label>
                <input
                  type="text"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="e.g., Horizon Retail Mart"
                  className="pos-input"
                  required
                />
              </div>
              <div>
                <label className="pos-field-label">Phone Number</label>
                <input
                  type="text"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="pos-input"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="pos-field-label">Membership Tier</label>
                  <select
                    value={newCustomerForm.tier}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, tier: e.target.value })}
                    className="pos-input"
                  >
                    <option value="VIP Gold">VIP Gold</option>
                    <option value="Wholesale B2B">Wholesale B2B</option>
                    <option value="Silver Member">Silver Member</option>
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
              <button type="submit" className="pos-btn-primary" style={{ justifyContent: "center", marginTop: "6px" }}>
                Save Customer Account
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
                Settle Credit Ledger — {settlingCustomer.name}
              </h3>
              <button type="button" onClick={() => setSettlingCustomer(null)} className="pos-icon-btn">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSettleCredit} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "13px", color: "#94A3B8" }}>
                Current Outstanding Balance:{" "}
                <strong style={{ color: "#F59E0B" }}>
                  {formatMoney(settlingCustomer.creditBalance)}
                </strong>
              </div>
              <div>
                <label className="pos-field-label">Payment Amount Received ({currency.trim()})</label>
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
                Confirm Credit Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`pos-toast pos-toast-${toast.type}`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
