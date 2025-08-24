'use client';

import { useState, useEffect, use, useRef } from 'react';
import { Survey, Question, Answer } from '@/types';
import AudioRecorder from '@/components/AudioRecorder';
import FileUpload from '@/components/FileUpload';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

interface SurveyFillPageProps {
  params: Promise<{ shareableId: string }>;
}

export default function SurveyFillPage({ params }: SurveyFillPageProps) {
  const router = useRouter();
  const { shareableId } = use(params);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [audioFiles, setAudioFiles] = useState<Record<string, Blob>>({});
  const [uploadFiles, setUploadFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [respondentId, setRespondentId] = useState<string>('');
  const [hasResponded, setHasResponded] = useState(false);
  const [showEthicsNotice, setShowEthicsNotice] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const initAndFetch = async () => {
      await initializeRespondent();
      await fetchSurvey();
    };
    initAndFetch();
  }, [shareableId]);

  // Check respondent status when both survey and respondentId are available
  useEffect(() => {
    if (survey && respondentId) {
      checkRespondentStatus(survey._id, respondentId);
    }
  }, [survey, respondentId]);

  // Initialize anonymous respondent ID
  const initializeRespondent = async () => {
    const storageKey = `survey_respondent_${shareableId}`;
    let storedId = localStorage.getItem(storageKey);
    
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem(storageKey, storedId);
    }
    
    setRespondentId(storedId);
  };

  // Check if respondent has already completed this survey
  const checkRespondentStatus = async (surveyId: string, respondentId: string) => {
    try {
      // Also check localStorage as a fallback
      const completedKey = `survey_completed_${shareableId}_${respondentId}`;
      const localCompleted = localStorage.getItem(completedKey);
      
      if (localCompleted) {
        setHasResponded(true);
        return;
      }

      const response = await fetch('/api/check-respondent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, respondentId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasResponded(data.hasResponded);
        
        // Store completion status in localStorage for faster future checks
        if (data.hasResponded) {
          localStorage.setItem(completedKey, 'true');
        }
      }
    } catch (error) {
      console.error('Error checking respondent:', error);
    }
  };

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/shareable/${shareableId}`);
      if (response.ok) {
        const surveyData = await response.json();
        setSurvey(surveyData);
      } else {
        setError('Survey not found');
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  // Track survey session activity
  const trackActivity = async (action: string, questionId?: string, answer?: string) => {
    if (!survey || !respondentId) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    questionStartTime.current = Date.now();

    try {
      await fetch('/api/survey-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: survey._id,
          respondentId,
          action,
          questionId,
          questionIndex: currentQuestionIndex,
          timeSpent,
          answer
        })
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  // Track page visibility to detect abandonment
  useEffect(() => {
    const getCurrentQuestion = () => {
      if (!survey) return null;
      
      if (survey.sections && survey.sections.length > 0) {
        const currentSection = survey.sections[currentSectionIndex];
        return currentSection?.questions[currentQuestionIndex] || null;
      }
      
      return survey.questions?.[currentQuestionIndex] || null;
    };

    const handleVisibilityChange = () => {
      if (document.hidden && survey && respondentId) {
        const currentQuestion = getCurrentQuestion();
        trackActivity('abandoned', currentQuestion?.id);
      }
    };

    const handleBeforeUnload = () => {
      if (survey && respondentId) {
        const currentQuestion = getCurrentQuestion();
        trackActivity('abandoned', currentQuestion?.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [survey, respondentId, currentSectionIndex, currentQuestionIndex]);

  const updateAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer
      }
    }));

    // Track the answer
    trackActivity('answered', questionId, answer);
  };

  const updateAudioAnswer = (questionId: string, audioBlob: Blob) => {
    setAudioFiles(prev => ({
      ...prev,
      [questionId]: audioBlob
    }));
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: audioBlob.size > 0 ? 'Audio response recorded' : ''
      }
    }));
  };

  const updateFileAnswer = (questionId: string, file: File | null) => {
    if (file) {
      setUploadFiles(prev => ({
        ...prev,
        [questionId]: file
      }));
      
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          questionId,
          answer: `File: ${file.name}`
        }
      }));
    } else {
      // Remove file
      setUploadFiles(prev => {
        const { [questionId]: removed, ...rest } = prev;
        return rest;
      });
      
      setAnswers(prev => {
        const { [questionId]: removed, ...rest } = prev;
        return rest;
      });
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

  // Check if a question should be shown based on conditional logic
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic) return true;
    
    const { dependsOn, showWhen, operator = 'equals' } = question.conditionalLogic;
    
    // If dependsOn is not set, this question should always show (it's likely a root question)
    if (!dependsOn) return true;
    
    const dependentAnswer = answers[dependsOn];
    
    // If the dependent question hasn't been answered yet, hide conditional questions
    if (!dependentAnswer || !dependentAnswer.answer) return false;
    
    const answerValue = dependentAnswer.answer;
    
    switch (operator) {
      case 'equals':
        return Array.isArray(showWhen) 
          ? showWhen.includes(answerValue)
          : answerValue === showWhen;
      case 'contains':
        return Array.isArray(showWhen)
          ? showWhen.some(val => answerValue.includes(val))
          : answerValue.includes(showWhen as string);
      case 'not_equals':
        return Array.isArray(showWhen)
          ? !showWhen.includes(answerValue)
          : answerValue !== showWhen;
      default:
        return true;
    }
  };

  // Get filtered questions for current section (including conditional logic)
  const getVisibleQuestions = (): Question[] => {
    const allQuestions = getAllQuestions();
    return allQuestions.filter(shouldShowQuestion);
  };
  
  const getCurrentQuestion = (): Question | null => {
    if (!survey) return null;
    
    if (survey.sections && survey.sections.length > 0) {
      const currentSection = survey.sections[currentSectionIndex];
      if (currentSection) {
        const visibleQuestions = currentSection.questions.filter(shouldShowQuestion);
        return visibleQuestions[currentQuestionIndex] || null;
      }
    }
    
    return null;
  };
  
  const getCurrentSection = () => {
    if (!survey?.sections) return null;
    return survey.sections[currentSectionIndex] || null;
  };

  const validateCurrentSection = () => {
    if (!survey) return false;
    
    const currentSection = getCurrentSection();
    if (!currentSection) return false;
    
    // Only validate visible questions
    const visibleQuestions = currentSection.questions.filter(shouldShowQuestion);
    for (const question of visibleQuestions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || !answer.answer) {
          return false;
        }
      }
    }
    return true;
  };
  
  const validateAnswers = () => {
    if (!survey) return false;
    
    // Only validate visible questions
    const visibleQuestions = getVisibleQuestions();
    for (const question of visibleQuestions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || !answer.answer) {
          return false;
        }
      }
    }
    return true;
  };
  
  const goToNextSection = () => {
    if (!survey?.sections) return;
    
    if (currentSectionIndex < survey.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      // Track section progression
      trackActivity('section_completed', undefined, `Completed section ${currentSectionIndex + 1}`);
    }
  };
  
  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      const prevSection = survey?.sections?.[currentSectionIndex - 1];
      setCurrentQuestionIndex(prevSection ? prevSection.questions.length - 1 : 0);
    }
  };
  
  const isLastSection = () => {
    return survey?.sections ? currentSectionIndex === survey.sections.length - 1 : true;
  };
  
  const isFirstSection = () => {
    return currentSectionIndex === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !validateAnswers()) {
      setError('Please answer all required questions');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('surveyId', survey._id);
      formData.append('respondentId', respondentId);
      formData.append('answers', JSON.stringify(Object.values(answers)));
      
      // Add audio files
      Object.entries(audioFiles).forEach(([questionId, blob]) => {
        if (blob.size > 0) {
          formData.append(`audio_${questionId}`, blob, `audio_${questionId}.webm`);
        }
      });

      // Add uploaded files
      Object.entries(uploadFiles).forEach(([questionId, file]) => {
        formData.append(`file_${questionId}`, file);
      });
      
      const response = await fetch('/api/responses', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Track completion
        trackActivity('completed');
        
        // Mark survey as completed in localStorage
        const completedKey = `survey_completed_${shareableId}_${respondentId}`;
        localStorage.setItem(completedKey, 'true');
        
        router.push(`/survey/${shareableId}/success`);
      } else {
        setError('Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setError('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Survey Not Found</h1>
            <p className="text-gray-600">The survey you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has already responded
  if (hasResponded) {
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

        <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
          <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Survey Already Completed</h1>
              <h2 className="text-lg font-semibold text-gray-600 mb-4">Anket Zaten Tamamlandı</h2>
              
              {survey && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-gray-800 mb-2">{survey.title}</h3>
                  <p className="text-sm text-gray-600">{survey.description}</p>
                </div>
              )}
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>You have already completed this survey.</strong> Each participant can only 
                  submit one response to maintain data integrity and prevent duplicate entries.
                </p>
                <p className="text-sm text-gray-600 italic">
                  <strong>Bu anketi zaten tamamladınız.</strong> Veri bütünlüğünü korumak ve 
                  tekrar girişleri önlemek için her katılımcı sadece bir yanıt gönderebilir.
                </p>
              </div>
              
              <p className="text-gray-600 mb-4">
                Thank you for your valuable contribution to this research!
              </p>
              <p className="text-sm text-gray-500">
                <em>Bu araştırmaya değerli katkınız için teşekkür ederiz!</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ethics Notice Modal
  if (showEthicsNotice) {
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Research Ethics & Privacy</h1>
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Araştırma Etiği ve Gizlilik</h2>
            </div>

            <div className="space-y-6 text-left max-w-3xl mx-auto">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-gray-800 mb-3">🔒 Anonymous Data Collection / Anonim Veri Toplama</h3>
                <p className="text-gray-700 mb-3">
                  Your participation is completely anonymous. We assign you a unique anonymous identifier (UUID) 
                  that prevents duplicate responses while protecting your identity. No personal information 
                  that could identify you is collected.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Katılımınız tamamen anonimdir. Size benzersiz bir anonim tanımlayıcı (UUID) atarız 
                  bu da tekrar yanıtları önlerken kimliğinizi korur. Sizi tanımlayabilecek hiçbir 
                  kişisel bilgi toplanmaz.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-gray-800 mb-3">📊 Research Purpose / Araştırma Amacı</h3>
                <p className="text-gray-700 mb-3">
                  This data collection is part of a TÜBİTAK-supported research project focused on 
                  Turkish language and cognitive studies. Your responses contribute to academic 
                  research and language technology development.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Bu veri toplama, Türkçe dil ve biliş çalışmalarına odaklanan TÜBİTAK destekli 
                  bir araştırma projesinin parçasıdır. Yanıtlarınız akademik araştırma ve dil 
                  teknolojisi geliştirmeye katkıda bulunur.
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-gray-800 mb-3">⏱️ Session Tracking / Oturum İzleme</h3>
                <p className="text-gray-700 mb-3">
                  We track your interaction patterns (time spent, question progression) to improve 
                  survey design and understand user experience. This helps researchers identify 
                  which questions might be confusing or take longer to answer.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Anket tasarımını iyileştirmek ve kullanıcı deneyimini anlamak için etkileşim 
                  desenlerinizi (geçirilen zaman, soru ilerlemesi) takip ediyoruz. Bu araştırmacıların 
                  hangi soruların kafa karıştırıcı olabileceğini veya yanıtlanması daha uzun sürebileceğini 
                  belirlemesine yardımcı olur.
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="font-bold text-gray-800 mb-3">🛡️ Your Rights / Haklarınız</h3>
                <ul className="text-gray-700 space-y-2 mb-3">
                  <li>• You may stop participating at any time</li>
                  <li>• Your data is stored securely and used only for research</li>
                  <li>• Results will be published in aggregate form only</li>
                  <li>• You can contact researchers if you have concerns</li>
                </ul>
                <ul className="text-sm text-gray-600 italic space-y-1">
                  <li>• İstediğiniz zaman katılımı durdurabilirsiniz</li>
                  <li>• Verileriniz güvenli bir şekilde saklanır ve sadece araştırma için kullanılır</li>
                  <li>• Sonuçlar yalnızca toplu halde yayınlanacaktır</li>
                  <li>• Endişeleriniz varsa araştırmacılarla iletişime geçebilirsiniz</li>
                </ul>
              </div>

              <div className="text-center pt-6">
                <p className="text-gray-600 mb-6">
                  By proceeding, you consent to participate in this research study under the terms described above.
                  <br />
                  <em className="text-sm">Devam ederek, yukarıda açıklanan şartlar altında bu araştırma çalışmasına katılmayı kabul etmiş olursunuz.</em>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowEthicsNotice(false)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    I Consent & Continue / Onaylıyorum ve Devam Et
                  </button>
                  <Link
                    href="/"
                    className="bg-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Decline / Reddet
                  </Link>
                </div>
              </div>
            </div>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {survey.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              {survey.description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section-based survey or legacy question-based survey */}
          {survey.sections && survey.sections.length > 0 ? (
            // Section-based survey
            <>
              {/* Section Progress */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Survey Progress</h2>
                  <span className="text-sm text-gray-600">
                    Section {currentSectionIndex + 1} of {survey.sections.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentSectionIndex + 1) / survey.sections.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Section */}
              {getCurrentSection() && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-lg">{currentSectionIndex + 1}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{getCurrentSection()!.title}</h2>
                    {getCurrentSection()!.description && (
                      <p className="text-gray-600">{getCurrentSection()!.description}</p>
                    )}
                  </div>

                  {/* Questions in current section */}
                  <div className="space-y-6">
                    {getCurrentSection()!.questions.filter(shouldShowQuestion).map((question: Question, questionIndex: number) => (
                      <div key={question.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{questionIndex + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                              {question.question}
                              {question.required && (
                                <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Required
                                </span>
                              )}
                            </h3>
                          </div>
                        </div>

                        <div className="ml-12">
                          {question.type === 'short-answer' && (
                            <input
                              type="text"
                              value={answers[question.id]?.answer || ''}
                              onChange={(e) => updateAnswer(question.id, e.target.value)}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white"
                              placeholder="Type your answer here..."
                              required={question.required}
                            />
                          )}

                          {question.type === 'long-answer' && (
                            <textarea
                              value={answers[question.id]?.answer || ''}
                              onChange={(e) => updateAnswer(question.id, e.target.value)}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white resize-none"
                              rows={5}
                              placeholder="Share your thoughts in detail..."
                              required={question.required}
                            />
                          )}

                          {question.type === 'multiple-choice' && (
                            <div className="space-y-3">
                              {(() => {
                                const shuffledOptions = question.multipleChoiceSettings?.randomizeOrder 
                                  ? [...(question.options || [])].sort(() => Math.random() - 0.5)
                                  : question.options || [];
                                
                                const allowMultiple = question.multipleChoiceSettings?.allowMultipleAnswers;
                                const inputType = allowMultiple ? 'checkbox' : 'radio';
                                const currentAnswers = allowMultiple 
                                  ? (answers[question.id]?.answer || '').split(',').filter(a => a.trim())
                                  : [answers[question.id]?.answer || ''];

                                return shuffledOptions.map((option, optionIndex) => (
                                  <label key={optionIndex} className="flex items-center p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group bg-white">
                                    <input
                                      type={inputType}
                                      name={allowMultiple ? `${question.id}_${optionIndex}` : question.id}
                                      value={option}
                                      checked={currentAnswers.includes(option)}
                                      onChange={(e) => {
                                        if (allowMultiple) {
                                          const currentVals = (answers[question.id]?.answer || '').split(',').filter(a => a.trim());
                                          if (e.target.checked) {
                                            updateAnswer(question.id, [...currentVals, option].join(','));
                                          } else {
                                            updateAnswer(question.id, currentVals.filter(val => val !== option).join(','));
                                          }
                                        } else {
                                          updateAnswer(question.id, e.target.value);
                                        }
                                      }}
                                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                      required={question.required && !allowMultiple}
                                    />
                                    <span className="ml-4 text-gray-700 group-hover:text-gray-900 font-medium">
                                      {option}
                                    </span>
                                  </label>
                                ));
                              })()}
                            </div>
                          )}

                          {question.type === 'date-time' && (
                            <div className="space-y-4">
                              {question.dateTimeSettings?.includeDate !== false && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tarih Seçin / Select Date
                                  </label>
                                  <input
                                    type="date"
                                    value={answers[question.id]?.answer?.split('T')[0] || answers[question.id]?.answer || ''}
                                    onChange={(e) => {
                                      const currentAnswer = answers[question.id]?.answer || '';
                                      const timepart = currentAnswer.includes('T') ? 'T' + currentAnswer.split('T')[1] : '';
                                      updateAnswer(question.id, e.target.value + timepart);
                                    }}
                                    min={question.dateTimeSettings?.minDate || undefined}
                                    max={question.dateTimeSettings?.maxDate || undefined}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white"
                                    required={question.required}
                                  />
                                </div>
                              )}
                              
                              {question.dateTimeSettings?.includeTime !== false && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Saat Seçin / Select Time
                                  </label>
                                  <input
                                    type="time"
                                    value={answers[question.id]?.answer?.includes('T') ? answers[question.id].answer.split('T')[1] : ''}
                                    onChange={(e) => {
                                      const currentAnswer = answers[question.id]?.answer || '';
                                      const datepart = currentAnswer.includes('T') ? currentAnswer.split('T')[0] : currentAnswer;
                                      updateAnswer(question.id, datepart + (e.target.value ? 'T' + e.target.value : ''));
                                    }}
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white focus:bg-white"
                                    required={question.required && question.dateTimeSettings?.includeDate === false}
                                  />
                                </div>
                              )}
                              
                              {question.dateTimeSettings?.includeDate !== false && question.dateTimeSettings?.includeTime !== false && (
                                <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                                  💡 Hem tarih hem de saat seçmeniz gerekmektedir / Please select both date and time
                                </div>
                              )}
                            </div>
                          )}

                          {question.type === 'audio' && (
                            <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300">
                              <AudioRecorder
                                question={question}
                                onAudioRecorded={(blob) => updateAudioAnswer(question.id, blob)}
                              />
                            </div>
                          )}

                          {question.type === 'likert-scale' && (
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                              <div className="text-center mb-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                  {(() => {
                                    const scaleType = question.likertSettings?.scaleType || 'agreement';
                                    switch (scaleType) {
                                      case 'agreement': return 'Anlaşma Derecenizi Belirtin / Please Indicate Your Agreement';
                                      case 'satisfaction': return 'Memnuniyet Derecenizi Belirtin / Please Rate Your Satisfaction';
                                      case 'frequency': return 'Sıklık Derecesini Belirtin / Please Indicate Frequency';
                                      case 'importance': return 'Önem Derecesini Belirtin / Please Rate Importance';
                                      case 'quality': return 'Kalite Değerlendirmesi / Please Rate Quality';
                                      case 'likelihood': return 'Olasılık Değerlendirmesi / Please Rate Likelihood';
                                      default: return 'Değerlendirmenizi Yapın / Please Make Your Assessment';
                                    }
                                  })()}
                                </h4>
                                {question.likertSettings?.scaleType !== 'custom' && (
                                  <p className="text-sm text-gray-600">
                                    {(() => {
                                      const scaleType = question.likertSettings?.scaleType || 'agreement';
                                      switch (scaleType) {
                                        case 'agreement': return 'Kesinlikle Katılmıyorum → Kesinlikle Katılıyorum';
                                        case 'satisfaction': return 'Çok Memnuniyetsiz → Çok Memnun';
                                        case 'frequency': return 'Hiçbir Zaman → Her Zaman';
                                        case 'importance': return 'Hiç Önemli Değil → Çok Önemli';
                                        case 'quality': return 'Çok Kötü → Mükemmel';
                                        case 'likelihood': return 'Kesinlikle Olmaz → Kesinlikle Olur';
                                        default: return '';
                                      }
                                    })()}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-center space-y-4">
                                {/* Scale Labels */}
                                <div className="flex justify-between w-full text-sm text-gray-600 px-2">
                                  <span className="font-medium">
                                    {question.likertSettings?.scaleType === 'custom' && question.likertSettings?.leftLabel
                                      ? question.likertSettings.leftLabel
                                      : (() => {
                                          const scaleType = question.likertSettings?.scaleType || 'agreement';
                                          switch (scaleType) {
                                            case 'agreement': return 'Kesinlikle Katılmıyorum';
                                            case 'satisfaction': return 'Çok Memnuniyetsiz';
                                            case 'frequency': return 'Hiçbir Zaman';
                                            case 'importance': return 'Hiç Önemli Değil';
                                            case 'quality': return 'Çok Kötü';
                                            case 'likelihood': return 'Kesinlikle Olmaz';
                                            default: return 'En Az';
                                          }
                                        })()
                                    }
                                  </span>
                                  <span className="font-medium">
                                    {question.likertSettings?.scaleType === 'custom' && question.likertSettings?.rightLabel
                                      ? question.likertSettings.rightLabel
                                      : (() => {
                                          const scaleType = question.likertSettings?.scaleType || 'agreement';
                                          switch (scaleType) {
                                            case 'agreement': return 'Kesinlikle Katılıyorum';
                                            case 'satisfaction': return 'Çok Memnun';
                                            case 'frequency': return 'Her Zaman';
                                            case 'importance': return 'Çok Önemli';
                                            case 'quality': return 'Mükemmel';
                                            case 'likelihood': return 'Kesinlikle Olur';
                                            default: return 'En Çok';
                                          }
                                        })()
                                    }
                                  </span>
                                </div>
                                
                                {/* Scale Options */}
                                <div className="flex flex-wrap justify-center gap-3 w-full">
                                  {Array.from({ length: question.likertSettings?.scaleSize || 5 }, (_, i) => {
                                    const value = (i + 1).toString();
                                    const isCenter = (question.likertSettings?.scaleSize || 5) % 2 === 1 && 
                                                    i === Math.floor((question.likertSettings?.scaleSize || 5) / 2);
                                    
                                    return (
                                      <label 
                                        key={i} 
                                        className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all duration-200 min-w-[60px] ${
                                          answers[question.id]?.answer === value
                                            ? 'bg-indigo-500 text-white shadow-lg transform scale-105' 
                                            : 'bg-white hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-300'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={question.id}
                                          value={value}
                                          checked={answers[question.id]?.answer === value}
                                          onChange={(e) => updateAnswer(question.id, e.target.value)}
                                          className="sr-only"
                                          required={question.required}
                                        />
                                        {question.likertSettings?.showNumbers !== false && (
                                          <span className="font-bold text-lg mb-1">{i + 1}</span>
                                        )}
                                        {isCenter && question.likertSettings?.showNeutral !== false && 
                                         question.likertSettings?.scaleType === 'custom' && 
                                         question.likertSettings?.centerLabel && (
                                          <span className="text-xs text-center font-medium">
                                            {question.likertSettings.centerLabel}
                                          </span>
                                        )}
                                        {isCenter && question.likertSettings?.showNeutral !== false && 
                                         question.likertSettings?.scaleType !== 'custom' && (
                                          <span className="text-xs text-center font-medium">
                                            {(() => {
                                              const scaleType = question.likertSettings?.scaleType || 'agreement';
                                              switch (scaleType) {
                                                case 'agreement': return 'Kararsızım';
                                                case 'satisfaction': return 'Orta';
                                                case 'frequency': return 'Bazen';
                                                case 'importance': return 'Orta';
                                                case 'quality': return 'Orta';
                                                case 'likelihood': return 'Belki';
                                                default: return 'Orta';
                                              }
                                            })()}
                                          </span>
                                        )}
                                      </label>
                                    );
                                  })}
                                </div>
                                
                                {/* Help text */}
                                <p className="text-xs text-gray-500 text-center mt-4">
                                  Seçeneğe tıklayarak cevabınızı verin / Click on an option to select your answer
                                </p>
                              </div>
                            </div>
                          )}

                          {question.type === 'file-upload' && (
                            <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300">
                              <FileUpload
                                question={question}
                                onFileSelected={(file) => updateFileAnswer(question.id, file)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={goToPreviousSection}
                      disabled={isFirstSection()}
                      className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous Section
                    </button>

                    {!isLastSection() ? (
                      <button
                        type="button"
                        onClick={goToNextSection}
                        disabled={!validateCurrentSection()}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next Section
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <div className="text-sm text-gray-600">
                        Complete all questions to submit
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Legacy question-based survey - show all questions at once
            getVisibleQuestions().map((question: Question, index: number) => (
              <div key={question.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                        {question.question}
                        {question.required && (
                          <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {question.type === 'short-answer' && (
                    <input
                      type="text"
                      value={answers[question.id]?.answer || ''}
                      onChange={(e) => updateAnswer(question.id, e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Type your answer here..."
                      required={question.required}
                    />
                  )}

                  {question.type === 'long-answer' && (
                    <textarea
                      value={answers[question.id]?.answer || ''}
                      onChange={(e) => updateAnswer(question.id, e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      rows={5}
                      placeholder="Share your thoughts in detail..."
                      required={question.required}
                    />
                  )}

                  {question.type === 'multiple-choice' && (
                    <div className="space-y-3">
                      {(() => {
                        const shuffledOptions = question.multipleChoiceSettings?.randomizeOrder 
                          ? [...(question.options || [])].sort(() => Math.random() - 0.5)
                          : question.options || [];
                        
                        const allowMultiple = question.multipleChoiceSettings?.allowMultipleAnswers;
                        const inputType = allowMultiple ? 'checkbox' : 'radio';
                        const currentAnswers = allowMultiple 
                          ? (answers[question.id]?.answer || '').split(',').filter(a => a.trim())
                          : [answers[question.id]?.answer || ''];

                        return shuffledOptions.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                            <input
                              type={inputType}
                              name={allowMultiple ? `${question.id}_${optionIndex}` : question.id}
                              value={option}
                              checked={currentAnswers.includes(option)}
                              onChange={(e) => {
                                if (allowMultiple) {
                                  const currentVals = (answers[question.id]?.answer || '').split(',').filter(a => a.trim());
                                  if (e.target.checked) {
                                    updateAnswer(question.id, [...currentVals, option].join(','));
                                  } else {
                                    updateAnswer(question.id, currentVals.filter(val => val !== option).join(','));
                                  }
                                } else {
                                  updateAnswer(question.id, e.target.value);
                                }
                              }}
                              className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                              required={question.required && !allowMultiple}
                            />
                            <span className="ml-4 text-gray-700 group-hover:text-gray-900 font-medium">
                              {option}
                            </span>
                          </label>
                        ));
                      })()}
                    </div>
                  )}

                  {question.type === 'date-time' && (
                    <div className="space-y-4">
                      {question.dateTimeSettings?.includeDate !== false && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tarih Seçin / Select Date
                          </label>
                          <input
                            type="date"
                            value={answers[question.id]?.answer?.split('T')[0] || answers[question.id]?.answer || ''}
                            onChange={(e) => {
                              const currentAnswer = answers[question.id]?.answer || '';
                              const timepart = currentAnswer.includes('T') ? 'T' + currentAnswer.split('T')[1] : '';
                              updateAnswer(question.id, e.target.value + timepart);
                            }}
                            min={question.dateTimeSettings?.minDate || undefined}
                            max={question.dateTimeSettings?.maxDate || undefined}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            required={question.required}
                          />
                        </div>
                      )}
                      
                      {question.dateTimeSettings?.includeTime !== false && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Saat Seçin / Select Time
                          </label>
                          <input
                            type="time"
                            value={answers[question.id]?.answer?.includes('T') ? answers[question.id].answer.split('T')[1] : ''}
                            onChange={(e) => {
                              const currentAnswer = answers[question.id]?.answer || '';
                              const datepart = currentAnswer.includes('T') ? currentAnswer.split('T')[0] : currentAnswer;
                              updateAnswer(question.id, datepart + (e.target.value ? 'T' + e.target.value : ''));
                            }}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            required={question.required && question.dateTimeSettings?.includeDate === false}
                          />
                        </div>
                      )}
                      
                      {question.dateTimeSettings?.includeDate !== false && question.dateTimeSettings?.includeTime !== false && (
                        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                          💡 Hem tarih hem de saat seçmeniz gerekmektedir / Please select both date and time
                        </div>
                      )}
                    </div>
                  )}

                  {question.type === 'audio' && (
                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                      <AudioRecorder
                        question={question}
                        onAudioRecorded={(blob) => updateAudioAnswer(question.id, blob)}
                      />
                    </div>
                  )}

                  {question.type === 'likert-scale' && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                      <div className="text-center mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          {(() => {
                            const scaleType = question.likertSettings?.scaleType || 'agreement';
                            switch (scaleType) {
                              case 'agreement': return 'Anlaşma Derecenizi Belirtin / Please Indicate Your Agreement';
                              case 'satisfaction': return 'Memnuniyet Derecenizi Belirtin / Please Rate Your Satisfaction';
                              case 'frequency': return 'Sıklık Derecesini Belirtin / Please Indicate Frequency';
                              case 'importance': return 'Önem Derecesini Belirtin / Please Rate Importance';
                              case 'quality': return 'Kalite Değerlendirmesi / Please Rate Quality';
                              case 'likelihood': return 'Olasılık Değerlendirmesi / Please Rate Likelihood';
                              default: return 'Değerlendirmenizi Yapın / Please Make Your Assessment';
                            }
                          })()}
                        </h4>
                        {question.likertSettings?.scaleType !== 'custom' && (
                          <p className="text-sm text-gray-600">
                            {(() => {
                              const scaleType = question.likertSettings?.scaleType || 'agreement';
                              switch (scaleType) {
                                case 'agreement': return 'Kesinlikle Katılmıyorum → Kesinlikle Katılıyorum';
                                case 'satisfaction': return 'Çok Memnuniyetsiz → Çok Memnun';
                                case 'frequency': return 'Hiçbir Zaman → Her Zaman';
                                case 'importance': return 'Hiç Önemli Değil → Çok Önemli';
                                case 'quality': return 'Çok Kötü → Mükemmel';
                                case 'likelihood': return 'Kesinlikle Olmaz → Kesinlikle Olur';
                                default: return '';
                              }
                            })()}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center space-y-4">
                        {/* Scale Labels */}
                        <div className="flex justify-between w-full text-sm text-gray-600 px-2">
                          <span className="font-medium">
                            {question.likertSettings?.scaleType === 'custom' && question.likertSettings?.leftLabel
                              ? question.likertSettings.leftLabel
                              : (() => {
                                  const scaleType = question.likertSettings?.scaleType || 'agreement';
                                  switch (scaleType) {
                                    case 'agreement': return 'Kesinlikle Katılmıyorum';
                                    case 'satisfaction': return 'Çok Memnuniyetsiz';
                                    case 'frequency': return 'Hiçbir Zaman';
                                    case 'importance': return 'Hiç Önemli Değil';
                                    case 'quality': return 'Çok Kötü';
                                    case 'likelihood': return 'Kesinlikle Olmaz';
                                    default: return 'En Az';
                                  }
                                })()
                            }
                          </span>
                          <span className="font-medium">
                            {question.likertSettings?.scaleType === 'custom' && question.likertSettings?.rightLabel
                              ? question.likertSettings.rightLabel
                              : (() => {
                                  const scaleType = question.likertSettings?.scaleType || 'agreement';
                                  switch (scaleType) {
                                    case 'agreement': return 'Kesinlikle Katılıyorum';
                                    case 'satisfaction': return 'Çok Memnun';
                                    case 'frequency': return 'Her Zaman';
                                    case 'importance': return 'Çok Önemli';
                                    case 'quality': return 'Mükemmel';
                                    case 'likelihood': return 'Kesinlikle Olur';
                                    default: return 'En Çok';
                                  }
                                })()
                            }
                          </span>
                        </div>
                        
                        {/* Scale Options */}
                        <div className="flex flex-wrap justify-center gap-3 w-full">
                          {Array.from({ length: question.likertSettings?.scaleSize || 5 }, (_, i) => {
                            const value = (i + 1).toString();
                            const isCenter = (question.likertSettings?.scaleSize || 5) % 2 === 1 && 
                                            i === Math.floor((question.likertSettings?.scaleSize || 5) / 2);
                            
                            return (
                              <label 
                                key={i} 
                                className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all duration-200 min-w-[60px] ${
                                  answers[question.id]?.answer === value
                                    ? 'bg-indigo-500 text-white shadow-lg transform scale-105' 
                                    : 'bg-white hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={value}
                                  checked={answers[question.id]?.answer === value}
                                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                                  className="sr-only"
                                  required={question.required}
                                />
                                {question.likertSettings?.showNumbers !== false && (
                                  <span className="font-bold text-lg mb-1">{i + 1}</span>
                                )}
                                {isCenter && question.likertSettings?.showNeutral !== false && 
                                 question.likertSettings?.scaleType === 'custom' && 
                                 question.likertSettings?.centerLabel && (
                                  <span className="text-xs text-center font-medium">
                                    {question.likertSettings.centerLabel}
                                  </span>
                                )}
                                {isCenter && question.likertSettings?.showNeutral !== false && 
                                 question.likertSettings?.scaleType !== 'custom' && (
                                  <span className="text-xs text-center font-medium">
                                    {(() => {
                                      const scaleType = question.likertSettings?.scaleType || 'agreement';
                                      switch (scaleType) {
                                        case 'agreement': return 'Kararsızım';
                                        case 'satisfaction': return 'Orta';
                                        case 'frequency': return 'Bazen';
                                        case 'importance': return 'Orta';
                                        case 'quality': return 'Orta';
                                        case 'likelihood': return 'Belki';
                                        default: return 'Orta';
                                      }
                                    })()}
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                        
                        {/* Help text */}
                        <p className="text-xs text-gray-500 text-center mt-4">
                          Seçeneğe tıklayarak cevabınızı verin / Click on an option to select your answer
                        </p>
                      </div>
                    </div>
                  )}

                  {question.type === 'file-upload' && (
                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                      <FileUpload
                        question={question}
                        onFileSelected={(file) => updateFileAnswer(question.id, file)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Submit Section - Only show for last section in sectioned surveys or always in legacy surveys */}
          {(!survey.sections || isLastSection()) && (
            <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <button
                type="submit"
                disabled={submitting || !validateAnswers()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting Response...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Response
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}