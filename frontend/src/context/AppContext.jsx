import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const resetDemo = useCallback(() => setState(buildSeed()), []);

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

  const value = {
    state,
    setState,
    patch,
    resetDemo,
    logAudit,
    addStock,
    deductStock,
    recordSale,
    totalBaseOf: (name) => totalBase(state.inventory, name),
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};
