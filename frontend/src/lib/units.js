/* Unit conversion engine: everything normalises to a base unit per material type.
   Mass base = gram (g), Volume base = milliliter (ml), Count base = pcs.
   "karton", "botol" are count-like display units handled per ingredient. */

export const UNIT_GROUP = {
  kg: "mass",
  g: "mass",
  gram: "mass",
  liter: "volume",
  l: "volume",
  ml: "volume",
  karton: "count",
  botol: "count",
  pcs: "count",
  buah: "count",
};

const TO_BASE = {
  kg: 1000,
  g: 1,
  gram: 1,
  liter: 1000,
  l: 1000,
  ml: 1,
  karton: 1,
  botol: 1,
  pcs: 1,
  buah: 1,
};

export const normalizeUnit = (u) => (u || "").toLowerCase().trim();

// Convert a value from unit -> base amount
export const toBase = (value, unit) => {
  const u = normalizeUnit(unit);
  return (Number(value) || 0) * (TO_BASE[u] ?? 1);
};

// Convert a base amount back to a display unit
export const fromBase = (baseValue, unit) => {
  const u = normalizeUnit(unit);
  return (Number(baseValue) || 0) / (TO_BASE[u] ?? 1);
};

// Given base amount + preferred display unit for an ingredient, format nicely.
export const formatBase = (baseValue, displayUnit) => {
  const val = fromBase(baseValue, displayUnit);
  const rounded = Math.round(val * 1000) / 1000;
  const str = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return `${str} ${displayUnit}`;
};
