import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError(""); setMsg(""); setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      if (data.success) {
        setMsg("OTP sent to your email.");
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setMsg(""); setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email, otp, newPassword
      });
      if (data.success) {
        setMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>
        <p style={styles.sub}>
          {step === 1 ? "Enter your email to receive an OTP." : `OTP sent to ${email}`}
        </p>
        
        {error && <div style={styles.error}>{error}</div>}
        {msg && <div style={styles.success}>{msg}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} style={styles.form}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <label style={styles.label}>Enter OTP</label>
            <input
              style={{...styles.input, textAlign: "center", letterSpacing: 4}}
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="123456"
            />
            
            <label style={{...styles.label, marginTop: 10}}>New Password</label>
            <input
              style={styles.input}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p style={styles.footer}>
          Remember your password? <Link to="/login" style={styles.link}>Login</Link>
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
  input: { width: "100%", padding: "12px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" },
  btn: { padding: "12px", background: "#2E7D32", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 8 },
  footer: { marginTop: 20, fontSize: 14, color: "#666" },
  link: { color: "#2E7D32", fontWeight: 600, textDecoration: "none" },
};
