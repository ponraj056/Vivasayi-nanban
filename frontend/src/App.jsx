import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/admin/AdminPanel";
import DiseaseCheck from "./pages/DiseaseCheck";
import Marketplace from "./pages/Marketplace";
import DealerProducts from "./pages/DealerProducts";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard/:role"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/farmer/disease-check"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <DiseaseCheck />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/farmer/marketplace"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agri_agency/products"
            element={
              <ProtectedRoute allowedRoles={["agri_agency"]}>
                <DealerProducts />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
