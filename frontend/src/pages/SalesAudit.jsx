import { useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, Upload, ClipboardCheck, ScrollText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { AUDIT_REASONS } from "@/data/seed";
import { totalBase } from "@/lib/inventory";
import { toBase, formatBase } from "@/lib/units";
import { rupiah } from "@/lib/format";

export default function SalesAudit() {
  const { state, recordSale, deductStock } = useApp();
  const [counts, setCounts] = useState({});
  const [opname, setOpname] = useState({ ingredient: "", physical: "" });
  const [waste, setWaste] = useState({ ingredient: "", qty: "", unit: "", reason: AUDIT_REASONS[0] });

  const setCount = (menu, d) => setCounts((p) => ({ ...p, [menu]: Math.max(0, (p[menu] || 0) + d) }));

  const submitSales = () => {
    const entries = Object.entries(counts).filter(([, c]) => c > 0);
    if (!entries.length) { toast.error("Belum ada menu dipilih"); return; }
    entries.forEach(([menu, c]) => recordSale(menu, c));
    toast.success("Penjualan tercatat!", { description: `${entries.reduce((s, [, c]) => s + c, 0)} porsi terjual, stok dipotong FIFO.` });
    setCounts({});
  };

  const importCsv = () => {
    // Simulated Moka/Majoo CSV sync
    recordSale("Kopi Susu Aren", 24);
    recordSale("Vanilla Latte", 11);
    toast.success("CSV kasir diimpor!", { description: "35 transaksi dari Moka/Majoo tersinkron & stok dipotong." });
  };

  const ingredientNames = [...new Set(state.inventory.map((b) => b.name))];

  const opnameCalc = () => {
    if (!opname.ingredient || opname.physical === "") return null;
    const b = state.inventory.find((x) => x.name === opname.ingredient);
    if (!b) return null;
    const sysBase = totalBase(state.inventory, opname.ingredient);
    const physBase = toBase(Number(opname.physical), b.displayUnit);
    const diffBase = physBase - sysBase;
    const diffRp = diffBase * b.pricePerBase;
    return { sysBase, physBase, diffBase, diffRp, unit: b.displayUnit };
  };
  const oc = opnameCalc();

  const submitOpname = () => {
    if (!oc) { toast.error("Lengkapi data opname"); return; }
    deductStock({ name: opname.ingredient, quantity: Math.abs(oc.diffBase) / (toBase(1, oc.unit)), unit: oc.unit, reason: "Koreksi Opname" });
    toast.success("Opname tercatat di Audit Trail", { description: `Selisih ${formatBase(Math.abs(oc.diffBase), oc.unit)} · ${rupiah(Math.abs(oc.diffRp))}` });
    setOpname({ ingredient: "", physical: "" });
  };

  const submitWaste = () => {
    if (!waste.ingredient || !waste.qty || !waste.unit) { toast.error("Lengkapi data waste"); return; }
    deductStock({ name: waste.ingredient, quantity: Number(waste.qty), unit: waste.unit, reason: waste.reason });
    toast.success("Waste tercatat!", { description: `${waste.qty} ${waste.unit} ${waste.ingredient} — ${waste.reason}` });
    setWaste({ ingredient: "", qty: "", unit: "", reason: AUDIT_REASONS[0] });
  };

  const totalRevenue = state.sales.reduce((s, x) => s + x.revenue, 0);

  return (
    <div className="space-y-6" data-testid="sales-audit-page">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Penjualan, Opname & Audit</h1>
        <p className="text-muted-foreground text-sm mt-1">Input penjualan, stok opname kilat, dan log waste dengan jejak audit.</p>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList data-testid="sales-audit-tabs">
          <TabsTrigger value="sales" data-testid="tab-sales">Penjualan</TabsTrigger>
          <TabsTrigger value="opname" data-testid="tab-opname">Stok Opname</TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">Audit & Waste</TabsTrigger>
        </TabsList>

        {/* SALES */}
        <TabsContent value="sales" className="mt-5 space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Input Penjualan Menu</h3>
                <Button onClick={importCsv} variant="outline" size="sm" data-testid="import-csv-btn" className="gap-2">
                  <Upload className="h-4 w-4" /> Import CSV Penjualan Kasir
                </Button>
              </div>
              <div className="space-y-3">
                {state.recipes.map((r) => (
                  <div key={r.name} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3.5" data-testid={`sale-menu-${r.name.replace(/\s+/g, "-").toLowerCase()}`}>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{rupiah(r.sellPrice)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="icon" variant="outline" onClick={() => setCount(r.name, -1)} data-testid={`sale-minus-${r.name.replace(/\s+/g, "-").toLowerCase()}`} className="h-8 w-8"><Minus className="h-4 w-4" /></Button>
                      <span className="font-mono font-bold w-8 text-center" data-testid={`sale-count-${r.name.replace(/\s+/g, "-").toLowerCase()}`}>{counts[r.name] || 0}</span>
                      <Button size="icon" onClick={() => setCount(r.name, 1)} data-testid={`sale-plus-${r.name.replace(/\s+/g, "-").toLowerCase()}`} className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 text-white"><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={submitSales} data-testid="submit-sales-btn" className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white">Catat Penjualan</Button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6">
              <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-emerald-500" /><h3 className="text-lg font-bold">Ringkasan</h3></div>
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
              <p className="text-3xl font-extrabold text-emerald-500" data-testid="total-revenue">{rupiah(totalRevenue)}</p>
              <p className="mt-4 text-sm text-muted-foreground">Total Porsi</p>
              <p className="text-2xl font-bold">{state.sales.reduce((s, x) => s + x.count, 0)}</p>
              <div className="mt-4 max-h-48 overflow-auto space-y-1.5">
                {state.sales.slice(-8).reverse().map((s) => (
                  <div key={s.id} className="flex justify-between text-sm border-b border-slate-200 dark:border-slate-800 pb-1"><span>{s.count}× {s.menu}</span><span className="font-mono">{rupiah(s.revenue)}</span></div>
                ))}
                {!state.sales.length && <p className="text-sm text-muted-foreground">Belum ada penjualan.</p>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* OPNAME */}
        <TabsContent value="opname" className="mt-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6 max-w-2xl">
            <div className="flex items-center gap-2 mb-4"><ClipboardCheck className="h-5 w-5 text-violet-500" /><h3 className="text-lg font-bold">Quick Stock Take (Opname)</h3></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Bahan</Label>
                <Select value={opname.ingredient} onValueChange={(v) => setOpname((p) => ({ ...p, ingredient: v }))}>
                  <SelectTrigger data-testid="opname-ingredient" className="mt-1.5"><SelectValue placeholder="Pilih bahan" /></SelectTrigger>
                  <SelectContent>{ingredientNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hitung Fisik ({opname.ingredient ? state.inventory.find((x) => x.name === opname.ingredient)?.displayUnit : "unit"})</Label>
                <Input type="number" value={opname.physical} onChange={(e) => setOpname((p) => ({ ...p, physical: e.target.value }))} data-testid="opname-physical" placeholder="0" className="mt-1.5" />
              </div>
            </div>
            {oc && (
              <div className="mt-5 grid grid-cols-3 gap-3 text-center" data-testid="opname-variance">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3"><p className="text-xs text-muted-foreground">Stok Sistem</p><p className="font-bold font-mono text-sm">{formatBase(oc.sysBase, oc.unit)}</p></div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3"><p className="text-xs text-muted-foreground">Fisik</p><p className="font-bold font-mono text-sm">{formatBase(oc.physBase, oc.unit)}</p></div>
                <div className={`rounded-xl p-3 ${oc.diffBase < 0 ? "bg-rose-50 dark:bg-rose-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"}`}>
                  <p className="text-xs text-muted-foreground">Selisih</p>
                  <p className={`font-bold font-mono text-sm ${oc.diffBase < 0 ? "text-rose-500" : "text-emerald-500"}`}>{formatBase(oc.diffBase, oc.unit)}</p>
                  <p className={`text-xs ${oc.diffBase < 0 ? "text-rose-500" : "text-emerald-500"}`}>{rupiah(oc.diffRp)}</p>
                </div>
              </div>
            )}
            <Button onClick={submitOpname} data-testid="submit-opname-btn" className="mt-5 bg-violet-500 hover:bg-violet-600 text-white">Simpan Koreksi Opname</Button>
          </div>
        </TabsContent>

        {/* AUDIT */}
        <TabsContent value="audit" className="mt-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6 max-w-3xl">
            <h3 className="text-lg font-bold mb-4">Catat Waste / Pengurangan Manual</h3>
            <div className="grid sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Label>Bahan</Label>
                <Select value={waste.ingredient} onValueChange={(v) => setWaste((p) => ({ ...p, ingredient: v, unit: state.inventory.find((x) => x.name === v)?.displayUnit || "" }))}>
                  <SelectTrigger data-testid="waste-ingredient" className="mt-1.5"><SelectValue placeholder="Pilih bahan" /></SelectTrigger>
                  <SelectContent>{ingredientNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Jumlah</Label>
                <Input type="number" value={waste.qty} onChange={(e) => setWaste((p) => ({ ...p, qty: e.target.value }))} data-testid="waste-qty" placeholder="0" className="mt-1.5" />
              </div>
              <div>
                <Label>Unit</Label>
                <Input value={waste.unit} onChange={(e) => setWaste((p) => ({ ...p, unit: e.target.value }))} data-testid="waste-unit" placeholder="kg/liter" className="mt-1.5" />
              </div>
            </div>
            <div className="mt-3">
              <Label>Alasan (wajib)</Label>
              <Select value={waste.reason} onValueChange={(v) => setWaste((p) => ({ ...p, reason: v }))}>
                <SelectTrigger data-testid="waste-reason" className="mt-1.5 sm:max-w-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{AUDIT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={submitWaste} data-testid="submit-waste-btn" className="mt-4 bg-rose-500 hover:bg-rose-600 text-white">Catat Waste</Button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] overflow-hidden" data-testid="audit-trail">
            <div className="p-6 pb-3 flex items-center gap-2"><ScrollText className="h-5 w-5 text-muted-foreground" /><h3 className="text-lg font-bold">Audit Trail & Waste Log</h3></div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Waktu</TableHead><TableHead>User</TableHead><TableHead>Aksi</TableHead>
                    <TableHead>Bahan</TableHead><TableHead>Detail</TableHead><TableHead>Alasan</TableHead><TableHead className="text-right">Kerugian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.audit.map((a) => (
                    <TableRow key={a.id} data-testid={`audit-row-${a.id}`}>
                      <TableCell className="text-sm whitespace-nowrap">{new Date(a.time).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</TableCell>
                      <TableCell className="text-sm">{a.user}</TableCell>
                      <TableCell className="text-sm">{a.action}</TableCell>
                      <TableCell className="text-sm font-medium">{a.item}</TableCell>
                      <TableCell className="text-sm">{a.detail}</TableCell>
                      <TableCell><span className="text-xs px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300">{a.reason}</span></TableCell>
                      <TableCell className="text-right font-mono text-sm text-rose-500">{rupiah(a.amount || 0)}</TableCell>
                    </TableRow>
                  ))}
                  {!state.audit.length && <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Belum ada log audit.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
