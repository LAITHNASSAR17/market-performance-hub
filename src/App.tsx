
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TradeProvider } from "@/contexts/TradeContext";
import { NotebookProvider } from "@/contexts/NotebookContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import Trades from "./pages/Trades";
import Journal from "./pages/Journal";
import Notebook from "./pages/Notebook";
import Reports from "./pages/Reports";
import Insights from "./pages/Insights";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import TradingChart from "./pages/TradingChart";
import TradeTracking from "./pages/TradeTracking";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <TradeProvider>
                <NotebookProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/add-trade" element={<AddTrade />} />
                    <Route path="/trades" element={<Trades />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/notebook" element={<Notebook />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/chart" element={<TradingChart />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/tracking/:id" element={<TradeTracking />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </NotebookProvider>
              </TradeProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
