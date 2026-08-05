import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ROLES = [
  { value: "farmer", label: "விவசாயி (Farmer)", icon: "🌾", color: "#2E7D32" },
  { value: "dealer", label: "கடை உரிமையாளர் (Dealer)", icon: "🏪", color: "#1565C0" },
  { value: "machine_owner", label: "இயந்திர உரிமையாளர் (Machine Owner)", icon: "🚜", color: "#E65100" },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // step 1: basic info, step 2: role profile, step 3: otp
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "",
    // farmer
    farmerProfile: { location: "", district: "", landSize: "", crops: "" },
    // dealer
    dealerProfile: { shopName: "", address: "", district: "", pincode: "" },
    // machine_owner
    machineOwnerProfile: { district: "", serviceRadius: "" },
  });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setProfile = (role, field, val) => {
    const key = role === "machine_owner" ? "machineOwnerProfile" : `${role}Profile`;
    setForm((f) => ({ ...f, [key]: { ...f[key], [field]: val } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, role: form.role,
      };
      if (form.role === "farmer") {
        payload.farmerProfile = {
          ...form.farmerProfile,
          landSize: parseFloat(form.farmerProfile.landSize) || 0,
          crops: form.farmerProfile.crops.split(",").map((c) => c.trim()).filter(Boolean),
        };
      }
      if (form.role === "dealer") payload.dealerProfile = form.dealerProfile;
      if (form.role === "machine_owner") {
        payload.machineOwnerProfile = {
          ...form.machineOwnerProfile,
          serviceRadius: parseFloat(form.machineOwnerProfile.serviceRadius) || 0,
        };
      }
      // Call raw API because authContext register sets token directly
      const { data } = await axios.post("http://localhost:5000/api/auth/register", payload);
      
      if (data.success) {
        setMsg("OTP sent to your email!");
        setStep(3); // Go to OTP step
      }
    } catch (err) {
      console.error("Frontend Registration Error:", err);
      const errorMessage = err.response?.data?.message || "DefaultError: Network or Server issue.";
      setError(errorMessage);
      if (errorMessage.includes("already registered and verified")) {
        setTimeout(() => navigate("/login"), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: form.email,
        otp,
      });
      if (data.success) {
        setMsg("Email verified successfully! Redirecting...");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
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

  const handleResendOTP = async () => {
    setError("");
    setMsg("");
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/resend-otp", {
        email: form.email,
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
        <div style={styles.logoRow}>
          <span style={{ fontSize: 36 }}>🌱</span>
          <div>
            <h1 style={styles.title}>Vivasayi Nanban</h1>
            <p style={styles.sub}>பதிவு செய்யுங்கள் (Register)</p>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {msg && <div style={styles.success}>{msg}</div>}

        <form onSubmit={step === 3 ? handleVerifyOTP : handleSubmit} style={styles.form}>
          {step === 1 && (
            <>
              <h3 style={styles.sectionTitle}>Basic Information</h3>
              {[["name","Full Name","text"],["email","Email","email"],["phone","Phone Number","tel"],["password","Password","password"]].map(([field, label, type]) => (
                <div key={field}>
                  <label style={styles.label}>{label}</label>
                  <input style={styles.input} type={type} value={form[field]} onChange={(e) => set(field, e.target.value)} required />
                </div>
              ))}

              <h3 style={styles.sectionTitle}>Select Your Role</h3>
              <div style={styles.roleGrid}>
                {ROLES.map((r) => (
                  <div
                    key={r.value}
                    onClick={() => set("role", r.value)}
                    style={{ ...styles.roleCard, borderColor: form.role === r.value ? r.color : "#ddd", background: form.role === r.value ? r.color + "15" : "#fff" }}
                  >
                    <span style={{ fontSize: 28 }}>{r.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: form.role === r.value ? r.color : "#555", textAlign: "center" }}>{r.label}</span>
                  </div>
                ))}
              </div>

              <button type="button" style={styles.btn} onClick={() => { if (!form.role) { setError("Please select a role"); return; } setError(""); setStep(2); }}>
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={styles.sectionTitle}>Profile Details</h3>

              {form.role === "farmer" && (
                <>
                  {[["location","Village/Town"],["district","District"],["landSize","Land Size (acres)"],["crops","Crops (comma separated, e.g. rice, chilli)"]].map(([field, label]) => (
                    <div key={field}>
                      <label style={styles.label}>{label}</label>
                      <input style={styles.input} value={form.farmerProfile[field]} onChange={(e) => setProfile("farmer", field, e.target.value)} />
                    </div>
                  ))}
                </>
              )}

              {form.role === "dealer" && (
                <>
                  {[["shopName","Shop Name"],["address","Address"],["district","District"],["pincode","Pincode"]].map(([field, label]) => (
                    <div key={field}>
                      <label style={styles.label}>{label}</label>
                      <input style={styles.input} value={form.dealerProfile[field]} onChange={(e) => setProfile("dealer", field, e.target.value)} />
                    </div>
                  ))}
                </>
              )}

              {form.role === "machine_owner" && (
                <>
                  {[["district","District"],["serviceRadius","Service Radius (km)"]].map(([field, label]) => (
                    <div key={field}>
                      <label style={styles.label}>{label}</label>
                      <input style={styles.input} value={form.machineOwnerProfile[field]} onChange={(e) => setProfile("machine_owner", field, e.target.value)} />
                    </div>
                  ))}
                </>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                <button type="button" style={{ ...styles.btn, background: "#888", flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" style={{ ...styles.btn, flex: 2, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? "Registering..." : "Send OTP ✓"}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 style={styles.sectionTitle}>Verify Email</h3>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 15 }}>
                We sent a 6-digit code to <b>{form.email}</b>.
              </p>
              <div>
                <label style={styles.label}>Enter OTP</label>
                <input 
                  style={{ ...styles.input, textAlign: "center", letterSpacing: 4, fontSize: 18 }} 
                  type="text" 
                  maxLength="6" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                  placeholder="123456" 
                />
              </div>
              
              <button type="submit" style={{ ...styles.btn, marginTop: 15, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p style={{ textAlign: "center", marginTop: 15, fontSize: 13 }}>
                Didn't receive the code? <span onClick={handleResendOTP} style={{ ...styles.link, cursor: "pointer", color: "#2E7D32", fontWeight: 600 }}>Resend OTP</span>
              </p>
            </>
          )}
        </form>

        <p style={styles.footer}>Already have an account? <Link to="/login" style={styles.link}>Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f0f4f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
  card: { background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 460, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  logoRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: "#1B5E20" },
  sub: { margin: 0, fontSize: 13, color: "#666" },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#333", margin: "16px 0 10px" },
  error: { background: "#ffebee", color: "#c62828", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 14 },
  success: { background: "#e8f5e9", color: "#2e7d32", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 13, fontWeight: 500, color: "#444", display: "block", marginBottom: 4 },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "4px 0" },
  roleCard: { border: "2px solid", borderRadius: 10, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.2s" },
  btn: { padding: "12px", background: "#2E7D32", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%" },
  footer: { textAlign: "center", marginTop: 16, fontSize: 14, color: "#666" },
  link: { color: "#2E7D32", fontWeight: 600, textDecoration: "none" },
};
