import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Plus } from 'lucide-react';

export default function DealerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', category: 'Seeds', price: '', description: '', contactNumber: ''
  });

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      // Simulate auth token
      const token = localStorage.getItem('token') || 'dummy-token';
      const res = await fetch('http://localhost:5000/api/dealer/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || 'dummy-token';
    try {
      const res = await fetch('http://localhost:5000/api/dealer/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setProducts([data.product, ...products]);
        setFormData({ name: '', category: 'Seeds', price: '', description: '', contactNumber: '' });
      }
    } catch (err) {
      console.error(err);
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
              <option>Seeds</option>
              <option>Fertilizer</option>
              <option>Pesticide</option>
              <option>Tools</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input required type="number" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input required type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
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
              <div key={p._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <span className="self-start px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded mb-2">{p.category}</span>
                <h4 className="font-bold text-lg">{p.name}</h4>
                <p className="text-gray-500 text-sm mb-3 flex-grow">{p.description}</p>
                <div className="text-xl font-bold text-gray-800">₹{p.price}</div>
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
