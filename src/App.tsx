import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ShoppingBag, Menu, Search, User, ArrowRight, X, Instagram, Twitter } from 'lucide-react';
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
  const productGridRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    return `${price}$ ${currency}`;
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
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'News') return p.isNew;
    if (activeCategory === 'All') return true;
    
    const matchesCategory = p.type === activeCategory;
    // We don't filter by subcategory anymore to allow "jump to section" while showing all
    return matchesCategory;
  });

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
        <div className="bg-brand-ink text-brand-bg py-2 text-[10px] uppercase font-bold tracking-[0.3em] text-center">
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

            <div className="flex items-center gap-4 flex-1 justify-end">
              <button className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-black text-brand-ink/40 hover:text-brand-ink transition-colors">
                Sort By: Featured
              </button>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="hidden sm:block bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer hover:text-brand-accent transition-colors"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
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
                <button 
                  className="p-2 -mr-2 text-brand-ink/60 hover:text-brand-ink transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: isMobileMenuOpen ? '0%' : '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 bg-white p-6 lg:hidden"
        >
          <div className="flex justify-end mb-8">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-brand-ink/60 hover:text-brand-ink transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {navItems.map(item => (
              <div key={item.name} className="relative group">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveCategory(item.name);
                    setActiveSubcategory(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`text-lg uppercase tracking-[0.2em] font-bold transition-all hover:text-brand-accent flex items-center gap-1 ${ activeCategory === item.name ? 'text-brand-ink' : 'text-brand-ink/30' }`}
                >
                  {item.name}
                  {item.type === 'dropdown' && <span className="text-sm opacity-50">▼</span>}
                </button>
                
                {item.type === 'dropdown' && (
                  <div className="mt-4 pl-4">
                    <div className="flex flex-col gap-3">
                      {item.items?.map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setActiveCategory(item.name);
                            setActiveSubcategory(sub);
                            scrollToSection(sub);
                          }}
                          className={`text-base uppercase tracking-widest text-left hover:text-brand-accent transition-colors ${ activeSubcategory === sub ? 'text-brand-ink font-bold' : 'text-brand-ink/40' }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

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
                      <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">
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
                      <h2 className="text-6xl md:text-9xl font-black leading-[0.8] uppercase tracking-tighter">
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
                              currency={currency}
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
                              currency={currency}
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
                <p className="text-brand-ink/40 text-[10px] uppercase tracking-[0.2em] font-bold max-w-xs leading-loose">
                  illu's fake online store
                </p>
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
        currency={currency}
      />

      <ProductDetailsModal 
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAddToCart={addToCart}
        currency={currency}
      />

      {/* Search Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isSearchOpen ? 1 : 0 }}
        className={`fixed inset-0 bg-brand-bg/98 z-[100] flex flex-col p-6 md:p-24 ${isSearchOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <button 
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-8 right-8 p-4 hover:bg-brand-ink/5 rounded-full transition-colors"
        >
          <X size={32} />
        </button>

        <div className="max-w-4xl mx-auto w-full mt-24">
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-ink/20" size={40} />
            <input 
              type="text"
              autoFocus
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b-2 border-brand-ink/10 py-8 pl-16 text-4xl md:text-6xl font-black uppercase tracking-tighter focus:outline-none focus:border-brand-ink transition-colors placeholder:text-brand-ink/5"
            />
          </div>

          <div className="mt-12">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-ink/40 mb-8">Popular Searches</p>
            <div className="flex flex-wrap gap-4">
              {['Hoodies', 'Cyberpunk', 'Keychains', 'Neon'].map(term => (
                <button 
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-6 py-3 border border-brand-ink/10 rounded-full text-[10px] uppercase font-bold tracking-widest hover:border-brand-ink transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {searchQuery && (
            <div className="mt-24">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-ink/40 mb-8">
                Results for "{searchQuery}" ({filteredProducts.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {filteredProducts.slice(0, 4).map(product => (
                  <div 
                    key={product.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      scrollToSection();
                    }}
                    className="cursor-pointer group"
                  >
                    <div className="aspect-square bg-brand-ink/5 rounded-xl overflow-hidden mb-4">
                      <img src={product.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">{product.name}</h4>
                    <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest">{product.price}$ {currency}</p>
                  </div>
                ))}
              </div>
              {filteredProducts.length > 4 && (
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="mt-12 text-[10px] uppercase font-black tracking-[0.3em] flex items-center gap-2 hover:text-brand-accent transition-colors"
                >
                  View All Results <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
