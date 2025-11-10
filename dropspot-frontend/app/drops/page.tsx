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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Aktif Droplar</h1>
      {drops.length === 0 ? (
        <p>Henüz aktif drop bulunmamaktadır.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map((drop) => (
            <Link href={`/drops/${drop.id}`} key={drop.id} className="block border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{drop.name}</h2>
              <p className="text-gray-600 mb-2">{drop.description}</p>
              <p className="text-lg font-bold">Fiyat: ${drop.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Mevcut Stok: {drop.availableStock} / {drop.stock}</p>
              <p className="text-sm text-gray-500">Yayın Tarihi: {new Date(drop.releaseDate).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
