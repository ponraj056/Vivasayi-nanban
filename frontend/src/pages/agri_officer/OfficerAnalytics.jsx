import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { PieChart, Activity, Map, Search } from "lucide-react";

export default function OfficerAnalytics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDistrict, setSearchDistrict] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/disease/reports");
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.farmerId?.farmerProfile?.district?.toLowerCase().includes(searchDistrict.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Disease Analytics 📈</h1>
          <p className="text-gray-500 text-sm mt-1">Track crop diseases and AI detection reports across districts.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter by District..."
            value={searchDistrict}
            onChange={(e) => setSearchDistrict(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Activity size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><PieChart size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Confidence</p>
            <p className="text-2xl font-bold text-gray-900">
              {reports.length > 0 ? (reports.reduce((acc, r) => acc + r.confidence, 0) / reports.length * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Map size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Districts Affected</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(reports.map(r => r.farmerId?.farmerProfile?.district).filter(Boolean)).size}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">Recent Scans</div>
        {loading ? (
          <p className="p-10 text-center text-gray-500 text-sm">Loading analytics...</p>
        ) : filteredReports.length === 0 ? (
          <p className="p-10 text-center text-gray-500 text-sm">No disease reports found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Farmer</th>
                  <th className="px-6 py-3">District</th>
                  <th className="px-6 py-3">Detected Disease</th>
                  <th className="px-6 py-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{r.farmerId?.name || "Unknown"}</td>
                    <td className="px-6 py-4">{r.farmerId?.farmerProfile?.district || "N/A"}</td>
                    <td className="px-6 py-4 text-orange-600 font-medium">{r.diseaseName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${r.confidence * 100}%` }}></div>
                        </div>
                        <span className="text-xs">{(r.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
