import React from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { name: 'Grocery', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/29327f40e9c4d26b.png?q=100' },
  { name: 'Mobiles', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/22fddf3c7da4c4f4.png?q=100' },
  { name: 'Fashion', icon: 'https://rukminim1.flixcart.com/fk-p-flap/128/128/image/0d75b34f7d8fbcb3.png?q=100' },
  { name: 'Electronics', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/69c6589653afdb9a.png?q=100' },
  { name: 'Home & Furniture', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/ab7e2b022a4587dd.jpg?q=100' },
  { name: 'Appliances', icon: 'https://rukminim1.flixcart.com/fk-p-flap/128/128/image/0139228b2f7eb413.jpg?q=100' },
  { name: 'Travel', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/71050627a56b4693.png?q=100' },
  { name: 'Beauty, Toys & More', icon: 'https://rukminim1.flixcart.com/flap/128/128/image/dff3f7adcf3a90c6.png?q=100' }
];

export default function CategoryRow() {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow-fk-nav flex justify-start lg:justify-center gap-[20px] lg:gap-[40px] items-center overflow-x-auto mt-[56px] px-4 py-3 shrink-0 no-scrollbar">
      {CATEGORIES.map((cat, idx) => (
        <div key={idx} onClick={() => navigate(`/?category=${encodeURIComponent(cat.name)}`)} className="flex flex-col items-center gap-2 cursor-pointer group hover:text-fk-blue transition-colors min-w-[64px] lg:min-w-[70px]">
          <div className="w-[64px] h-[64px] overflow-hidden flex items-center justify-center">
            <img 
              src={cat.icon} 
              alt={cat.name} 
              className="w-full h-full object-contain" 
            />
          </div>
          <span className="text-[14px] font-medium text-[#212121] group-hover:text-fk-blue text-center whitespace-nowrap">
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}
