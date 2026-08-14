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
import MachineOwnerEarnings from "./pages/machine_owner/MachineOwnerEarnings";
import OfficerTickets from "./pages/agri_officer/OfficerTickets";
import OfficerAnalytics from "./pages/agri_officer/OfficerAnalytics";
import OfficerBroadcast from "./pages/agri_officer/OfficerBroadcast";
import AgencyOrders from "./pages/agri_agency/AgencyOrders";
import AgencyReports from "./pages/agri_agency/AgencyReports";
import AdminVerify from "./pages/admin/AdminVerify";
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
          <Route
            path="/dashboard/machine_owner/earnings"
            element={
              <ProtectedRoute allowedRoles={["machine_owner"]}>
                <Layout>
                  <MachineOwnerEarnings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agri_officer/tickets"
            element={
              <ProtectedRoute allowedRoles={["agri_officer"]}>
                <Layout>
                  <OfficerTickets />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agri_officer/analytics"
            element={
              <ProtectedRoute allowedRoles={["agri_officer"]}>
                <Layout>
                  <OfficerAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agri_officer/broadcasts"
            element={
              <ProtectedRoute allowedRoles={["agri_officer"]}>
                <Layout>
                  <OfficerBroadcast />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agri_agency/orders"
            element={
              <ProtectedRoute allowedRoles={["agri_agency"]}>
                <Layout>
                  <AgencyOrders />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agri_agency/reports"
            element={
              <ProtectedRoute allowedRoles={["agri_agency"]}>
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
    </AuthProvider>
  );
}
