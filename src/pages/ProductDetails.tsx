import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../CartContext';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Oops, we haven't got JSON!");
        }
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch failed, using mock data:', err);
        import('../data/mockData').then(mod => {
          const prod = mod.getFallbackProducts().find((p: any) => p._id === id);
          if (prod) {
            setProduct(prod);
          } else {
            console.error('Product not found in mock data');
          }
          setLoading(false);
        });
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fk-gray pt-[80px] flex justify-center p-10">
        <div className="animate-spin text-fk-blue w-8 h-8 rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-fk-gray pt-[80px] flex flex-col items-center justify-center p-10 text-fk-text">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="bg-fk-blue text-white px-6 py-2 rounded-sm font-semibold">
          Back to Home
        </button>
      </div>
    );
  }

  const discountPercent = Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100);

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.title} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-fk-gray pt-[80px] p-[12px] md:p-[20px] flex justify-center">
      <div className="bg-white shadow-fk rounded-[2px] max-w-[1200px] w-full flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Image & Actions */}
        <div className="p-6 md:w-2/5 flex flex-col items-center border-r border-[#f0f0f0]">
          <div className="w-full h-[400px] flex items-center justify-center p-4 border rounded-[2px] mb-6">
            <img src={product.imageUrl} alt={product.title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
          </div>
          <div className="flex gap-4 w-full">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-[#ff9f00] text-white py-3 rounded-[2px] font-semibold text-[16px] shadow hover:bg-[#f39800] uppercase cursor-pointer flex justify-center items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg" className="fill-current"><path d="M15.32 2.405H4.887C3 2.405 2.46.805 2.46.805L2.257.21C2.208.085 2.083 0 1.946 0H.336C.1 0-.064.24.024.46l.644 1.945L3.11 9.767c.047.137.175.23.32.23h8.418l-.493 1.958H3.768l.002.003c-.017 0-.033-.003-.05-.003-1.06 0-1.92.86-1.92 1.92s.86 1.92 1.92 1.92c.99 0 1.805-.75 1.91-1.712l5.55.076c.12.922.91 1.636 1.867 1.636 1.04 0 1.885-.844 1.885-1.885 0-.866-.584-1.593-1.38-1.814l2.423-8.832c.12-.433-.206-.86-.655-.86" fill="#fff"></path></svg>
              ADD TO CART
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-[#fb641b] text-white py-3 rounded-[2px] font-semibold text-[16px] shadow hover:bg-[#f35b13] uppercase cursor-pointer flex justify-center items-center gap-2"
            >
              <svg width="14" height="18" viewBox="0 0 14 18" xmlns="http://www.w3.org/2000/svg" className="fill-current"><path d="m11.884 5.05-3.32-.42L6.155 1.488a.382.382 0 0 0-.62 0L3.125 4.63l-3.32.42a.38.38 0 0 0-.256.685l2.67 2.082-.99 3.197a.382.382 0 0 0 .584.423l2.846-1.953 2.848 1.953a.382.382 0 0 0 .584-.423l-.99-3.197 2.671-2.082a.38.38 0 0 0-.256-.685ZM6.89 8.922c0 .666-.237 1.258-.711 1.776-.474.518-1.077.777-1.809.777-.385 0-.75-.06-1.096-.18l.842-3.18H6.6c.193 0 .341-.059.444-.178.103-.119.155-.316.155-.592 0-.276-.052-.473-.155-.592-.103-.118-.25-.177-.444-.177H1.93l.365-1.323h5.184c.385 0 .75.059 1.096.177Z" fill="#fff" fillRule="evenodd"></path></svg>
              BUY NOW
            </button>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="p-6 md:w-3/5 flex flex-col">
          <div className="text-gray-500 text-sm mb-2">{product.category} &gt; {product.title}</div>
          <h1 className="text-2xl font-normal text-fk-text leading-relaxed tracking-wide mb-2">{product.title}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#388e3c] text-white text-xs font-bold px-2 py-1 rounded-[2px] flex items-center gap-1">
              4.5 <svg width="10" height="10" viewBox="0 0 10 10" className="fill-current"><path d="M5 .667L6.46 3.63l3.267.473-2.36 2.3.553 3.25L5 8.16l-2.92 1.54.553-3.25-2.36-2.3 3.267-.474L5 .667z"></path></svg>
            </span>
            <span className="text-[#878787] text-sm font-semibold">2,142 Ratings & 231 Reviews</span>
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" alt="f-assured" className="h-5 ml-4" />
          </div>

          <div className="flex items-end gap-3 mb-4">
            <span className="text-3xl font-semibold text-fk-text">₹{product.sellingPrice.toLocaleString('en-IN')}</span>
            <span className="text-[#878787] text-base line-through mb-1">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            <span className="text-[#388e3c] text-base font-semibold mb-1">{discountPercent}% off</span>
          </div>

          <p className="text-fk-text text-sm mb-6 leading-relaxed border-t border-[#f0f0f0] pt-4">
            {product.description}
          </p>

          {/* Highlights */}
          <div className="mt-4 border border-[#f0f0f0] rounded-[2px] p-4 bg-[#f9f9f9]">
            <h3 className="text-fk-secondary text-sm font-semibold mb-2 uppercase">Stock Status</h3>
            <div className="text-sm font-medium text-fk-text">
              {product.stock > 0 ? <span className="text-fk-green">In Stock ({product.stock} items available)</span> : <span className="text-[#ff6161]">Out of Stock</span>}
            </div>
            
            <h3 className="text-fk-secondary text-sm font-semibold mb-2 uppercase mt-4">Available offers</h3>
            <ul className="text-sm text-fk-text space-y-2">
              <li className="flex gap-2">
                <img src="https://rukminim1.flixcart.com/www/36/36/promos/06/09/2016/c22c9fc4-0555-4460-8401-bf5c28d7ba29.png?q=90" className="w-[18px] h-[18px]" alt="offer" />
                <span><span className="font-semibold">Bank Offer</span> 5% Cashback on Flipkart Axis Bank Card</span>
              </li>
              <li className="flex gap-2">
                <img src="https://rukminim1.flixcart.com/www/36/36/promos/06/09/2016/c22c9fc4-0555-4460-8401-bf5c28d7ba29.png?q=90" className="w-[18px] h-[18px]" alt="offer" />
                <span><span className="font-semibold">Partner Offer</span> Sign up for Flipkart Pay Later and get Flipkart Gift Card worth up to ₹500</span>
              </li>
            </ul>

            <h3 className="text-fk-secondary text-sm font-semibold mb-2 uppercase mt-4">Specifications</h3>
            <div className="text-sm text-fk-text space-y-2 border-t border-[#e0e0e0] pt-2">
               <div className="flex"><span className="text-[#878787] w-[110px]">Brand</span><span>Generic / Custom</span></div>
               <div className="flex"><span className="text-[#878787] w-[110px]">Model</span><span>{product.title}</span></div>
               <div className="flex"><span className="text-[#878787] w-[110px]">Condition</span><span>Brand New</span></div>
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="mt-4 border border-[#f0f0f0] rounded-[2px] p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-fk-text">Ratings & Reviews</h3>
              <button className="bg-white text-fk-text shadow p-2 px-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] font-semibold rounded-[2px]">Rate Product</button>
            </div>
            
            <div className="flex items-center gap-6 border-b border-[#f0f0f0] pb-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-semibold flex items-center justify-center gap-1">4.5 <svg width="24" height="24" viewBox="0 0 10 10" className="fill-current text-[#388e3c]"><path d="M5 .667L6.46 3.63l3.267.473-2.36 2.3.553 3.25L5 8.16l-2.92 1.54.553-3.25-2.36-2.3 3.267-.474L5 .667z"></path></svg></div>
                <div className="text-[#878787] text-sm mt-1">2,142 Ratings &<br/>231 Reviews</div>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-xs text-[#878787] font-medium">
                    <span className="w-2">{star}</span>
                    <svg width="10" height="10" viewBox="0 0 10 10" className="fill-current"><path d="M5 .667L6.46 3.63l3.267.473-2.36 2.3.553 3.25L5 8.16l-2.92 1.54.553-3.25-2.36-2.3 3.267-.474L5 .667z"></path></svg>
                    <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#388e3c] rounded-full" style={{width: `${(star/5) * (Math.random() * 40 + 60)}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {[
                { name: "Rahul Sharma", rating: 5, text: "Excellent product! Really loved the quality. Worth every penny.", date: "1 month ago" },
                { name: "Priya Singh", rating: 4, text: "Good product but delivery was delayed by a day. Quality is good.", date: "2 months ago" },
                { name: "Amit Patel", rating: 5, text: "Best in this price segment. Highly recommended.", date: "4 months ago" },
              ].map((review, i) => (
                <div key={i} className="border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded-[2px] flex items-center gap-1 ${review.rating >= 4 ? 'bg-[#388e3c]' : 'bg-[#ff9f00]'}`}>
                      {review.rating} <svg width="8" height="8" viewBox="0 0 10 10" className="fill-current"><path d="M5 .667L6.46 3.63l3.267.473-2.36 2.3.553 3.25L5 8.16l-2.92 1.54.553-3.25-2.36-2.3 3.267-.474L5 .667z"></path></svg>
                    </span>
                    <span className="font-semibold text-sm">{review.rating >= 4 ? 'Brilliant' : 'Good'}</span>
                  </div>
                  <p className="text-sm text-fk-text mb-2">{review.text}</p>
                  <div className="flex justify-between items-center text-xs text-[#878787]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.name}</span>
                      <svg width="14" height="14" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" className="mt-0.5"><g><circle cx="6" cy="6" r="6" fill="#878787"></circle><path d="M3.78 6.43L5.27 8l2.95-3.6" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></g></svg>
                      <span>Certified Buyer</span>
                    </div>
                    <span>{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
