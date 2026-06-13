import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Account() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const { user, userData, updateProfileDetails, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('orders');
  
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  
  const [localName, setLocalName] = useState(localStorage.getItem('user_name') || '');
  const [localPhone, setLocalPhone] = useState(localStorage.getItem('user_phone') || '');
  const [localAddress, setLocalAddress] = useState(localStorage.getItem('user_address') || '');
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    fetch('/api/orders')
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Oops, we haven't got JSON!");
        }
        return res.json();
      })
      .then(data => setOrders(data))
      .catch(err => {
        console.error('Fetch failed, using mock data:', err);
        import('../data/mockData').then(mod => {
          setOrders(mod.fallbackOrders);
        });
      });
      
    const handleStorage = () => {
      setLocalName(localStorage.getItem('user_name') || '');
      setLocalPhone(localStorage.getItem('user_phone') || '');
      setLocalAddress(localStorage.getItem('user_address') || '');
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('userLogin', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userLogin', handleStorage);
    };
  }, []);

  useEffect(() => {
    setNewName(userData?.name || user?.displayName || localName || '');
    setNewPhone(userData?.phone || localPhone || '');
    setNewAddress(userData?.address || localAddress || '');
  }, [userData, user, localName, localPhone, localAddress]);

  const handleSaveName = async () => {
    if (newName.trim()) {
      await updateProfileDetails({ name: newName.trim() });
      setEditingName(false);
    }
  };

  const handleSavePhone = async () => {
    if (newPhone.trim()) {
      await updateProfileDetails({ phone: newPhone.trim() });
      setEditingPhone(false);
    }
  };

  const handleSaveAddress = async () => {
    if (newAddress.trim()) {
      await updateProfileDetails({ address: newAddress.trim() });
      setEditingAddress(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_address');
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('userLogin'));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-fk-gray pt-[80px] px-4 md:px-20 lg:px-32 flex flex-col md:flex-row gap-4 pb-20">
      {/* Sidebar */}
      <div className="w-full md:w-[250px] shrink-0 space-y-4">
        <div className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] rounded-[2px] p-4 flex items-center gap-4">
          <div className="w-[50px] h-[50px] rounded-full bg-blue-100 flex items-center justify-center text-fk-blue font-bold text-xl">
            {userData?.name ? userData.name.charAt(0).toUpperCase() : (user?.displayName ? user.displayName.charAt(0).toUpperCase() : (localName ? localName.charAt(0).toUpperCase() : 'U'))}
          </div>
          <div>
            <div className="text-[12px] text-fk-secondary">Hello,</div>
            <div className="font-semibold text-fk-text lg:text-lg truncate max-w-[150px]">{userData?.name || user?.displayName || localName || 'User'}</div>
          </div>
        </div>

        <div className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] rounded-[2px] overflow-hidden">
          <div className="p-4 border-b border-[#f0f0f0] font-semibold text-fk-secondary uppercase text-[14px]">
            Account Settings
          </div>
          <div className={`p-4 border-b border-[#f0f0f0] text-[14px] cursor-pointer font-semibold ${activeTab === 'profile' ? 'bg-[#f5faff] text-fk-blue' : 'text-fk-text hover:text-fk-blue'}`} onClick={() => setActiveTab('profile')}>
            Profile Information
          </div>
          <div className={`p-4 border-b border-[#f0f0f0] text-[14px] cursor-pointer font-semibold ${activeTab === 'addresses' ? 'bg-[#f5faff] text-fk-blue' : 'text-fk-text hover:text-fk-blue'}`} onClick={() => setActiveTab('addresses')}>
            Manage Addresses
          </div>
          <div className={`p-4 border-b border-[#f0f0f0] text-[14px] cursor-pointer font-semibold ${activeTab === 'orders' ? 'bg-[#f5faff] text-fk-blue' : 'text-fk-text hover:text-fk-blue'}`} onClick={() => setActiveTab('orders')}>
            My Orders
          </div>
          <div className="p-4 text-[14px] text-[#ff6161] hover:text-[#ff3b3b] font-semibold cursor-pointer border-t-[4px] border-[#f1f3f6] flex items-center gap-2" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] rounded-[2px] p-6 h-fit">
        {activeTab === 'orders' ? (
          <>
            <h2 className="text-xl font-bold mb-6 text-fk-text">My Orders</h2>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-fk-secondary flex flex-col items-center">
                  <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/empty-orders_e98f8c.png" alt="No Orders" className="w-32 mb-4 opacity-70" />
                  <p className="text-lg font-semibold">No orders placed yet!</p>
                  <button onClick={() => navigate('/')} className="mt-4 bg-fk-blue text-white px-6 py-2 rounded-[2px] font-semibold">Shop Now</button>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id} className="border border-[#f0f0f0] rounded-[4px] hover:shadow-fk transition-shadow">
                    <div className="p-4 flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-[14px]">Order ID: {order._id.slice(-8).toUpperCase()}</span>
                        <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-1 rounded-[2px]">
                          {order.orderStatus}
                        </span>
                      </div>
                      
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 mt-4 border-t border-[#f0f0f0] pt-4" onClick={() => navigate(`/product/${item._id}`)}>
                          <div className="w-16 h-16 shrink-0 bg-[#f9f9f9] rounded p-1 flex items-center justify-center cursor-pointer">
                            <img src={item.imageUrl} alt={item.title} className="max-w-full max-h-full mix-blend-multiply" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[14px] font-medium text-fk-text line-clamp-1 hover:text-fk-blue cursor-pointer">{item.title}</h4>
                            <div className="text-[12px] text-fk-secondary mt-1">Quantity: {item.quantity}</div>
                            <div className="text-[14px] font-semibold mt-1">₹{item.sellingPrice.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-[12px] text-fk-secondary mt-4 border-t border-[#f0f0f0] pt-2">
                        Ordered on: {new Date(order.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    
                    <div className="md:w-[200px] md:border-l border-[#f0f0f0] md:pl-4 flex flex-col justify-center gap-2">
                      <div className="text-[12px] text-fk-secondary">Delivered to:</div>
                      <div className="text-[14px] font-medium">{order.customerDetails.name}</div>
                      <div className="text-[12px] text-fk-secondary truncate">{order.customerDetails.address}</div>
                      <div className="mt-4 bg-[#f9f9f9] p-2 rounded-[2px] text-center border border-[#e0e0e0]">
                        <div className="text-[11px] text-fk-secondary uppercase font-semibold">Total Paid</div>
                        <div className="text-lg font-bold text-fk-text">₹{order.totalValue.toLocaleString()}</div>
                      </div>
                      <button 
                         onClick={() => setTrackingOrderId(trackingOrderId === order._id ? null : order._id)}
                         className="text-fk-blue font-semibold text-[14px] mt-2 flex justify-center items-center gap-1 hover:underline cursor-pointer"
                      >
                        {trackingOrderId === order._id ? 'Hide Tracker' : 'Track Order'}
                      </button>
                    </div>
                  </div>
                  {trackingOrderId === order._id && (
                     <div className="border-t border-[#f0f0f0] mt-4 pt-6 px-4 pb-4">
                        <div className="font-semibold text-[15px] mb-6">Order Tracking</div>
                        <div className="relative flex justify-between items-center max-w-2xl mx-auto w-full">
                           <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#f0f0f0] -translate-y-1/2 z-0"></div>
                           <div className="absolute top-1/2 left-0 h-[2px] bg-[#26a541] -translate-y-1/2 z-0 transition-all duration-500" style={{width: order.orderStatus === 'Delivered' ? '100%' : order.orderStatus === 'Shipped' ? '50%' : '10%'}}></div>
                           
                           <div className="relative z-10 flex flex-col items-center gap-2">
                             <div className="w-4 h-4 rounded-full bg-[#26a541] outline outline-2 outline-white"></div>
                             <div className="text-[12px] font-semibold text-fk-text">Ordered</div>
                             <div className="text-[10px] text-fk-secondary">{new Date(order.orderDate).toLocaleDateString()}</div>
                           </div>

                           <div className="relative z-10 flex flex-col items-center gap-2">
                             <div className={`w-4 h-4 rounded-full outline outline-2 outline-white ${order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' ? 'bg-[#26a541]' : 'bg-[#f0f0f0]'}`}></div>
                             <div className={`text-[12px] font-semibold ${order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' ? 'text-fk-text' : 'text-fk-secondary'}`}>Shipped</div>
                             <div className="text-[10px] text-fk-secondary">Expected soon</div>
                           </div>

                           <div className="relative z-10 flex flex-col items-center gap-2">
                             <div className={`w-4 h-4 rounded-full outline outline-2 outline-white ${order.orderStatus === 'Delivered' ? 'bg-[#26a541]' : 'bg-[#f0f0f0]'}`}></div>
                             <div className={`text-[12px] font-semibold ${order.orderStatus === 'Delivered' ? 'text-fk-text' : 'text-fk-secondary'}`}>Delivered</div>
                             <div className="text-[10px] text-fk-secondary">Expected {new Date(new Date(order.orderDate).getTime() + 3*24*60*60*1000).toLocaleDateString()}</div>
                           </div>
                        </div>
                     </div>
                  )}
                </div>
                ))
              )}
            </div>
          </>
        ) : activeTab === 'profile' ? (
          <>
            <h2 className="text-xl font-bold mb-6 text-fk-text">Profile Information</h2>
            <div className="max-w-sm space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-fk-secondary">Personal Information</label>
                  {!editingName ? (
                    <button className="text-fk-blue text-sm font-semibold hover:underline" onClick={() => setEditingName(true)}>Edit</button>
                  ) : (
                    <button className="text-fk-blue text-sm font-semibold hover:underline" onClick={handleSaveName}>Save</button>
                  )}
                </div>
                {editingName ? (
                   <input type="text" className="w-full border border-[#e0e0e0] p-3 outline-none focus:border-fk-blue rounded-sm" value={newName} onChange={e => setNewName(e.target.value)} />
                ) : (
                   <input type="text" className="w-full border border-[#e0e0e0] p-3 rounded-sm bg-gray-50 text-fk-secondary cursor-not-allowed" value={userData?.name || user?.displayName || localName || ''} disabled />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-fk-secondary">Email Address</label>
                <input type="email" className="w-full border border-[#e0e0e0] p-3 rounded-sm bg-gray-50 text-fk-secondary cursor-not-allowed" value={userData?.email || user?.email || localStorage.getItem('user_token') || ''} disabled />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-fk-secondary">Mobile Number</label>
                  {!editingPhone ? (
                    <button className="text-fk-blue text-sm font-semibold hover:underline" onClick={() => setEditingPhone(true)}>Edit</button>
                  ) : (
                    <button className="text-fk-blue text-sm font-semibold hover:underline" onClick={handleSavePhone}>Save</button>
                  )}
                </div>
                {editingPhone ? (
                   <input type="text" className="w-full border border-[#e0e0e0] p-3 outline-none focus:border-fk-blue rounded-sm" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="E.g. +91 9876543210" />
                ) : (
                   <input type="text" className="w-full border border-[#e0e0e0] p-3 rounded-sm bg-gray-50 text-fk-secondary cursor-not-allowed" value={userData?.phone || localPhone || ''} placeholder="Not provided" disabled />
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-6 text-fk-text">Manage Addresses</h2>
            <div className="space-y-6">
              <div className="border border-[#e0e0e0] rounded-sm p-5 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#f0f0f0] text-fk-secondary text-[10px] uppercase font-bold px-2 py-1 rounded-sm tracking-wider">Default</div>
                  {!editingAddress ? (
                    <button className="text-fk-blue text-sm font-semibold hover:underline" onClick={() => setEditingAddress(true)}>Edit</button>
                  ) : (
                    <button className="text-fk-blue text-sm font-semibold hover:underline" onClick={handleSaveAddress}>Save</button>
                  )}
                </div>
                {editingAddress ? (
                   <textarea rows={3} className="w-full border border-[#e0e0e0] p-3 outline-none focus:border-fk-blue rounded-sm resize-none" value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Enter full address..." />
                ) : (
                   <div className="text-fk-text text-[14px]">
                     <span className="font-semibold">{userData?.name || user?.displayName || localName || 'User'}</span>
                     <span className="ml-4 font-semibold">{userData?.phone || localPhone || ''}</span>
                     <p className="mt-2 text-fk-secondary leading-relaxed">
                       {userData?.address || localAddress || 'No address provided. Click edit to add your delivery address.'}
                     </p>
                   </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
