import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { Package, CheckCircle } from "lucide-react";

export default function AgencyOrders() {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/inquiries"); // Reused endpoint for orders
      setOrderItems(res.data.inquiries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (orderId) => {
    try {
      await api.patch(`/inquiries/${orderId}/respond`, { status: "approved" });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Orders 📦</h1>
        <p className="text-gray-500 text-sm mt-1">Manage incoming product orders from farmers.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-10 text-center text-gray-500 text-sm">Loading orders...</p>
        ) : orderItems.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center text-gray-500">
            <Package size={48} className="mb-4 text-gray-300" />
            <p>No customer orders found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orderItems.map((item) => (
              <div key={item.id} className="p-5 hover:bg-gray-50 transition flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.order?.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {item.order?.status === "pending" ? "New Order" : "Approved"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.order?.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package size={16} className="text-gray-400" /> 
                    {item.product?.name || "Deleted Product"} 
                    <span className="text-sm font-normal text-gray-500">(₹{item.unit_price})</span>
                  </h3>
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700">
                    <p><strong>Quantity:</strong> {item.quantity}</p>
                    <p><strong>Total Subtotal:</strong> ₹{item.subtotal}</p>
                    <p className="mt-2"><strong>Delivery Address:</strong> {item.order?.delivery_address}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[250px] flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Details</p>
                    <p className="font-medium text-gray-900">{item.order?.farmer?.name}</p>
                    <p className="text-sm text-gray-500">{item.order?.phone || item.order?.farmer?.phone}</p>
                  </div>
                  
                  {item.order?.status === "pending" ? (
                    <button 
                      onClick={() => handleRespond(item.order_id)}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex justify-center items-center gap-2"
                    >
                      <CheckCircle size={16} /> Accept Order
                    </button>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium justify-center bg-green-50 py-2 rounded-lg border border-green-100">
                      <CheckCircle size={16} /> Approved
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
