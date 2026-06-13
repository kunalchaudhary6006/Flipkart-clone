import React, { useEffect, useState } from 'react';
import { Product, Order } from '../types';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '', description: '', originalPrice: '', sellingPrice: '', category: '', imageUrl: '', stock: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [ordersRes, productsRes] = await Promise.all([
      fetch('/api/orders').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]);
    setOrders(ordersRes);
    setProducts(productsRes);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      await fetch(`/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      alert("Product updated successfully");
      setEditingProductId(null);
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      alert("Product added successfully");
    }
    setNewProduct({ title: '', description: '', originalPrice: '', sellingPrice: '', category: '', imageUrl: '', stock: '' });
    fetchData();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product._id);
    setNewProduct({
      title: product.title,
      description: product.description,
      originalPrice: product.originalPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setNewProduct({ title: '', description: '', originalPrice: '', sellingPrice: '', category: '', imageUrl: '', stock: '' });
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchData();
  };

  const handleDeleteProduct = async (productId: string) => {
    if(confirm("Are you sure you want to delete this product?")) {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      fetchData();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'SecureAdmin@2026!') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-fk-gray flex items-center justify-center p-4 pt-[80px]">
        <div className="bg-white p-8 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] rounded-[2px] w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-fk-text">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Admin Password" 
              className="w-full border p-3 rounded-[2px] outline-none focus:border-fk-blue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-[#fb641b] text-white font-semibold py-3 rounded-[2px] shadow-sm cursor-pointer hover:bg-[#f35b13]">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalEarnings = orders.reduce((acc, order) => acc + order.totalValue, 0);

  return (
    <div className="min-h-screen bg-fk-gray pt-[80px] p-[12px] md:p-[20px]">
      <h1 className="text-[18px] font-bold text-fk-text mb-[12px]">Admin Dashboard</h1>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[8px] mb-[12px]">
        <div className="bg-white p-[12px] rounded-[2px] flex justify-between items-center shadow-fk">
          <div className="text-[11px] text-fk-secondary font-semibold uppercase">Total Orders</div>
          <div className="text-[18px] font-bold text-fk-blue">{orders.length}</div>
        </div>
        <div className="bg-white p-[12px] rounded-[2px] flex justify-between items-center shadow-fk">
          <div className="text-[11px] text-fk-secondary font-semibold uppercase">Gross Earnings</div>
          <div className="text-[18px] font-bold text-fk-blue">₹{totalEarnings.toLocaleString()}</div>
        </div>
        <div className="bg-white p-[12px] rounded-[2px] flex justify-between items-center shadow-fk">
          <div className="text-[11px] text-fk-secondary font-semibold uppercase">Total Products</div>
          <div className="text-[18px] font-bold text-fk-blue">{products.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Form */}
        <div className="bg-white p-6 shadow-sm rounded-sm lg:col-span-1 h-fit">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-lg font-bold text-[#212121]">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
            {editingProductId && (
              <button 
                type="button" 
                onClick={cancelEdit} 
                className="text-sm text-fk-secondary hover:text-[#ff6161]"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <input required placeholder="Title String" className="w-full border p-2 text-sm rounded-sm outline-none focus:border-[#2874f0]" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
            <textarea required placeholder="Description" className="w-full border p-2 text-sm rounded-sm outline-none focus:border-[#2874f0]" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            <div className="flex gap-2">
              <input required type="number" placeholder="Original Price" className="w-1/2 border p-2 text-sm rounded-sm outline-none focus:border-[#2874f0]" value={newProduct.originalPrice} onChange={e => setNewProduct({...newProduct, originalPrice: e.target.value})} />
              <input required type="number" placeholder="Sale Price" className="w-1/2 border p-2 text-sm rounded-sm outline-none focus:border-[#2874f0]" value={newProduct.sellingPrice} onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})} />
            </div>
            <select required className="w-full border p-2 text-sm rounded-sm outline-none focus:border-[#2874f0] bg-white cursor-pointer" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
              <option value="" disabled>Select Category</option>
              <option value="Grocery">Grocery</option>
              <option value="Mobiles">Mobiles</option>
              <option value="Fashion">Fashion</option>
              <option value="Electronics">Electronics</option>
              <option value="Home & Furniture">Home & Furniture</option>
              <option value="Appliances">Appliances</option>
              <option value="Travel">Travel</option>
              <option value="Beauty, Toys & More">Beauty, Toys & More</option>
            </select>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-fk-secondary">Product Image URL or Upload</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  required={!newProduct.imageUrl}
                  placeholder="Image URL" 
                  className="flex-1 border p-2 text-sm rounded-sm outline-none focus:border-[#2874f0]" 
                  value={newProduct.imageUrl.startsWith('data:image') ? 'Uploaded Image Selected' : newProduct.imageUrl} 
                  onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} 
                />
                <label className="bg-[#f0f0f0] text-fk-text px-4 py-2 text-sm font-semibold cursor-pointer border border-[#e0e0e0] rounded-[2px] hover:bg-[#e0e0e0]">
                  Upload File
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              {newProduct.imageUrl && (
                <div className="h-16 w-16 border border-[#e0e0e0] rounded-[2px] flex items-center justify-center p-1 bg-white">
                  <img src={newProduct.imageUrl} alt="preview" className="max-h-full max-w-full mix-blend-multiply" />
                </div>
              )}
            </div>

            <input required type="number" placeholder="Stock Availability" className="w-full border p-2 text-sm rounded-sm outline-none focus:border-[#2874f0]" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
            <button type="submit" className="w-full bg-[#2874f0] text-white font-semibold py-2 shadow-sm rounded-sm">
              {editingProductId ? 'Update Product' : 'Save Product'}
            </button>
          </form>
        </div>

        {/* Order Ledger */}
        <div className="bg-white p-6 shadow-sm rounded-sm lg:col-span-2 overflow-x-auto text-sm">
          <h2 className="text-lg font-bold text-[#212121] border-b pb-4 mb-4">Real-time Order Ledger</h2>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>ID / Date</th>
                <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Customer Info</th>
                <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Items</th>
                <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Total Value</th>
                <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>UTR Reference</th>
                <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="p-[8px] align-top border-b border-[#f9f9f9]">
                    <p className="font-mono text-fk-text">{order._id.slice(-6)}</p>
                    <p className="text-fk-secondary">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </td>
                  <td className="p-[8px] align-top border-b border-[#f9f9f9]">
                    <p className="font-semibold">{order.customerDetails.name}</p>
                    <p className="text-fk-secondary max-w-xs">{order.customerDetails.address}</p>
                  </td>
                  <td className="p-[8px] align-top border-b border-[#f9f9f9] max-w-[200px]">
                    <ul className="list-disc pl-4 text-fk-secondary">
                      {order.items?.map((item: any) => (
                        <li key={item.id} className="line-clamp-1">{item.title} ({item.quantity})</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-[8px] align-top font-semibold text-fk-text border-b border-[#f9f9f9]">
                    ₹{order.totalValue.toLocaleString()}
                  </td>
                  <td className="p-[8px] align-top border-b border-[#f9f9f9]">
                    <span className="font-mono bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded-[2px]">{order.utrTransactionId}</span>
                  </td>
                  <td className="p-[8px] align-top border-b border-[#f9f9f9]">
                    <select 
                      className="border rounded-[2px] p-1 text-[10px] uppercase font-semibold outline-none cursor-pointer bg-[#fff3e0] text-[#ef6c00] border-none"
                      value={order.orderStatus}
                      onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                    >
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Payment Accepted & Dispatched">Payment Accepted & Dispatched</option>
                      <option value="Order Cancelled">Order Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#878787]">No orders found in the ledger.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white p-6 shadow-sm rounded-sm mt-8 overflow-x-auto text-sm">
        <h2 className="text-lg font-bold text-[#212121] border-b pb-4 mb-4">Product Catalog</h2>
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Image</th>
              <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Product Details</th>
              <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Price</th>
              <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Stock</th>
              <th className="p-[8px] border-b border-[#f0f0f0] text-fk-secondary font-semibold" style={{textAlign: "left"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="p-[8px] align-top border-b border-[#f9f9f9] w-[60px]">
                  <div className="w-[40px] h-[40px] bg-[#f9f9f9] rounded flex items-center justify-center p-1">
                    <img src={product.imageUrl} alt={product.title} className="max-w-full max-h-full mix-blend-multiply" />
                  </div>
                </td>
                <td className="p-[8px] align-top border-b border-[#f9f9f9]">
                  <p className="font-semibold text-[13px] text-fk-blue line-clamp-1">{product.title}</p>
                  <p className="text-fk-secondary text-[11px] mt-1">Category: {product.category}</p>
                  <p className="text-fk-text text-[11px] line-clamp-1 mt-1">{product.description}</p>
                </td>
                <td className="p-[8px] align-top border-b border-[#f9f9f9]">
                  <span className="font-semibold text-fk-text">₹{product.sellingPrice.toLocaleString()}</span>
                  <div className="text-fk-secondary line-through text-[10px]">₹{product.originalPrice.toLocaleString()}</div>
                </td>
                <td className="p-[8px] align-top border-b border-[#f9f9f9]">
                  <span className={`font-semibold ${product.stock > 0 ? 'text-fk-green' : 'text-[#ff6161]'}`}>{product.stock > 0 ? product.stock : 'Out of Stock'}</span>
                </td>
                <td className="p-[8px] align-top border-b border-[#f9f9f9]">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="text-fk-blue hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-[#ff6161] hover:text-[#ff3b3b] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#878787]">No products found in the catalog.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
