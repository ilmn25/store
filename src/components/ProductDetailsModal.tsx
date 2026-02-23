import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  formatPrice 
}) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-auto md:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] max-w-5xl h-auto md:h-[85vh] bg-brand-bg z-[120] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors z-20 shadow-sm"
            >
              <X size={24} />
            </button>

            <div className="w-full md:w-1/2 flex-1 min-h-0 md:h-auto bg-brand-ink/5">
              <img 
                src={product.url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col flex-shrink-0 h-auto md:flex-1 md:min-h-0">
              <div className="space-y-4 md:space-y-8">
                <div className="space-y-4">
                  <div>
                    <span className="text-brand-ink/40 text-[8px] md:text-[10px] uppercase font-bold tracking-[0.4em] mb-1 md:mb-4 block">
                      {product.type} / {product.subcategory}
                    </span>
                    <h2 className="text-lg md:text-5xl font-black uppercase tracking-tighter leading-none">
                      {product.name}
                    </h2>
                  </div>
                  <p className="text-base md:text-2xl font-mono text-brand-accent">{formatPrice(product.price)}</p>
                </div>

                <div className="space-y-2 md:space-y-4"> 
                  <p 
                    className="text-brand-ink/60 text-[10px] md:text-sm uppercase tracking-widest font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description || "No description available for this item." }}
                  />
                </div>

                <div className="pt-2 md:pt-8 space-y-3 md:space-y-4">
                  <button 
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="w-full bg-brand-ink text-brand-bg py-3.5 md:py-6 rounded-full text-[9px] md:text-[12px] uppercase font-black tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-brand-accent transition-all shadow-xl"
                  >
                    <ShoppingBag size={16} className="md:w-[18px] md:h-[18px]" />
                    Add to Bag
                  </button>
                  <p className="text-center text-[7px] md:text-[9px] text-brand-ink/30 uppercase tracking-widest font-bold">
                    Free shipping on orders over 200$ USD
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
