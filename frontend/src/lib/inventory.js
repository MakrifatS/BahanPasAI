/* Pure inventory / HPP / FIFO helpers */

export const daysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
};

export const statusOf = (batch) => {
  const days = daysUntil(batch.expiry);
  if (days <= 2) return "red";
  if (days <= 5) return "yellow";
  return "green";
};

export const STATUS_LABEL = {
  red: "Kritis",
  yellow: "Waspada",
  green: "Aman",
};

// Total base stock of an ingredient across all batches
export const totalBase = (inventory, name) =>
  inventory.filter((b) => b.name === name).reduce((s, b) => s + b.baseQty, 0);

// Batch (with qty > 0) that should be used first = earliest expiry
export const fifoBatch = (inventory, name) => {
  const batches = inventory
    .filter((b) => b.name === name && b.baseQty > 0)
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  return batches[0] || null;
};

// Weighted-average price per base unit for an ingredient (Rp per g/ml/pcs)
export const avgPricePerBase = (inventory, name, priceHikePct = 0) => {
  const batches = inventory.filter((b) => b.name === name);
  if (!batches.length) return 0;
  const totQty = batches.reduce((s, b) => s + b.baseQty, 0);
  if (totQty <= 0) {
    // fall back to simple average of prices
    const avg = batches.reduce((s, b) => s + b.pricePerBase, 0) / batches.length;
    return avg * (1 + priceHikePct / 100);
  }
  const weighted = batches.reduce((s, b) => s + b.pricePerBase * b.baseQty, 0) / totQty;
  return weighted * (1 + priceHikePct / 100);
};

// baseAmount for a recipe component (qty in its own unit -> base)
import { toBase } from "@/lib/units";

export const computeHPP = (recipe, inventory, priceHikePct = 0) => {
  let hpp = 0;
  const breakdown = recipe.components.map((c) => {
    const pricePerBase = avgPricePerBase(inventory, c.ingredient, priceHikePct);
    const base = toBase(c.qty, c.unit);
    const cost = pricePerBase * base;
    hpp += cost;
    return { ...c, cost };
  });
  const margin = recipe.sellPrice > 0 ? ((recipe.sellPrice - hpp) / recipe.sellPrice) * 100 : 0;
  return { hpp, margin, breakdown };
};

// Deduct base amount from inventory following FIFO across batches of an ingredient
export const deductFifo = (inventory, name, baseAmount) => {
  let remaining = baseAmount;
  const batches = inventory
    .filter((b) => b.name === name && b.baseQty > 0)
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  const next = inventory.map((b) => ({ ...b }));
  for (const b of batches) {
    if (remaining <= 0) break;
    const target = next.find((x) => x.id === b.id);
    const take = Math.min(target.baseQty, remaining);
    target.baseQty -= take;
    remaining -= take;
  }
  return { inventory: next, shortfall: remaining };
};
