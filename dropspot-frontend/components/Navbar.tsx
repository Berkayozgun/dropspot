'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-gray-200">
          DropSpot
        </Link>
        <ul className="flex space-x-6 items-center">
          <li>
            <Link href="/drops" className="hover:text-gray-300 transition-colors duration-200">
              Drops
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link href="/admin/drops" className="hover:text-gray-300 transition-colors duration-200">
                Admin
              </Link>
            </li>
          )}
          {isAuthenticated ? (
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Çıkış Yap
              </button>
            </li>
          ) : (
            <>
              <li>
                <Link href="/auth/login" className="hover:text-gray-300 transition-colors duration-200">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                  Kayıt Ol
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
