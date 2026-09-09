import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseVoice } from "@/lib/api";

const SAMPLES = [
  "Masuk susu Diamond 5 karton dari Supplier Jaya expired 20 Oktober",
  "Catat susu tumpah 1 liter karena bocor di dapur",
  "Tambah 3 kg biji kopi arabika dari Toko Jaya harga 150000 expired 30 hari lagi",
];

export const VoiceInput = ({ onParsed }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = "id-ID";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setTranscript(text);
    };
    rec.onerror = (e) => {
      setListening(false);
      toast.error("Mikrofon bermasalah", { description: "Gunakan tombol sampel teks di bawah untuk menguji AI." });
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  const toggleMic = () => {
    if (!supported) {
      toast.error("Browser tidak mendukung input suara", { description: "Pakai tombol sampel teks di bawah." });
      return;
    }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
    } else {
      setTranscript("");
      try {
        recRef.current?.start();
        setListening(true);
      } catch (e) {
        toast.error("Tidak bisa mengakses mikrofon");
      }
    }
  };

  const process = async (text) => {
    const t = (text || transcript).trim();
    if (!t) { toast.error("Tidak ada teks untuk diproses"); return; }
    setTranscript(t);
    setLoading(true);
    try {
      const data = await parseVoice(t);
      onParsed(data);
      toast.success("AI berhasil memproses suara dapur!", { description: `${data.action?.toUpperCase()} · ${data.item}` });
    } catch (e) {
      toast.error("Gagal memproses", { description: e?.response?.data?.detail || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-6" data-testid="voice-input">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🎙️</span>
        <h3 className="text-lg font-bold">Input Suara Dapur</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Tekan mikrofon lalu ucapkan aktivitas stok, atau klik sampel teks bila mikrofon terblokir.</p>

      <div className="flex flex-col items-center gap-4">
        <button onClick={toggleMic} data-testid="mic-button"
          className={`h-20 w-20 rounded-full grid place-items-center transition-all ${listening ? "bg-rose-500 mic-pulse" : "bg-emerald-500 hover:bg-emerald-600"} text-white shadow-lg`}>
          {listening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
        </button>
        <p className="text-sm font-medium">{listening ? "Mendengarkan... ucapkan sekarang" : "Klik untuk mulai bicara"}</p>
      </div>

      {transcript && (
        <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4" data-testid="transcript-box">
          <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-1">Transkrip</p>
          <p className="text-sm">{transcript}</p>
          <Button onClick={() => process()} disabled={loading} size="sm" data-testid="process-transcript-btn"
            className="mt-3 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Proses dengan AI
          </Button>
        </div>
      )}

      <div className="mt-5">
        <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-2">Sampel Teks (1-Klik Uji AI)</p>
        <div className="space-y-2">
          {SAMPLES.map((s, i) => (
            <button key={i} onClick={() => process(s)} disabled={loading} data-testid={`voice-sample-${i}`}
              className="w-full text-left text-sm rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all disabled:opacity-50">
              "{s}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
