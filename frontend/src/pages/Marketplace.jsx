import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { ShoppingBag, Search, PhoneCall } from 'lucide-react';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.products || res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-green-800 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-green-600" />
            Agricultural Marketplace
          </h2>
          <p className="text-gray-600 mt-2">Find seeds, fertilizers, and tools from trusted local dealers.</p>
        </div>
        <div className="mt-4 md:mt-0 relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading products...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-3">
                {product.category}
              </span>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="text-2xl font-bold text-green-600 mb-4">₹{product.price}</div>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Sold by: {product.dealerId?.name || 'Local Dealer'}</p>
                <a 
                  href={`tel:${product.contactNumber}`}
                  className="w-full bg-green-50 text-green-700 font-medium py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-green-100 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  Contact Dealer
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No products found matching your search.
        </div>
      )}
    </div>
  );
}
