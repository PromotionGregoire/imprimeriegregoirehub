import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/NotFound";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientDetails from "./pages/ClientDetails";
import CreateSubmission from "./pages/CreateSubmission";
import Submissions from "./pages/Submissions";
import SubmissionDetails from "./pages/SubmissionDetails";
import Orders from "./pages/Orders";
import EditSubmission from "./pages/EditSubmission";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ProofDetails from "./pages/ProofDetails";
import Proofs from "./pages/Proofs";
import OrderDetails from "./pages/OrderDetails";
import Suppliers from "./pages/Suppliers";
import SupplierDetails from "./pages/SupplierDetails";
import AdminEmployees from "./pages/AdminEmployees";
import AdminHistory from "./pages/AdminHistory";
import ProofApproval from "./pages/ProofApproval";
import ProofApprovalPage from "./pages/ProofApprovalPage";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import DashboardLayout from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/epreuve/:token" element={<ProofApproval />} />
            <Route path="/approve/proof/:token" element={<ProofApprovalPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="clients/:id" element={<ClientDetails />} />
              <Route path="submissions" element={<Submissions />} />
              <Route path="submissions/new" element={<CreateSubmission />} />
              <Route path="submissions/:id" element={<SubmissionDetails />} />
              <Route path="submissions/edit/:id" element={<EditSubmission />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="suppliers/:id" element={<SupplierDetails />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="proofs/:id" element={<ProofDetails />} />
              <Route path="proofs" element={<Proofs />} />
              <Route path="admin/employees" element={<AdminEmployees />} />
              <Route path="admin/history" element={<AdminHistory />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/force-password-change" element={<ForcePasswordChange />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
