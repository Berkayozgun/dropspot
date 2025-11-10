"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

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
  createdAt: string;
  updatedAt: string;
}

export default function DropDetailPage({ params }: { params: { id: string } }) {
  const { id: dropId } = params;
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const fetchDropDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/drops/${dropId}`);
      if (!response.ok) {
        throw new Error('Drop detayları yüklenemedi.');
      }
      const data: Drop = await response.json();
      setDrop(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkWaitlistStatus = async () => {
    if (!isAuthenticated || !token) {
      setIsOnWaitlist(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/drops/${dropId}/waitlist-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsOnWaitlist(data.isOnWaitlist);
      } else if (response.status === 404) {
        // User is not on waitlist
        setIsOnWaitlist(false);
      } else {
        console.error('Bekleme listesi durumu kontrol edilirken hata oluştu.', await response.json());
        setIsOnWaitlist(false);
      }
    } catch (err) {
      console.error('Bekleme listesi durumu kontrol edilirken hata oluştu.', err);
      setIsOnWaitlist(false);
    }
  };

  useEffect(() => {
    fetchDropDetails();
    checkWaitlistStatus();
  }, [isAuthenticated, token, dropId]);

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      alert('Bekleme listesine katılmak için giriş yapmalısınız.');
      router.push('/auth/login');
      return;
    }
    setWaitlistLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/drops/${dropId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Bekleme listesine katılırken hata oluştu.');
      }
      alert('Başarıyla bekleme listesine katıldınız!');
      setIsOnWaitlist(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!!isAuthenticated) {
      alert('Bekleme listesinden ayrılmak için giriş yapmalısınız.');
      router.push('/auth/login');
      return;
    }
    setWaitlistLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/drops/${dropId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Bekleme listesinden ayrılırken hata oluştu.');
      }
      alert('Başarıyla bekleme listesinden ayrıldınız!');
      setIsOnWaitlist(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleClaimDrop = () => {
    router.push(`/drops/${dropId}/claim`);
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
  const releaseDate = new Date(drop.releaseDate);
  const claimWindowStart = new Date(drop.claimWindowStart);
  const claimWindowEnd = new Date(drop.claimWindowEnd);

  const isClaimWindowOpen = now >= claimWindowStart && now <= claimWindowEnd;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{drop.name}</h1>
        <p className="text-gray-600 mb-6">{drop.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-700">
          <div>
            <p><strong>Fiyat:</strong> ${drop.price}</p>
            <p><strong>Stok:</strong> {drop.stock}</p>
            <p><strong>Mevcut Stok:</strong> {drop.availableStock}</p>
          </div>
          <div>
            <p><strong>Yayın Tarihi:</strong> {new Date(drop.releaseDate).toLocaleString()}</p>
            <p><strong>Claim Başlangıcı:</strong> {new Date(drop.claimWindowStart).toLocaleString()}</p>
            <p><strong>Claim Bitişi:</strong> {new Date(drop.claimWindowEnd).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isAuthenticated ? (
            isOnWaitlist ? (
              <button
                onClick={handleLeaveWaitlist}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                disabled={waitlistLoading}
              >
                {waitlistLoading ? 'Ayrılıyor...' : 'Bekleme Listesinden Ayrıl'}
              </button>
            ) : (
              <button
                onClick={handleJoinWaitlist}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                disabled={waitlistLoading}
              >
                {waitlistLoading ? 'Katılıyor...' : 'Bekleme Listesine Katıl'}
              </button>
            )
          ) : (
            <p className="text-yellow-600">Bekleme listesine katılmak için giriş yapmalısınız.</p>
          )}

          {isAuthenticated && isOnWaitlist && isClaimWindowOpen && ( drop.availableStock > 0 ) && (
            <button
              onClick={handleClaimDrop}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out mt-4"
            >
              Drop'u Talep Et
            </button>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out mt-4"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
