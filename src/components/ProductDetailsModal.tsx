import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  currency: string;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  currency 
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
            className="fixed inset-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-full max-w-5xl h-full md:h-[85vh] bg-brand-bg z-[120] md:rounded-3xl shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors z-10 shadow-sm"
            >
              <X size={24} />
            </button>

            <div className="w-full md:w-1/2 h-[60vh] md:h-auto bg-brand-ink/5">
              <img 
                src={product.url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto md:min-h-0">
              <div className="space-y-8">
                <div>
                  <span className="text-brand-ink/40 text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">
                    {product.type} / {product.subcategory}
                  </span>
                  <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                    {product.name}
                  </h2>
                  <p className="text-xl md:text-2xl font-mono">{product.price}$ {currency}</p>
                </div>

                <div className="space-y-4"> 
                  <p 
                    className="text-brand-ink/60 text-xs md:text-sm uppercase tracking-widest font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description || "No description available for this item." }}
                  />
                </div>

                <div className="pt-8 space-y-4">
                  <button 
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="w-full bg-brand-ink text-brand-bg py-4 md:py-6 rounded-full text-[10px] md:text-[12px] uppercase font-black tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-brand-accent transition-all shadow-xl"
                  >
                    <ShoppingBag size={18} />
                    Add to Bag
                  </button>
                  <p className="text-center text-[9px] text-brand-ink/30 uppercase tracking-widest font-bold">
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
