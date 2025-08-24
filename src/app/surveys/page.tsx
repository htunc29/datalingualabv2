'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SurveyInfo {
  _id: string;
  title: string;
  description: string;
  shareableId: string;
  questionCount: number;
  responseCount: number;
  hasAudio: boolean;
  hasFiles: boolean;
  createdAt: string;
  createdBy?: {
    name: string;
    organization: string;
    type: string;
  };
  responseRate: string;
}

export default function AllSurveysPage() {
  const [surveys, setSurveys] = useState<SurveyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSurveys, setFilteredSurveys] = useState<SurveyInfo[]>([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    // Filter surveys based on search term
    if (searchTerm.trim() === '') {
      setFilteredSurveys(surveys);
    } else {
      const filtered = surveys.filter(survey =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (survey.createdBy?.name && survey.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (survey.createdBy?.organization && survey.createdBy.organization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSurveys(filtered);
    }
  }, [searchTerm, surveys]);

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys/public');
      if (response.ok) {
        const data = await response.json();
        setSurveys(data.surveys || []);
        setFilteredSurveys(data.surveys || []);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center space-x-4 sm:space-x-6 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="DataLinguaLab Logo" 
                width={50} 
                height={50}
                className="rounded-lg sm:w-[60px] sm:h-[60px]"
              />
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">DataLinguaLab</h1>
                <p className="text-xs sm:text-sm text-gray-600">Turkish Data Collection Platform</p>
              </div>
            </Link>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-center sm:text-right text-xs sm:text-sm text-gray-600">
                <p className="font-medium">Destekleyen / Supported by</p>
              </div>
              <Image 
                src="/tübitak.png" 
                alt="TÜBİTAK Logo" 
                width={80} 
                height={32}
                className="h-8 w-auto sm:h-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Tüm Anketler / All Surveys
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
              DataLinguaLab platformunda bulunan tüm aktif anketleri keşfedin. Türkçe dil ve biliş 
              araştırmalarına katılarak bilime katkıda bulunun.
            </p>
            <p className="text-gray-500 leading-relaxed max-w-2xl mx-auto">
              <em>Discover all active surveys on the DataLinguaLab platform. Contribute to science 
              by participating in Turkish language and cognitive research.</em>
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Anket ara... / Search surveys..."
                className="block w-full pl-10 pr-3 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Başlık, açıklama, araştırmacı adı veya kurum adına göre arama yapabilirsiniz.
              <br />
              <em>You can search by title, description, researcher name, or organization.</em>
            </p>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900">{filteredSurveys.length}</span>
                <span className="text-gray-600 ml-2">
                  anket bulundu / surveys found
                  {searchTerm && (
                    <span className="ml-2 text-purple-600">
                      &quot;{searchTerm}&quot; için
                    </span>
                  )}
                </span>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Filtreyi temizle / Clear filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Surveys Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-6 w-3/4"></div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz anket bulunmuyor'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `"${searchTerm}" aramasına uygun anket bulunamadı.`
                : 'Platformda henüz anket oluşturulmamış.'
              }
            </p>
            <p className="text-sm text-gray-400 italic">
              {searchTerm 
                ? `No surveys found matching "${searchTerm}".`
                : 'No surveys have been created on the platform yet.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Tüm anketleri göster / Show all surveys
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <div key={survey._id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  {/* Survey Header */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{survey.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{survey.description}</p>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                      <div className="text-xl font-bold text-blue-700">{survey.questionCount}</div>
                      <div className="text-xs text-blue-600">Sorular / Questions</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                      <div className="text-xl font-bold text-green-700">{survey.responseCount}</div>
                      <div className="text-xs text-green-600">Katılımcı / Responses</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {survey.hasAudio && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Ses Kaydı
                      </span>
                    )}
                    {survey.hasFiles && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Dosya Yükleme
                      </span>
                    )}
                  </div>

                  {/* Creator Information */}
                  {survey.createdBy && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{survey.createdBy.name}</div>
                          <div className="text-xs text-gray-600 mb-1">{survey.createdBy.organization}</div>
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {survey.createdBy.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date and Response Rate */}
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <div>Oluşturulma: {formatDate(survey.createdAt)}</div>
                    <div className="font-medium text-gray-700">{survey.responseRate}</div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <Link
                    href={`/survey/${survey.shareableId}`}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium text-center block"
                  >
                    Ankete Katıl / Participate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfaya Dön / Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}