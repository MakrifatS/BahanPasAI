import { toast } from "sonner";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { useApp } from "@/context/AppContext";
import { statusOf, daysUntil, fifoBatch } from "@/lib/inventory";
import { formatBase } from "@/lib/units";
import { rupiah } from "@/lib/format";

export const FifoTable = () => {
  const { state } = useApp();

  const rows = [...state.inventory].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  const markUseFirst = (batch) => {
    toast.success(`Batch ${batch.batchNo} ${batch.name} ditandai prioritas pakai`, {
      description: "FIFO: gunakan batch ini sebelum yang lain untuk cegah waste.",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] overflow-hidden" data-testid="fifo-table">
      <div className="p-6 pb-3">
        <h3 className="text-lg font-bold">Radar Stok & FIFO Batch</h3>
        <p className="text-sm text-muted-foreground">Diurutkan berdasarkan tanggal kedaluwarsa terdekat.</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama Bahan</TableHead>
              <TableHead>Lot/Batch</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="hidden sm:table-cell">Batas Min</TableHead>
              <TableHead className="hidden md:table-cell">Tgl Expired</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">FIFO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => {
              const s = statusOf(b);
              const days = daysUntil(b.expiry);
              const low = b.baseQty <= b.minBase;
              const isFirst = fifoBatch(state.inventory, b.name)?.id === b.id;
              return (
                <TableRow key={b.id} data-testid={`fifo-row-${b.id}`} className={s === "red" ? "bg-rose-50/50 dark:bg-rose-950/20" : ""}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{b.batchNo}</TableCell>
                  <TableCell className={`font-mono ${low ? "text-rose-500 font-semibold" : ""}`}>{formatBase(b.baseQty, b.displayUnit)}</TableCell>
                  <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">{formatBase(b.minBase, b.displayUnit)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{b.expiry}</span>
                      <span className={`text-xs ${days <= 2 ? "text-rose-500" : days <= 5 ? "text-amber-500" : "text-muted-foreground"}`}>(H{days >= 0 ? "-" : "+"}{Math.abs(days)})</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={s} testid={`status-${b.id}`} /></TableCell>
                  <TableCell className="text-right">
                    {isFirst ? (
                      <Button size="sm" variant="outline" onClick={() => markUseFirst(b)} data-testid={`fifo-use-${b.id}`}
                        className="gap-1.5 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs h-8">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pakai Dulu
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
