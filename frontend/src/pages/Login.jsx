import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Zap, LogIn, ArrowLeft, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";

const DEMO_EMAIL = "admin@bahanpas.ai";
const DEMO_PASS = "bahanpas321";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const authenticate = () => {
    localStorage.setItem("bahanpas_auth", "1");
    toast.success("Berhasil masuk!", { description: "Selamat datang di BahanPas AI." });
    navigate("/dashboard");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email.trim() === DEMO_EMAIL && password === DEMO_PASS) {
      authenticate();
    } else {
      toast.error("Email atau password salah", { description: "Gunakan kartu kredensial demo di samping." });
    }
  };

  const bypass = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    authenticate();
  };

  const copyCred = () => {
    navigator.clipboard.writeText(`${DEMO_EMAIL} / ${DEMO_PASS}`);
    toast.success("Kredensial disalin");
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative"><Brand /></div>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">Dapur cerdas dimulai dari sini.</h2>
          <p className="mt-4 text-emerald-50 max-w-md">Kelola stok FIFO, hitung HPP real-time, dan belanja otomatis — semua dalam satu dashboard.</p>
          <div className="mt-8 space-y-3">
            {["Input suara dapur bertenaga AI", "Simulator margin & kenaikan harga", "Draft order WhatsApp otomatis"].map((x) => (
              <div key={x} className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> <span>{x}</span></div>
            ))}
          </div>
        </div>
        <div className="relative text-sm text-emerald-100">© 2026 BahanPas AI</div>
      </div>

      {/* Right form */}
      <div className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} data-testid="back-home-btn" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Beranda
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex-1 grid place-items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
            <div className="lg:hidden mb-6"><Brand /></div>
            <h1 className="text-3xl font-extrabold tracking-tight">Masuk Dashboard</h1>
            <p className="mt-2 text-muted-foreground text-sm">Gunakan kredensial demo untuk mencoba semua fitur.</p>

            {/* Demo credentials card */}
            <div className="mt-6 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4" data-testid="demo-credentials-card">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400">Kredensial Demo</p>
                <button onClick={copyCred} data-testid="copy-cred-btn" className="text-emerald-600 dark:text-emerald-400 hover:opacity-70"><Copy className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 font-mono text-sm space-y-0.5">
                <p>Email: <span className="font-semibold">{DEMO_EMAIL}</span></p>
                <p>Password: <span className="font-semibold">{DEMO_PASS}</span></p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email-input" placeholder={DEMO_EMAIL} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password-input" placeholder="••••••••" className="mt-1.5" />
              </div>
              <Button type="submit" data-testid="login-submit-btn" className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                <LogIn className="h-4 w-4" /> Masuk
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> ATAU <span className="h-px flex-1 bg-border" />
            </div>

            <Button onClick={bypass} variant="outline" data-testid="bypass-login-btn"
              className="w-full h-11 gap-2 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40">
              <Zap className="h-4 w-4" /> Bypass / Quick Login
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
