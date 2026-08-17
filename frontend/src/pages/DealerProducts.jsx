import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import { Package, Plus } from 'lucide-react';

export default function DealerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', category: 'seed', price: '', description: '', unit: 'kg', stock_quantity: '', district: ''
  });

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dealer/my-products');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/dealer/products', formData);
      if (res.data.success) {
        setProducts([res.data.product, ...products]);
        setFormData({ name: '', category: 'seed', price: '', description: '', unit: 'kg', stock_quantity: '', district: '' });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Add Product Form */}
      <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5" /> Add New Product
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="seed">Seeds</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="organic_fertilizer">Organic Fertilizer</option>
              <option value="bio_fertilizer">Bio Fertilizer</option>
              <option value="nutrient">Nutrient</option>
              <option value="plant_protection">Plant Protection</option>
              <option value="tool">Tools</option>
              <option value="irrigation">Irrigation</option>
              <option value="machinery">Machinery</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input required type="number" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit (e.g. kg, L)</label>
              <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
              <input required type="number" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full p-2 border border-gray-300 rounded-lg" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">
            List Product
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="col-span-1 md:col-span-2">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <Package className="w-6 h-6 text-blue-600" /> My Listed Products
        </h3>
        
        {loading ? (
          <p className="text-gray-500">Loading your products...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded capitalize">{p.category.replace('_', ' ')}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">{p.district}</span>
                </div>
                <h4 className="font-bold text-lg">{p.name}</h4>
                <p className="text-gray-500 text-sm mb-3 flex-grow">{p.description}</p>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-xl font-bold text-gray-800">₹{p.price} <span className="text-sm font-normal text-gray-500">/ {p.unit}</span></div>
                  <div className="text-sm text-gray-500">Stock: <span className="font-semibold text-gray-800">{p.stock_quantity}</span></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 p-8 text-center rounded-xl border border-blue-100 text-blue-800">
            You haven't listed any products yet. Fill out the form to add your first product to the marketplace!
          </div>
        )}
      </div>
    </div>
  );
}
