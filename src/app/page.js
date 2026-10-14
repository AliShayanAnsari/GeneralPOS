"use client";

import React, { useState, useEffect } from "react";
import HomePage from "../components/HomePage";
import PosTerminal from "../components/PosTerminal";
import DeployModal from "../components/DeployModal";
import {
  DEFAULT_STORE_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_ORDERS,
  INITIAL_EXPENSES,
} from "../data/initialData";

const STORAGE_KEY = "pro_general_pos_state_v24";

export default function MainPosApp() {
  const [currentView, setCurrentView] = useState("homepage"); // "homepage" | "terminal"
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    name: "Alex Morgan",
    email: "admin@progeneralpos.com",
    role: "Store Manager (Full Admin)",
  });

  const [storeSettings, setStoreSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [parkedBills, setParkedBills] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.storeSettings) setStoreSettings(parsed.storeSettings);
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        }
        if (Array.isArray(parsed.customers) && parsed.customers.length > 0) {
          setCustomers(parsed.customers);
        }
        if (Array.isArray(parsed.suppliers) && parsed.suppliers.length > 0) {
          setSuppliers(parsed.suppliers);
        }
        if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
        if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
        if (Array.isArray(parsed.parkedBills)) setParkedBills(parsed.parkedBills);
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
      }
    } catch {
      // Ignore storage read errors
    }
    setHydrated(true);
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          storeSettings,
          products,
          customers,
          suppliers,
          orders,
          expenses,
          parkedBills,
          currentUser,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [
    hydrated,
    storeSettings,
    products,
    customers,
    suppliers,
    orders,
    expenses,
    parkedBills,
    currentUser,
  ]);

  const handleAuthenticatedLaunch = (userPayload) => {
    setCurrentUser({
      name: userPayload.name || "Alex Morgan",
      email: userPayload.email || "admin@progeneralpos.com",
      role: userPayload.role || "Store Manager (Full Admin)",
    });
    if (userPayload.storeName || userPayload.currency) {
      setStoreSettings((prev) => ({
        ...prev,
        storeName: userPayload.storeName || prev.storeName,
        currency: userPayload.currency || prev.currency,
      }));
    }
    setCurrentView("terminal");
  };

  const handleResetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setOrders(INITIAL_ORDERS);
    setExpenses(INITIAL_EXPENSES);
    setParkedBills([]);
  };

  return (
    <>
      {currentView === "homepage" ? (
        <HomePage
          onAuthenticatedLaunch={handleAuthenticatedLaunch}
          currentUser={currentUser}
          onOpenDeployModal={() => setIsDeployModalOpen(true)}
          storeSettings={storeSettings}
        />
      ) : (
        <PosTerminal
          currentUser={currentUser}
          storeSettings={storeSettings}
          setStoreSettings={setStoreSettings}
          products={products}
          setProducts={setProducts}
          customers={customers}
          setCustomers={setCustomers}
          suppliers={suppliers}
          setSuppliers={setSuppliers}
          orders={orders}
          setOrders={setOrders}
          expenses={expenses}
          setExpenses={setExpenses}
          parkedBills={parkedBills}
          setParkedBills={setParkedBills}
          onBackToHome={() => setCurrentView("homepage")}
          onOpenDeployModal={() => setIsDeployModalOpen(true)}
          onResetDemoData={handleResetDemoData}
        />
      )}

      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </>
  );
}
