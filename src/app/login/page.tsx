'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function UserLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [banInfo, setBanInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBanInfo(null);

    try {
      const response = await fetch('/api/auth/user-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // Check if this is a ban error with additional info
        if (data.banInfo) {
          setBanInfo(data.banInfo);
          setError(data.error || 'Your account has been banned.');
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
      
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/logo.png" 
                alt="DataLinguaLab Logo" 
                width={60} 
                height={60}
                className="rounded-xl mx-auto"
              />
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Kullanıcı Girişi
            </h2>
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              User Login
            </h3>
            <p className="text-gray-600">
              Anket oluşturmak için giriş yapın
            </p>
            <p className="text-sm text-gray-500">
              <em>Sign in to create surveys</em>
            </p>
          </div>

          {/* Info Notice for Unapproved Users */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Önemli Bilgi / Important Info</h4>
                <div className="text-sm text-blue-800">
                  <p className="mb-1">Sadece onaylanan kullanıcılar giriş yapabilir.</p>
                  <p className="text-xs"><em>Only approved users can log in.</em></p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-posta / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şifre / Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            {error && banInfo && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-red-800 mb-3">
                      🚫 Hesap Yasaklandı / Account Banned
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 border border-red-100">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Sebep / Reason:</span>
                            <p className="text-red-700 mt-1">{banInfo.reason}</p>
                          </div>
                          
                          {banInfo.bannedAt && (
                            <div>
                              <span className="font-semibold text-gray-700">Yasaklanma Tarihi / Banned Date:</span>
                              <p className="text-gray-600 mt-1">
                                {new Date(banInfo.bannedAt).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          )}
                          
                          {banInfo.isPermanent ? (
                            <div className="bg-red-100 p-3 rounded-lg">
                              <span className="font-semibold text-red-800">⚠️ Kalıcı Yasak / Permanent Ban</span>
                              <p className="text-red-700 text-xs mt-1">
                                Bu yasak kalıcıdır. Lütfen yöneticiyle iletişime geçin.
                              </p>
                              <p className="text-red-600 text-xs italic">
                                This ban is permanent. Please contact the administrator.
                              </p>
                            </div>
                          ) : banInfo.expiresAt && (
                            <div className="bg-orange-100 p-3 rounded-lg">
                              <span className="font-semibold text-orange-800">⏰ Geçici Yasak / Temporary Ban</span>
                              <div className="mt-2 text-sm">
                                <p className="text-orange-700">
                                  <span className="font-medium">Bitiş Tarihi / Expires:</span> {' '}
                                  {new Date(banInfo.expiresAt).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {banInfo.daysRemaining > 0 && (
                                  <p className="text-orange-600 font-medium mt-1">
                                    📅 Kalan Süre / Days Remaining: {banInfo.daysRemaining} gün / days
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <strong>💬 İtiraz / Appeal:</strong> Bu kararla ilgili itirazlarınızı yöneticiyle paylaşabilirsiniz.
                        </p>
                        <p className="text-blue-600 text-xs italic mt-1">
                          You can share your appeals regarding this decision with the administrator.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && !banInfo && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Giriş Yap / Sign In
                </>
              )}
            </button>

            {/* Additional Links */}
            <div className="text-center space-y-3">
              <div className="text-sm text-gray-600">
                Hesabınız yok mu? / Don't have an account?
              </div>
              <Link
                href="/register"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Kayıt Ol / Register
              </Link>
            </div>

            {/* Back to Home */}
            <div className="pt-4 border-t border-gray-200 text-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Ana Sayfaya Dön / Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}