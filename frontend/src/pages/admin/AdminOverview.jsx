import { useEffect, useState } from "react";
import api from "../../api/axiosClient";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E0D4] p-5">
      <p className="text-xs font-medium text-[#8A8371] uppercase tracking-wide">
        {label}
      </p>
      <p className="text-3xl font-bold text-[#1F3A2E] mt-2">{value}</p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: accent || "#8A8371" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data.stats))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load stats")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[#8A8371]">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1F3A2E] mb-1">Overview</h2>
      <p className="text-sm text-[#8A8371] mb-6">
        Platform-wide snapshot, updated in real time.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Farmers" value={stats.users.farmers} />
        <StatCard label="Dealers" value={stats.users.dealers} />
        <StatCard label="Machine Owners" value={stats.users.machineOwners} />
        <StatCard label="Total Users" value={stats.users.total} accent="#1F3A2E" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Bookings"
          value={stats.bookings.total}
          sub={`${stats.bookings.pending} pending`}
          accent="#D97706"
        />
        <StatCard
          label="Active WhatsApp Chats"
          value={stats.whatsapp.activeSessions24h}
          sub="last 24 hours"
        />
        <StatCard
          label="Messages"
          value={stats.whatsapp.messagesLast7Days}
          sub="last 7 days"
        />
      </div>
    </div>
  );
}