import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import FarmerDashboard from "./dashboards/FarmerDashboard";
import AgriAgencyDashboard from "./dashboards/AgriAgencyDashboard";
import MachineOwnerDashboard from "./dashboards/MachineOwnerDashboard";
import AgriOfficerDashboard from "./dashboards/AgriOfficerDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

const DASH_MAP = {
  farmer: FarmerDashboard,
  agri_agency: AgriAgencyDashboard,
  machine_owner: MachineOwnerDashboard,
  agri_officer: AgriOfficerDashboard,
  admin: AdminDashboard,
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();

  useEffect(() => {
    if (user && user.role !== role) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, role, navigate]);

  if (!user || user.role !== role) return null;

  const DashComponent = DASH_MAP[user.role] || FarmerDashboard;

  return <DashComponent />;
}
