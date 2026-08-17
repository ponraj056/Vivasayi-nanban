import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { ShieldCheck, CheckCircle, XCircle, Store, Tractor } from "lucide-react";

export default function AdminVerify() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const res = await api.get("/admin/verifications");
      setUsers(res.data.pendingUsers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, isVerified) => {
    try {
      await api.patch(`/admin/verifications/${id}/verify`, { isVerified });
      setUsers((prev) => prev.filter(u => u.id !== id));
    } catch (err) {
      alert("Failed to update verification status.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verification Center 🛡️</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve new Agri Agencies and Machine Owners.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700 flex items-center gap-2">
          <ShieldCheck size={18} className="text-gray-400" /> Pending Approvals
        </div>
        
        {loading ? (
          <p className="p-10 text-center text-gray-500 text-sm">Loading pending verifications...</p>
        ) : users.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <CheckCircle className="text-green-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-sm text-gray-500 mt-1">There are no users pending verification at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex gap-4">
                  <div className={`p-4 rounded-xl flex items-center justify-center ${u.role === "agri_agency" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                    {u.role === "agri_agency" ? <Store size={28} /> : <Tractor size={28} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900">{u.name}</h3>
                      <span className="text-xs uppercase tracking-wider font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        {u.role.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Phone: {u.phone} | Email: {u.email || "N/A"}</p>
                    
                    {u.role === "agri_agency" && u.agency_profile && (
                      <p className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded">
                        Business: <strong>{u.agency_profile.business_name}</strong> | Address: {u.agency_profile.address}, {u.agency_profile.district} - {u.agency_profile.pincode}
                      </p>
                    )}
                    
                    {u.role === "machine_owner" && (
                      <p className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded">
                        District: <strong>{u.district || "Not specified"}</strong> | Village: {u.village || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={() => handleVerify(u.id, true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button
                    onClick={() => handleVerify(u.id, false)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-red-600 border border-gray-200 hover:border-red-200 px-5 py-2.5 rounded-lg text-sm font-medium transition"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
