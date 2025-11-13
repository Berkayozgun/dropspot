"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // useParams hook'u eklendi
import { useAuth } from '../../../context/AuthContext'; // useAuth hook'unu import et
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

export default function DropDetailPage() { // params prop'u kaldırıldı
  const router = useRouter();
  const params = useParams(); // useParams hook'unu kullanarak params'ı al
  const id = params.id as string;
  const { isAuthenticated, token } = useAuth(); // useAuth hook'unu kullan

  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Drop ID bulunamadı.');
      return;
    }

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

  useEffect(() => {
    if (!drop) return;
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const releaseTime = new Date(drop.releaseDate).getTime();
      const claimStartTime = new Date(drop.claimWindowStart).getTime();
      const claimEndTime = new Date(drop.claimWindowEnd).getTime();
      let distance = 0;
      let message = '';

      if (now < releaseTime) {
        distance = releaseTime - now;
        message = 'Yayınlanmasına Kalan Süre: ';
      } else if (now < claimStartTime) {
        distance = claimStartTime - now;
        message = 'Claim Penceresinin Açılmasına Kalan Süre: ';
      } else if (now < claimEndTime) {
        distance = claimEndTime - now;
        message = 'Claim Penceresinin Kapanmasına Kalan Süre: ';
      } else {
        setCountdown('Drop sona erdi.');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${message}${days}g ${hours}s ${minutes}d ${seconds}sn`);
    };

    const interval = setInterval(calculateCountdown, 1000);
    calculateCountdown(); // İlk çalıştırmayı hemen yap

    return () => clearInterval(interval);
  }, [drop]);

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      toast.info('Bekleme listesine katılmak için giriş yapmalısınız.');
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

      toast.success('Bekleme listesine başarıyla katıldınız!');
    } catch (err: any) {
      setJoinError(err.message || 'Bir hata oluştu.');
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!isAuthenticated) {
      toast.info('Bekleme listesinden ayrılmak için giriş yapmalısınız.');
      router.push('/auth/login');
      return;
    }

    setJoinError(null);
    setJoinLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/drops/${id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bekleme listesinden ayrılamadı.');
      }

      toast.success('Bekleme listesinden başarıyla ayrıldınız!');
    } catch (err: any) {
      setJoinError(err.message || 'Bir hata oluştu.');
      toast.error(err.message || 'Bir hata oluştu.');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8 text-center text-lg">Drop Detayları Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-red-600 text-lg">Hata: {error}</div>;
  }

  if (!drop) {
    return <div className="container mx-auto p-8 text-center text-gray-600 text-lg">Drop bulunamadı.</div>;
  }

  const now = new Date();
  const isClaimWindowOpen = now >= new Date(drop.claimWindowStart) && now <= new Date(drop.claimWindowEnd);

  return (
    <div className="container mx-auto p-8 bg-white shadow-xl rounded-lg mt-10">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">{drop.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Açıklama</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{drop.description}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-xl font-bold text-indigo-700 mb-2">Fiyat: ${drop.price.toFixed(2)}</p>
            <p className="text-md text-gray-600 mb-2">Mevcut Stok: <span className="font-semibold">{drop.availableStock}</span> / {drop.stock}</p>
            <p className="text-sm text-gray-500">Yayın Tarihi: <span className="font-semibold">{new Date(drop.releaseDate).toLocaleDateString()}</span></p>
            <p className="text-sm text-gray-500">Claim Penceresi: <span className="font-semibold">{new Date(drop.claimWindowStart).toLocaleDateString()} {new Date(drop.claimWindowStart).toLocaleTimeString()}</span> - <span className="font-semibold">{new Date(drop.claimWindowEnd).toLocaleDateString()} {new Date(drop.claimWindowEnd).toLocaleTimeString()}</span></p>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center bg-indigo-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-indigo-800 mb-4">Durum</h3>
          {countdown && <p className="text-2xl font-mono text-indigo-900 mb-4 text-center">{countdown}</p>}
          {isClaimWindowOpen ? (
            <p className="text-green-600 font-bold text-2xl mb-4">Claim Penceresi AÇIK!</p>
          ) : (
            <p className="text-red-600 font-bold text-2xl mb-4">Claim Penceresi KAPALI.</p>
          )}

          {joinError && <p className="text-red-500 text-sm italic mb-4 text-center">{joinError}</p>}
          
          <div className="flex flex-col space-y-3 w-full max-w-xs">
            <button
              onClick={handleJoinWaitlist}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={joinLoading}
            >
              {joinLoading ? 'Katılıyor...' : 'Bekleme Listesine Katıl'}
            </button>

            <button
              onClick={handleLeaveWaitlist}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={joinLoading}
            >
              {joinLoading ? 'Ayrılıyor...' : 'Bekleme Listesinden Ayrıl'}
            </button>

            {isClaimWindowOpen && isAuthenticated && (
              <button
                onClick={() => router.push(`/drops/${id}/claim`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
              >
                Drop'u Talep Et
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
