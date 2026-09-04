"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext'; // useAuth hook'unu import et
import { toast } from 'react-toastify';
import { API_URL } from '../../../../../lib/api';

interface Drop {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  availableStock: number;
  releaseDate: string;
  claimWindowStart: string;
  claimWindowEnd: string;
}

export default function EditDropPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { token, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [releaseDate, setReleaseDate] = useState('');
  const [claimWindowStart, setClaimWindowStart] = useState('');
  const [claimWindowEnd, setClaimWindowEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!id) {
      setError('Drop ID bulunamadı.');
      toast.error('Drop ID bulunamadı.');
      setLoading(false);
      return;
    }

    async function fetchDrop() {
      try {
        const response = await fetch(`${API_URL}/admin/drops/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Drop detayları yüklenemedi.');
        }

        const data: Drop = await response.json();
        setName(data.name);
        setDescription(data.description || '');
        setPrice(data.price);
        setStock(data.stock);
        setReleaseDate(data.releaseDate.substring(0, 16)); // YYYY-MM-DDTHH:MM formatı için
        setClaimWindowStart(data.claimWindowStart.substring(0, 16));
        setClaimWindowEnd(data.claimWindowEnd.substring(0, 16));
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message || 'Drop detayları yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchDrop();
  }, [id, isAuthenticated, token, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_URL}/admin/drops/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price.toString()),
          stock: parseInt(stock.toString()),
          releaseDate: new Date(releaseDate).toISOString(),
          claimWindowStart: new Date(claimWindowStart).toISOString(),
          claimWindowEnd: new Date(claimWindowEnd).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Drop güncellenirken bir hata oluştu.');
      }

      const updatedDrop = await response.json();
      toast.success(`Drop başarıyla güncellendi: ${updatedDrop.name}`);
      router.push('/admin/drops');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Drop güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Hata: {error}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Drop Düzenle: {name}</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">İsim:</label>
              <input
                type="text"
                id="name"
                name="name"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Fiyat:</label>
              <input
                type="number"
                id="price"
                name="price"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Açıklama:</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stok:</label>
              <input
                type="number"
                id="stock"
                name="stock"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value))}
                required
              />
            </div>
            <div>
              <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-1">Yayın Tarihi:</label>
              <input
                type="datetime-local"
                id="releaseDate"
                name="releaseDate"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="claimWindowStart" className="block text-sm font-medium text-gray-700 mb-1">Talep Başlangıç Penceresi:</label>
              <input
                type="datetime-local"
                id="claimWindowStart"
                name="claimWindowStart"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={claimWindowStart}
                onChange={(e) => setClaimWindowStart(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="claimWindowEnd" className="block text-sm font-medium text-gray-700 mb-1">Talep Bitiş Penceresi:</label>
              <input
                type="datetime-local"
                id="claimWindowEnd"
                name="claimWindowEnd"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={claimWindowEnd}
                onChange={(e) => setClaimWindowEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-end">
            {error && <p className="text-red-500 text-sm mr-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mr-4">{success}</p>}
            <button
              type="submit"
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Güncelleniyor...' : `Drop'u Güncelle`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
