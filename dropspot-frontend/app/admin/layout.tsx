'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      toast.error('Bu sayfaya erişmek için giriş yapmalısınız.');
      router.replace('/');
      return;
    }

    if (!isAdmin) {
      toast.error('Bu sayfaya erişim yetkiniz yok.');
      router.replace('/');
    }
  }, [ready, isAuthenticated, isAdmin, router]);

  if (!ready || !isAuthenticated || !isAdmin) {
    return (
      <div className="container mx-auto p-8 text-center text-lg text-gray-600">
        Yetki kontrol ediliyor...
      </div>
    );
  }

  return <>{children}</>;
}
