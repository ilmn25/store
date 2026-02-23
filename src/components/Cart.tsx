import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  currency: string;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, currency }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-lg max-h-[80vh] bg-brand-bg border border-brand-ink/10 z-50 flex flex-col rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-brand-ink/10 flex items-center justify-between">
              <h2 className="text-xs uppercase font-bold tracking-[0.3em]">Shopping Bag</h2>
              <button onClick={onClose} className="p-2 hover:bg-brand-ink/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <ShoppingBag size={32} className="opacity-10" />
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">Your bag is currently empty</p>

                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    className="flex gap-6"
                  >
                    <div className="w-24 h-24 bg-brand-ink/5 overflow-hidden border border-brand-ink/10">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-[10px] uppercase font-bold tracking-widest">{item.name}</h3>
                          <button 
                            onClick={() => onRemove(item.id)}
                            className="text-brand-ink/20 hover:text-brand-ink transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest mt-1">{item.type}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-4 border border-brand-ink/10 px-3 py-1">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className="disabled:opacity-10"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-mono text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)}>
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-mono text-sm">{item.price * item.quantity}$ {currency}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-brand-ink/10 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ink/40">Total</span>
                  <span className="font-mono text-2xl">{total}$ {currency}</span>
                </div>
                <button className="w-full py-5 bg-brand-ink text-brand-bg text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-accent transition-all">
                  Checkout Now
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
