import React, { useEffect, useState } from 'react';
import CategoryRow from '../components/CategoryRow';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setHours(23, 59, 59, 999);

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(
          `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
        );
      } else {
        setTimeLeft('00 : 00 : 00');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category')?.toLowerCase() || '';

  const filteredProducts = products.filter(p => {
    if (search && !p.title.toLowerCase().includes(search) && !p.description.toLowerCase().includes(search)) return false;
    if (category && p.category.toLowerCase() !== category) return false;
    return true;
  });

  return (
    <div className="bg-fk-gray min-h-screen pt-0 flex flex-col">
      <CategoryRow />
      
      <main className="flex-1 p-[12px] w-full max-w-[1600px] mx-auto">
        <div className="bg-white shadow-fk rounded-[2px] flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="p-[16px] border-b border-[#f0f0f0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
              <h2 className="text-[16px] sm:text-[20px] font-semibold text-fk-text">
                {category ? `${searchParams.get('category')} Products` : search ? `Showing results for "${searchParams.get('search')}"` : 'Deals of the Day'}
              </h2>
              {!category && !search && (
                <div className="flex items-center text-fk-secondary text-sm gap-2">
                  <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/timer_a73398.svg" alt="timer" className="w-[18px]"/>
                  <span className="font-medium text-fk-secondary">{timeLeft} Left</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/?category=Electronics')} 
              className="w-full sm:w-auto bg-fk-blue text-white text-[14px] sm:text-[12px] px-[16px] py-[10px] sm:py-[8px] rounded-[2px] font-semibold uppercase shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              VIEW ALL
            </button>
          </div>

          {/* Grid Section */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center p-10">
                <div className="animate-spin text-fk-blue w-8 h-8 rounded-full border-4 border-t-transparent"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-[12px]">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex justify-center flex-col items-center p-10 text-fk-secondary">
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/error-no-search-results_2353c5.png" alt="No Results" className="w-32 mb-4" />
                <p className="text-lg font-semibold text-fk-text">Sorry, no results found!</p>
                <p className="text-sm mt-2">Please check the spelling or try searching for something else</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
