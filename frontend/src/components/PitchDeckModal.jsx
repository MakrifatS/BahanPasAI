import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Presentation, ChevronLeft, ChevronRight, AlertTriangle, Sparkles, TrendingUp, Globe2 } from "lucide-react";

const SLIDES = [
  {
    tag: "Masalah",
    icon: AlertTriangle,
    color: "text-rose-500",
    bg: "from-rose-500/10 to-transparent",
    title: "UMKM Kuliner Boncos Karena Stok & HPP Meleset",
    points: [
      "70% UMKM F&B tak tahu HPP asli per menu — margin bocor diam-diam.",
      "Bahan basi & FIFO berantakan: rugi rata-rata Rp 2–5 juta/bulan.",
      "Catat stok manual di kertas/WA, salah hitung takaran gram vs kg.",
      "Harga bahan naik mendadak, margin ambruk tanpa disadari.",
    ],
  },
  {
    tag: "Solusi",
    icon: Sparkles,
    color: "text-emerald-500",
    bg: "from-emerald-500/10 to-transparent",
    title: "BahanPas AI — Otak Dapur & Belanja Otomatis",
    points: [
      "Input suara dapur: ngomong, AI langsung catat stok terstruktur.",
      "Simulator HPP real-time: geser slider harga, margin langsung terlihat.",
      "FIFO batch radar: tahu batch mana dipakai duluan sebelum basi.",
      "AI reorder + draft WhatsApp ke supplier sekali klik.",
    ],
  },
  {
    tag: "Dampak Bisnis",
    icon: TrendingUp,
    color: "text-amber-500",
    bg: "from-amber-500/10 to-transparent",
    title: "Hemat Modal, Margin Terjaga, Waktu Kembali",
    points: [
      "Cegah waste hingga Rp 3,5 juta/bulan per outlet.",
      "Margin menu naik 8–15% lewat koreksi takaran & harga.",
      "Hemat 6 jam/minggu dari pencatatan manual.",
      "Keputusan belanja berbasis data, bukan feeling.",
    ],
  },
  {
    tag: "Ukuran Pasar",
    icon: Globe2,
    color: "text-sky-500",
    bg: "from-sky-500/10 to-transparent",
    title: "Pasar Raksasa: 64 Juta UMKM Indonesia",
    points: [
      "≈ 64 juta UMKM, kuliner porsi terbesar (~36%).",
      "Target awal: 4,7 juta warung & kafe modern.",
      "Model SaaS Rp 99rb–299rb/bulan/outlet.",
      "TAM > Rp 15 triliun/tahun, digitalisasi F&B baru dimulai.",
    ],
  },
];

export const PitchDeckModal = () => {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const Icon = s.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setI(0); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="pitch-deck-btn"
          className="gap-2 border-slate-200 dark:border-slate-700">
          <Presentation className="h-4 w-4" /> Pitch Deck 1-Menit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-slate-200 dark:border-slate-800" data-testid="pitch-deck-modal">
        <div className={`relative bg-gradient-to-br ${s.bg} p-8 sm:p-10 min-h-[420px] flex flex-col`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`h-11 w-11 rounded-xl grid place-items-center bg-white dark:bg-slate-900 shadow-sm ${s.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Slide {i + 1}/4</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.tag}</p>
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 leading-tight">{s.title}</h3>
          <ul className="space-y-3 flex-1">
            {s.points.map((p, idx) => (
              <li key={idx} className="flex gap-3 text-sm sm:text-base">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${s.color.replace("text", "bg")}`} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5">
              {SLIDES.map((_, idx) => (
                <button key={idx} onClick={() => setI(idx)}
                  data-testid={`pitch-dot-${idx}`}
                  className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-emerald-500" : "w-2 bg-slate-300 dark:bg-slate-700"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled={i === 0} onClick={() => setI((x) => x - 1)} data-testid="pitch-prev">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" disabled={i === SLIDES.length - 1} onClick={() => setI((x) => x + 1)} data-testid="pitch-next"
                className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
