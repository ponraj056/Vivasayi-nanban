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
import RentMachine from "./pages/farmer/RentMachine";
import MachineList from "./pages/machine_owner/MachineList";
import MachineBookings from "./pages/machine_owner/MachineBookings";
import Layout from "./components/Layout";

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
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/farmer/disease-check"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <Layout>
                  <DiseaseCheck />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/farmer/marketplace"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <Layout>
                  <Marketplace />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agri_agency/products"
            element={
              <ProtectedRoute allowedRoles={["agri_agency"]}>
                <Layout>
                  <DealerProducts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/farmer/rent-machine"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <Layout>
                  <RentMachine />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/machine_owner/machines"
            element={
              <ProtectedRoute allowedRoles={["machine_owner"]}>
                <Layout>
                  <MachineList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/machine_owner/bookings"
            element={
              <ProtectedRoute allowedRoles={["machine_owner"]}>
                <Layout>
                  <MachineBookings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
