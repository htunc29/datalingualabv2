'use client';

import { useState, useEffect, use } from 'react';
import { Survey, Response as IResponse, Question } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

interface ResponsesPageProps {
  params: Promise<{ surveyId: string }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export default function ResponsesPage({ params }: ResponsesPageProps) {
  const { surveyId } = use(params);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<IResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'responses'>('analytics');

  useEffect(() => {
    fetchData();
  }, [surveyId]);

  const fetchData = async () => {
    try {
      const [surveyResponse, responsesResponse] = await Promise.all([
        fetch(`/api/surveys/${surveyId}`),
        fetch(`/api/responses?surveyId=${surveyId}`)
      ]);

      if (surveyResponse.ok) {
        const surveyData = await surveyResponse.json();
        setSurvey(surveyData);
      }

      if (responsesResponse.ok) {
        const responsesData = await responsesResponse.json();
        setResponses(responsesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllQuestions = (): Question[] => {
    if (!survey) return [];
    
    // Handle both section-based and legacy question-based surveys
    if (survey.sections && survey.sections.length > 0) {
      return survey.sections.flatMap(section => section.questions);
    }
    
    return survey.questions || [];
  };

  const getQuestionById = (questionId: string): Question | undefined => {
    const allQuestions = getAllQuestions();
    return allQuestions.find(q => q.id === questionId);
  };

  const getAnalyticsData = () => {
    if (!survey || !responses.length) return null;

    const analytics: any = {
      totalResponses: responses.length,
      questionAnalytics: [],
      submissionTrend: [],
      completionRate: 100, // Assuming all responses are complete
    };

    // Question analytics
    const allQuestions = getAllQuestions();
    allQuestions.forEach(question => {
      const questionResponses = responses.map(r => 
        r.answers.find(a => a.questionId === question.id)
      ).filter(Boolean);

      if (question.type === 'multiple-choice' && question.options) {
        const optionCounts = question.options.map(option => ({
          name: option,
          value: questionResponses.filter(r => r?.answer === option).length,
          percentage: ((questionResponses.filter(r => r?.answer === option).length / questionResponses.length) * 100).toFixed(1)
        }));

        analytics.questionAnalytics.push({
          questionId: question.id,
          question: question.question,
          type: question.type,
          data: optionCounts,
          totalResponses: questionResponses.length
        });
      } else if (question.type === 'short-answer' || question.type === 'long-answer') {
        const wordCounts = questionResponses.map(r => {
          if (!r?.answer) return 0;
          return r.answer.trim().split(/\s+/).length;
        });
        
        const avgWordCount = wordCounts.length > 0 
          ? (wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length).toFixed(1)
          : 0;

        analytics.questionAnalytics.push({
          questionId: question.id,
          question: question.question,
          type: question.type,
          avgWordCount,
          responses: questionResponses.length,
          sampleAnswers: questionResponses.slice(0, 3).map(r => r?.answer).filter(Boolean)
        });
      } else if (question.type === 'likert-scale') {
        // Create distribution data for Likert scale
        const scaleSize = question.likertSettings?.scaleSize || 5;
        const distributionData = Array.from({ length: scaleSize }, (_, i) => {
          const value = (i + 1).toString();
          const count = questionResponses.filter(r => r?.answer === value).length;
          return {
            scale: value,
            name: `${i + 1}`,
            value: count,
            percentage: questionResponses.length > 0 ? ((count / questionResponses.length) * 100).toFixed(1) : '0'
          };
        });

        // Calculate average score
        const totalScore = questionResponses.reduce((sum, r) => {
          const score = parseInt(r?.answer || '0');
          return sum + (isNaN(score) ? 0 : score);
        }, 0);
        const averageScore = questionResponses.length > 0 
          ? (totalScore / questionResponses.length).toFixed(2)
          : '0';

        analytics.questionAnalytics.push({
          questionId: question.id,
          question: question.question,
          type: question.type,
          scaleType: question.likertSettings?.scaleType || 'agreement',
          scaleSize: scaleSize,
          data: distributionData,
          totalResponses: questionResponses.length,
          averageScore: averageScore,
          responseRate: ((questionResponses.length / responses.length) * 100).toFixed(1)
        });
      } else if (question.type === 'audio' || question.type === 'file-upload') {
        analytics.questionAnalytics.push({
          questionId: question.id,
          question: question.question,
          type: question.type,
          responses: questionResponses.length,
          responseRate: ((questionResponses.length / responses.length) * 100).toFixed(1)
        });
      }
    });

    // Submission trend (by day)
    const submissionsByDate = responses.reduce((acc: any, response) => {
      const date = new Date(response.submittedAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    analytics.submissionTrend = Object.entries(submissionsByDate)
      .map(([date, count]) => ({ date, responses: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return analytics;
  };

  const analytics = getAnalyticsData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
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
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Survey Not Found</h1>
            <Link href="/admin" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              ← Back to Admin Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Admin Panel
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Survey Analytics
                  </h1>
                  <p className="text-gray-600">Comprehensive analysis and insights</p>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{survey.title}</h2>
              <p className="text-gray-600">{survey.description}</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{responses.length}</div>
                <div className="text-sm opacity-90">Total Responses</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{getAllQuestions().length}</div>
                <div className="text-sm opacity-90">Questions</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{analytics?.completionRate || 0}%</div>
                <div className="text-sm opacity-90">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                Analytics & Insights
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'responses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                Raw Responses ({responses.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No responses yet</h3>
                <p className="text-gray-500 mb-6">Share your survey to start collecting responses</p>
                <Link 
                  href={`/survey/${survey.shareableId}`}
                  target="_blank"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 13l3 3 7-7" />
                  </svg>
                  Open Survey Link
                </Link>
              </div>
            ) : (
              <>
                {/* Analytics Tab */}
                {activeTab === 'analytics' && analytics && (
                  <div className="space-y-8">
                    {/* Submission Trend */}
                    {analytics.submissionTrend.length > 1 && (
                      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Response Submissions Over Time
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analytics.submissionTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="responses" 
                              stroke="#3b82f6" 
                              strokeWidth={3}
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Question Analytics */}
                    <div className="space-y-6">
                      {analytics.questionAnalytics.map((questionAnalytic: any, index: number) => (
                        <div key={questionAnalytic.questionId} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                          <div className="mb-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 mb-1">{questionAnalytic.question}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {questionAnalytic.type}
                                  </span>
                                  <span>{questionAnalytic.totalResponses || questionAnalytic.responses} responses</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {questionAnalytic.type === 'multiple-choice' && questionAnalytic.data && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-medium mb-3">Response Distribution</h5>
                                <ResponsiveContainer width="100%" height={250}>
                                  <PieChart>
                                    <Pie
                                      data={questionAnalytic.data}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({name, percentage}) => `${name} (${percentage}%)`}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {questionAnalytic.data.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div>
                                <h5 className="font-medium mb-3">Detailed Breakdown</h5>
                                <div className="space-y-3">
                                  {questionAnalytic.data.map((option: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div 
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                        ></div>
                                        <span className="font-medium text-gray-800">{option.name}</span>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-gray-900">{option.value}</div>
                                        <div className="text-sm text-gray-600">{option.percentage}%</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {(questionAnalytic.type === 'short-answer' || questionAnalytic.type === 'long-answer') && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-800">{questionAnalytic.avgWordCount}</div>
                                  <div className="text-sm text-blue-600">Average Word Count</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <div className="text-2xl font-bold text-green-800">{questionAnalytic.responses}</div>
                                  <div className="text-sm text-green-600">Total Responses</div>
                                </div>
                              </div>
                              {questionAnalytic.sampleAnswers && questionAnalytic.sampleAnswers.length > 0 && (
                                <div>
                                  <h5 className="font-medium mb-3">Sample Responses</h5>
                                  <div className="space-y-2">
                                    {questionAnalytic.sampleAnswers.map((answer: string, idx: number) => (
                                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                        <p className="text-gray-800 text-sm line-clamp-3">{answer}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {questionAnalytic.type === 'likert-scale' && questionAnalytic.data && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Summary Stats */}
                              <div className="space-y-4">
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                  <div className="text-2xl font-bold text-indigo-800">{questionAnalytic.averageScore}</div>
                                  <div className="text-sm text-indigo-600">Average Score (out of {questionAnalytic.scaleSize})</div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-800">{questionAnalytic.totalResponses}</div>
                                  <div className="text-sm text-blue-600">Total Responses</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                  <div className="text-xl font-bold text-purple-800 capitalize">
                                    {questionAnalytic.scaleType.replace('-', ' ')}
                                  </div>
                                  <div className="text-sm text-purple-600">Scale Type</div>
                                </div>
                              </div>

                              {/* Bar Chart */}
                              <div className="lg:col-span-2">
                                <h5 className="font-medium mb-3">Response Distribution</h5>
                                <ResponsiveContainer width="100%" height={250}>
                                  <BarChart data={questionAnalytic.data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip 
                                      formatter={(value: number, name: string) => [value, 'Responses']}
                                      labelFormatter={(label) => `Scale Point: ${label}`}
                                    />
                                    <Legend />
                                    <Bar 
                                      dataKey="value" 
                                      fill="#6366f1" 
                                      name="Responses"
                                      radius={[4, 4, 0, 0]}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>

                              {/* Detailed Breakdown */}
                              <div className="lg:col-span-3">
                                <h5 className="font-medium mb-3">Detailed Breakdown</h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                  {questionAnalytic.data.map((scale: any, idx: number) => (
                                    <div key={idx} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-800 mb-1">{scale.name}</div>
                                        <div className="text-lg font-semibold text-gray-800">{scale.value}</div>
                                        <div className="text-sm text-gray-600">{scale.percentage}%</div>
                                        <div className="text-xs text-gray-500 mt-2">
                                          {(() => {
                                            const scaleNum = parseInt(scale.name);
                                            const scaleType = questionAnalytic.scaleType;
                                            const scaleSize = questionAnalytic.scaleSize;
                                            
                                            if (scaleType === 'agreement') {
                                              if (scaleNum === 1) return 'Kesinlikle Katılmıyorum';
                                              if (scaleNum === scaleSize) return 'Kesinlikle Katılıyorum';
                                              if (scaleSize % 2 === 1 && scaleNum === Math.ceil(scaleSize / 2)) return 'Kararsızım';
                                            } else if (scaleType === 'satisfaction') {
                                              if (scaleNum === 1) return 'Çok Memnuniyetsiz';
                                              if (scaleNum === scaleSize) return 'Çok Memnun';
                                              if (scaleSize % 2 === 1 && scaleNum === Math.ceil(scaleSize / 2)) return 'Orta';
                                            } else if (scaleType === 'frequency') {
                                              if (scaleNum === 1) return 'Hiçbir Zaman';
                                              if (scaleNum === scaleSize) return 'Her Zaman';
                                              if (scaleSize % 2 === 1 && scaleNum === Math.ceil(scaleSize / 2)) return 'Bazen';
                                            }
                                            
                                            return '';
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {(questionAnalytic.type === 'audio' || questionAnalytic.type === 'file-upload') && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-purple-800">{questionAnalytic.responses}</div>
                                <div className="text-sm text-purple-600">{questionAnalytic.type === 'audio' ? 'Audio' : 'File'} Submissions</div>
                              </div>
                              <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-orange-800">{questionAnalytic.responseRate}%</div>
                                <div className="text-sm text-orange-600">Response Rate</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Export Options */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <h3 className="font-semibold mb-4">Export & Download</h3>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => exportResponses('json')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export JSON
                        </button>
                        <button 
                          onClick={() => exportResponses('csv')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export CSV
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw Responses Tab */}
                {activeTab === 'responses' && (
                  <div className="space-y-6">
                    {responses.map((response, responseIndex) => (
                      <div key={response._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Response #{responseIndex + 1}
                            </h3>
                            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                              {new Date(response.submittedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                          {survey.sections && survey.sections.length > 0 ? (
                            // Section-based responses
                            survey.sections.map((section, sectionIndex) => (
                              <div key={section.id} className="mb-8">
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-lg mb-4 border border-blue-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">{sectionIndex + 1}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">{section.title}</h3>
                                    {section.description && (
                                      <span className="text-sm text-gray-600">• {section.description}</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="space-y-4 ml-4">
                                  {section.questions.map((question) => {
                                    const answer = response.answers.find(a => a.questionId === question.id);
                                    if (!answer) return null;

                                    return (
                                      <div key={question.id} className="border-l-4 border-green-500 pl-4">
                                        <h4 className="font-medium text-gray-900 mb-3">
                                          {question.question}
                                        </h4>
                                        
                                        {question.type === 'audio' && answer.audioPath ? (
                                          <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-blue-800">Audio Response:</p>
                                            <audio 
                                              controls 
                                              className="w-full max-w-md"
                                              preload="metadata"
                                            >
                                              <source src={answer.audioPath} type="audio/webm" />
                                              <source src={answer.audioPath} type="audio/mp4" />
                                              Your browser does not support the audio element.
                                            </audio>
                                            <a 
                                              href={answer.audioPath} 
                                              download 
                                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              Download Audio
                                            </a>
                                          </div>
                                        ) : question.type === 'file-upload' && answer.filePath ? (
                                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                              <div className="text-green-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                              </div>
                                              <div className="flex-1">
                                                <p className="font-medium text-gray-900">{answer.answer}</p>
                                                <a 
                                                  href={answer.filePath} 
                                                  download 
                                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-1"
                                                >
                                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                  </svg>
                                                  Download File
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-800 leading-relaxed">{answer.answer}</p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))
                          ) : (
                            // Legacy responses (no sections)
                            response.answers.map((answer) => {
                              const question = getQuestionById(answer.questionId);
                              if (!question) return null;

                              return (
                                <div key={answer.questionId} className="border-l-4 border-blue-500 pl-4">
                                  <h4 className="font-medium text-gray-900 mb-3">
                                    {question.question}
                                  </h4>
                                
                                {question.type === 'audio' && answer.audioPath ? (
                                  <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800">Audio Response:</p>
                                    <audio 
                                      controls 
                                      className="w-full max-w-md"
                                      preload="metadata"
                                    >
                                      <source src={answer.audioPath} type="audio/webm" />
                                      <source src={answer.audioPath} type="audio/mp4" />
                                      Your browser does not support the audio element.
                                    </audio>
                                    <a 
                                      href={answer.audioPath} 
                                      download 
                                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Download Audio
                                    </a>
                                  </div>
                                ) : question.type === 'file-upload' && answer.filePath ? (
                                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div className="text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">{answer.answer}</p>
                                        <a 
                                          href={answer.filePath} 
                                          download 
                                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-1"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          Download File
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                  ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <p className="text-gray-800 leading-relaxed">{answer.answer}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function exportResponses(format: 'json' | 'csv') {
    if (format === 'json') {
      const dataStr = JSON.stringify({ survey, responses }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${survey?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'csv') {
      // Simple CSV export (audio responses will show as "Audio Response")
      const allQuestions = getAllQuestions();
      let csv = 'Response ID,Submitted At,';
      csv += allQuestions.map(q => `"${q.question}"`).join(',') + '\n';
      
      responses.forEach(response => {
        const row = [
          response._id,
          new Date(response.submittedAt).toLocaleString()
        ];
        
        allQuestions.forEach(question => {
          const answer = response.answers.find(a => a.questionId === question.id);
          if (answer) {
            if (question.type === 'audio' && answer.audioPath) {
              row.push('Audio Response');
            } else {
              row.push(`"${answer.answer.replace(/"/g, '""')}"`);
            }
          } else {
            row.push('');
          }
        });
        
        csv += row.join(',') + '\n';
      });
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${survey?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}