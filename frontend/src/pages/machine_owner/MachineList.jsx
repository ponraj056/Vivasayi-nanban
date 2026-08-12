import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { Plus, Tractor, Settings, MoreVertical, CheckCircle, XCircle } from "lucide-react";

export default function MachineList() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    machineType: "MACHINE_TRACTOR",
    description: "",
    pricePerDay: "",
    district: "",
    location: "",
  });

  useEffect(() => {
    fetchMyMachines();
  }, []);

  const fetchMyMachines = async () => {
    try {
      setLoading(true);
      const res = await api.get("/machines/owner/mine");
      setMachines(res.data.machines || []);
    } catch (err) {
      setError("Failed to load your machines. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    try {
      setAddLoading(true);
      await api.post("/machines", formData);
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        machineType: "MACHINE_TRACTOR",
        description: "",
        pricePerDay: "",
        district: "",
        location: "",
      });
      fetchMyMachines();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add machine.");
    } finally {
      setAddLoading(false);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await api.patch(`/machines/${id}`, { isAvailable: !currentStatus });
      setMachines((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isAvailable: !currentStatus } : m))
      );
    } catch (err) {
      alert("Failed to update availability.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Machines 🚜</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your machinery fleet and availability.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add Machine
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Machine List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm text-center py-10">Loading your machines...</p>
        ) : machines.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Tractor className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No machines found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              You haven't added any machines yet. Add your first machine to start getting rental requests.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 text-orange-600 font-medium hover:text-orange-700 text-sm flex items-center gap-1"
            >
              <Plus size={16} /> Add a Machine
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Machine Name & Type</th>
                  <th className="px-6 py-4">Pricing</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine) => (
                  <tr key={machine._id} className="bg-white border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 text-base">{machine.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {machine.machineType?.replace("MACHINE_", "")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">₹{machine.pricePerDay}</span> / day
                    </td>
                    <td className="px-6 py-4">
                      {machine.district}
                      {machine.location && <span className="block text-xs text-gray-400">{machine.location}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailability(machine._id, machine.isAvailable)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                          machine.isAvailable 
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {machine.isAvailable ? "Available" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 transition p-1">
                        <Settings size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Machine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="font-semibold text-lg text-gray-900">Add New Machine</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddMachine} className="p-6">
              <div className="space-y-4 text-sm">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Machine Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Mahindra 575 DI"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      name="machineType"
                      required
                      value={formData.machineType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                    >
                      <option value="MACHINE_TRACTOR">Tractor</option>
                      <option value="MACHINE_HARVESTER">Harvester</option>
                      <option value="MACHINE_SPRAYER">Sprayer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide details about attachments, condition, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Price per Day (₹) *</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    required
                    min="1"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">District *</label>
                    <input
                      type="text"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="e.g. Coimbatore"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Specific Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Pollachi Road"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 px-4 py-2 text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg font-medium transition flex justify-center items-center gap-2"
                >
                  {addLoading ? "Adding..." : "Add Machine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
