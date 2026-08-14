import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { BarChart3, TrendingUp, Package, IndianRupee } from "lucide-react";

export default function AgencyReports() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInquiries: 0,
    respondedInquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, inqRes] = await Promise.all([
        api.get("/dealer/my-products"),
        api.get("/inquiries")
      ]);
      
      const products = prodRes.data.products || [];
      const inquiries = inqRes.data.inquiries || [];
      
      setStats({
        totalProducts: products.length,
        totalInquiries: inquiries.length,
        respondedInquiries: inquiries.filter(i => i.status === "responded").length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales & Reports 📊</h1>
        <p className="text-gray-500 text-sm mt-1">Track your product engagement and inquiry conversion.</p>
      </div>

      {loading ? (
        <p className="p-10 text-center text-gray-500 text-sm">Loading reports...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Package size={28} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={28} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInquiries}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><BarChart3 size={28} /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Response Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalInquiries > 0 
                    ? Math.round((stats.respondedInquiries / stats.totalInquiries) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-700">Detailed Analytics Coming Soon</p>
            <p className="text-sm mt-1">Once the platform gathers more data, visual charts of your sales trends will appear here.</p>
          </div>
        </>
      )}
    </div>
  );
}
