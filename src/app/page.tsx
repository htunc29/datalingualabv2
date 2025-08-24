import Link from 'next/link';
import Image from 'next/image';
import RecentSurveysSection from '@/components/RecentSurveysSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Logos */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6">
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
            </div>
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

      {/* Main Content */}
      <div className="flex items-center justify-center p-8 pt-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Türkçe Veri Toplama Platformu
          </h2>
          <h3 className="text-3xl font-semibold text-blue-700 mb-8">
            Turkish Data Collection Platform
          </h3>
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Dil ve biliş araştırmalarında önemli bir eksiklik olan çevrimiçi ses verisi toplama sistemini 
            geliştirmeyi amaçlayan TÜBİTAK destekli projemiz kapsamında, Türkçe veri setleri toplamaya 
            yönelik benzersiz bir çevrimiçi araç geliştiriyoruz.
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            <em>Our TÜBİTAK-supported project focuses on developing a unique online tool for collecting 
            Turkish datasets, addressing the significant gap in online audio data collection systems 
            for language and cognitive research.</em>
          </p>

          {/* Login/Register Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/register" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 inline-flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Kayıt Ol / Register
            </Link>
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 inline-flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Giriş Yap / Login
            </Link>
          </div>
        
          {/* Project Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Anket Oluşturma</h3>
              <h4 className="text-lg font-medium text-blue-600 mb-3">Survey Creation</h4>
              <p className="text-gray-600 mb-6">
                Anket oluşturmak için kayıt olun ve onay bekleyin. Onaylandıktan sonra 
                metin, çoktan seçmeli, ses kaydı ve dosya yükleme gibi farklı soru türleriyle 
                kapsamlı anketler oluşturabilirsiniz.
              </p>
              <p className="text-sm text-gray-500">
                <em>Register to create surveys and wait for approval. Once approved, you can create 
                comprehensive surveys with text, multiple choice, audio recording, and file upload question types.</em>
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Ses Kaydı</h3>
              <h4 className="text-lg font-medium text-green-600 mb-3">Audio Recording</h4>
              <p className="text-gray-600 mb-6">
                Dil araştırmaları için kritik olan yüksek kaliteli ses verilerini 
                çevrimiçi ortamda kolayca toplayın ve analiz edin.
              </p>
              <div className="text-green-600 font-medium">
                🎤 Yerleşik ses kayıt sistemi
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-purple-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Veri Analizi</h3>
              <h4 className="text-lg font-medium text-purple-600 mb-3">Data Analysis</h4>
              <p className="text-gray-600 mb-6">
                Toplanan verileri çeşitli formatlarda dışa aktarın ve 
                dil araştırmalarınızda kullanmak üzere analiz edin.
              </p>
              <div className="text-purple-600 font-medium">
                📊 JSON & CSV dışa aktarım
              </div>
            </div>
          </div>
          
          {/* Project Information */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl shadow-lg mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Proje Özellikleri / Project Features</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl mb-2">📝</div>
                <div className="font-semibold">Çoklu Soru Türü</div>
                <div className="text-sm opacity-90">Multiple Question Types</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl mb-2">🎤</div>
                <div className="font-semibold">Ses Kaydı</div>
                <div className="text-sm opacity-90">Audio Recording</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl mb-2">🔗</div>
                <div className="font-semibold">Paylaşım Linkleri</div>
                <div className="text-sm opacity-90">Shareable Links</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold">Veri Analizi</div>
                <div className="text-sm opacity-90">Data Analytics</div>
              </div>
            </div>
          </div>

          {/* Recent Surveys Section */}
          <RecentSurveysSection />

          {/* All Surveys Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tüm Anketler / All Surveys
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Platformumuzda oluşturulan tüm aktif anketleri görüntüleyin. Araştırmacılar 
                tarafından paylaşılan çeşitli dil ve biliş çalışmalarına katılabilirsiniz.
              </p>
              <p className="text-sm text-gray-500 italic mb-8">
                View all active surveys created on our platform. You can participate in various 
                language and cognitive studies shared by researchers.
              </p>
              <Link
                href="/surveys"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 inline-flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Tüm Anketleri Görüntüle / View All Surveys
              </Link>
            </div>
          </div>

          {/* Footer Information */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                DataLinguaLab - TÜBİTAK Destekli Araştırma Projesi
              </h4>
              <p className="text-gray-600 mb-4 max-w-3xl mx-auto">
                Bu platform, Türkiye&apos;de dil ve biliş araştırmalarını desteklemek amacıyla 
                geliştirilmiş özgün bir veri toplama aracıdır. Ses verilerinin çevrimiçi 
                toplanmasındaki eksikliği gidererek araştırmacılara kapsamlı bir çözüm sunar.
              </p>
              <p className="text-sm text-gray-500 italic">
                This platform is a unique data collection tool developed to support language and 
                cognitive research in Turkey, providing researchers with a comprehensive solution 
                to address the gap in online audio data collection.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-8">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src="/logo.png" 
                      alt="DataLinguaLab" 
                      width={40} 
                      height={40}
                      className="rounded"
                    />
                    <span className="font-medium text-gray-700">DataLinguaLab</span>
                  </div>
                  <div className="text-gray-400">×</div>
                  <div className="flex items-center space-x-3">
                    <Image 
                      src="/tübitak.png" 
                      alt="TÜBİTAK" 
                      width={60} 
                      height={24}
                      className="h-6 w-auto"
                    />
                    <span className="font-medium text-gray-700">TÜBİTAK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
