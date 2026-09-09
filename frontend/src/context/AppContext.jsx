import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { buildSeed } from "@/data/seed";
import { deductFifo, totalBase } from "@/lib/inventory";
import { toBase } from "@/lib/units";

const KEY = "bahanpas_state_v1";
const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return buildSeed();
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(load);
  const [demoStatus, setDemoStatus] = useState(null); // { pct, message, step, total } | null
  const demoTimers = useRef([]);
  const demoBusy = useRef(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => () => demoTimers.current.forEach(clearTimeout), []);

  const resetDemo = useCallback(() => {
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];
    demoBusy.current = false;
    setDemoStatus(null);
    setState(buildSeed());
  }, []);

  const patch = useCallback((updater) => {
    setState((prev) => ({ ...prev, ...(typeof updater === "function" ? updater(prev) : updater) }));
  }, []);

  const logAudit = useCallback((entry) => {
    setState((prev) => ({
      ...prev,
      audit: [
        {
          id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          time: new Date().toISOString(),
          user: "admin@bahanpas.ai",
          ...entry,
        },
        ...prev.audit,
      ],
    }));
  }, []);

  // Add stock (voice/receipt "masuk") -> new batch
  const addStock = useCallback(({ name, quantity, unit, expiry, supplier, priceDisplay }) => {
    setState((prev) => {
      const existing = prev.inventory.find((b) => b.name === name);
      const group = existing?.group || (["kg", "g", "gram"].includes((unit || "").toLowerCase()) ? "mass" : ["liter", "l", "ml"].includes((unit || "").toLowerCase()) ? "volume" : "count");
      const displayUnit = existing?.displayUnit || unit || "pcs";
      const priceUnit = existing?.priceUnit || unit || "pcs";
      const base = toBase(quantity, unit);
      const price = priceDisplay || existing?.priceDisplay || 0;
      // Rp per base unit = price per priceUnit / base amount in one priceUnit
      const pricePerBase = price ? price / toBase(1, priceUnit) : existing?.pricePerBase || 0;
      const count = prev.inventory.filter((b) => b.name === name).length;
      const batchNo = "#" + String(count + 1).padStart(2, "0");
      const newBatch = {
        id: `batch-${Date.now()}`,
        name,
        batchNo,
        displayUnit,
        group,
        baseQty: base,
        minBase: existing?.minBase || toBase(1, displayUnit),
        pricePerBase: pricePerBase || existing?.pricePerBase || 0,
        priceUnit,
        priceDisplay: price,
        expiry: expiry || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        supplier: supplier || "Umum",
      };
      return { ...prev, inventory: [...prev.inventory, newBatch] };
    });
  }, []);

  // Waste / deduction ("keluar"/"waste")
  const deductStock = useCallback(({ name, quantity, unit, reason }) => {
    setState((prev) => {
      const base = toBase(quantity, unit);
      const { inventory } = deductFifo(prev.inventory, name, base);
      const b = prev.inventory.find((x) => x.name === name);
      const lossRp = b ? b.pricePerBase * base : 0;
      const audit = [
        {
          id: `a-${Date.now()}`,
          time: new Date().toISOString(),
          user: "admin@bahanpas.ai",
          action: reason ? "Waste/Keluar" : "Keluar",
          item: name,
          detail: `${quantity} ${unit}`,
          reason: reason || "Pemakaian",
          amount: lossRp,
        },
        ...prev.audit,
      ];
      return { ...prev, inventory, audit };
    });
  }, []);

  // Record a sale of a menu -> deduct recipe ingredients FIFO
  const recordSale = useCallback((recipeName, count) => {
    setState((prev) => {
      const recipe = prev.recipes.find((r) => r.name === recipeName);
      if (!recipe) return prev;
      let inv = prev.inventory;
      recipe.components.forEach((c) => {
        const base = toBase(c.qty, c.unit) * count;
        inv = deductFifo(inv, c.ingredient, base).inventory;
      });
      const sales = [
        ...prev.sales,
        { id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, menu: recipeName, count, revenue: recipe.sellPrice * count, time: new Date().toISOString() },
      ];
      return { ...prev, inventory: inv, sales };
    });
  }, []);

  // Quick Demo Mode: reset -> sales -> spill -> real price hike (HPP alert) -> WA draft. ~10s, visible.
  const runQuickDemo = useCallback((onFinish) => {
    if (demoBusy.current) return;
    demoBusy.current = true;
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];

    // fresh, repeatable start
    setState(buildSeed());

    const TOTAL = 6;
    const at = (ms, fn) => demoTimers.current.push(setTimeout(fn, ms));
    const status = (pct, step, message) => setDemoStatus({ pct, step, total: TOTAL, message });

    status(6, 0, "Menyiapkan data warung demo...");
    toast.info("🎬 Quick Demo dimulai", { description: "Simulasi otomatis ~10 detik: penjualan, stok, alert HPP & draft WA." });

    at(1400, () => {
      recordSale("Kopi Susu Aren", 12);
      status(28, 1, "12 Kopi Susu Aren terjual — stok kopi & susu turun (FIFO)");
      toast.success("☕ 12 Kopi Susu Aren terjual", { description: "Stok kopi & susu berkurang otomatis (FIFO)." });
    });

    at(3200, () => {
      recordSale("Vanilla Latte", 7);
      status(46, 2, "7 Vanilla Latte terjual — sirup vanilla menipis");
      toast.success("🥤 7 Vanilla Latte terjual", { description: "Sirup vanilla batch #01 mulai menipis." });
    });

    at(5000, () => {
      deductStock({ name: "Susu UHT Diamond", quantity: 1, unit: "liter", reason: "Spill/Tumpah Dapur" });
      status(64, 3, "Susu tumpah 1 L tercatat di Audit Trail");
      toast.warning("⚠️ Susu tumpah 1 L", { description: "Tercatat otomatis di Audit Trail & Waste Log." });
    });

    at(6800, () => {
      // REAL price hike so HPP & margin genuinely change on dashboard/simulator
      setState((prev) => ({
        ...prev,
        inventory: prev.inventory.map((b) =>
          b.name === "Biji Kopi Arabika"
            ? { ...b, pricePerBase: b.pricePerBase * 1.25, priceDisplay: Math.round(b.priceDisplay * 1.25) }
            : b
        ),
      }));
      status(80, 4, "Harga biji kopi +25% → margin menu turun");
      toast.error("🔴 Alert HPP: harga biji kopi naik +25%", { description: "Margin menu turun — cek Simulator HPP di Dashboard." });
    });

    at(8600, () => {
      const draft =
        "Halo Toko Jaya Abadi 🙏\n\nSaya mau order restock:\n1. Susu UHT Diamond — 12 liter\n2. Sirup Vanilla — 3 botol\n\nMohon info ketersediaan & total harga ya. Terima kasih!\n\n— via BahanPas AI";
      setState((prev) => ({ ...prev, waDraft: draft }));
      status(93, 5, "Draft WhatsApp order siap ke Toko Jaya Abadi");
      toast("📲 Draft WhatsApp order siap", { description: "Rekomendasi restock ke Toko Jaya Abadi — buka menu AI Order WA." });
    });

    at(10200, () => {
      status(100, 6, "Demo selesai! Data sudah diperbarui.");
      toast.success("✅ Quick Demo selesai", { description: "Semua perubahan tampil di Dashboard. Klik Reset Data untuk mengulang." });
    });

    at(12200, () => {
      setDemoStatus(null);
      demoBusy.current = false;
      onFinish && onFinish();
    });
  }, [recordSale, deductStock]);

  const value = {
    state,
    setState,
    patch,
    resetDemo,
    logAudit,
    addStock,
    deductStock,
    recordSale,
    runQuickDemo,
    demoStatus,
    totalBaseOf: (name) => totalBase(state.inventory, name),
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};
