
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TradeProvider } from "@/contexts/TradeContext";
import { NotebookProvider } from "@/contexts/NotebookContext";
import { TradeNotebookProvider } from "@/contexts/TradeNotebookContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MongoDBProvider } from "@/contexts/MongoDBContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddTrade from "./pages/AddTrade";
import Trades from "./pages/Trades";
import Journal from "./pages/Journal";
import TradeNotebook from "./pages/TradeNotebook";
import Reports from "./pages/Reports";
import Insights from "./pages/Insights";
import Analytics from "./pages/Analytics";
import TradingChart from "./pages/TradingChart";
import TradeTracking from "./pages/TradeTracking";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Subscriptions from "./pages/Subscriptions";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTrades from "./pages/admin/AdminTrades";
import AdminHashtags from "./pages/admin/AdminHashtags";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDatabase from "./pages/admin/AdminDatabase";
import AdminPages from "./pages/admin/AdminPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <MongoDBProvider>
          <BrowserRouter>
            <AuthProvider>
              <TradeProvider>
                <NotebookProvider>
                  <TradeNotebookProvider>
                    <LanguageProvider>
                      <Toaster />
                      <Sonner />
                      <Routes>
                        {/* User Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/add-trade" element={<AddTrade />} />
                        <Route path="/trades" element={<Trades />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/trade-notebook" element={<TradeNotebook />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/chart" element={<TradingChart />} />
                        <Route path="/tracking/:id" element={<TradeTracking />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="/subscriptions" element={<Subscriptions />} />
                        <Route path="/settings" element={<Settings />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/trades" element={<AdminTrades />} />
                        <Route path="/admin/hashtags" element={<AdminHashtags />} />
                        <Route path="/admin/notes" element={<AdminNotes />} />
                        <Route path="/admin/pages" element={<AdminPages />} />
                        <Route path="/admin/settings" element={<AdminSettings />} />
                        <Route path="/admin/database" element={<AdminDatabase />} />
                        
                        {/* Catch-all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </LanguageProvider>
                  </TradeNotebookProvider>
                </NotebookProvider>
              </TradeProvider>
            </AuthProvider>
          </BrowserRouter>
        </MongoDBProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
