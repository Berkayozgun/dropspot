"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // useParams hook'u eklendi
import { useAuth } from '../../../../context/AuthContext'; // useAuth hook'unu import et

interface ClaimResult {
  message: string;
  claimCode?: string;
}

interface Drop {
  id: string;
  name: string;
}

export default function ClaimPage() { // params prop'u kaldırıldı
  const router = useRouter();
  const params = useParams(); // useParams hook'unu kullanarak params'ı al
  const id = params.id as string;
  const { token, isAuthenticated } = useAuth();

  const [dropName, setDropName] = useState('Unknown Drop');
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!id) {
      setError('Drop ID bulunamadı.');
      setLoading(false);
      return;
    }

    async function fetchDropName() {
      try {
        const response = await fetch(`http://localhost:3000/drops/${id}`);
        if (!response.ok) {
          throw new Error('Drop adı yüklenemedi.');
        }
        const data: Drop = await response.json();
        setDropName(data.name);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDropName();
  }, [id, isAuthenticated, router]);

  const handleClaimDrop = async () => {
    if (!isAuthenticated) {
      alert('Hak talebinde bulunmak için giriş yapmalısınız.');
      router.push('/auth/login');
      return;
    }

    setError(null);
    setClaimLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/drops/${id}/claim`, {
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

      setClaimCode(data.claimCode);
      alert(data.message || 'Başarıyla hak talebinde bulunuldu!');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    }
    setClaimLoading(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Yükleniyor...</div>;
  }

  if (claimCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-600">Hak Talebi Başarılı!</h1>
          <p className="mb-4">Drop için hak talebinde bulunuldu.</p>
          {claimCode && (
            <p className="text-xl font-bold mb-4">Claim Kodu: <span className="text-blue-600 break-all">{claimCode}</span></p>
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
        {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
        <button
          onClick={handleClaimDrop}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline"
          disabled={claimLoading}
        >
          {claimLoading ? 'Talep Ediliyor...' : `Drop'u Talep Et`}
        </button>
      </div>
    </div>
  );
}
