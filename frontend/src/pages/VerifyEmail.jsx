import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // We might not have a direct login(token, user) in AuthContext, let's just navigate to login or set localStorage.
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to register if state is missing
  useEffect(() => {
    if (!state?.email) {
      navigate("/register");
    }
  }, [state, navigate]);

  if (!state?.email) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const { data } = await axios.post("http://127.0.0.1:5000/api/auth/verify-otp", {
        email: state.email,
        otp,
      });
      if (data.success) {
        setMsg("Email verified successfully! Redirecting...");
        // Usually AuthContext handles login. We can just set token manually or use a specific method.
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Force reload to update AuthContext state, or redirect
        setTimeout(() => {
          window.location.href = `/dashboard/${data.user.role}`;
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMsg("");
    try {
      const { data } = await axios.post("http://127.0.0.1:5000/api/auth/resend-otp", {
        email: state.email,
      });
      if (data.success) {
        setMsg("A new OTP has been sent to your email.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Verify Email</h2>
        <p style={styles.sub}>We sent a 6-digit code to <b>{state.email}</b></p>
        
        {error && <div style={styles.error}>{error}</div>}
        {msg && <div style={styles.success}>{msg}</div>}

        <form onSubmit={handleVerify} style={styles.form}>
          <label style={styles.label}>Enter OTP</label>
          <input
            style={styles.input}
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="123456"
          />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p style={styles.footer}>
          Didn't receive the code?{" "}
          <span style={styles.link} onClick={handleResend}>
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f0f4f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
  card: { background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1B5E20" },
  sub: { margin: "8px 0 20px", fontSize: 14, color: "#666" },
  error: { background: "#ffebee", color: "#c62828", padding: "10px", borderRadius: 8, marginBottom: 12, fontSize: 14 },
  success: { background: "#e8f5e9", color: "#2e7d32", padding: "10px", borderRadius: 8, marginBottom: 12, fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 12, textAlign: "left" },
  label: { fontSize: 13, fontWeight: 500, color: "#444", display: "block" },
  input: { width: "100%", padding: "12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 18, outline: "none", boxSizing: "border-box", textAlign: "center", letterSpacing: 4 },
  btn: { padding: "12px", background: "#2E7D32", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 8 },
  footer: { marginTop: 20, fontSize: 14, color: "#666" },
  link: { color: "#2E7D32", fontWeight: 600, cursor: "pointer", textDecoration: "underline" },
};
