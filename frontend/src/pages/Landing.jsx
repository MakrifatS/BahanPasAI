import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic, Calculator, ScanLine, Layers, ClipboardCheck, ArrowRight, Sparkles,
  Store, Coffee, IceCream2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brand } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PitchDeckModal } from "@/components/PitchDeckModal";

const FEATURES = [
  { icon: Mic, title: "Voice-to-Stock Dapur", desc: "Ngomong ke HP, AI langsung catat bahan masuk, keluar, & tumpah jadi data rapi.", color: "text-emerald-500", span: "md:col-span-2" },
  { icon: Calculator, title: "AI Margin & Price Simulator", desc: "Geser slider kenaikan harga bahan, margin tiap menu langsung terhitung ulang.", color: "text-amber-500", span: "" },
  { icon: ScanLine, title: "Scan Nota AI", desc: "Foto nota supplier, AI ekstrak item & harga otomatis.", color: "text-sky-500", span: "" },
  { icon: Layers, title: "FIFO Batch Tracking", desc: "Tahu persis batch mana harus dipakai duluan sebelum kedaluwarsa.", color: "text-rose-500", span: "" },
  { icon: ClipboardCheck, title: "Quick Stock Take & Waste Audit", desc: "Opname kilat, hitung selisih otomatis dalam unit & Rupiah.", color: "text-violet-500", span: "md:col-span-2" },
];

const STEPS = [
  { n: "01", t: "Input Cepat", d: "Suara, scan nota, atau import CSV kasir." },
  { n: "02", t: "Auto Batching FIFO", d: "Stok masuk otomatis dikelompokkan per batch & expiry." },
  { n: "03", t: "Margin Terjaga", d: "HPP & margin dihitung real-time saat harga berubah." },
  { n: "04", t: "Belanja Otomatis", d: "AI rekomendasi reorder + draft WhatsApp supplier." },
];

const TESTIMONIALS = [
  { icon: Coffee, name: "Mas Yudi", biz: "Warung Kopi Senja", quote: "Dulu sering rugi karena susu basi. Sekarang FIFO-nya jelas, waste turun drastis." },
  { icon: Store, name: "Bu Ratih", biz: "Resto Bebek Goreng", quote: "Simulator HPP-nya juara. Pas harga cabai naik, langsung tau harus ubah porsi." },
  { icon: IceCream2, name: "Koh Aan", biz: "Cafe Gelato Nusantara", quote: "Input suara pas lagi sibuk di dapur — hemat waktu banget, gak perlu nyatet manual." },
];

const FAQS = [
  { q: "Apakah cocok untuk warung kecil?", a: "Sangat cocok. BahanPas AI dirancang khusus untuk UMKM kuliner — dari warung kopi, resto, hingga katering. Tanpa perlu perangkat mahal." },
  { q: "Data saya aman?", a: "Semua data demo tersimpan di perangkat Anda. Versi produksi menggunakan enkripsi dan penyimpanan cloud yang aman." },
  { q: "Perlu belajar akuntansi dulu?", a: "Tidak. Cukup input bahan lewat suara atau foto nota, sisanya AI yang hitung HPP, margin, dan rekomendasi belanja." },
  { q: "Bisa integrasi dengan kasir Moka/Majoo?", a: "Ya, Anda bisa import CSV penjualan dari kasir populer untuk sinkron pemakaian bahan otomatis." },
];

export default function Landing() {
  const navigate = useNavigate();
  const go = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><PitchDeckModal /></div>
            <ThemeToggle />
            <Button onClick={go} size="sm" data-testid="landing-login-btn" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
              Masuk Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-6">
              <Sparkles className="h-3.5 w-3.5" /> AI-Native untuk UMKM Kuliner
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Kelola Stok <span className="text-emerald-500">FIFO</span>, Input Suara Dapur, & Hitung <span className="text-amber-500">HPP</span> F&B Tanpa Meleset
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl">
              Solusi Stok FIFO, Voice Input Dapur, Simulator HPP, & Belanja Otomatis untuk warung, kafe, dan resto Anda.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={go} size="lg" data-testid="hero-demo-btn" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-12 px-6 text-base">
                Mulai Demo Gratis <ArrowRight className="h-5 w-5" />
              </Button>
              <Button onClick={go} size="lg" variant="outline" data-testid="hero-dashboard-btn" className="h-12 px-6 text-base border-slate-300 dark:border-slate-700">
                Masuk Dashboard
              </Button>
            </div>
            <div className="mt-10 flex gap-8">
              {[["Rp 3,5jt", "Waste dicegah/bln"], ["+12%", "Margin naik"], ["6 jam", "Hemat/minggu"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl shadow-emerald-500/10">
            <img src="https://images.pexels.com/photos/6213723/pexels-photo-6213723.jpeg" alt="Dapur F&B" className="w-full h-[420px] object-cover" />
            <div className="absolute bottom-4 left-4 right-4 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-white/40 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500 grid place-items-center mic-pulse"><Mic className="h-5 w-5 text-white" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">"Masuk susu Diamond 5 karton..."</p>
                  <p className="text-xs text-muted-foreground">AI mencatat stok otomatis ✨</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">Fitur Andalan</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Semua yang Dapur Anda Butuhkan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className={`group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6 hover:shadow-lg hover:-translate-y-1 transition-all ${f.span}`}>
              <div className={`h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800/60 grid place-items-center mb-4 ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-14">
            <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">Cara Kerja</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">4 Langkah, Dapur Auto-Pilot</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 p-6">
                <span className="text-4xl font-extrabold text-emerald-500/20">{s.n}</span>
                <h3 className="mt-2 font-bold text-lg">{s.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
                {i < STEPS.length - 1 && <ArrowRight className="hidden lg:block absolute top-1/2 -right-3.5 h-5 w-5 text-emerald-400" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-14">
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">Kata Pemilik Usaha</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Dipercaya Pelaku Kuliner</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6">
              <div className="flex gap-1 text-amber-400 mb-4">{"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}</div>
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 grid place-items-center text-emerald-600 dark:text-emerald-400">
                  <t.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.biz}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="text-center mb-10">
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">FAQ</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Pertanyaan Umum</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3" data-testid="faq-accordion">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-slate-200 dark:border-slate-800 rounded-xl px-5 bg-white dark:bg-[#131C2E]">
              <AccordionTrigger className="text-left font-semibold hover:no-underline" data-testid={`faq-trigger-${i}`}>{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-10 sm:p-16 text-center text-white shadow-2xl shadow-emerald-500/25">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Siap Bikin Dapur Anda Auto-Pilot?</h2>
          <p className="mt-4 text-emerald-50 max-w-xl mx-auto">Coba semua fitur BahanPas AI sekarang. Gratis, tanpa install.</p>
          <Button onClick={go} size="lg" data-testid="cta-demo-btn" className="mt-8 h-12 px-8 bg-white text-emerald-600 hover:bg-emerald-50 gap-2 text-base">
            Mulai Demo Gratis <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-emerald-50">
            {["Tanpa kartu kredit", "Data tersimpan lokal", "Bahasa Indonesia penuh"].map((x) => (
              <span key={x} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {x}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Brand />
          <p className="text-sm text-muted-foreground">© 2026 BahanPas AI — Solusi Dapur Cerdas untuk UMKM Kuliner.</p>
        </div>
      </footer>
    </div>
  );
}
