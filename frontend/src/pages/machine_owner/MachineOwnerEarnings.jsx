import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { IndianRupee, TrendingUp, Calendar, CheckCircle } from "lucide-react";

export default function MachineOwnerEarnings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/machines/owner/bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completedBookings = bookings.filter(b => b.status === "COMPLETED" || b.status === "APPROVED");
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.machine?.pricePerDay || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Earnings Tracker 💰</h1>
        <p className="text-gray-500 text-sm mt-1">Track your machinery rental revenue.</p>
      </div>

      {loading ? (
        <p className="p-10 text-center text-gray-500 text-sm">Loading earnings data...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-8 rounded-2xl shadow-md text-white flex flex-col justify-center">
              <p className="text-green-100 font-medium mb-2 flex items-center gap-2">
                <IndianRupee size={20} /> Total Estimated Revenue
              </p>
              <h2 className="text-5xl font-bold">₹{totalEarnings.toLocaleString('en-IN')}</h2>
              <p className="text-sm mt-4 text-green-200">Based on approved & completed bookings</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center gap-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-blue-600" size={24} />
                  <span className="font-medium text-gray-700">Completed Jobs</span>
                </div>
                <span className="text-xl font-bold">{completedBookings.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-orange-600" size={24} />
                  <span className="font-medium text-gray-700">Conversion Rate</span>
                </div>
                <span className="text-xl font-bold">
                  {bookings.length > 0 ? Math.round((completedBookings.length / bookings.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">Recent Revenue History</div>
            {completedBookings.length === 0 ? (
              <p className="p-10 text-center text-gray-500 text-sm">No completed bookings yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {completedBookings.map((b) => (
                  <div key={b._id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                      <h4 className="font-bold text-gray-900">{b.machine?.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={14} /> {b.requestedDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 flex items-center justify-end">
                        + ₹{b.machine?.pricePerDay}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Paid by {b.farmer?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
