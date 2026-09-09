import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, TrendingDown, Lightbulb } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { useApp } from "@/context/AppContext";
import { computeHPP } from "@/lib/inventory";
import { rupiah, pct } from "@/lib/format";
import { marginAdvice } from "@/lib/api";

export const MarginSimulator = () => {
  const { state } = useApp();
  const [hike, setHike] = useState(0);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => {
    return state.recipes.map((r) => {
      const base = computeHPP(r, state.inventory, 0);
      const hiked = computeHPP(r, state.inventory, hike);
      return {
        name: r.name,
        sellPrice: r.sellPrice,
        baseHpp: base.hpp,
        newHpp: hiked.hpp,
        baseMargin: base.margin,
        newMargin: hiked.margin,
        impacted: hike > 0 && hiked.margin < base.margin - 3,
      };
    });
  }, [state.recipes, state.inventory, hike]);

  const chartData = rows.map((r) => ({ name: r.name.split(" ").slice(0, 2).join(" "), "HPP Lama": Math.round(r.baseHpp), "HPP Baru": Math.round(r.newHpp) }));

  const getAdvice = async () => {
    setLoading(true);
    try {
      const payload = rows.map((r) => ({
        menu: r.name, harga_jual: r.sellPrice,
        hpp_lama: Math.round(r.baseHpp), hpp_baru: Math.round(r.newHpp),
        margin_lama: +r.baseMargin.toFixed(1), margin_baru: +r.newMargin.toFixed(1),
      }));
      const res = await marginAdvice(hike, payload);
      setAdvice(res);
      toast.success("Saran AI siap!");
    } catch (e) {
      toast.error("Gagal mengambil saran AI", { description: e?.response?.data?.detail || e.message });
    } finally {
      setLoading(false);
    }
  };

  const TONE = {
    aman: { border: "border-emerald-200 dark:border-emerald-900", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "text-emerald-500", dot: "bg-emerald-500" },
    waspada: { border: "border-amber-200 dark:border-amber-900", bg: "bg-amber-50 dark:bg-amber-950/30", icon: "text-amber-500", dot: "bg-amber-500" },
    bahaya: { border: "border-rose-200 dark:border-rose-900", bg: "bg-rose-50 dark:bg-rose-950/30", icon: "text-rose-500", dot: "bg-rose-500" },
  };
  const tone = TONE[advice?.tone] || TONE.aman;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6" data-testid="margin-simulator">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 grid place-items-center text-amber-500"><TrendingDown className="h-4.5 w-4.5" /></div>
        <h3 className="text-lg font-bold">AI Margin & Price Hike Simulator</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Geser slider untuk simulasi kenaikan harga bahan baku — HPP & margin dihitung ulang seketika.</p>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Simulasi Kenaikan Harga Bahan Baku</span>
          <span className="font-mono text-xl font-bold text-amber-500" data-testid="hike-value">+{hike}%</span>
        </div>
        <Slider value={[hike]} onValueChange={(v) => setHike(v[0])} max={50} step={1} data-testid="hike-slider" className="[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-500 [&>span>span]:bg-amber-500" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>0%</span><span>25%</span><span>50%</span></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Menu impact table */}
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.name} data-testid={`sim-menu-${r.name.replace(/\s+/g, "-").toLowerCase()}`}
              className={`rounded-xl border p-4 transition-all ${r.impacted ? "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30" : "border-slate-200 dark:border-slate-800"}`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{r.name}</p>
                {r.impacted && <span className="text-xs font-bold text-rose-500 flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" /> Terdampak</span>}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">HPP</p>
                  <p className="font-mono">{rupiah(r.baseHpp)} → <span className={r.impacted ? "text-rose-500 font-semibold" : "font-semibold"}>{rupiah(r.newHpp)}</span></p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Margin</p>
                  <p className="font-mono">{pct(r.baseMargin)} → <span className={r.newMargin < 50 ? "text-rose-500 font-semibold" : "text-emerald-500 font-semibold"}>{pct(r.newMargin)}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[220px]" style={{ minHeight: 220 }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <BarChart data={chartData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
              <Tooltip formatter={(v) => rupiah(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="HPP Lama" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="HPP Baru" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI recommendation box */}
      <div className="mt-6">
        <Button onClick={getAdvice} disabled={loading} data-testid="get-ai-advice-btn" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Menganalisis..." : "Minta Saran AI"}
        </Button>

        {advice && (
          <div data-testid="ai-recommendation-box"
            className={`mt-4 rounded-xl border p-4 fade-up ${tone.border} ${tone.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className={`h-4.5 w-4.5 ${tone.icon}`} />
              <p className="font-semibold text-sm">Saran AI</p>
            </div>
            <p className="text-sm font-medium">{advice.headline}</p>
            <ul className="mt-2 space-y-1.5">
              {(advice.recommendations || []).map((rec, i) => (
                <li key={i} className="text-sm flex gap-2"><span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${tone.dot} shrink-0`} />{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
