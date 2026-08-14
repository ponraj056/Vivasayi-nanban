import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { MessageSquare, Package, CheckCircle, Clock } from "lucide-react";

export default function AgencyOrders() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await api.get("/inquiries");
      setInquiries(res.data.inquiries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id) => {
    try {
      await api.patch(`/inquiries/${id}/respond`, { status: "responded" });
      fetchInquiries();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Inquiries 📦</h1>
        <p className="text-gray-500 text-sm mt-1">Manage product inquiries and orders from farmers.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-10 text-center text-gray-500 text-sm">Loading inquiries...</p>
        ) : inquiries.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center text-gray-500">
            <MessageSquare size={48} className="mb-4 text-gray-300" />
            <p>No customer inquiries found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {inquiries.map((inq) => (
              <div key={inq._id} className="p-5 hover:bg-gray-50 transition flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
                      {inq.status === "open" ? "New Request" : "Responded"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package size={16} className="text-gray-400" /> 
                    {inq.productId?.name || "Deleted Product"} 
                    <span className="text-sm font-normal text-gray-500">(₹{inq.productId?.price})</span>
                  </h3>
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 italic">
                    "{inq.message}"
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[250px] flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Details</p>
                    <p className="font-medium text-gray-900">{inq.farmerId?.name}</p>
                    <p className="text-sm text-gray-500">{inq.farmerId?.phone}</p>
                  </div>
                  
                  {inq.status === "open" ? (
                    <button 
                      onClick={() => handleRespond(inq._id)}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={16} /> Mark as Responded
                    </button>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium justify-center bg-green-50 py-2 rounded-lg border border-green-100">
                      <CheckCircle size={16} /> Handled
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
