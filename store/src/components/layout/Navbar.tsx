'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useCart } from '@/hooks/useCart';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiPackage, FiHome, FiGrid } from 'react-icons/fi';
import CartDrawer from '../cart/CartDrawer';
import { getCategories } from '@/actions/categories';
import SearchBar from '../SearchBar';
import Notifications from '../ui/Notifications';
import { Package } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const { items } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  
  const pathname = usePathname();
  const router = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const productsRef = useRef<HTMLAnchorElement>(null);
  const categoriesRef = useRef<HTMLAnchorElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const itemCount = items.length;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Move updateIndicator inside useEffect
  useEffect(() => {
    const updateIndicator = () => {
      if (!indicatorRef.current) return;
      
      let activeRef: React.RefObject<HTMLAnchorElement> | null = null;
      
      if (pathname === '/') {
        activeRef = homeRef;
      } else if (pathname.startsWith('/products')) {
        activeRef = productsRef;
      } else if (pathname.startsWith('/categories')) {
        activeRef = categoriesRef;
      }
      
      if (activeRef?.current && indicatorRef.current) {
        const { offsetLeft, offsetWidth } = activeRef.current;
        indicatorRef.current.style.width = `${offsetWidth}px`;
        indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
        indicatorRef.current.style.opacity = '1';
      } else {
        // Hide indicator if no active link
        if (indicatorRef.current) {
          indicatorRef.current.style.opacity = '0';
        }
      }
    };

    updateIndicator();
    setIsOpen(false);
    
    // Add window resize listener to recalculate indicator position
    const handleResize = () => {
      updateIndicator();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    
    fetchCategories();
  }, []);

  // Handle click outside profile menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Classes for active state
  const getLinkClassName = (path: string) => {
    const isActive = 
      path === '/' ? pathname === '/' : 
      pathname.startsWith(path);
    
    return `nav-link ${isActive ? 'active' : ''}`;
  };

  // Handle sign out
  const handleSignOut = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    await signOut({ redirect: true, callbackUrl: `${baseUrl}/login` });
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-[#0f172a] shadow-md' : 'bg-[#0f172a]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-white flex items-center space-x-2">
                <span className="text-[#f59e0b]">Cursor</span>
                <span>Shop</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/" 
                className={`font-medium transition-colors ${pathname === '/' ? 'text-[#f59e0b]' : 'text-white hover:text-[#f59e0b]'}`}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className={`font-medium transition-colors ${pathname === '/products' || pathname.startsWith('/products/') ? 'text-[#f59e0b]' : 'text-white hover:text-[#f59e0b]'}`}
              >
                Products
              </Link>
              <Link 
                href="/categories" 
                className={`font-medium transition-colors ${pathname === '/categories' || pathname.startsWith('/categories/') ? 'text-[#f59e0b]' : 'text-white hover:text-[#f59e0b]'}`}
              >
                Categories
              </Link>
              <Link 
                href="/about" 
                className={`font-medium transition-colors ${pathname === '/about' ? 'text-[#f59e0b]' : 'text-white hover:text-[#f59e0b]'}`}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`font-medium transition-colors ${pathname === '/contact' ? 'text-[#f59e0b]' : 'text-white hover:text-[#f59e0b]'}`}
              >
                Contact
              </Link>
            </nav>
            
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-6">
              <SearchBar />
              
              <Notifications />
              
              {session ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`text-white hover:text-[#f59e0b] transition-colors relative ${pathname.startsWith('/account') ? 'text-[#f59e0b]' : ''}`}
                    aria-label="Account"
                  >
                    {session.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border-2 border-[#f59e0b]"
                      />
                    ) : (
                      <FiUser className="h-5 w-5" />
                    )}
                  </button>
                  
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">{session.user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link 
                          href="/account" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setProfileOpen(false)}
                        >
                          <FiUser className="mr-2 h-4 w-4" />
                          My Account
                        </Link>
                        <Link 
                          href="/account/orders" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setProfileOpen(false)}
                        >
                          <FiPackage className="mr-2 h-4 w-4" />
                          My Orders
                        </Link>
                        <button 
                          onClick={handleSignOut} 
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <FiLogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="text-white hover:text-[#f59e0b] transition-colors flex items-center"
                >
                  <FiLogIn className="h-5 w-5 mr-1" />
                  <span className="hidden lg:inline">Sign in</span>
                </Link>
              )}
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="text-white hover:text-[#f59e0b] transition-colors relative"
                aria-label="Cart"
              >
                <FiShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-[#f59e0b] text-[#0f172a] text-xs flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-4">
              <Notifications />
              
              <SearchBar />
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="text-white hover:text-[#f59e0b] transition-colors relative p-1"
                aria-label="Cart"
              >
                <FiShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-[#f59e0b] text-[#0f172a] text-xs flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsOpen(true)}
                className="text-white hover:text-[#f59e0b] transition-colors p-1"
                aria-label="Open menu"
              >
                <FiMenu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className={`fixed inset-0 z-50 bg-[#0f172a] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center h-16 px-4 border-b border-[#f59e0b]/20">
          <Link href="/" className="text-2xl font-bold text-white flex items-center space-x-2">
            <span className="text-[#f59e0b]">Cursor</span>
            <span>Shop</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white p-1"
            aria-label="Close menu"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <nav className="px-4 py-6 space-y-4">
          <Link 
            href="/" 
            className={`block px-2 py-3 font-medium text-lg ${pathname === '/' ? 'text-[#f59e0b]' : 'text-white'}`}
          >
            Home
          </Link>
          <Link 
            href="/products" 
            className={`block px-2 py-3 font-medium text-lg ${pathname === '/products' || pathname.startsWith('/products/') ? 'text-[#f59e0b]' : 'text-white'}`}
          >
            Products
          </Link>
          
          <div className="border-t border-[#f59e0b]/20 pt-4">
            <h3 className="text-[#f59e0b] font-semibold mb-3 px-2">Categories</h3>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className={`block px-2 py-2 text-white hover:text-[#f59e0b] ${pathname === `/categories/${category.id}` ? 'text-[#f59e0b]' : ''}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
          
          <div className="border-t border-[#f59e0b]/20 pt-4">
            {session ? (
              <>
                <Link 
                  href="/account" 
                  className={`block px-2 py-3 font-medium text-lg ${pathname.startsWith('/account') ? 'text-[#f59e0b]' : 'text-white'}`}
                >
                  My Account
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="block px-2 py-3 font-medium text-lg text-white hover:text-[#f59e0b] w-full text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className={`block px-2 py-3 font-medium text-lg ${pathname === '/login' ? 'text-[#f59e0b]' : 'text-white'}`}
              >
                Sign in
              </Link>
            )}
            <Link 
              href="/about" 
              className={`block px-2 py-3 font-medium text-lg ${pathname === '/about' ? 'text-[#f59e0b]' : 'text-white'}`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`block px-2 py-3 font-medium text-lg ${pathname === '/contact' ? 'text-[#f59e0b]' : 'text-white'}`}
            >
              Contact
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
} 