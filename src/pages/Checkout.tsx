import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [activeStep, setActiveStep] = useState(2); // Start at Delivery Address assuming logged in
  const [address, setAddress] = useState({ 
    name: userData?.name || user?.displayName || localStorage.getItem('user_name') || '', 
    phone: userData?.phone || localStorage.getItem('user_phone') || '', 
    address: userData?.address || localStorage.getItem('user_address') || '' 
  });

  useEffect(() => {
    setAddress(prev => ({
        name: userData?.name || user?.displayName || localStorage.getItem('user_name') || prev.name,
        phone: userData?.phone || localStorage.getItem('user_phone') || prev.phone,
        address: userData?.address || localStorage.getItem('user_address') || prev.address
    }));
  }, [user, userData]);

  const [utr, setUtr] = useState('');
  const [paymentExpanded, setPaymentExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<{ utr: string, total: number } | null>(null);

  const steps = [
    { num: 1, title: 'LOGIN DETAILS', done: true },
    { num: 2, title: 'DELIVERY ADDRESS', done: activeStep > 2 },
    { num: 3, title: 'ORDER SUMMARY', done: activeStep > 3 },
    { num: 4, title: 'PAYMENT OPTIONS', done: false },
  ];

  const handleCheckout = async () => {
    if (!utr || utr.length !== 12) {
      alert("Please enter a valid 12-digit UTR.");
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        customerDetails: address,
        items: cartItems,
        totalValue: cartTotal,
        utrTransactionId: utr
      };
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (res.ok) {
        setPlacedOrderDetails({ utr, total: cartTotal });
        clearCart();
      } else {
        alert('Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  if (placedOrderDetails) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] pt-[80px] px-4 md:px-20 lg:px-[80px] pb-20 flex justify-center">
        <div className="bg-white p-10 w-full max-w-3xl shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] rounded-[2px] text-center flex flex-col items-center">
          <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/order_placed_0cfa73.png" alt="Success" className="w-[140px] mb-6" />
          <h2 className="text-2xl font-semibold text-[#212121] mb-2">Order placed for ₹{placedOrderDetails.total.toLocaleString()}!</h2>
          <p className="text-[15px] text-[#878787] mb-2">UTR Reference: <span className="font-semibold text-[#212121]">{placedOrderDetails.utr}</span></p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#388e3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span className="text-[15px] font-semibold text-[#388e3c]">Delivery by {new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</span>
          </div>
          <div className="text-[14px] text-[#212121] mb-8 text-center bg-[#f5faff] p-4 rounded border border-[#e0e0e0] max-w-lg mx-auto leading-relaxed">
             Your order will be confirmed once payment is verified. Verification usually takes 5-10 minutes. An email confirmation has been sent to you.
          </div>
          <button onClick={() => navigate('/account')} className="bg-[#2874f0] text-white px-10 py-3.5 rounded-[2px] font-semibold text-[15px] shadow-sm hover:bg-[#1a5bbb] cursor-pointer">View My Orders</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] pt-20 px-8 flex justify-center">
        <div className="bg-white p-8 w-full max-w-4xl shadow-sm rounded-sm text-center">
          <h2 className="text-xl font-medium mb-4">Your cart is empty!</h2>
          <button onClick={() => navigate('/')} className="bg-[#2874f0] text-white px-8 py-2 rounded-sm">Shop Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fk-gray pt-[80px] px-4 md:px-20 lg:px-[80px] flex flex-col lg:flex-row gap-[12px] pb-20">
      <div className="flex-grow flex flex-col gap-[16px]">
        {/* Accordions */}
        {steps.map(step => (
          <div key={step.num} className="bg-white shadow-sm rounded-sm overflow-hidden flex flex-col">
            <div 
              className={`p-[16px] flex items-center gap-[12px] ${activeStep === step.num ? 'bg-fk-blue text-white' : 'bg-white text-[#878787]'}`}
            >
              <div className="flex items-center gap-[12px] w-full">
                <span className={`w-[20px] h-[20px] flex items-center justify-center text-[12px] rounded-[2px] font-semibold ${activeStep === step.num ? 'bg-white text-fk-blue' : 'bg-[#f0f0f0] text-fk-blue'}`}>
                  {step.num}
                </span>
                <div className="flex flex-col">
                  <span className={`font-semibold text-[16px] ${activeStep === step.num ? '' : 'text-[#878787]'}`}>
                    {step.title}
                  </span>
                  {activeStep !== step.num && step.done && (
                    <span className="text-[14px] font-medium text-fk-text mt-1 mt-0.5">
                      {step.num === 1 ? `+91 ${address.phone}` : 
                       step.num === 2 ? address.address.slice(0, 40) + '...' : 
                       step.num === 3 ? `${cartItems.length} Items` : ''}
                    </span>
                  )}
                </div>
                {step.done && activeStep !== step.num && <span className="ml-auto text-fk-blue font-semibold text-[14px] cursor-pointer hover:underline" onClick={() => setActiveStep(step.num)}>CHANGE</span>}
              </div>
            </div>

            {/* Content for active step */}
            {activeStep === step.num && (
              <div className="p-[16px] flex-1">
                {step.num === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[14px]">
                       <span className="font-semibold text-fk-text">{address.name || user?.displayName || localStorage.getItem('user_name') || 'User'}</span>
                       <span className="font-medium text-fk-text">+91 {address.phone}</span>
                    </div>
                    <button 
                      onClick={() => setActiveStep(2)}
                      className="mt-[16px] bg-[#fb641b] text-white font-semibold px-[24px] py-[14px] rounded-[2px] text-[16px] min-w-[200px] cursor-pointer"
                    >
                      CONTINUE CHECKOUT
                    </button>
                    <div 
                      className="text-[14px] text-fk-blue font-medium mt-4 cursor-pointer"
                      onClick={async () => {
                        const { logoutUser } = await import('../firebase');
                        await logoutUser();
                        localStorage.removeItem('user_token');
                        localStorage.removeItem('user_name');
                        localStorage.removeItem('user_phone');
                        localStorage.removeItem('user_address');
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new Event('userLogin'));
                        navigate('/login');
                      }}
                    >
                      Logout & Sign in to another account
                    </div>
                  </div>
                )}
                
                {step.num === 2 && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={address.name} 
                        onChange={(e) => setAddress({...address, name: e.target.value})}
                        placeholder="Name"
                        className="w-full border border-[#e0e0e0] p-[8px] text-[14px] bg-white outline-none focus:border-fk-blue"
                      />
                      <input 
                        type="text" 
                        value={address.phone} 
                        onChange={(e) => setAddress({...address, phone: e.target.value})}
                        placeholder="10-digit mobile number"
                        className="w-full border border-[#e0e0e0] p-[8px] text-[14px] bg-white outline-none focus:border-fk-blue"
                      />
                    </div>
                    <textarea 
                      value={address.address} 
                      onChange={(e) => setAddress({...address, address: e.target.value})}
                      placeholder="Address (Area and Street)"
                      rows={3}
                      className="w-full border border-[#e0e0e0] p-[8px] text-[14px] bg-white outline-none focus:border-fk-blue resize-none"
                    ></textarea>
                    <button 
                      onClick={() => setActiveStep(3)}
                      className="mt-[16px] bg-[#fb641b] text-white font-semibold px-[24px] py-[14px] rounded-[2px] text-[16px] min-w-[200px] cursor-pointer"
                    >
                      DELIVER HERE
                    </button>
                  </div>
                )}
                
                {step.num === 3 && (
                  <div>
                    {cartItems.map(item => (
                      <div key={item._id} className="flex flex-col md:flex-row gap-6 border-b border-[#f0f0f0] pb-6 mb-6">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-28 w-28 p-2 flex items-center justify-center">
                            <img src={item.imageUrl} alt={item.title} className="max-h-full max-w-full mix-blend-multiply" />
                          </div>
                          <div className="flex items-center gap-4">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-7 h-7 rounded-full border border-[#e0e0e0] flex items-center justify-center font-semibold text-xl hover:bg-gray-100 cursor-pointer text-[#212121] leading-none pb-1 disabled:opacity-50" disabled={item.quantity <= 1}>-</button>
                            <span className="w-10 h-7 border border-[#e0e0e0] flex items-center justify-center text-sm font-semibold bg-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-7 h-7 rounded-full border border-[#e0e0e0] flex items-center justify-center font-semibold text-xl hover:bg-gray-100 cursor-pointer text-[#212121] leading-none pb-1">+</button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base text-[#212121] hover:text-[#2874f0] cursor-pointer mb-2 font-medium line-clamp-1">{item.title}</h3>
                          <div className="text-[13px] text-[#878787] mb-4">Seller: RetailNet <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" className="w-[55px] inline-block ml-1" alt="f-assured" /></div>
                          <div className="flex items-center gap-3 mb-4">
                             <div className="text-[#878787] text-sm line-through">₹{(item.originalPrice * item.quantity).toLocaleString()}</div>
                             <div className="text-xl font-bold text-[#212121]">₹{(item.sellingPrice * item.quantity).toLocaleString()}</div>
                             <div className="text-[#388e3c] text-sm font-semibold">{Math.round(((item.originalPrice - item.sellingPrice) / item.originalPrice) * 100)}% Off</div>
                             <div className="text-sm text-[#388e3c] font-semibold ml-4">1 offer applied <span className="text-[#878787] border border-[#e0e0e0] rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] cursor-pointer hover:bg-gray-50 ml-1">i</span></div>
                          </div>
                          <button onClick={() => removeFromCart(item._id)} className="text-[#212121] uppercase text-[15px] font-semibold hover:text-[#2874f0] cursor-pointer tracking-tight">Remove</button>
                        </div>
                        <div className="text-sm md:w-[200px]">
                            Delivery by <span className="font-semibold">{new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric'})}</span> | <span className="text-[#388e3c]">Free</span>
                            <div className="text-xs text-[#878787] mt-1">₹40 fee applies normally</div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm font-semibold mt-4 sticky bottom-0 bg-white py-4 border-t border-[#f0f0f0] shadow-[0_-2px_6px_-2px_rgba(0,0,0,0.1)] -mx-4 px-4 z-10">
                      <span>Order Confirmation email will be sent to your email.</span>
                      <button 
                        onClick={() => setActiveStep(4)}
                        className="bg-[#fb641b] text-white font-semibold px-12 py-3 rounded-[2px] shadow hover:bg-[#f35b13] cursor-pointer tracking-wide"
                      >
                        CONTINUE
                      </button>
                    </div>
                  </div>
                )}

                {step.num === 4 && (
                  <div className="space-y-4">
                    <div className="border rounded-sm">
                      <div 
                        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 bg-[#f5faff] border-b"
                        onClick={() => setPaymentExpanded(true)}
                      >
                        <input type="radio" checked={paymentExpanded} readOnly className="w-4 h-4 text-[#2874f0]" />
                        <span className="font-semibold text-fk-text text-[14px]">UPI / Dynamic QR Payment</span>
                      </div>
                      
                      {paymentExpanded && (
                        <div className="p-[16px] bg-white border-t border-[#e0e0e0]">
                          <div className="border border-[#e0e0e0] p-[16px] rounded-[2px] bg-[#f9f9f9] mt-[12px]">
                            <div className="text-[12px] font-semibold text-fk-secondary">MERCHANT UPI ID</div>
                            <div className="text-[16px] font-bold mt-[4px]">rudrapratap.singh01@ptyes</div>
                            
                            <div className="w-[120px] h-[120px] border-2 border-[#ccc] mx-auto mt-[12px] bg-white flex items-center justify-center relative p-1">
                              <img className="w-full h-full mix-blend-multiply" src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=rudrapratap.singh01@ptyes&pn=FlipkartClone&am=${cartTotal}&cu=INR`} alt="QR" />
                            </div>

                            <input 
                              type="text" 
                              maxLength={12}
                              value={utr}
                              onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                              placeholder="Enter 12-Digit UPI Ref No. / UTR"
                              className="w-full border border-[#e0e0e0] p-[8px] mt-[12px] text-[14px] bg-white outline-none focus:border-fk-blue"
                            />
                            
                            <button 
                              onClick={handleCheckout}
                              disabled={loading || utr.length < 12}
                              className="w-full mt-[16px] bg-[#fb641b] disabled:bg-[#f9d7c8] text-white font-semibold py-[14px] text-[16px] rounded-[2px] border-none cursor-pointer"
                            >
                              {loading ? 'Processing...' : 'CONFIRM ORDER & VERIFY'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Price Details Sidebar */}
      <div className="w-full lg:w-[350px] bg-white shadow-sm rounded-sm h-fit sticky top-20">
        <h3 className="text-sm font-semibold text-[#878787] p-4 border-b">PRICE DETAILS</h3>
        <div className="p-4 space-y-4 text-[#212121]">
          <div className="flex justify-between text-sm">
            <span>Price ({cartItems.length} items)</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Charges</span>
            <span className="text-[#388e3c]">FREE</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-dashed pt-4">
            <span>Total Payable</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
