import React from 'react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const discountPercent = Math.round(
    ((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100
  );

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white text-center rounded-[4px] hover:shadow-fk transition-shadow duration-200 p-3 flex flex-col group relative cursor-pointer"
    >
      <div className="w-[120px] h-[120px] mx-auto bg-[#f9f9f9] rounded-[4px] mb-[8px] relative flex items-center justify-center p-2">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="flex-grow flex flex-col items-center">
        <h3 className="text-fk-text text-[13px] font-medium line-clamp-1 hover:text-fk-blue mb-[4px]">
          {product.title}
        </h3>
        
        <div className="flex flex-col items-center">
          <span className="text-fk-green text-[13px] font-medium">
            From ₹{product.sellingPrice.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-1 opacity-60">
            <span className="text-fk-secondary text-[11px] line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-fk-text text-[11px] font-semibold">
              {discountPercent}% off
            </span>
          </div>
        </div>
      </div>

      {/* Add to Cart Overlay */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product);
          alert(`${product.title} added to cart!`);
        }}
        className="mt-3 w-full bg-[#ff9f00] text-white text-[12px] font-semibold py-[6px] rounded-[2px] shadow hover:bg-[#f39800] transition-colors uppercase cursor-pointer"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
