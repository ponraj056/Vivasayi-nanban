import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_COLORS = {
  farmer: "#2E7D32",
  dealer: "#1565C0",
  machine_owner: "#E65100",
  admin: "#6A1B9A",
};

const ROLE_LABELS = {
  farmer: "விவசாயி (Farmer)",
  dealer: "கடை உரிமையாளர் (Dealer)",
  machine_owner: "இயந்திர உரிமையாளர் (Machine Owner)",
  admin: "நிர்வாகி (Admin)",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      // Redirect based on role
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>🌱</span>
          <div>
            <h1 style={styles.title}>Vivasayi Nanban</h1>
            <p style={styles.subtitle}>விவசாயி நண்பன்</p>
          </div>
        </div>

        <h2 style={styles.heading}>உள்நுழைக (Login)</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <p style={{...styles.footer, marginTop: 15, marginBottom: 5}}>
          <Link to="/forgot-password" style={{...styles.link, color: "#666", fontWeight: 500}}>Forgot Password?</Link>
        </p>

        <p style={styles.footer}>
          New user?{" "}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>

        {/* Role badges */}
        <div style={styles.rolesRow}>
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <span key={role} style={{ ...styles.badge, background: ROLE_COLORS[role] }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f0f4f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
  card: { background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  logoRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 },
  logoIcon: { fontSize: 40 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1B5E20" },
  subtitle: { margin: 0, fontSize: 13, color: "#666" },
  heading: { fontSize: 18, fontWeight: 600, color: "#333", marginBottom: 20 },
  error: { background: "#ffebee", color: "#c62828", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  label: { fontSize: 13, fontWeight: 500, color: "#444" },
  input: { padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 15, outline: "none" },
  btn: { marginTop: 8, padding: "12px", background: "#2E7D32", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  footer: { textAlign: "center", marginTop: 20, fontSize: 14, color: "#666" },
  link: { color: "#2E7D32", fontWeight: 600, textDecoration: "none" },
  rolesRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20, justifyContent: "center" },
  badge: { color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 500 },
};
