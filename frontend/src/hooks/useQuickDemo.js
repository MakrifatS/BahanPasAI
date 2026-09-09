import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

/* Quick Demo Mode: auto-simulates sales, stock decay, HPP alert & WA draft over ~10s. */
export const useQuickDemo = () => {
  const { recordSale, deductStock, state } = useApp();
  const [running, setRunning] = useState(false);
  const timers = useRef([]);

  const run = useCallback((onFinish) => {
    if (running) return;
    setRunning(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const push = (ms, fn) => timers.current.push(setTimeout(fn, ms));

    toast.info("🎬 Quick Demo dimulai — simulasi 10 detik", { description: "Menyimulasikan penjualan, stok, alert HPP & draft WA." });

    push(1200, () => {
      recordSale("Kopi Susu Aren", 12);
      toast.success("☕ 12 Kopi Susu Aren terjual", { description: "Stok kopi & susu berkurang otomatis (FIFO)." });
    });
    push(3200, () => {
      recordSale("Vanilla Latte", 7);
      toast.success("🥤 7 Vanilla Latte terjual", { description: "Sirup vanilla batch #01 mulai menipis." });
    });
    push(5200, () => {
      deductStock({ name: "Susu UHT Diamond", quantity: 1, unit: "liter", reason: "Spill/Tumpah Dapur" });
      toast.warning("⚠️ Susu tumpah 1 L tercatat di Audit Trail", { description: "Kerugian dihitung & dicegah berulang." });
    });
    push(7200, () => {
      toast.error("🔴 Alert HPP: margin Kopi Susu Aren turun ke 61%", { description: "Harga biji kopi naik — cek Simulator HPP." });
    });
    push(9200, () => {
      toast("📲 Draft WhatsApp order siap ke Toko Jaya Abadi", { description: "Susu UHT & Sirup Vanilla direkomendasikan restock." });
    });
    push(10400, () => {
      setRunning(false);
      onFinish && onFinish();
    });
  }, [running, recordSale, deductStock, state]);

  return { run, running };
};
