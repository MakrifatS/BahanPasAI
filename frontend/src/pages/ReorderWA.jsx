import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Send, Copy, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/context/AppContext";
import { statusOf, totalBase } from "@/lib/inventory";
import { formatBase } from "@/lib/units";
import { reorderAnalysis } from "@/lib/api";

const URGENCY = {
  tinggi: "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300",
  sedang: "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300",
  rendah: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300",
};

export default function ReorderWA() {
  const { state } = useApp();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [waText, setWaText] = useState("");

  useEffect(() => {
    if (state.waDraft && !waText) setWaText(state.waDraft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.waDraft]);

  const buildWaText = (orders) => {
    const sup = state.suppliers[0];
    const lines = orders.map((o, i) => `${i + 1}. ${o.item} — ${o.quantity} ${o.unit}`).join("\n");
    return `Halo ${sup?.name || "Supplier"} 🙏\n\nSaya mau order bahan untuk ${state.business}:\n\n${lines}\n\nMohon info ketersediaan & total harga ya. Terima kasih!\n\n— via BahanPas AI`;
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const inventory = [...new Set(state.inventory.map((b) => b.name))].map((n) => {
        const b = state.inventory.find((x) => x.name === n);
        return { nama: n, stok: formatBase(totalBase(state.inventory, n), b.displayUnit), status: statusOf(b), min: formatBase(b.minBase, b.displayUnit) };
      });
      const sales = state.sales.map((s) => ({ menu: s.menu, jumlah: s.count }));
      const res = await reorderAnalysis(inventory, sales);
      setResult(res);
      setWaText(buildWaText(res.orders || []));
      toast.success("Analisis AI selesai!");
    } catch (e) {
      toast.error("Gagal analisis", { description: e?.response?.data?.detail || e.message });
    } finally {
      setLoading(false);
    }
  };

  const sendWa = () => {
    const wa = state.suppliers[0]?.wa || "";
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(waText)}`, "_blank");
  };

  const copyText = () => {
    navigator.clipboard.writeText(waText);
    toast.success("Teks order disalin ke clipboard!");
  };

  return (
    <div className="space-y-6" data-testid="reorder-page">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Reorder Predictor & WA Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">Analisis laju pemakaian, prediksi stockout, dan buat order WhatsApp otomatis.</p>
      </div>

      <Button onClick={runAnalysis} disabled={loading} size="lg" data-testid="run-analysis-btn" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        {loading ? "Menganalisis..." : "Jalankan Analisis AI"}
      </Button>

      {!result && state.waDraft && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-6 fade-up" data-testid="demo-wa-draft">
          <div className="flex items-center gap-2 mb-1"><Send className="h-5 w-5 text-emerald-500" /><h3 className="text-lg font-bold">Draft WhatsApp dari Quick Demo</h3></div>
          <p className="text-sm text-muted-foreground mb-4">Rekomendasi restock otomatis ke {state.suppliers[0]?.name}. Edit bila perlu.</p>
          <Textarea value={waText} onChange={(e) => setWaText(e.target.value)} rows={9} data-testid="demo-wa-text" className="font-mono text-sm bg-white dark:bg-[#131C2E]" />
          <div className="mt-4 flex gap-2">
            <Button onClick={sendWa} data-testid="demo-send-wa-btn" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
              <Send className="h-4 w-4" /> Kirim via WhatsApp
            </Button>
            <Button onClick={copyText} variant="outline" data-testid="demo-copy-wa-btn" className="gap-2">
              <Copy className="h-4 w-4" /> Salin Teks
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="grid lg:grid-cols-2 gap-6 fade-up">
          {/* Insights + orders */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6" data-testid="ai-insights">
              <div className="flex items-center gap-2 mb-3"><AlertTriangle className="h-5 w-5 text-amber-500" /><h3 className="text-lg font-bold">Insight AI</h3></div>
              <ul className="space-y-2">
                {(result.insights || []).map((ins, i) => (
                  <li key={i} className="text-sm flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />{ins}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6" data-testid="reorder-list">
              <div className="flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-emerald-500" /><h3 className="text-lg font-bold">Rekomendasi Order</h3></div>
              <div className="space-y-2.5">
                {(result.orders || []).map((o, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3.5" data-testid={`order-item-${i}`}>
                    <div>
                      <p className="font-semibold text-sm">{o.item}</p>
                      <p className="text-xs text-muted-foreground">{o.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{o.quantity} {o.unit}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${URGENCY[o.urgency] || URGENCY.sedang}`}>{o.urgency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WA generator */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6 h-fit" data-testid="wa-generator">
            <div className="flex items-center gap-2 mb-1"><Send className="h-5 w-5 text-emerald-500" /><h3 className="text-lg font-bold">WhatsApp Order Generator</h3></div>
            <p className="text-sm text-muted-foreground mb-4">Ke {state.suppliers[0]?.name} · {state.suppliers[0]?.wa}</p>
            <Textarea value={waText} onChange={(e) => setWaText(e.target.value)} rows={12} data-testid="wa-text" className="font-mono text-sm" />
            <div className="mt-4 flex gap-2">
              <Button onClick={sendWa} data-testid="send-wa-btn" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white flex-1">
                <Send className="h-4 w-4" /> Kirim via WhatsApp
              </Button>
              <Button onClick={copyText} variant="outline" data-testid="copy-wa-btn" className="gap-2">
                <Copy className="h-4 w-4" /> Salin Teks
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
