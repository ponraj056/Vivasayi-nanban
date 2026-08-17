import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/admin/AdminPanel";
import DiseaseCheck from "./pages/DiseaseCheck";
import Marketplace from "./pages/Marketplace";
import DealerProducts from "./pages/DealerProducts";
import RentMachine from "./pages/farmer/RentMachine";
import MachineList from "./pages/machine_owner/MachineList";
import MachineBookings from "./pages/machine_owner/MachineBookings";
import MachineOwnerEarnings from "./pages/machine_owner/MachineOwnerEarnings";
import AgencyOrders from "./pages/agri_agency/AgencyOrders";
import AgencyReports from "./pages/agri_agency/AgencyReports";
import AdminVerify from "./pages/admin/AdminVerify";
import Layout from "./components/Layout";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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
            path="/dashboard/agency/products"
            element={
              <ProtectedRoute allowedRoles={["agency"]}>
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
            path="/dashboard/machineOwner/machines"
            element={
              <ProtectedRoute allowedRoles={["machineOwner"]}>
                <Layout>
                  <MachineList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/machineOwner/bookings"
            element={
              <ProtectedRoute allowedRoles={["machineOwner"]}>
                <Layout>
                  <MachineBookings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/machineOwner/earnings"
            element={
              <ProtectedRoute allowedRoles={["machineOwner"]}>
                <Layout>
                  <MachineOwnerEarnings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agency/orders"
            element={
              <ProtectedRoute allowedRoles={["agency"]}>
                <Layout>
                  <AgencyOrders />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agency/reports"
            element={
              <ProtectedRoute allowedRoles={["agency"]}>
                <Layout>
                  <AgencyReports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/verify"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout>
                  <AdminVerify />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
