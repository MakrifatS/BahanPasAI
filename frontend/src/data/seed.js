/* Pre-loaded demo data for BahanPas AI.
   Quantities stored as `baseQty` in base units (g for mass, ml for volume, pcs/botol for count).
   Expiry computed relative to "today" so demo always looks fresh (H-2, H-4, ...). */
import { toBase } from "@/lib/units";

const daysFromNow = (d) => {
  const dt = new Date();
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

let idc = 1;
const uid = (p) => `${p}-${idc++}`;

export const buildSeed = () => {
  idc = 1;
  const inventory = [
    {
      id: uid("batch"),
      name: "Susu UHT Diamond",
      batchNo: "#01",
      displayUnit: "liter",
      group: "volume",
      baseQty: toBase(2, "liter"),
      minBase: toBase(3, "liter"),
      pricePerBase: 18000 / 1000, // Rp per ml
      priceUnit: "liter",
      priceDisplay: 18000,
      expiry: daysFromNow(2),
      supplier: "Toko Jaya Abadi",
    },
    {
      id: uid("batch"),
      name: "Susu UHT Diamond",
      batchNo: "#02",
      displayUnit: "liter",
      group: "volume",
      baseQty: toBase(10, "liter"),
      minBase: toBase(3, "liter"),
      pricePerBase: 18500 / 1000,
      priceUnit: "liter",
      priceDisplay: 18500,
      expiry: daysFromNow(14),
      supplier: "Toko Jaya Abadi",
    },
    {
      id: uid("batch"),
      name: "Biji Kopi Arabika",
      batchNo: "#01",
      displayUnit: "kg",
      group: "mass",
      baseQty: toBase(3, "kg"),
      minBase: toBase(1, "kg"),
      pricePerBase: 150000 / 1000, // Rp per g
      priceUnit: "kg",
      priceDisplay: 150000,
      expiry: daysFromNow(30),
      supplier: "Toko Jaya Abadi",
    },
    {
      id: uid("batch"),
      name: "Sirup Vanilla",
      batchNo: "#01",
      displayUnit: "ml",
      group: "volume",
      baseQty: toBase(500, "ml"),
      minBase: toBase(200, "ml"),
      pricePerBase: 80000 / 500, // Rp per ml (Rp 80.000 / botol 500ml)
      priceUnit: "botol",
      priceDisplay: 80000,
      expiry: daysFromNow(4),
      supplier: "Toko Jaya Abadi",
    },
    {
      id: uid("batch"),
      name: "Gula Aren Cair",
      batchNo: "#01",
      displayUnit: "ml",
      group: "volume",
      baseQty: toBase(2, "liter"),
      minBase: toBase(500, "ml"),
      pricePerBase: 45000 / 1000,
      priceUnit: "liter",
      priceDisplay: 45000,
      expiry: daysFromNow(20),
      supplier: "Toko Jaya Abadi",
    },
  ];

  const recipes = [
    {
      id: uid("recipe"),
      name: "Kopi Susu Aren",
      sellPrice: 18000,
      components: [
        { ingredient: "Biji Kopi Arabika", qty: 18, unit: "g" },
        { ingredient: "Susu UHT Diamond", qty: 120, unit: "ml" },
        { ingredient: "Gula Aren Cair", qty: 20, unit: "ml" },
      ],
    },
    {
      id: uid("recipe"),
      name: "Vanilla Latte",
      sellPrice: 22000,
      components: [
        { ingredient: "Biji Kopi Arabika", qty: 18, unit: "g" },
        { ingredient: "Susu UHT Diamond", qty: 150, unit: "ml" },
        { ingredient: "Sirup Vanilla", qty: 15, unit: "ml" },
      ],
    },
  ];

  const suppliers = [
    { id: uid("sup"), name: "Toko Jaya Abadi", wa: "628123456789" },
  ];

  return {
    inventory,
    recipes,
    suppliers,
    sales: [],
    audit: [],
    business: "Warung Sambal Bakar Mas Yudi",
    preventedLoss: 0,
    savings: buildSavingsHistory(),
  };
};

// 7-day history for the dashboard bar chart (savings + waste prevented)
function buildSavingsHistory() {
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const hemat = [42, 68, 55, 90, 76, 120, 98];
  const waste = [12, 8, 18, 6, 14, 4, 9];
  return days.map((d, i) => ({
    day: d,
    hemat: hemat[i] * 1000,
    waste: waste[i] * 1000,
  }));
}

export const AUDIT_REASONS = [
  "Rusak/Kedaluwarsa",
  "Spill/Tumpah Dapur",
  "Koreksi Opname",
];
