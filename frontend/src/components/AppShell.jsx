import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { LayoutDashboard, Mic, ShoppingCart, Send, Zap, RotateCcw, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Brand } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PitchDeckModal } from "@/components/PitchDeckModal";
import { useApp } from "@/context/AppContext";
import { useQuickDemo } from "@/hooks/useQuickDemo";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/input", label: "Input & HPP", icon: Mic },
  { to: "/penjualan", label: "Penjualan & Audit", icon: ShoppingCart },
  { to: "/order", label: "AI Order WA", icon: Send },
];

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetDemo } = useApp();
  const { run, running } = useQuickDemo();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("bahanpas_auth");
    navigate("/");
  };

  const doReset = () => {
    resetDemo();
    toast.success("Data demo direset ke kondisi awal", { description: "Semua stok, penjualan & audit kembali fresh." });
    navigate("/dashboard");
  };

  const runDemo = () => {
    navigate("/dashboard");
    run();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/dashboard"><Brand /></Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((n) => {
                const active = location.pathname === n.to;
                return (
                  <Link key={n.to} to={n.to} data-testid={`nav-${n.to.slice(1)}`}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}>
                    <n.icon className="h-4 w-4" /> {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Button onClick={runDemo} disabled={running} size="sm" data-testid="quick-demo-btn"
                className="hidden sm:flex gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                <Zap className="h-4 w-4" /> {running ? "Berjalan..." : "Quick Demo"}
              </Button>
              <div className="hidden md:block"><PitchDeckModal /></div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" data-testid="reset-data-btn"
                    className="hidden md:flex border-slate-200 dark:border-slate-700" aria-label="Reset data">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-testid="reset-confirm-dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Data Demo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Semua stok, penjualan, dan log audit akan dikembalikan ke kondisi awal demo. Tindakan ini tidak bisa dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="reset-cancel">Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={doReset} data-testid="reset-confirm" className="bg-rose-500 hover:bg-rose-600">
                      Ya, Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={logout} data-testid="logout-btn" className="hidden md:flex" aria-label="Keluar">
                <LogOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen((o) => !o)} data-testid="mobile-menu-btn">
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1 bg-white dark:bg-slate-950">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMobileOpen(false)} data-testid={`mobile-nav-${n.to.slice(1)}`}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  location.pathname === n.to ? "bg-emerald-500 text-white" : "text-muted-foreground"
                }`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={() => { setMobileOpen(false); runDemo(); }} size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                <Zap className="h-4 w-4" /> Quick Demo
              </Button>
              <div><PitchDeckModal /></div>
              <Button variant="outline" size="sm" onClick={doReset} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2"><LogOut className="h-4 w-4" /> Keluar</Button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
