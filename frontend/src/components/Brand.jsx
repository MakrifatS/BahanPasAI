import { Leaf } from "lucide-react";

export const Brand = ({ compact }) => (
  <div className="flex items-center gap-2.5" data-testid="brand-logo">
    <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 grid place-items-center shadow-lg shadow-emerald-500/25">
      <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} />
      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900" />
    </div>
    {!compact && (
      <div className="leading-none">
        <p className="font-extrabold text-lg tracking-tight">
          BahanPas<span className="text-emerald-500"> AI</span>
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">UMKM Kuliner Edition</p>
      </div>
    )}
  </div>
);
