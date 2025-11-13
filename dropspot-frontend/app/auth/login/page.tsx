"use client";

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; // useAuth hook'unu import et
import { useRouter } from 'next/navigation'; // useRouter hook'unu import et
import Link from 'next/link'; // Link component'ini import et
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // useAuth hook'unu kullan
  const router = useRouter(); // useRouter hook'unu kullan

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş başarısız.');
      }

      // Başarılı giriş: token'ı AuthContext'e kaydet ve yönlendir
      login(data.token);
      toast.success('Giriş başarılı!');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.'); // Local state'e hata mesajı kaydet
      toast.error(err.message || 'Bir hata oluştu.'); // Toast bildirimi göster
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Giriş Yap</h1>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">E-posta:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="sr-only">Parola:</label>
              <input
                type="password"
                id="password"
                name="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Parolanız"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 text-sm mt-4">
          Hesabınız yok mu? <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}
