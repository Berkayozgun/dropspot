"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext'; // useAuth hook'unu import et
import Link from 'next/link';
import { toast } from 'react-toastify';

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
        console.error('Admin Drops: İstek sırasında hata oluştu:', err.message);
        setError(err.message || 'Bir hata oluştu.');
        toast.error(err.message || 'Droplar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchAdminDrops();
  }, [isAuthenticated, token, router]);

  if (loading) {
    return <div className="container mx-auto p-8 text-center text-lg">Admin Drops Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-red-600 text-lg">Hata: {error}</div>;
  }

  const handleDeleteDrop = async (dropId: string) => {
    if (!confirm('Bu dropu silmek istediğinizden emin misiniz?')) {
      return;
    }

    if (!isAuthenticated || !token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/admin/drops/${dropId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        throw new Error('Bu sayfaya erişim yetkiniz yok.');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Droplar silinemedi.');
      }

      setDrops(drops.filter((drop) => drop.id !== dropId));
      toast.success('Drop başarıyla silindi.');
    } catch (err: any) {
      console.error('Admin Drops: İstek sırasında hata oluştu:', err.message);
      setError(err.message || 'Bir hata oluştu.');
      toast.error(err.message || 'Drop silinirken bir hata oluştu.');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Admin: Drop Yönetimi</h1>
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => router.push('/admin/drops/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-colors duration-200"
        >
          Yeni Drop Oluştur
        </button>
      </div>
      {drops.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">Henüz yönetilecek drop bulunmamaktadır.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mevcut Stok / Toplam Stok</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yayın Tarihi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Penceresi</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Eylemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drops.map((drop) => (
                <tr key={drop.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{drop.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${drop.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{drop.availableStock} / {drop.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(drop.releaseDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(drop.claimWindowStart).toLocaleDateString()} - {new Date(drop.claimWindowEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/drops/${drop.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteDrop(drop.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
