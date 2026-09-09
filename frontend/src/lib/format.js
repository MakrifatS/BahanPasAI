/* Rupiah + number formatting helpers */
export const rupiah = (n) => {
  const v = Math.round(Number(n) || 0);
  return "Rp " + v.toLocaleString("id-ID");
};

export const rupiahShort = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return "Rp " + (v / 1_000_000).toFixed(1) + " jt";
  if (Math.abs(v) >= 1_000) return "Rp " + (v / 1_000).toFixed(0) + "rb";
  return "Rp " + Math.round(v);
};

export const pct = (n) => `${(Number(n) || 0).toFixed(1)}%`;

export const fmtQty = (n) => {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? v.toString() : v.toFixed(3).replace(/\.?0+$/, "");
};
