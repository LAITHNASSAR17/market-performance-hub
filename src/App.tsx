
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
import Homepage from "./pages/Homepage";
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
import TradingChart from "./pages/TradingChart";
import TradeTracking from "./pages/TradeTracking";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import UserProfileSettings from "./pages/UserProfileSettings";
import Subscriptions from "./pages/Subscriptions";

// Admin Components
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTrades from "./pages/admin/AdminTrades";
import AdminHashtags from "./pages/admin/AdminHashtags";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfileSettings from "./pages/admin/AdminProfileSettings";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminPages from "./pages/admin/AdminPages";
import AdminLayout from "./components/layouts/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <TradeProvider>
              <NotebookProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* User Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Homepage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/add-trade" element={<AddTrade />} />
                    <Route path="/trades" element={<Trades />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/notebook" element={<Notebook />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/chart" element={<TradingChart />} />
                    <Route path="/tracking/:id" element={<TradeTracking />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<UserProfileSettings />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    
                    {/* Admin Routes - Completely Separate */}
                    <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                    <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
                    <Route path="/admin/trades" element={<AdminLayout><AdminTrades /></AdminLayout>} />
                    <Route path="/admin/hashtags" element={<AdminLayout><AdminHashtags /></AdminLayout>} />
                    <Route path="/admin/notes" element={<AdminLayout><AdminNotes /></AdminLayout>} />
                    <Route path="/admin/pages" element={<AdminLayout><AdminPages /></AdminLayout>} />
                    <Route path="/admin/subscriptions" element={<AdminLayout><AdminSubscriptions /></AdminLayout>} />
                    <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                    <Route path="/admin/profile" element={<AdminLayout><AdminProfileSettings /></AdminLayout>} />
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </NotebookProvider>
            </TradeProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
