'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { 
  FiHome, 
  FiShoppingBag, 
  FiTag, 
  FiList,
  FiMessageSquare,
  FiBell,
  FiMail,
  FiUser,
  FiSearch,
  FiLogOut
} from 'react-icons/fi';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (status === 'loading' || isLoginPage) return;

    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [session, status, router, isLoginPage]);

  if (isLoginPage) {
    return children;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Messages', href: '/admin/messages', icon: FiMessageSquare },
    { name: 'Products', href: '/admin/products', icon: FiShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: FiTag },
    { name: 'Orders', href: '/admin/orders', icon: FiList },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-8 space-y-8">
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <span className="text-blue-400 text-2xl font-bold">A</span>
        </div>
        
        <nav className="flex flex-col space-y-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="absolute left-14 bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                  {item.name}
                </span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-blue-400">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="admin-search"
                name="admin-search"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
              <FiMail className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
              <FiBell className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors duration-200 inline-flex items-center space-x-1"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
            
            <div className="relative w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-400/30 overflow-hidden group">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FiUser className="text-blue-400 w-5 h-5" />
              )}
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <span className="text-xs text-blue-300 font-medium">{session.user.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 