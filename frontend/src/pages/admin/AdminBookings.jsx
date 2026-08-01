import { useEffect, useState } from "react";
import api from "../../api/axiosClient";

const MACHINE_LABELS = {
  MACHINE_TRACTOR: "🚜 Tractor",
  MACHINE_HARVESTER: "🌾 Harvester",
  MACHINE_SPRAYER: "💧 Sprayer",
};

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get("/admin/bookings", { params: { status: statusFilter || undefined } })
      .then((res) => setBookings(res.data.bookings))
      .finally(() => setLoading(false));
  };

  useEffect(fetchBookings, [statusFilter]);

  const updateStatus = async (id, status) => {
    const res = await api.patch(`/admin/bookings/${id}`, { status });
    setBookings((prev) => prev.map((b) => (b._id === id ? res.data.booking : b)));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1F3A2E] mb-1">Machine Bookings</h2>
      <p className="text-sm text-[#8A8371] mb-6">
        Requests coming in from WhatsApp and the web app.
      </p>

      <div className="flex gap-2 mb-4">
        {["", "PENDING", "APPROVED", "REJECTED", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              statusFilter === s
                ? "bg-[#1F3A2E] text-white border-[#1F3A2E]"
                : "bg-white text-[#8A8371] border-[#E5E0D4]"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-[#8A8371] text-sm">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-[#8A8371] text-sm">No bookings found.</p>
        ) : (
          bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-xl border border-[#E5E0D4] px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-[#1F3A2E]">
                  {MACHINE_LABELS[b.machineType] || b.machineType}
                </p>
                <p className="text-xs text-[#8A8371] mt-1">
                  {b.farmerPhone} · Requested for {b.requestedDate} · via {b.source}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[b.status]}`}
                >
                  {b.status}
                </span>
                {b.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => updateStatus(b._id, "APPROVED")}
                      className="text-xs font-medium text-green-700 hover:underline"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(b._id, "REJECTED")}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}