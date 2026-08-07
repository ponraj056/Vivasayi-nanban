import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

// Stat card component
const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "1.2rem", border: "1.5px solid #eee", display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontSize: 28 }}>{icon}</span>
    <span style={{ fontSize: 13, color: "#888" }}>{label}</span>
    <span style={{ fontSize: 22, fontWeight: 700, color: color || "#222" }}>{value}</span>
  </div>
);

// Quick action button
const ActionBtn = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} style={{ background: color + "15", border: `1.5px solid ${color}30`, borderRadius: 10, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flex: 1, minWidth: 80 }}>
    <span style={{ fontSize: 24 }}>{icon}</span>
    <span style={{ fontSize: 12, fontWeight: 500, color: color, textAlign: "center" }}>{label}</span>
  </button>
);

// --- FARMER DASHBOARD ---
const FarmerDashboard = ({ user }) => (
  <div>
    <h2 style={{ color: "#2E7D32", marginBottom: 4 }}>வணக்கம், {user.name}! 🌾</h2>
    <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Farmer Dashboard</p>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
      <StatCard icon="🌡️" label="Today's Weather" value="32°C" color="#E65100" />
      <StatCard icon="💰" label="Groundnut Price" value="₹5,200/qt" color="#1565C0" />
      <StatCard icon="🌾" label="Active Crops" value={user.farmerProfile?.crops?.length || 0} color="#2E7D32" />
      <StatCard icon="📊" label="This Season Profit" value="₹0" color="#6A1B9A" />
    </div>

    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h3>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
      <ActionBtn icon="📸" label="Disease Check" color="#c62828" onClick={() => window.location.href = '/dashboard/farmer/disease-check'} />
      <ActionBtn icon="📈" label="Price Alert" color="#1565C0" />
      <ActionBtn icon="🌦️" label="Weather" color="#0277bd" />
      <ActionBtn icon="🏪" label="Find Shop" color="#2E7D32" onClick={() => window.location.href = '/dashboard/farmer/marketplace'} />
      <ActionBtn icon="🚜" label="Machine" color="#E65100" />
      <ActionBtn icon="💸" label="Expenses" color="#6A1B9A" />
    </div>

    <div style={{ background: "#E8F5E9", borderRadius: 12, padding: "1rem" }}>
      <p style={{ fontWeight: 600, color: "#2E7D32", margin: "0 0 6px" }}>📢 Daily Advisory</p>
      <p style={{ fontSize: 14, color: "#444", margin: 0 }}>இன்று மழை வாய்ப்பு உள்ளது — pesticide spray வேண்டாம். Groundnut rate ₹5,200 — விற்பதற்கு நல்ல நேரம்.</p>
    </div>
  </div>
);

// --- AGRI-AGENCY DASHBOARD ---
const AgriAgencyDashboard = ({ user }) => (
  <div>
    <h2 style={{ color: "#1565C0", marginBottom: 4 }}>வணக்கம், {user.name}! 🏪</h2>
    <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Agri-Agency Dashboard — {user.agriAgencyProfile?.shopName || "Your Shop"}</p>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
      <StatCard icon="📦" label="Products Listed" value="0" color="#1565C0" />
      <StatCard icon="🛒" label="New Orders" value="0" color="#2E7D32" />
      <StatCard icon="⚠️" label="Low Stock Items" value="0" color="#E65100" />
      <StatCard icon="💰" label="This Month Sales" value="₹0" color="#6A1B9A" />
    </div>

    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h3>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
      <ActionBtn icon="➕" label="Add Product" color="#1565C0" onClick={() => window.location.href = '/dashboard/agri_agency/products'} />
      <ActionBtn icon="📋" label="View Orders" color="#2E7D32" />
      <ActionBtn icon="📦" label="Update Stock" color="#E65100" />
      <ActionBtn icon="📊" label="Sales Report" color="#6A1B9A" />
    </div>

    <div style={{ background: "#E3F2FD", borderRadius: 12, padding: "1rem" }}>
      <p style={{ fontWeight: 600, color: "#1565C0", margin: "0 0 6px" }}>ℹ️ Platform Status</p>
      <p style={{ fontSize: 14, color: "#444", margin: 0 }}>உங்கள் shop verify ஆகவில்லை — Admin verification pending. Verified ஆனதும் orders வரும்.</p>
    </div>
  </div>
);

