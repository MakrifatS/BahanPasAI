import { useMemo } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, ShieldCheck, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { useApp } from "@/context/AppContext";
import { MarginSimulator } from "@/components/dashboard/MarginSimulator";
import { FifoTable } from "@/components/dashboard/FifoTable";
import { statusOf, computeHPP } from "@/lib/inventory";
import { rupiah, rupiahShort, pct } from "@/lib/format";

const KpiCard = ({ icon: Icon, label, value, sub, color, testid, delay }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    data-testid={testid}
    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <div className={`h-9 w-9 rounded-lg grid place-items-center ${color}`}><Icon className="h-4.5 w-4.5" /></div>
    </div>
    <p className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</p>
    {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
  </motion.div>
);

export default function Dashboard() {
  const { state } = useApp();

  const kpi = useMemo(() => {
    const names = new Set(state.inventory.map((b) => b.name));
    const totalValue = state.inventory.reduce((s, b) => s + b.pricePerBase * b.baseQty, 0);
    const critical = state.inventory.filter((b) => statusOf(b) === "red");
    const warning = state.inventory.filter((b) => statusOf(b) === "yellow");
    const prevented = critical.reduce((s, b) => s + b.pricePerBase * b.baseQty, 0) + state.audit.reduce((s, a) => s + (a.amount || 0), 0);
    const margins = state.recipes.map((r) => computeHPP(r, state.inventory).margin);
    const avgMargin = margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;
    return { totalItems: names.size, totalValue, critical: critical.length, warning: warning.length, prevented, avgMargin };
  }, [state.inventory, state.recipes, state.audit]);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard Utama</h1>
        <p className="text-muted-foreground text-sm mt-1">{state.business} · Radar FIFO, Simulator HPP & Widget Dampak</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard testid="kpi-total-bahan" delay={0} icon={Package} label="Total Bahan" value={kpi.totalItems}
          sub={`Nilai stok ${rupiah(kpi.totalValue)}`} color="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500" />
        <KpiCard testid="kpi-kritis" delay={0.05} icon={AlertTriangle} label="Stok Kritis & Expired" value={kpi.critical}
          sub={`+${kpi.warning} batch waspada`} color="bg-rose-100 dark:bg-rose-950/60 text-rose-500" />
        <KpiCard testid="kpi-prevented" delay={0.1} icon={ShieldCheck} label="Estimasi Kerugian Dicegah" value={rupiahShort(kpi.prevented)}
          sub="Dari FIFO & audit waste" color="bg-amber-100 dark:bg-amber-950/60 text-amber-500" />
        <KpiCard testid="kpi-margin" delay={0.15} icon={Percent} label="Rata-rata Margin" value={pct(kpi.avgMargin)}
          sub={`${state.recipes.length} menu aktif`} color="bg-sky-100 dark:bg-sky-950/60 text-sky-500" />
      </div>

      {/* Simulator */}
      <MarginSimulator />

      {/* Savings chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6" data-testid="savings-chart">
        <h3 className="text-lg font-bold">Proyeksi Hemat Modal & Waste Prevented</h3>
        <p className="text-sm text-muted-foreground mb-5">7 hari terakhir</p>
        <div className="h-[260px]" style={{ minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={240}>
            <BarChart data={state.savings} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="currentColor" className="text-muted-foreground" />
              <YAxis tickFormatter={(v) => rupiahShort(v)} tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
              <Tooltip formatter={(v) => rupiah(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar name="Hemat Modal" dataKey="hemat" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar name="Waste Dicegah" dataKey="waste" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FIFO table */}
      <FifoTable />
    </div>
  );
}
