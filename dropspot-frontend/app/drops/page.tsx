"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Drop {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  availableStock: number;
  releaseDate: string; // ISO string
  claimWindowStart: string; // ISO string
  claimWindowEnd: string; // ISO string
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrops() {
      try {
        const response = await fetch('http://localhost:3000/drops');
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

    fetchDrops();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Hata: {error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Aktif Droplar</h1>
      {drops.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">Henüz aktif drop bulunmamaktadır.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <Link href={`/drops/${drop.id}`} key={drop.id} className="block bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{drop.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{drop.description}</p>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xl font-extrabold text-indigo-600">${drop.price.toFixed(2)}</p>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Stok: {drop.availableStock} / {drop.stock}</span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p><span className="font-semibold">Yayın Tarihi:</span> {new Date(drop.releaseDate).toLocaleDateString()}</p>
                <p><span className="font-semibold">Claim Başlangıç:</span> {new Date(drop.claimWindowStart).toLocaleDateString()} {new Date(drop.claimWindowStart).toLocaleTimeString()}</p>
                <p><span className="font-semibold">Claim Bitiş:</span> {new Date(drop.claimWindowEnd).toLocaleDateString()} {new Date(drop.claimWindowEnd).toLocaleTimeString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
