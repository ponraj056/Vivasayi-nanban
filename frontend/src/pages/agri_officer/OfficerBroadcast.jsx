import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { Send, Bell, MapPin, Loader } from "lucide-react";

export default function OfficerBroadcast() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ message: "", targetDistricts: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await api.get("/broadcast");
      setBroadcasts(res.data.broadcasts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.message) return;
    try {
      setSending(true);
      const districtsArray = formData.targetDistricts.split(",").map(d => d.trim()).filter(Boolean);
      await api.post("/broadcast", { 
        message: formData.message, 
        targetDistricts: districtsArray 
      });
      setFormData({ message: "", targetDistricts: "" });
      fetchBroadcasts();
    } catch (err) {
      alert("Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Broadcast Alerts 📢</h1>
          <p className="text-gray-500 text-sm mt-1">Send emergency advisories and weather alerts to farmers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Send size={20} className="text-purple-600" /> New Broadcast
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                required
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="e.g. Heavy rain expected in next 24 hours. Delay pesticide spray."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Districts</label>
              <input
                type="text"
                value={formData.targetDistricts}
                onChange={(e) => setFormData({ ...formData, targetDistricts: e.target.value })}
                placeholder="e.g. Coimbatore, Tiruppur (Leave empty for all)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
            >
              {sending ? <Loader size={18} className="animate-spin" /> : "Send Broadcast"}
            </button>
          </form>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700 flex items-center gap-2">
            <Bell size={18} className="text-gray-400" /> Sent History
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {loading ? (
              <p className="p-10 text-center text-gray-500 text-sm">Loading history...</p>
            ) : broadcasts.length === 0 ? (
              <p className="p-10 text-center text-gray-500 text-sm">No broadcasts sent yet.</p>
            ) : (
              broadcasts.map((b) => (
                <div key={b._id} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-900 bg-purple-50 px-2 py-1 rounded-md border border-purple-100 inline-block">
                      {b.message}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(b.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <MapPin size={12} />
                      {b.targetDistricts && b.targetDistricts.length > 0 ? b.targetDistricts.join(", ") : "All Districts"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
