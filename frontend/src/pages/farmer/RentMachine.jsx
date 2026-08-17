import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { Search, Tractor, Calendar, MapPin, IndianRupee, Info, Clock, CheckCircle, XCircle } from "lucide-react";

export default function RentMachine() {
  const [activeTab, setActiveTab] = useState("browse");
  const [machines, setMachines] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [districtFilter, setDistrictFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Booking Modal
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [requestedDate, setRequestedDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    if (activeTab === "browse") {
      fetchMachines();
    } else {
      fetchMyBookings();
    }
  }, [activeTab]);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await api.get("/machines", {
        params: {
          district: districtFilter || undefined,
          machineType: typeFilter || undefined,
        },
      });
      setMachines(res.data.machines || []);
    } catch (err) {
      setError("Failed to load machines. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/machines/bookings/mine");
      setMyBookings(res.data.bookings || []);
    } catch (err) {
      setError("Failed to load bookings. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!requestedDate) {
      alert("Please select a date.");
      return;
    }
    try {
      setBookingLoading(true);
      setBookingSuccess("");
      await api.post(`/machines/${selectedMachine.id}/book`, { requestedDate });
      setBookingSuccess("Booking request sent successfully!");
      setRequestedDate("");
      setTimeout(() => {
        setSelectedMachine(null);
        setBookingSuccess("");
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book machine.");
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "ACCEPTED":
        return "text-green-600 bg-green-50 border-green-200";
      case "REJECTED":
        return "text-red-600 bg-red-50 border-red-200";
      case "PENDING":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rent a Machine 🚜</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and book agricultural machinery near you.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-max">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "browse" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Browse Machines
        </button>
        <button
          onClick={() => setActiveTab("my_bookings")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "my_bookings" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Bookings
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Content */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
              <input
                type="text"
                placeholder="e.g., Coimbatore"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1">Machine Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="">All Types</option>
                <option value="MACHINE_TRACTOR">Tractor</option>
                <option value="MACHINE_HARVESTER">Harvester</option>
                <option value="MACHINE_SPRAYER">Sprayer</option>
                <option value="Drone">Drone</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              onClick={fetchMachines}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <Search size={16} /> Search
            </button>
          </div>

          {/* Machine List */}
          {loading ? (
            <p className="text-gray-500 text-sm text-center py-10">Loading machines...</p>
          ) : machines.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10 bg-white rounded-xl border border-gray-200">
              No machines found matching your criteria.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {machines.map((machine) => (
                <div key={machine.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  {machine.photoUrl ? (
                    <img src={machine.photoUrl} alt={machine.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-orange-50 flex items-center justify-center">
                      <Tractor className="text-orange-200" size={64} />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{machine.name}</h3>
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                        {machine.machineType.replace("MACHINE_", "")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{machine.description || "No description provided."}</p>
                    
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center text-sm text-gray-600 gap-2">
                        <IndianRupee size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">₹{machine.pricePerDay}</span> / day
                      </div>
                      <div className="flex items-center text-sm text-gray-600 gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {machine.district} {machine.location && `(${machine.location})`}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 gap-2">
                        <Info size={16} className="text-gray-400" />
                        Owner: {machine.owner?.name || "Unknown"}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedMachine(machine)}
                      className="w-full bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Request to Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "my_bookings" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
             <p className="text-gray-500 text-sm text-center py-10">Loading bookings...</p>
          ) : myBookings.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center">
              <Calendar className="text-gray-300 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
              <p className="text-sm text-gray-500 mt-1">You haven't requested any machines.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Machine</th>
                    <th className="px-6 py-4">Requested Date</th>
                    <th className="px-6 py-4">Price/Day</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((booking) => (
                    <tr key={booking._id} className="bg-white border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {booking.machine?.name || "Unknown"}
                        <div className="text-xs text-gray-500 font-normal">{booking.machineType?.replace("MACHINE_", "")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400"/>
                          {booking.requestedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">₹{booking.machine?.pricePerDay || 0}</td>
                      <td className="px-6 py-4">{booking.machine?.district || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-900">Book {selectedMachine.name}</h3>
              <button onClick={() => setSelectedMachine(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleBook} className="p-6">
              {bookingSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                  <CheckCircle size={16} /> {bookingSuccess}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    required
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Check owner availability. They will confirm your request.</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per day</span>
                    <span className="font-medium">₹{selectedMachine.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium text-right">{selectedMachine.district}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMachine(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || bookingSuccess}
                  className="flex-1 px-4 py-2 text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition flex justify-center items-center gap-2"
                >
                  {bookingLoading ? <Clock size={16} className="animate-spin" /> : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
