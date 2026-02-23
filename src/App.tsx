import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, Search, User, ArrowRight, X, Instagram, Twitter, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { products } from './constants';
import { Product, CartItem } from './types';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { RevealOnScroll } from './components/RevealOnScroll';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('News');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'HKD', 'RMB', 'TWD', 'KRW'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const productGridRef = useRef<HTMLDivElement>(null);

  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150,
    HKD: 7.8,
    RMB: 7.2,
    TWD: 32,
    KRW: 1300
  };

  const formatPrice = (price: number) => {
    const converted = (price * rates[currency]).toFixed(currency === 'JPY' || currency === 'KRW' || currency === 'TWD' ? 0 : 2);
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      HKD: 'HK$',
      RMB: '¥',
      TWD: 'NT$',
      KRW: '₩'
    };
    return `${symbols[currency]}${converted} ${currency}`;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };



  const scrollToSection = useCallback((id?: string) => {
    setTimeout(() => {
      const element = id ? document.getElementById(`section-${id}`) : productGridRef.current;
      if (element) {
        const offset = 140; // Height of sticky header
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
      }
    }, 100);
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'News') return p.isNew;
    if (activeCategory === 'All') return true;
    
    const matchesCategory = p.type === activeCategory;
    return matchesCategory;
  });

  const searchResults = products.filter(p => 
    !searchQuery || 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subcategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const sub = product.subcategory || 'Other';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const newProductsGrouped = products.filter(p => p.isNew).reduce((acc, product) => {
    const type = product.type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const navItems = useMemo(() => {
    const categories = ['Clothes', 'Accessories'];
    const items: any[] = [
      { name: 'News', type: 'link' },
    ];

    categories.forEach(cat => {
      const subcategories = Array.from(new Set(
        products
          .filter(p => p.type === cat)
          .map(p => p.subcategory)
          .filter(Boolean)
      )) as string[];
      
      if (subcategories.length > 0) {
        items.push({
          name: cat,
          type: 'dropdown',
          items: subcategories.sort()
        });
      }
    });

    return items;
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-brand-bg">
      <div className="sticky top-0 z-40">
        {/* Announcement Bar */}
        <div className="bg-brand-ink text-brand-bg py-2 text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.1em] sm:tracking-[0.3em] text-center px-4">
          Free Worldwide Shipping on Orders Over $200
        </div>

        {/* Navigation */}
        <nav className={`w-full transition-all duration-300 ${
          isScrolled ? 'bg-brand-bg/95 backdrop-blur-md py-4 border-b border-brand-ink/10' : 'bg-brand-bg py-6 border-b border-transparent'
        }`}>
          <div className="max-w-[1800px] mx-auto px-6">
            <div className="hidden lg:flex justify-between items-center">
              <div className="flex items-center gap-8 flex-1">
              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden p-2 -ml-2 text-brand-ink/60 hover:text-brand-ink transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="hidden lg:flex items-center gap-10">
                {navItems.map(item => (
                  <div key={item.name} className="relative group">
                    <button 
                      onClick={() => {
                        setActiveCategory(item.name);
                        setActiveSubcategory(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-all hover:text-brand-accent flex items-center gap-1 ${ activeCategory === item.name ? 'text-brand-ink' : 'text-brand-ink/30' }`}
                    >
                      {item.name}
                      {item.type === 'dropdown' && <span className="text-[8px] opacity-50">▼</span>}
                    </button>
                    
                    {item.type === 'dropdown' && (
                      <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="bg-white border border-brand-ink/10 p-4 min-w-[160px] shadow-xl rounded-xl">
                          <div className="flex flex-col gap-3">
                            {item.items?.map(sub => (
                              <button
                                key={sub}
                              onClick={() => {
                                setActiveCategory(item.name);
                                setActiveSubcategory(sub);
                                scrollToSection(sub);
                              }}
                                className={`text-[9px] uppercase tracking-widest text-left hover:text-brand-accent transition-colors ${
                                  activeSubcategory === sub ? 'text-brand-ink font-bold' : 'text-brand-ink/40'
                                }`}
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setActiveCategory('News');
                setActiveSubcategory(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xl sm:text-2xl font-black tracking-tighter uppercase"
            >
              ILMNNNNNNNN
            </button>

            <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">

              <div className="relative hidden sm:block" ref={currencyRef}>
                <button 
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-brand-accent transition-colors"
                >
                  {currency}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isCurrencyOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 bg-white border border-brand-ink/10 shadow-2xl rounded-2xl overflow-hidden z-50 min-w-[120px] p-2"
                    >
                      {currencies.map((curr) => (
                        <button
                          key={curr}
                          onClick={() => {
                            setCurrency(curr);
                            setIsCurrencyOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-[10px] font-mono uppercase tracking-widest text-left rounded-lg transition-colors flex items-center justify-between group ${
                            currency === curr ? 'bg-brand-ink text-brand-bg font-bold' : 'text-brand-ink/40 hover:bg-brand-ink/5'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`opacity-20 ${currency === curr ? 'text-brand-bg/40' : ''}`}>{currency === curr ? '>' : '/'}</span>
                            {curr}
                          </span>
                          {currency === curr && <div className="w-1 h-1 rounded-full bg-brand-accent" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-brand-ink/5 transition-colors hidden sm:block"
              >
                <Search size={20} />
              </button>
              <button className="p-2 hover:bg-brand-ink/5 transition-colors hidden sm:block">
                <User size={20} />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 p-2 hover:bg-brand-ink/5 transition-colors"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:block">Bag</span>
                <div className="relative">
                  <ShoppingBag size={20} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent text-brand-bg text-[10px] flex items-center justify-center font-bold">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
              </button>
            </div>
            </div>

            {/* Mobile/Tablet Header */}
            <div className="lg:hidden flex justify-between items-center">
               <button 
                onClick={() => {
                  setActiveCategory('News');
                  setActiveSubcategory(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xl font-black tracking-tighter uppercase"
              >
                ILMNNNNNNNN
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 hover:bg-brand-ink/5 transition-colors"
                >
                  <Search size={22} />
                </button>
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="p-2 hover:bg-brand-ink/5 transition-colors"
                >
                  <div className="relative">
                    <ShoppingBag size={22} />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent text-brand-bg text-[10px] flex items-center justify-center font-bold">
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center bg-brand-ink text-brand-bg rounded-xl shadow-lg active:scale-90 transition-all hover:bg-black"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5 animate-fade-in" />
                    ) : (
                      <Menu className="w-5 h-5 animate-fade-in" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isMobileMenuOpen && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[45] bg-brand-ink/5 backdrop-blur-sm"
                          onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-12 right-0 mt-2 w-[calc(100vw-4rem)] max-w-[320px] bg-white rounded-3xl shadow-2xl border border-brand-ink/10 overflow-hidden z-[50] max-h-[80vh] overflow-y-auto"
                        >
                          <div className="p-5 space-y-6">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center px-1">
                                <p className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest">Navigation</p>
                              </div>
                              <div className="space-y-1">
                                {navItems.map((item) => (
                                  <div key={item.name} className="space-y-1">
                                    <button
                                      onClick={() => {
                                        if (item.type !== 'dropdown') {
                                          setIsMobileMenuOpen(false);
                                          setActiveCategory(item.name);
                                          setActiveSubcategory(null);
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                        } else {
                                          setActiveCategory(item.name);
                                        }
                                      }}
                                      className={`w-full flex items-center justify-between p-2 transition-all text-left group ${
                                        activeCategory === item.name ? 'text-brand-ink' : 'text-brand-ink/40 hover:text-brand-ink'
                                      }`}
                                    >
                                      <span className="text-[11px] font-mono uppercase tracking-widest flex items-center gap-2">
                                        <span className="opacity-20">/</span>
                                        {item.name}
                                      </span>
                                      {item.type === 'dropdown' ? (
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeCategory === item.name ? 'rotate-180' : 'opacity-20'}`} />
                                      ) : (
                                        <ChevronRight className={`w-3.5 h-3.5 ${activeCategory === item.name ? 'text-brand-accent' : 'opacity-0 group-hover:opacity-20'}`} />
                                      )}
                                    </button>
                                    
                                    {item.type === 'dropdown' && activeCategory === item.name && (
                                      <div className="grid grid-cols-1 gap-1 pl-4 animate-slide-up border-l border-brand-ink/5 ml-3">
                                        {item.items?.map(sub => (
                                          <button
                                            key={sub}
                                            onClick={() => {
                                              setIsMobileMenuOpen(false);
                                              setActiveCategory(item.name);
                                              setActiveSubcategory(sub);
                                              scrollToSection(sub);
                                            }}
                                            className={`w-full p-2 text-[10px] font-mono uppercase tracking-widest text-left transition-colors flex items-center justify-between group ${
                                              activeSubcategory === sub ? 'text-brand-ink font-bold' : 'text-brand-ink/30 hover:text-brand-ink'
                                            }`}
                                          >
                                            <span className="flex items-center gap-2">
                                              <span className="opacity-20">|_</span>
                                              {sub}
                                            </span>
                                            <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${activeSubcategory === sub ? 'opacity-100 text-brand-accent' : ''}`} />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-brand-ink/5">
                              <p className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest px-1">Currency</p>
                              <div className="grid grid-cols-2 gap-2">
                                {currencies.map((curr) => (
                                  <button
                                    key={curr}
                                    onClick={() => {
                                      setCurrency(curr);
                                      setIsMobileMenuOpen(false);
                                    }}
                                    className={`p-3 text-[10px] font-mono uppercase tracking-widest text-left rounded-xl transition-all flex items-center gap-2 ${
                                      currency === curr ? 'bg-brand-ink text-brand-bg font-bold' : 'bg-brand-ink/5 text-brand-ink/40'
                                    }`}
                                  >
                                    <span className="opacity-20">{currency === curr ? '>' : '/'}</span>
                                    {curr}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay Removed - Replaced by Dropdown */}

      </div>



      <div>
        
          <motion.div
            key="shop"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {activeCategory === 'News' ? (
              <header className="max-w-4xl mx-auto px-6 py-24">
                <RevealOnScroll direction="left">
                  <div className="flex flex-col md:flex-row md:items-end md:gap-8 space-y-6 md:space-y-0">
                    <div className="flex-shrink-0">
                      <span className="text-brand-ink/40 text-[10px] uppercase font-bold tracking-[0.4em]">Illu's</span>
                      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        ILMNNNNNNNN
                      </h2>
                    </div>
                    <div className="pb-1">
                      <p className="text-brand-ink/60 text-sm uppercase tracking-widest font-medium leading-relaxed max-w-sm">
                        is a conceptual mockup for a clothing and accessories brand, all products displayed do not exist.
                      </p>
                      <div className="flex gap-4 mt-4">
                        <a href="https://www.instagram.com/ilmnnnnnnnnnn/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-ink transition-colors"><Instagram size={20} /></a>
                        <a href="https://x.com/ilmn25" target="_blank" rel="noopener noreferrer" className="hover:text-brand-ink transition-colors"><Twitter size={20} /></a>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              </header>
            ) : (
              <header className="border-b border-brand-ink/10">
                <div className="max-w-[1800px] mx-auto">
                  <RevealOnScroll direction="up">
                    <div className="p-12 lg:p-24 flex flex-col items-center text-center">
                      <span className="text-brand-ink/40 text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">
                        Collection 01 / 2026
                      </span>
                      <h2 className="text-5xl sm:text-6xl md:text-9xl font-black leading-[0.8] uppercase tracking-tighter">
                        ILMN <br /> NNNNNN<span className="bg-brand-ink text-brand-bg">N</span>
                      </h2>
                    </div>
                  </RevealOnScroll>
                </div>
              </header>
            )}
            {/* Product Grid Section */}
            <main ref={productGridRef} className="max-w-[1800px] mx-auto p-6">
              <div className="flex justify-between items-end mb-12 px-2">
                <div className="space-y-1">
                  <p className="text-brand-ink/40 text-[10px] uppercase font-bold tracking-[0.4em]"></p>
                  <p className="text-[9px] text-brand-ink/30 font-bold uppercase tracking-[0.2em]">
                  </p>
                </div>
              </div>


              {filteredProducts.length > 0 ? (
                <div className="space-y-12">
                  {activeCategory === 'News' ? (
                    Object.entries(newProductsGrouped).map(([type, items]) => (
                      <div key={type} id={`section-${type}`} className="space-y-4 scroll-mt-40">
                        <div className="flex items-center gap-4">
                          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                            ILMNNNNNNNN / {type} / New
                          </h2>
                          <div className="h-px flex-1 bg-brand-ink/10"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                          {items.map((product) => (
                            <ProductCard 
                              key={product.id} 
                              product={product} 
                              onAddToCart={addToCart} 
                              onViewDetails={openProductDetails}
                              formatPrice={formatPrice}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    Object.entries(groupedProducts).map(([sub, items]) => (
                      <div key={sub} id={`section-${sub}`} className="space-y-4 scroll-mt-40">
                        <div className="flex items-center gap-4">
                          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                            ILMNNNNNNNN / {items[0]?.type} / {sub}
                          </h2>
                          <div className="h-px flex-1 bg-brand-ink/10"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                          {items.map((product) => (
                            <ProductCard 
                              key={product.id} 
                              product={product} 
                              onAddToCart={addToCart} 
                              onViewDetails={openProductDetails}
                              formatPrice={formatPrice}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-ink/20">No products found in this category.</p>
                </div>
              )}
            </main>
          </motion.div>


        {/* Newsletter Section */}
        <RevealOnScroll direction="up">
          <section className="border-t border-brand-ink/10 bg-brand-ink text-brand-bg py-24">
            <div className="max-w-xl mx-auto px-6 text-center">
              <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter">Stay</h2>
              <p className="text-brand-bg/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-10">
                Sign up for updates on new drops and exclusive content.
              </p>
              <form className="flex flex-col sm:flex-row gap-0 border border-brand-bg/20">
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL" 
                  className="flex-1 bg-transparent py-5 px-6 focus:outline-none text-[10px] uppercase tracking-widest font-bold placeholder:text-brand-bg/20"
                />
                <button className="bg-brand-bg text-brand-ink px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-accent hover:text-brand-bg transition-all">
                  Join
                </button>
              </form>
            </div>
          </section>
        </RevealOnScroll>

        {/* Footer */}
        <RevealOnScroll direction="up">
          <footer className="bg-brand-bg py-24 border-t border-brand-ink/10">
            <div className="max-w-[1800px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
              <div className="col-span-1 md:col-span-1">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8">ILMNNNNNNNN</h3>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8">Legal</h4>
                <ul className="space-y-4 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ink/40">
                  <li><a href="#" className="hover:text-brand-ink transition-colors">Shipping</a></li>
                  <li><a href="#" className="hover:text-brand-ink transition-colors">Returns</a></li>
                  <li><a href="#" className="hover:text-brand-ink transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-brand-ink transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="max-w-[1800px] mx-auto px-6 mt-24 pt-8 pb-8 border-t border-brand-ink/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 text-[9px] uppercase tracking-[0.3em] font-black text-brand-ink/20">
              <p>© 2026 ILMNNNNNNNN</p>
              <div className="flex gap-8">
                <a href="https://www.instagram.com/ilmnnnnnnnnnn/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-ink transition-colors"><Instagram size={18} /></a>
                <a href="https://x.com/ilmn25" target="_blank" rel="noopener noreferrer" className="hover:text-brand-ink transition-colors"><Twitter size={18} /></a>
              </div>
            </div>
          </footer>
        </RevealOnScroll>
      </div>

      {/* Side Menu Overlay */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        formatPrice={formatPrice}
      />

      <ProductDetailsModal 
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAddToCart={addToCart}
        formatPrice={formatPrice}
      />

      {/* Search Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isSearchOpen ? 1 : 0 }}
        className={`fixed inset-0 bg-brand-bg/98 z-[100] flex flex-col ${isSearchOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div className="flex justify-end p-6 md:p-12">
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="p-4 hover:bg-brand-ink/5 rounded-full transition-colors"
          >
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <div className="max-w-6xl mx-auto w-full">
            <div className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-ink/20" size={40} />
              <input 
                type="text"
                autoFocus
                placeholder="SEARCH PRODUCTS"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-brand-ink/10 py-4 pl-16 text-3xl md:text-6xl font-black uppercase tracking-tighter focus:outline-none focus:border-brand-ink transition-colors placeholder:text-brand-ink/5"
              />
            </div>

            <div className="mt-24">
              <div className="flex justify-between items-end mb-12">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-ink/40">
                  {searchQuery ? `Results for "${searchQuery}"` : 'All Products'} ({searchResults.length})
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-[8px] uppercase font-bold tracking-widest text-brand-ink/20 hover:text-brand-ink transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
                  {searchResults.map(product => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        openProductDetails(product);
                      }}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-[4/5] bg-brand-ink/5 rounded-2xl overflow-hidden mb-4 relative">
                        <img 
                          src={product.url} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-brand-ink/0 group-hover:bg-brand-ink/5 transition-colors duration-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-brand-ink/30 uppercase font-bold tracking-widest">{product.type}</p>
                        <h4 className="text-[11px] font-black uppercase tracking-tight leading-tight">{product.name}</h4>
                        <p className="text-[10px] font-mono text-brand-accent">{formatPrice(product.price)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center border-2 border-dashed border-brand-ink/5 rounded-3xl">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-ink/20">No matching products found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
