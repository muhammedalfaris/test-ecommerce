'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';

interface NavbarClientProps {
  user: {
    user_id: string;
    name: string;
    phone_number: string;
  } | null;
  isAuthenticated: boolean;
}

export default function NavbarClient({ user, isAuthenticated }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const isLoginPage = pathname === '/login';

  const handleLogout = () => {
    logout();
    document.cookie = 'access_token=; Max-Age=0; path=/;';
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-800 backdrop-blur-sm bg-opacity-90">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
            <Image
              src="/nlogo.png" 
              alt="Nike"
              fill
              sizes="40px"
              className="object-contain"
              priority={false}
            />
          </div>
            <span className="text-white font-bold text-xl hidden sm:block">NikeStore</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <span className="text-white">{user?.name || 'User'}</span>
                </div>
                
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pathname === '/profile'
                      ? 'bg-white text-black'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Profile
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {!isLoginPage && (
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 mb-4 px-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user?.name || 'User'}</p>
                    <p className="text-gray-400 text-sm">{user?.phone_number}</p>
                  </div>
                </div>
                
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-white font-bold text-xl sm:block">NikeStore</span>
                {!isLoginPage && (
                  <Link
                    href="/login"
                    className="block mt-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}