import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppProvider } from "@/context/AppContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SmartEntry from "@/pages/SmartEntry";
import SalesAudit from "@/pages/SalesAudit";
import ReorderWA from "@/pages/ReorderWA";
import AppShell from "@/components/AppShell";

const isAuthed = () => localStorage.getItem("bahanpas_auth") === "1";

const Protected = ({ children }) =>
  isAuthed() ? children : <Navigate to="/login" replace />;

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <Protected>
                  <AppShell />
                </Protected>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/input" element={<SmartEntry />} />
              <Route path="/penjualan" element={<SalesAudit />} />
              <Route path="/order" element={<ReorderWA />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
