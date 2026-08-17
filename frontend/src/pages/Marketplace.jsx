import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Search, ShoppingCart, X, CheckCircle } from 'lucide-react';

export default function Marketplace() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderStatus, setOrderStatus] = useState(''); // 'ordering', 'success', 'error'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products'); // Assuming we mapped this in backend routes to getAllProducts
      if (res.data.success) {
        setProducts(res.data.products || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!selectedProduct) return;
    try {
      setOrderStatus('ordering');
      const payload = {
        agencyId: selectedProduct.agency_id,
        productId: selectedProduct.id,
        quantity: orderQuantity,
        unitPrice: selectedProduct.price,
        deliveryAddress: deliveryAddress
      };
      
      // Send to the inquiries endpoint (which we renamed logic to handle orders)
      const res = await api.post('/inquiries', payload);
      
      if (res.data.success) {
        setOrderStatus('success');
      } else {
        setOrderStatus('error');
      }
    } catch (error) {
      console.error(error);
      setOrderStatus('error');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-emerald-600" /> Vivasayi Marketplace
          </h1>
          <p className="text-gray-500 text-sm mt-1">Buy seeds, fertilizers, and tools directly from trusted dealers.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading products...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full capitalize">
                  {product.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  {product.district}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
              <p className="text-gray-500 text-sm mt-2 mb-4 flex-grow line-clamp-2">{product.description}</p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-2xl font-bold text-gray-900">₹{product.price} <span className="text-sm font-normal text-gray-500">/ {product.unit}</span></p>
                  <p className="text-xs text-gray-500 mt-1">Dealer: {product.agency?.name || 'Unknown'}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedProduct(product);
                    setOrderQuantity(1);
                    setOrderStatus('');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition flex items-center gap-2"
                >
                  <ShoppingCart size={18} /> Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Place Order</h3>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {orderStatus === 'success' ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h4>
                  <p className="text-gray-500 text-sm">Your order has been sent to {selectedProduct.agency?.name}. They will process it shortly.</p>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4">
                    <h4 className="font-semibold text-emerald-900">{selectedProduct.name}</h4>
                    <p className="text-emerald-700 text-sm">₹{selectedProduct.price} per {selectedProduct.unit}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity ({selectedProduct.unit}s)</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                      value={orderQuantity} 
                      onChange={(e) => setOrderQuantity(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <textarea 
                      rows="3"
                      placeholder="Enter full address..."
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                      value={deliveryAddress} 
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Total Amount:</span>
                    <span className="text-xl font-bold text-gray-900">₹{selectedProduct.price * orderQuantity}</span>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                      disabled={orderStatus === 'ordering'}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleOrder}
                      disabled={orderStatus === 'ordering' || !deliveryAddress}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                      {orderStatus === 'ordering' ? 'Placing...' : 'Confirm Order'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
