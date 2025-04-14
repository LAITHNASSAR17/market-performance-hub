import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { TradeProvider } from "@/contexts/TradeContext";
import { NotebookProvider } from "@/contexts/NotebookContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PageTransition from "./components/PageTransition";

import Index from "./pages/Index";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
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

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* User Routes */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/" element={<PageTransition><Homepage /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/add-trade" element={<PageTransition><AddTrade /></PageTransition>} />
        <Route path="/trades" element={<PageTransition><Trades /></PageTransition>} />
        <Route path="/journal" element={<PageTransition><Journal /></PageTransition>} />
        <Route path="/notebook" element={<PageTransition><Notebook /></PageTransition>} />
        <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
        <Route path="/insights" element={<PageTransition><Insights /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
        <Route path="/chart" element={<PageTransition><TradingChart /></PageTransition>} />
        <Route path="/tracking/:id" element={<PageTransition><TradeTracking /></PageTransition>} />
        <Route path="/payment" element={<PageTransition><Payment /></PageTransition>} />
        <Route path="/payment-success" element={<PageTransition><PaymentSuccess /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><UserProfileSettings /></PageTransition>} />
        <Route path="/subscriptions" element={<PageTransition><Subscriptions /></PageTransition>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<PageTransition><AdminLayout><AdminDashboard /></AdminLayout></PageTransition>} />
        <Route path="/admin/users" element={<PageTransition><AdminLayout><AdminUsers /></AdminLayout></PageTransition>} />
        <Route path="/admin/trades" element={<PageTransition><AdminLayout><AdminTrades /></AdminLayout></PageTransition>} />
        <Route path="/admin/hashtags" element={<PageTransition><AdminLayout><AdminHashtags /></AdminLayout></PageTransition>} />
        <Route path="/admin/notes" element={<PageTransition><AdminLayout><AdminNotes /></AdminLayout></PageTransition>} />
        <Route path="/admin/pages" element={<PageTransition><AdminLayout><AdminPages /></AdminLayout></PageTransition>} />
        <Route path="/admin/subscriptions" element={<PageTransition><AdminLayout><AdminSubscriptions /></AdminLayout></PageTransition>} />
        <Route path="/admin/settings" element={<PageTransition><AdminLayout><AdminSettings /></AdminLayout></PageTransition>} />
        <Route path="/admin/profile" element={<PageTransition><AdminLayout><AdminProfileSettings /></AdminLayout></PageTransition>} />
        
        {/* Catch-all route */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <TradeProvider>
              <NotebookProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AnimatedRoutes />
                </TooltipProvider>
              </NotebookProvider>
            </TradeProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
