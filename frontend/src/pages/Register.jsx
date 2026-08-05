import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";

const ROLES = [
  { value: "farmer", label: "விவசாயி (Farmer)", icon: "🌾", color: "#2E7D32" },
  { value: "dealer", label: "கடை உரிமையாளர் (Dealer)", icon: "🏪", color: "#1565C0" },
  { value: "machine_owner", label: "இயந்திர உரிமையாளர் (Machine Owner)", icon: "🚜", color: "#E65100" },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "",
    farmerProfile: { location: "", district: "", taluk: "", village: "", pincode: "", landSize: "", crops: "" },
    dealerProfile: { shopName: "", address: "", district: "", pincode: "" },
    machineOwnerProfile: { district: "", serviceRadius: "" },
  });

  // Location feature state
  const [useFarmLocation, setUseFarmLocation] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [villages, setVillages] = useState([]);
  const [locLoading, setLocLoading] = useState({ dist: false, taluk: false, vill: false });

  // Fetch districts on mount
  useEffect(() => {
    const fetchDist = async () => {
      setLocLoading((l) => ({ ...l, dist: true }));
      try {
        const { data } = await axios.get("http://127.0.0.1:5000/api/locations/districts");
        if (data.success) setDistricts(data.districts);
      } catch (err) {
        console.error("Failed to load districts", err);
      } finally {
        setLocLoading((l) => ({ ...l, dist: false }));
      }
    };
    fetchDist();
  }, []);

  // Fetch taluks when district changes
  useEffect(() => {
    if (!form.farmerProfile.district) {
      setTaluks([]);
      return;
    }
    const fetchTaluks = async () => {
      setLocLoading((l) => ({ ...l, taluk: true }));
      try {
        const { data } = await axios.get(`http://127.0.0.1:5000/api/locations/taluks?district=${form.farmerProfile.district}`);
        if (data.success) setTaluks(data.taluks);
      } catch (err) {
        console.error("Failed to load taluks", err);
      } finally {
        setLocLoading((l) => ({ ...l, taluk: false }));
      }
    };
    fetchTaluks();
  }, [form.farmerProfile.district]);

  // Fetch villages when taluk changes
  useEffect(() => {
    if (!form.farmerProfile.taluk) {
      setVillages([]);
      return;
    }
    const fetchVillages = async () => {
      setLocLoading((l) => ({ ...l, vill: true }));
      try {
        const { data } = await axios.get(`http://127.0.0.1:5000/api/locations/villages?district=${form.farmerProfile.district}&taluk=${form.farmerProfile.taluk}`);
        if (data.success) setVillages(data.villages);
      } catch (err) {
        console.error("Failed to load villages", err);
      } finally {
        setLocLoading((l) => ({ ...l, vill: false }));
      }
    };
    fetchVillages();
  }, [form.farmerProfile.taluk]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setProfile = (role, field, val) => {
    const key = role === "machine_owner" ? "machineOwnerProfile" : `${role}Profile`;
    setForm((f) => ({ ...f, [key]: { ...f[key], [field]: val } }));
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({
      ...f,
      farmerProfile: { ...f.farmerProfile, district: val, taluk: "", village: "", pincode: "" }
    }));
  };

  const handleTalukChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({
      ...f,
      farmerProfile: { ...f.farmerProfile, taluk: val, village: "", pincode: "" }
    }));
  };

  const handleVillageChange = (selectedOption) => {
    setForm((f) => ({
      ...f,
      farmerProfile: { ...f.farmerProfile, village: selectedOption ? selectedOption.value : "", pincode: selectedOption ? selectedOption.pincode : "" }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation for location
    if (form.role === "farmer" && useFarmLocation) {
      const p = form.farmerProfile;
      if (!p.district || !p.taluk || !p.village) {
        setError("Please complete your farm location selection (District, Taluk, Village).");
        return;
      }
    }

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
          crops: form.farmerProfile.crops ? form.farmerProfile.crops.split(",").map((c) => c.trim()).filter(Boolean) : [],
        };
      }
      if (form.role === "dealer") payload.dealerProfile = form.dealerProfile;
      if (form.role === "machine_owner") {
        payload.machineOwnerProfile = {
          ...form.machineOwnerProfile,
          serviceRadius: parseFloat(form.machineOwnerProfile.serviceRadius) || 0,
        };
      }
      const { data } = await axios.post("http://127.0.0.1:5000/api/auth/register", payload);
      if (data.success) {
        setMsg("OTP sent to your email!");
        setStep(3);
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
      const { data } = await axios.post("http://127.0.0.1:5000/api/auth/verify-otp", {
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
      const { data } = await axios.post("http://127.0.0.1:5000/api/auth/resend-otp", {
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
                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", fontWeight: 500, color: "#1B5E20" }}>
                      <input 
                        type="checkbox" 
                        checked={useFarmLocation} 
                        onChange={(e) => setUseFarmLocation(e.target.checked)} 
                        style={{ width: 18, height: 18, cursor: "pointer" }}
                      />
                      Use my farm location for personalized advisory
                    </label>
                  </div>

                  {useFarmLocation && (
                    <div style={{ background: "#f9fcf9", padding: 15, borderRadius: 8, border: "1px solid #e0e0e0", marginBottom: 15, display: "flex", flexDirection: "column", gap: 10 }}>
                      
                      <div>
                        <label style={styles.label}>District {useFarmLocation && <span style={{color:"red"}}>*</span>}</label>
                        <select style={styles.input} value={form.farmerProfile.district} onChange={handleDistrictChange} required={useFarmLocation}>
                          <option value="">{locLoading.dist ? "Loading..." : "Select District"}</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={styles.label}>Taluk {useFarmLocation && <span style={{color:"red"}}>*</span>}</label>
                        <select style={styles.input} value={form.farmerProfile.taluk} onChange={handleTalukChange} disabled={!form.farmerProfile.district} required={useFarmLocation}>
                          <option value="">{locLoading.taluk ? "Loading..." : "Select Taluk"}</option>
                          {taluks.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={styles.label}>Village {useFarmLocation && <span style={{color:"red"}}>*</span>}</label>
                        <Select
                          isDisabled={!form.farmerProfile.taluk}
                          isLoading={locLoading.vill}
                          options={villages.map(v => ({ value: v.village, label: v.village, pincode: v.pincode }))}
                          value={form.farmerProfile.village ? { value: form.farmerProfile.village, label: form.farmerProfile.village } : null}
                          onChange={handleVillageChange}
                          placeholder="Select Village..."
                          styles={{ control: (base) => ({ ...base, borderRadius: 8, borderColor: "#ddd", minHeight: 40 }) }}
                        />
                      </div>

                      <div>
                        <label style={styles.label}>Pincode</label>
                        <input style={{...styles.input, background: "#f0f0f0", color: "#666"}} value={form.farmerProfile.pincode} readOnly placeholder="Auto-filled" />
                      </div>

                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[["landSize","Land Size (acres)"],["crops","Crops (comma separated, e.g. rice, chilli)"]].map(([field, label]) => (
                      <div key={field}>
                        <label style={styles.label}>{label}</label>
                        <input style={styles.input} value={form.farmerProfile[field]} onChange={(e) => setProfile("farmer", field, e.target.value)} />
                      </div>
                    ))}
                  </div>
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
