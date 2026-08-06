import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminPanel() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    } else {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, usersRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/api/admin/stats", { headers }),
        axios.get(`http://127.0.0.1:5000/api/admin/users?search=${search}&role=${roleFilter}`, { headers }),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (token) fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter]);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`http://127.0.0.1:5000/api/admin/users/${id}/status`, 
        { isActive: !currentStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  if (loading && !stats) return <div style={styles.loading}>Loading Admin Panel...</div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <span style={{ fontWeight: 700, color: "#6A1B9A", fontSize: 18 }}>Admin Control Panel</span>
        </div>
        <button onClick={() => navigate("/dashboard/admin")} style={styles.backBtn}>Back to Dashboard</button>
      </nav>

      <div style={styles.container}>
        {/* STATS OVERVIEW */}
        <h2 style={styles.sectionTitle}>Platform Statistics</h2>
        <div style={styles.statsGrid}>
          <StatCard title="Total Users" value={stats?.users?.total || 0} color="#6A1B9A" />
          <StatCard title="Farmers" value={stats?.users?.farmers || 0} color="#2E7D32" />
          <StatCard title="Dealers" value={stats?.users?.dealers || 0} color="#1565C0" />
          <StatCard title="Machine Owners" value={stats?.users?.machineOwners || 0} color="#E65100" />
          <StatCard title="Machine Bookings" value={stats?.bookings?.total || 0} color="#00838F" />
        </div>

        {/* USER MANAGEMENT */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>User Management</h2>
            <div style={styles.filters}>
              <input
                style={styles.input}
                type="text"
                placeholder="Search users by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select style={styles.select} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="farmer">Farmer</option>
                <option value="dealer">Dealer</option>
                <option value="machineOwner">Machine Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Contact</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "#777" }}>Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={styles.td}>
                      <div>{u.email || "N/A"}</div>
                      <div style={{ fontSize: 12 }}>{u.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: getRoleColor(u.role) }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: u.isActive ? "#2E7D32" : "#c62828" }}>
                        {u.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button 
                          onClick={() => toggleUserStatus(u._id, u.isActive)}
                          style={{ ...styles.actionBtn, background: u.isActive ? "#f57c00" : "#2E7D32" }}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button 
                          onClick={() => deleteUser(u._id)}
                          style={{ ...styles.actionBtn, background: "#c62828" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, color }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "20px", borderLeft: `6px solid ${color}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
    <div style={{ fontSize: 13, color: "#666", fontWeight: 600, textTransform: "uppercase" }}>{title}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: "#333", marginTop: 8 }}>{value}</div>
  </div>
);

const getRoleColor = (role) => {
  const map = { farmer: "#2E7D32", dealer: "#1565C0", machineOwner: "#E65100", admin: "#6A1B9A" };
  return map[role] || "#555";
};

const styles = {
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 20 },
  page: { minHeight: "100vh", background: "#f5f7fa" },
  nav: { background: "#fff", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd" },
  navLeft: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: { padding: "8px 16px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: 600 },
  container: { padding: "32px", maxWidth: 1200, margin: "0 auto" },
  sectionTitle: { margin: "0 0 20px", fontSize: 20, color: "#333" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 40 },
  card: { background: "#fff", borderRadius: 12, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 20, gap: 16 },
  filters: { display: "flex", gap: 12, flexWrap: "wrap" },
  input: { padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, width: 300 },
  select: { padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, background: "#fff" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "14px 16px", background: "#f8f9fa", color: "#555", fontWeight: 600, borderBottom: "2px solid #eee" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "14px 16px", verticalAlign: "middle" },
  badge: { color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600 },
  actionBtn: { padding: "6px 12px", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" },
};
