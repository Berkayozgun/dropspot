"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext'; // useAuth hook'unu import et

interface ClaimResult {
  message: string;
  claimCode?: string;
}

export default function ClaimPage({ params }: { params: { id: string } }) {
  const { id: dropId } = params;
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  const [dropName, setDropName] = useState('Loading...'); // Drop adını göstermek için
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<ClaimResult | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login'); // Giriş yapmamışsa login sayfasına yönlendir
      return;
    }

    async function fetchDropName() {
      try {
        const response = await fetch(`http://localhost:3000/drops/${dropId}`);
        if (!response.ok) {
          throw new Error('Drop bilgileri yüklenemedi.');
        }
        const data = await response.json();
        setDropName(data.name);
      } catch (err: any) {
        console.error('Error fetching drop name:', err);
        setDropName('Unknown Drop');
      } finally {
        setLoading(false);
      }
    }

    fetchDropName();
  }, [isAuthenticated, router, dropId]);

  const handleClaimDrop = async () => {
    if (!isAuthenticated) {
      alert('Hak talebinde bulunmak için giriş yapmalısınız.');
      router.push('/auth/login');
      return;
    }

    setClaimError(null);
    setClaimLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/drops/${dropId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ClaimResult = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Hak talebi başarısız.');
      }

      setClaimSuccess(data);
      alert(data.message || 'Başarıyla hak talebinde bulunuldu!');
    } catch (err: any) {
      setClaimError(err.message || 'Bir hata oluştu.');
    }
    setClaimLoading(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Yükleniyor...</div>;
  }

  if (claimSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-600">Hak Talebi Başarılı!</h1>
          <p className="mb-4">{claimSuccess.message}</p>
          {claimSuccess.claimCode && (
            <p className="text-xl font-bold mb-4">Claim Kodu: <span className="text-blue-600 break-all">{claimSuccess.claimCode}</span></p>
          )}
          <button
            onClick={() => router.push('/drops')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Droplara Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">{dropName} için Hak Talebi</h1>
        <p className="text-center text-gray-700 mb-4">Drop için hak talebinde bulunmak üzeresiniz.</p>
        {claimError && <p className="text-red-500 text-xs italic mb-4 text-center">{claimError}</p>}
        <button
          onClick={handleClaimDrop}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline"
          disabled={claimLoading}
        >
          {claimLoading ? 'Talep Ediliyor...' : 'Drop'u Talep Et'}
        </button>
      </div>
    </div>
  );
}
