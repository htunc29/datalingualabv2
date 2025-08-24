'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  researchArea: string;
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: any[];
  shareableId: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user-me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        fetchSurveys();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/user/surveys');
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/user-logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  const deleteSurvey = async (id: string) => {
    if (confirm('Bu anketi silmek istediğinizden emin misiniz? / Are you sure you want to delete this survey?')) {
      try {
        const response = await fetch(`/api/surveys/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setSurveys(surveys.filter(survey => survey._id !== id));
        }
      } catch (error) {
        console.error('Error deleting survey:', error);
      }
    }
  };

  const copyLink = async (shareableId: string) => {
    const surveyUrl = `${window.location.origin}/survey/${shareableId}`;
    try {
      await navigator.clipboard.writeText(surveyUrl);
      // Show a temporary success message
      const button = document.querySelector(`[data-survey-id="${shareableId}"]`) as HTMLElement;
      if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '✓ Kopyalandı!';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove('bg-green-600');
        }, 2000);
      }
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = surveyUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link kopyalandı! / Link copied!');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between py-6 gap-4">
            <div className="flex items-center space-x-4">
              <Image 
                src="/logo.png" 
                alt="DataLinguaLab Logo" 
                width={50} 
                height={50}
                className="rounded-xl"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Paneli</h1>
                <p className="text-gray-600 mt-1">User Dashboard - {user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Link 
                href="/dashboard/create" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Anket Oluştur / Create Survey
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıkış / Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-600 text-sm font-medium">İsim / Name</div>
              <div className="text-gray-900 font-semibold">{user?.firstName} {user?.lastName}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 text-sm font-medium">Kurum / Organization</div>
              <div className="text-gray-900 font-semibold">{user?.organization}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-600 text-sm font-medium">Araştırma Alanı / Research Area</div>
              <div className="text-gray-900 font-semibold">{user?.researchArea}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-amber-600 text-sm font-medium">Anket Sayısı / Survey Count</div>
              <div className="text-gray-900 font-semibold">{surveys.length}</div>
            </div>
          </div>
        </div>

        {/* Surveys Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Anketleriniz / Your Surveys</h2>
              <p className="text-gray-600">Oluşturduğunuz anketleri yönetin ve yanıtları görüntüleyin</p>
            </div>
            {surveys.length > 0 && (
              <div className="text-sm text-gray-500">
                {surveys.length} anket / survey
              </div>
            )}
          </div>

          {surveys.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Henüz anket oluşturmadınız</h3>
              <h4 className="text-lg text-blue-600 mb-3">No surveys created yet</h4>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                İlk anketinizi oluşturarak Türkçe dil verisi toplamaya başlayın. 
                Ses kaydı, metin ve dosya yükleme seçenekleriyle kapsamlı anketler oluşturabilirsiniz.
              </p>
              <Link 
                href="/dashboard/create" 
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                İlk Anketinizi Oluşturun / Create Your First Survey
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {surveys.map((survey) => (
                <div key={survey._id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{survey.title}</h3>
                    <p className="text-blue-100 text-sm line-clamp-2">{survey.description}</p>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(survey.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {survey.questions?.length || 0} soru
                      </div>
                    </div>
                    
                    {/* Survey Link Display */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-3">
                          <label className="text-xs font-medium text-gray-600 mb-1 block">
                            Anket Linki / Survey Link
                          </label>
                          <input
                            type="text"
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/survey/${survey.shareableId}`}
                            readOnly
                            className="w-full text-xs text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => copyLink(survey.shareableId)}
                          data-survey-id={survey.shareableId}
                          className="inline-flex items-center px-3 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 text-xs"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2M8 5a2 2 0 012 2v3m6 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v3m12 0v9a2 2 0 01-2 2H9a2 2 0 01-2-2v-9a2 2 0 012-2h10a2 2 0 012 2z" />
                          </svg>
                          Kopyala
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={`/survey/${survey.shareableId}`}
                          target="_blank"
                          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l5 5m0 0l5-5m-5 5V3" />
                          </svg>
                          Önizle / Preview
                        </Link>
                        <Link
                          href={`/admin/responses/${survey._id}`}
                          className="inline-flex items-center justify-center px-4 py-2.5 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Yanıtlar / Responses
                        </Link>
                      </div>
                      <button
                        onClick={() => deleteSurvey(survey._id)}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Sil / Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}