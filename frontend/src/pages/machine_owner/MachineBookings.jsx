import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { ClipboardList, Check, X, Calendar, User, Phone, MapPin } from "lucide-react";

export default function MachineBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/machines/owner/bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError("Failed to load booking requests. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      setActionLoading(id);
      await api.patch(`/machines/owner/bookings/${id}`, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
    } catch (err) {
      alert("Failed to update booking status.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "ACCEPTED":
        return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">Approved</span>;
      case "REJECTED":
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-medium border border-red-200">Rejected</span>;
      case "PENDING":
        return <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full font-medium border border-orange-200">Pending</span>;
      case "COMPLETED":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-200">Completed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Booking Requests 📋</h1>
          <p className="text-gray-500 text-sm mt-1">Manage rental requests from farmers for your machinery.</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm text-center py-10">Loading booking requests...</p>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="text-blue-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No requests yet</h3>
            <p className="text-sm text-gray-500 mt-1">You haven't received any booking requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking._id} className="p-5 sm:p-6 hover:bg-gray-50 transition flex flex-col md:flex-row gap-6">
                
                {/* Details Section */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{booking.machine?.name || "Unknown Machine"}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-sm text-gray-500">{booking.machineType?.replace("MACHINE_", "")}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-700 gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        Requested Date: <span className="font-medium text-gray-900">{booking.requestedDate}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700 gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        Source: {booking.source}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Farmer Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-700 gap-2">
                        <User size={16} className="text-gray-400" />
                        {booking.farmer?.name || "Unknown Farmer"}
                      </div>
                      <div className="flex items-center text-sm text-gray-700 gap-2">
                        <Phone size={16} className="text-gray-400" />
                        {booking.farmer?.phone || booking.farmerPhone || "No Phone"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                {booking.status?.toUpperCase() === "PENDING" && (
                  <div className="flex flex-row md:flex-col justify-end gap-3 min-w-[120px]">
                    <button
                      onClick={() => handleAction(booking._id, "APPROVED")}
                      disabled={actionLoading === booking._id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(booking._id, "REJECTED")}
                      disabled={actionLoading === booking._id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-red-600 border border-gray-200 hover:border-red-200 px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
