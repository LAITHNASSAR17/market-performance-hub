import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { TradeProvider } from "./contexts/TradeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { NotebookProvider } from "./contexts/NotebookContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Trades from "./pages/Trades";
import AddTrade from "./pages/AddTrade";
import Analytics from "./pages/Analytics";
import Journal from "./pages/Journal";
import Notebook from "./pages/Notebook";
import Homepage from './pages/Homepage';
import UserProfileSettings from "./pages/UserProfileSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTrades from "./pages/admin/AdminTrades";
import AdminHashtags from "./pages/admin/AdminHashtags";
import AdminNotes from "./pages/admin/AdminNotes";
import AdminPages from "./pages/admin/AdminPages";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminProfileSettings from "./pages/admin/AdminProfileSettings";
import Insights from "./pages/Insights";
import Reports from "./pages/Reports";
import EmailVerify from "./pages/EmailVerify";
import PaymentSuccess from "./pages/PaymentSuccess";
import Payment from "./pages/Payment";
import Subscriptions from "./pages/Subscriptions";
import ImportTrades from "./pages/ImportTrades";

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <LanguageProvider>
          <ThemeProvider>
            <TradeProvider>
              <NotebookProvider>
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/trades" element={<Trades />} />
                  <Route path="/add-trade" element={<AddTrade />} />
                  <Route path="/import-trades" element={<ImportTrades />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/notebook" element={<Notebook />} />
                  <Route path="/profile" element={<UserProfileSettings />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/email-verify" element={<EmailVerify />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/trades" element={<AdminTrades />} />
                  <Route path="/admin/hashtags" element={<AdminHashtags />} />
                  <Route path="/admin/notes" element={<AdminNotes />} />
                  <Route path="/admin/pages" element={<AdminPages />} />
                  <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                  <Route path="/admin/profile" element={<AdminProfileSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NotebookProvider>
            </TradeProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
