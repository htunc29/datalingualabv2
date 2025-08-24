'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function RecentSurveysSection() {
  const [surveys, setSurveys] = useState<SurveyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSurveys();
  }, []);

  const fetchRecentSurveys = async () => {
    try {
      const response = await fetch('/api/surveys/public?recent=true&limit=3');
      if (response.ok) {
        const data = await response.json();
        setSurveys(data.surveys || []);
      }
    } catch (error) {
      console.error('Error fetching recent surveys:', error);
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Son Anketler / Recent Surveys
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-3"></div>
              <div className="h-3 bg-gray-300 rounded mb-4"></div>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Son Anketler / Recent Surveys
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-600">Henüz anket oluşturulmamış.</p>
          <p className="text-sm text-gray-500 italic">No surveys have been created yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Son Anketler / Recent Surveys
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Yakın zamanda eklenen anketleri keşfedin ve araştırmalara katılarak bilime katkıda bulunun.
        </p>
        <p className="text-sm text-gray-500 italic mt-2">
          Discover recently added surveys and contribute to science by participating in research.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {surveys.map((survey) => (
          <div key={survey._id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{survey.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{survey.description}</p>
              </div>
            </div>

            {/* Survey Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 text-center border">
                <div className="text-lg font-bold text-blue-600">{survey.questionCount}</div>
                <div className="text-xs text-gray-600">Questions</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border">
                <div className="text-lg font-bold text-green-600">{survey.responseCount}</div>
                <div className="text-xs text-gray-600">Responses</div>
              </div>
            </div>

            {/* Survey Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {survey.hasAudio && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Audio
                </span>
              )}
              {survey.hasFiles && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Files
                </span>
              )}
            </div>

            {/* Creator Info */}
            {survey.createdBy && (
              <div className="bg-white rounded-lg p-3 mb-4 border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{survey.createdBy.name}</div>
                    <div className="text-xs text-gray-600">{survey.createdBy.organization}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="text-xs text-gray-500 mb-4">
              Created: {formatDate(survey.createdAt)}
            </div>

            {/* Action Button */}
            <Link
              href={`/survey/${survey.shareableId}`}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-center block"
            >
              Anketi Başlat / Start Survey
            </Link>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center">
        <Link
          href="/surveys"
          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
        >
          Tüm anketleri görüntüle / View all surveys
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}