import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

import { RevealOnScroll } from './RevealOnScroll';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  formatPrice: (price: number) => string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails, formatPrice }) => {
  return (
    <RevealOnScroll direction="up">
      <div 
        onClick={() => onViewDetails(product)}
        className="group flex flex-col border border-brand-ink/10 relative m-1 rounded-2xl overflow-hidden cursor-pointer"
      >
      <div className="relative aspect-square overflow-hidden bg-white">
        <img 
          src={product.url} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md text-black text-[9px] uppercase font-bold tracking-[0.2em] rounded-full border border-black/5 shadow-sm z-10">
            New
          </span>
        )}
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full bg-white text-black py-3 text-[9px] uppercase font-bold tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all duration-300 rounded-full shadow-xl border border-black/5"
          >
            <Plus size={12} />
            Quick Add
          </button>
        </div>
      </div>
      
      <div className="p-2 flex-1 flex flex-col justify-between border-t border-brand-ink/10">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-widest mb-1">
            {product.name}
          </h3>
          <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest">{product.type}</p>
        </div>
        <div className="mt-4 flex justify-between items-baseline">
          <span className="font-mono text-sm">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  </RevealOnScroll>
  );
};
