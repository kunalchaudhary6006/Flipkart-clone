import React from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { name: 'Grocery', icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&q=80' },
  { name: 'Mobiles', icon: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop&q=80' },
  { name: 'Fashion', icon: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&q=80' },
  { name: 'Electronics', icon: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop&q=80' },
  { name: 'Home & Furniture', icon: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop&q=80' },
  { name: 'Appliances', icon: 'https://images.unsplash.com/photo-1584346808018-da1d6dc771ea?w=100&h=100&fit=crop&q=80' },
  { name: 'Travel', icon: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=100&fit=crop&q=80' },
  { name: 'Beauty, Toys & More', icon: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=100&h=100&fit=crop&q=80' }
];

export default function CategoryRow() {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow-fk-nav h-[54px] flex justify-center gap-[40px] items-center overflow-x-auto mt-[56px] shrink-0">
      {CATEGORIES.map((cat, idx) => (
        <div key={idx} onClick={() => navigate(`/?category=${encodeURIComponent(cat.name)}`)} className="flex flex-col items-center gap-1 cursor-pointer group hover:text-fk-blue transition-colors">
          <div className="w-[20px] h-[20px] overflow-hidden bg-[#eee] rounded-[4px] relative">
            <img 
              src={cat.icon} 
              alt={cat.name} 
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80" 
            />
          </div>
          <span className="text-[12px] font-semibold text-fk-text group-hover:text-fk-blue text-center whitespace-nowrap">
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}