// --- MACHINE OWNER DASHBOARD ---
const MachineOwnerDashboard = ({ user }) => (
  <div>
    <h2 style={{ color: "#E65100", marginBottom: 4 }}>வணக்கம், {user.name}! 🚜</h2>
    <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Machine Owner Dashboard</p>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
      <StatCard icon="🚜" label="My Machines" value={user.machineOwnerProfile?.machines?.length || 0} color="#E65100" />
      <StatCard icon="📋" label="Booking Requests" value="0" color="#1565C0" />
      <StatCard icon="✅" label="Completed Jobs" value="0" color="#2E7D32" />
      <StatCard icon="💰" label="This Month Earned" value="₹0" color="#6A1B9A" />
    </div>

    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h3>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
      <ActionBtn icon="➕" label="Add Machine" color="#E65100" />
      <ActionBtn icon="📋" label="View Bookings" color="#1565C0" />
      <ActionBtn icon="✅" label="Set Available" color="#2E7D32" />
      <ActionBtn icon="📊" label="Earnings" color="#6A1B9A" />
    </div>

    <div style={{ background: "#FBE9E7", borderRadius: 12, padding: "1rem" }}>
      <p style={{ fontWeight: 600, color: "#E65100", margin: "0 0 6px" }}>ℹ️ Platform Status</p>
      <p style={{ fontSize: 14, color: "#444", margin: 0 }}>Machine details add பண்ணுங்கள் — farmers உங்களை find பண்ணலாம்.</p>
    </div>
  </div>
);

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ user }) => (
  <div>
    <h2 style={{ color: "#6A1B9A", marginBottom: 4 }}>வணக்கம், {user.name}! 🛡️</h2>
    <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Admin Dashboard — Platform Overview</p>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
      <StatCard icon="👨‍🌾" label="Total Farmers" value="0" color="#2E7D32" />
      <StatCard icon="🏪" label="Total Dealers" value="0" color="#1565C0" />
      <StatCard icon="🚜" label="Machine Owners" value="0" color="#E65100" />
      <StatCard icon="⏳" label="Pending Verify" value="0" color="#c62828" />
    </div>

    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h3>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
      <ActionBtn icon="👥" label="Control Panel" color="#6A1B9A" onClick={() => window.location.href = '/admin-panel'} />
      <ActionBtn icon="✅" label="Verify Dealers" color="#1565C0" />
      <ActionBtn icon="🚜" label="Verify Machines" color="#E65100" />
    </div>

    <div style={{ background: "#F3E5F5", borderRadius: 12, padding: "1rem" }}>
      <p style={{ fontWeight: 600, color: "#6A1B9A", margin: "0 0 6px" }}>🗺️ Village Analytics</p>
      <p style={{ fontSize: 14, color: "#444", margin: 0 }}>Platform new — users join ஆனதும் village-level analytics காட்டும்.</p>
    </div>
  </div>
);

// --- AGRI-OFFICER DASHBOARD ---
const AgriOfficerDashboard = ({ user }) => (
  <div>
    <h2 style={{ color: "#0277bd", marginBottom: 4 }}>வணக்கம், {user.name}! 👮</h2>
    <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Agri-Officer Dashboard — District Analytics</p>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
      <StatCard icon="👨‍🌾" label="Farmers in District" value="0" color="#2E7D32" />
      <StatCard icon="🎫" label="Open Tickets" value="0" color="#c62828" />
      <StatCard icon="📸" label="Disease Reports" value="0" color="#E65100" />
      <StatCard icon="✅" label="Tickets Resolved" value="0" color="#1565C0" />
    </div>

    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h3>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
      <ActionBtn icon="🎫" label="View Tickets" color="#0277bd" />
      <ActionBtn icon="📸" label="Disease Analytics" color="#E65100" />
      <ActionBtn icon="📢" label="Send Broadcast" color="#6A1B9A" />
    </div>
  </div>
);

// --- MAIN DASHBOARD ROUTER ---
const DASH_MAP = { farmer: FarmerDashboard, agri_agency: AgriAgencyDashboard, machine_owner: MachineOwnerDashboard, agri_officer: AgriOfficerDashboard, admin: AdminDashboard };
const ROLE_COLORS = { farmer: "#2E7D32", agri_agency: "#1565C0", machine_owner: "#E65100", agri_officer: "#0277bd", admin: "#6A1B9A" };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();

  useEffect(() => {
    if (user && user.role !== role) navigate(`/dashboard/${user.role}`);
  }, [user, role]);

  if (!user) return null;

  const DashComponent = DASH_MAP[user.role] || FarmerDashboard;
  const color = ROLE_COLORS[user.role] || "#2E7D32";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f5" }}>
      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1.5px solid #eee", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🌱</span>
          <span style={{ fontWeight: 700, color: "#1B5E20", fontSize: 17 }}>Vivasayi Nanban</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, background: color + "20", color: color, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>
            {user.role.replace("_", " ").toUpperCase()}
          </span>
          <span style={{ fontSize: 14, color: "#555" }}>{user.name}</span>
          <button onClick={() => { logout(); navigate("/login"); }} style={{ padding: "6px 14px", border: "1.5px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: "#666" }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <DashComponent user={user} />
      </div>
    </div>
  );
}
