"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // useAuth hook'unu import et
import Link from 'next/link';

interface Drop {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  availableStock: number;
  releaseDate: string;
  claimWindowStart: string;
  claimWindowEnd: string;
}

export default function AdminDropsPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth(); // useAuth hook'unu kullan

  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login'); // Giriş yapmamışsa login sayfasına yönlendir
      return;
    }

    async function fetchAdminDrops() {
      try {
        const response = await fetch('http://localhost:3000/admin/drops', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 403) {
          throw new Error('Bu sayfaya erişim yetkiniz yok.');
        }
        if (!response.ok) {
          throw new Error('Droplar yüklenemedi.');
        }
        const data: Drop[] = await response.json();
        setDrops(data);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchAdminDrops();
  }, [isAuthenticated, token, router]);

  if (loading) {
    return <div className="container mx-auto p-4">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Hata: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin: Drop Yönetimi</h1>
      <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4">
        Yeni Drop Oluştur
      </button>
      {drops.length === 0 ? (
        <p>Henüz yönetilecek drop bulunmamaktadır.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map((drop) => (
            <div key={drop.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{drop.name}</h2>
              <p className="text-gray-600 mb-2">{drop.description}</p>
              <p className="text-lg font-bold">Fiyat: ${drop.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Mevcut Stok: {drop.availableStock} / {drop.stock}</p>
              <p className="text-sm text-gray-500">Yayın Tarihi: {new Date(drop.releaseDate).toLocaleDateString()}</p>
              <div className="mt-4 flex space-x-2">
                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm">
                  Düzenle
                </button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
