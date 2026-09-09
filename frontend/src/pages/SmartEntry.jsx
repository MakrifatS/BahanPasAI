import { useState } from "react";
import { toast } from "sonner";
import { ScanLine, Loader2, Check, X, Calculator, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceInput } from "@/components/VoiceInput";
import { useApp } from "@/context/AppContext";
import { computeHPP } from "@/lib/inventory";
import { parseReceipt } from "@/lib/api";
import { rupiah, pct } from "@/lib/format";

const SAMPLE_RECEIPT = `NOTA SUPPLIER - TOKO JAYA ABADI
Tanggal: 12/06/2026
------------------------------
Susu UHT Diamond  8 liter  x Rp18.500  = Rp148.000
Biji Kopi Arabika 2 kg     x Rp150.000 = Rp300.000
Sirup Vanilla     3 botol  x Rp80.000  = Rp240.000
------------------------------
TOTAL: Rp688.000`;

export default function SmartEntry() {
  const { state, addStock, deductStock } = useApp();
  const [parsed, setParsed] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [hikePrice, setHikePrice] = useState({});

  const confirmParsed = () => {
    if (!parsed) return;
    if (parsed.action === "waste" || parsed.action === "keluar") {
      deductStock({ name: parsed.item, quantity: parsed.quantity, unit: parsed.unit, reason: parsed.reason || (parsed.action === "waste" ? "Spill/Tumpah Dapur" : "Pemakaian") });
    } else {
      addStock({ name: parsed.item, quantity: parsed.quantity, unit: parsed.unit, expiry: parsed.expiry, supplier: parsed.supplier, priceDisplay: parsed.price });
    }
    toast.success("Inventaris diperbarui!", { description: `${parsed.item} · ${parsed.quantity} ${parsed.unit}` });
    setParsed(null);
  };

  const readReceipt = async () => {
    setReceiptLoading(true);
    try {
      const data = await parseReceipt({ text: SAMPLE_RECEIPT });
      setReceipt(data);
      toast.success("Nota berhasil dibaca AI!");
    } catch (e) {
      toast.error("Gagal membaca nota", { description: e?.response?.data?.detail || e.message });
    } finally {
      setReceiptLoading(false);
    }
  };

  const uploadReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const b64 = String(reader.result).split(",")[1];
        try {
          const data = await parseReceipt({ image_base64: b64 });
          setReceipt(data);
          toast.success("Foto nota berhasil di-OCR AI!");
        } catch (err) {
          toast.error("Gagal OCR nota", { description: err?.response?.data?.detail || err.message });
        } finally {
          setReceiptLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setReceiptLoading(false);
    }
  };

  const importReceiptItems = () => {
    (receipt.items || []).forEach((it) => {
      addStock({ name: it.name, quantity: it.quantity, unit: it.unit, supplier: receipt.supplier, priceDisplay: it.price });
    });
    toast.success(`${receipt.items?.length || 0} item dari nota masuk ke inventaris`);
    setReceipt(null);
  };

  // HPP recalculator preview
  const recalc = state.recipes.map((r) => {
    const base = computeHPP(r, state.inventory);
    const hikedInv = state.inventory.map((b) => hikePrice[b.name] ? { ...b, pricePerBase: b.pricePerBase * (1 + hikePrice[b.name] / 100) } : b);
    const neu = computeHPP(r, hikedInv);
    return { name: r.name, sellPrice: r.sellPrice, base, neu };
  });

  const ingredientNames = [...new Set(state.inventory.map((b) => b.name))];

  return (
    <div className="space-y-6" data-testid="smart-entry-page">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Smart Entry & HPP Calculator</h1>
        <p className="text-muted-foreground text-sm mt-1">Input suara dapur, scan nota AI, dan hitung ulang HPP otomatis.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Voice */}
        <div className="space-y-6">
          <VoiceInput onParsed={setParsed} />

          {parsed && (
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 fade-up" data-testid="parsed-result">
              <p className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 mb-3">Hasil Parsing AI</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Aksi" value={parsed.action} />
                <Field label="Bahan" value={parsed.item} />
                <Field label="Jumlah" value={`${parsed.quantity ?? "-"} ${parsed.unit ?? ""}`} />
                <Field label="Expired" value={parsed.expiry || "-"} />
                <Field label="Supplier" value={parsed.supplier || "-"} />
                <Field label="Alasan" value={parsed.reason || "-"} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={confirmParsed} size="sm" data-testid="confirm-parsed-btn" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Check className="h-4 w-4" /> Terapkan ke Inventaris
                </Button>
                <Button onClick={() => setParsed(null)} size="sm" variant="outline" data-testid="discard-parsed-btn" className="gap-1.5">
                  <X className="h-4 w-4" /> Batal
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Receipt OCR */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6" data-testid="receipt-ocr">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 grid place-items-center text-sky-500"><ScanLine className="h-4.5 w-4.5" /></div>
            <h3 className="text-lg font-bold">Scan Nota AI (OCR)</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Unggah foto nota supplier atau pakai sampel untuk uji instan.</p>

          <div className="flex flex-col gap-3">
            <label className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center cursor-pointer hover:border-sky-400 transition-all" data-testid="receipt-dropzone">
              <input type="file" accept="image/*" className="hidden" onChange={uploadReceipt} data-testid="receipt-file-input" />
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Klik untuk unggah foto nota</p>
              <p className="text-xs text-muted-foreground">JPG / PNG</p>
            </label>
            <Button onClick={readReceipt} disabled={receiptLoading} variant="outline" data-testid="sample-receipt-btn" className="gap-2">
              {receiptLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />} Gunakan Sample Nota Supplier
            </Button>
          </div>

          {receipt && (
            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 fade-up" data-testid="receipt-result">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{receipt.supplier}</p>
                <span className="text-xs text-muted-foreground">{receipt.date}</span>
              </div>
              <div className="space-y-1.5">
                {(receipt.items || []).map((it, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <span>{it.name} · {it.quantity} {it.unit}</span>
                    <span className="font-mono">{rupiah(it.price)}</span>
                  </div>
                ))}
              </div>
              {receipt.total != null && <p className="mt-2 text-right font-bold">Total: {rupiah(receipt.total)}</p>}
              <Button onClick={importReceiptItems} size="sm" data-testid="import-receipt-btn" className="mt-3 gap-1.5 bg-sky-500 hover:bg-sky-600 text-white">
                <ArrowRight className="h-4 w-4" /> Masukkan ke Inventaris
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* HPP Recalculator */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6" data-testid="hpp-recalculator">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 grid place-items-center text-emerald-500"><Calculator className="h-4.5 w-4.5" /></div>
          <h3 className="text-lg font-bold">Dynamic HPP Auto-Recalculator</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">Ubah harga bahan (dalam %) untuk melihat perbandingan HPP Lama vs HPP Baru secara real-time.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {ingredientNames.map((n) => (
            <div key={n}>
              <Label className="text-xs">{n} (+%)</Label>
              <Input type="number" min="0" value={hikePrice[n] || ""} placeholder="0"
                data-testid={`hpp-hike-${n.replace(/\s+/g, "-").toLowerCase()}`}
                onChange={(e) => setHikePrice((p) => ({ ...p, [n]: Number(e.target.value) }))} className="mt-1" />
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {recalc.map((r) => {
            const changed = Math.round(r.neu.hpp) !== Math.round(r.base.hpp);
            return (
              <div key={r.name} className={`rounded-xl border p-4 ${changed ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20" : "border-slate-200 dark:border-slate-800"}`} data-testid={`hpp-card-${r.name.replace(/\s+/g, "-").toLowerCase()}`}>
                <p className="font-semibold">{r.name}</p>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">HPP Lama</p>
                    <p className="font-mono font-semibold">{rupiah(r.base.hpp)}</p>
                    <p className="text-xs text-emerald-500">margin {pct(r.base.margin)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">HPP Baru</p>
                    <p className={`font-mono font-semibold ${changed ? "text-amber-600 dark:text-amber-400" : ""}`}>{rupiah(r.neu.hpp)}</p>
                    <p className={`text-xs ${r.neu.margin < 50 ? "text-rose-500" : "text-emerald-500"}`}>margin {pct(r.neu.margin)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-semibold capitalize">{value ?? "-"}</p>
  </div>
);
