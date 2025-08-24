'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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

      {/* Success Content */}
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)] px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* Main Success Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 border border-gray-100">
            {/* Success Messages */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                🎉 Thank You!
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-green-600 mb-6">
                Teşekkür Ederiz!
              </h2>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 mb-6">
                <p className="text-lg text-gray-700 mb-3 leading-relaxed">
                  <strong>Your response has been submitted successfully!</strong> 
                  We deeply appreciate your valuable time and thoughtful participation in this research.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  <strong>Yanıtınız başarıyla gönderildi!</strong> 
                  Bu araştırmaya ayırdığınız değerli zaman ve düşünceli katılımınız için çok teşekkür ederiz.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-blue-900 mb-2">What happens next? / Bundan sonra ne olacak?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Your data will be analyzed as part of our research</li>
                      <li>• All responses remain completely anonymous</li>
                      <li>• Results will contribute to scientific knowledge</li>
                      <li>• Verileriniz araştırmamızın bir parçası olarak analiz edilecek</li>
                      <li>• Tüm yanıtlar tamamen anonim kalacak</li>
                      <li>• Sonuçlar bilimsel bilgiye katkıda bulunacak</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return Home / Ana Sayfa
              </Link>
              
              <button
                onClick={() => window.close()}
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Tab / Sekmeyi Kapat
              </button>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 leading-relaxed">
                Your participation helps advance research in Turkish language processing and data collection methodologies. 
                <br />
                Katılımınız Türkçe dil işleme ve veri toplama metodolojilerindeki araştırmaların ilerlemesine yardımcı oluyor.
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center space-x-8 opacity-20">
            <div className="w-12 h-12 bg-green-200 rounded-full"></div>
            <div className="w-8 h-8 bg-blue-200 rounded-full mt-4"></div>
            <div className="w-16 h-16 bg-purple-200 rounded-full -mt-2"></div>
            <div className="w-6 h-6 bg-yellow-200 rounded-full mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}