import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "farmer", label: "விவசாயி (Farmer)", icon: "🌾", color: "#2E7D32" },
  { value: "dealer", label: "வியாபாரி (Dealer)", icon: "🏪", color: "#1565C0" },
  { value: "machineOwner", label: "இயந்திர உரிமையாளர் (Machine Owner)", icon: "🚜", color: "#E65100" },
  { value: "agency", label: "நிறுவனம் (Agency)", icon: "🏢", color: "#FBC02D" },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "",
    village: "", district: "", land_size: "",
    agency_details: { business_name: "", business_description: "", address: "", pincode: "", gst_number: "", license_number: "" }
  });

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setAgency = (field, val) => setForm((f) => ({ ...f, agency_details: { ...f.agency_details, [field]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const payload = {
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, role: form.role,
        village: form.village, district: form.district, land_size: form.land_size
      };
      
      if (form.role === "agency") {
        payload.agency_details = form.agency_details;
      }
      
      const user = await register(payload);
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Network or server issue.");
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSubmit} style={styles.form}>
          {step === 1 && (
            <>
              <h3 style={styles.sectionTitle}>Basic Information</h3>
              {[
                ["name", "Full Name", "text"],
                ["phone", "Phone Number", "tel"],
                ["email", "Email (Optional)", "email"],
                ["password", "Password", "password"]
              ].map(([field, label, type]) => (
                <div key={field}>
                  <label style={styles.label}>{label}</label>
                  <input style={styles.input} type={type} value={form[field]} onChange={(e) => set(field, e.target.value)} required={field !== "email"} />
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
                    <span style={{ fontSize: 24 }}>{r.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: form.role === r.value ? r.color : "#555", textAlign: "center" }}>{r.label}</span>
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
              
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["district", "District"], ["village", "Village / City"]].map(([field, label]) => (
                  <div key={field}>
                    <label style={styles.label}>{label}</label>
                    <input style={styles.input} required value={form[field]} onChange={(e) => set(field, e.target.value)} />
                  </div>
                ))}
              </div>

              {form.role === "farmer" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  <label style={styles.label}>Land Size (acres)</label>
                  <input style={styles.input} type="number" step="0.1" value={form.land_size} onChange={(e) => set("land_size", e.target.value)} />
                </div>
              )}

              {form.role === "agency" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  {[
                    ["business_name", "Business Name", true],
                    ["business_description", "Business Description", false],
                    ["address", "Address", true],
                    ["pincode", "Pincode", true],
                    ["gst_number", "GST Number", false],
                    ["license_number", "License Number", false]
                  ].map(([field, label, req]) => (
                    <div key={field}>
                      <label style={styles.label}>{label}</label>
                      <input style={styles.input} value={form.agency_details[field]} onChange={(e) => setAgency(field, e.target.value)} required={req} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                <button type="button" style={{ ...styles.btn, background: "#888", flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" style={{ ...styles.btn, flex: 2, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                  {loading ? "Registering..." : "Complete Registration ✓"}
                </button>
              </div>
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
  form: { display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 13, fontWeight: 500, color: "#444", display: "block", marginBottom: 4 },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "4px 0" },
  roleCard: { border: "2px solid", borderRadius: 10, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.2s" },
  btn: { padding: "12px", background: "#2E7D32", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%" },
  footer: { textAlign: "center", marginTop: 16, fontSize: 14, color: "#666" },
  link: { color: "#2E7D32", fontWeight: 600, textDecoration: "none" },
};
