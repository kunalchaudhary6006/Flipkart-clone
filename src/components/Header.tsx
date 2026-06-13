import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Store, ChevronDown } from 'lucide-react';
import { useCart } from '../CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Header() {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [localToken, setLocalToken] = useState(localStorage.getItem('user_token'));

  useEffect(() => {
    const handleStorage = () => setLocalToken(localStorage.getItem('user_token'));
    window.addEventListener('storage', handleStorage);
    window.addEventListener('userLogin', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userLogin', handleStorage);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <header className="bg-fk-blue h-[56px] flex items-center px-10 gap-[20px] fixed top-0 w-full z-50 shrink-0">
      {/* Left Logo */}
      <Link to="/" className="flex flex-col items-end pt-1">
        <span className="text-white font-bold italic text-[20px] tracking-tight leading-none">
          Flipkart
        </span>
        <span className="text-fk-yellow text-[11px] font-semibold italic flex items-center gap-1">
          Explore <span className="text-fk-yellow">Plus</span>
          <span className="text-fk-yellow text-xs">✦</span>
        </span>
      </Link>

      {/* Center Search */}
      <form onSubmit={handleSearch} className="w-[560px] h-[36px] bg-white flex items-center rounded-[2px] overflow-hidden ml-5">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for products, brands and more" 
          className="h-full flex-grow px-3 text-[14px] text-fk-text outline-none border-none"
        />
        <button type="submit" className="px-3 text-fk-blue flex items-center justify-center cursor-pointer">
          <Search size={18} className="stroke-[2.5px]" />
        </button>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-[32px] ml-auto text-white text-[16px] font-semibold">
        {user || localToken ? (
          <button onClick={() => navigate('/account')} className="bg-white text-fk-blue px-[30px] py-[6px] rounded-[2px] leading-none font-semibold cursor-pointer">
            {user?.displayName ? user.displayName.split(' ')[0] : (localStorage.getItem('user_name') || 'My Account')}
          </button>
        ) : (
          <button onClick={() => navigate('/login')} className="bg-white text-fk-blue px-[30px] py-[6px] rounded-[2px] leading-none font-semibold cursor-pointer">
            Login
          </button>
        )}
        
        <button onClick={() => navigate('/admin')} className="flex items-center hover:text-gray-100 transition-colors shrink-0 cursor-pointer">
          Become a Seller
        </button>

        <button onClick={() => alert("More menu expanding!")} className="flex items-center gap-1 hover:text-gray-100 transition-colors shrink-0 cursor-pointer">
          More <ChevronDown size={16} className="mt-1" />
        </button>
        
        <Link to="/checkout" className="flex items-center tracking-tight font-semibold gap-2 hover:text-gray-100 transition-colors">
          <div className="relative">
            <ShoppingCart size={20} className="stroke-[2.5px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#ff6161] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none font-bold border border-fk-blue">
                {cartCount}
              </span>
            )}
          </div>
          Cart
        </Link>
      </div>
    </header>
  );
}
