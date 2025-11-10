"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // useAuth hook'unu import et

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

export default function DropDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { isAuthenticated, token } = useAuth(); // useAuth hook'unu kullan

  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDropDetails() {
      try {
        const response = await fetch(`http://localhost:3000/drops/${id}`);
        if (!response.ok) {
          throw new Error('Drop detayları yüklenemedi.');
        }
        const data: Drop = await response.json();
        setDrop(data);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchDropDetails();
  }, [id]);

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      alert('Bekleme listesine katılmak için giriş yapmalısınız.');
      router.push('/auth/login');
      return;
    }

    setJoinError(null);
    setJoinLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/drops/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bekleme listesine katılamadı.');
      }

      alert('Bekleme listesine başarıyla katıldınız!');
    } catch (err: any) {
      setJoinError(err.message || 'Bir hata oluştu.');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Hata: {error}</div>;
  }

  if (!drop) {
    return <div className="container mx-auto p-4">Drop bulunamadı.</div>;
  }

  const now = new Date();
  const isClaimWindowOpen = now >= new Date(drop.claimWindowStart) && now <= new Date(drop.claimWindowEnd);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Drop Detayı: {drop.name}</h1>
      <p className="text-gray-700 mb-4">{drop.description}</p>
      <p className="text-xl font-bold mb-2">Fiyat: ${drop.price.toFixed(2)}</p>
      <p className="text-md text-gray-600 mb-2">Mevcut Stok: {drop.availableStock} / {drop.stock}</p>
      <p className="text-sm text-gray-500">Yayın Tarihi: {new Date(drop.releaseDate).toLocaleDateString()}</p>
      <p className="text-sm text-gray-500">Claim Penceresi: {new Date(drop.claimWindowStart).toLocaleDateString()} - {new Date(drop.claimWindowEnd).toLocaleDateString()}</p>
      
      {isClaimWindowOpen ? (
        <p className="text-green-600 font-bold mt-4">Claim Penceresi AÇIK!</p>
      ) : (
        <p className="text-red-600 font-bold mt-4">Claim Penceresi KAPALI.</p>
      )}

      {joinError && <p className="text-red-500 text-xs italic mt-4">{joinError}</p>}
      <button
        onClick={handleJoinWaitlist}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        disabled={joinLoading}
      >
        {joinLoading ? 'Katılıyor...' : 'Join Waitlist'}
      </button>

      {isClaimWindowOpen && isAuthenticated && (
        <button
          onClick={() => router.push(`/drops/${id}/claim`)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2 mt-4"
        >
          Claim Drop
        </button>
      )}

    </div>
  );
}
