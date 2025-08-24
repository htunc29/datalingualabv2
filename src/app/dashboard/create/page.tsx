'use client';

import { useState } from 'react';
import { Question, Section } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export default function CreateSurvey() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([
    {
      id: uuidv4(),
      title: 'Section 1',
      description: '',
      questions: [],
      order: 0
    }
  ]);
  const [loading, setLoading] = useState(false);

  const addSection = () => {
    const newSection: Section = {
      id: uuidv4(),
      title: `Section ${sections.length + 1}`,
      description: '',
      questions: [],
      order: sections.length
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionIndex: number, updates: Partial<Section>) => {
    const updatedSections = sections.map((section, i) => 
      i === sectionIndex ? { ...section, ...updates } : section
    );
    setSections(updatedSections);
  };

  const removeSection = (sectionIndex: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== sectionIndex));
    }
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: 'short-answer',
      question: '',
      required: false
    };
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setSections(updatedSections);
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      ...updates
    };
    setSections(updatedSections);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions.splice(questionIndex, 1);
    setSections(updatedSections);
  };

  const addOption = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections];
    if (!updatedSections[sectionIndex].questions[questionIndex].options) {
      updatedSections[sectionIndex].questions[questionIndex].options = [];
    }
    updatedSections[sectionIndex].questions[questionIndex].options!.push('');
    setSections(updatedSections);
  };

  const updateOption = (sectionIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex].options![optionIndex] = value;
    setSections(updatedSections);
  };

  const removeOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].questions[questionIndex].options!.splice(optionIndex, 1);
    setSections(updatedSections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0);
    if (!title || totalQuestions === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          sections
        })
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error creating survey:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Anket Oluştur</h1>
                <p className="text-gray-600 mt-1">Create New Survey</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Panele Dön / Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Survey Info Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="border-b border-gray-200 pb-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Anket Bilgileri / Survey Information</h2>
              <p className="text-gray-600">Anketinize başlık ve açıklama ekleyin</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Anket Başlığı / Survey Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Anket başlığınızı girin..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Açıklama / Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  rows={4}
                  placeholder="Anketinizin amacını ve içeriğini açıklayın..."
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="border-b border-gray-200 pb-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Bölümler / Survey Sections</h2>
                  <p className="text-gray-600">Anket bölümlerinizi ve sorularını ekleyin ve yapılandırın</p>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Bölüm Ekle / Add Section
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-2xl p-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">
                        {sectionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                          className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 w-full"
                          placeholder="Bölüm Başlığı / Section Title"
                        />
                        <input
                          type="text"
                          value={section.description || ''}
                          onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                          className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 w-full mt-1"
                          placeholder="Bölüm açıklaması (opsiyonel) / Section description (optional)"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => addQuestion(sectionIndex)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Soru Ekle
                      </button>
                      {sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSection(sectionIndex)}
                          className="inline-flex items-center px-3 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Bölümü Kaldır
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Questions in Section */}
                  {section.questions.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
                      <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Bu bölümde henüz soru yok</h3>
                      <p className="text-gray-600 mb-4">Bu bölüme soru ekleyerek başlayın</p>
                      <button
                        type="button"
                        onClick={() => addQuestion(sectionIndex)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        İlk Soruyu Ekle
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {section.questions.map((question, questionIndex) => (
                        <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-6 relative">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                {questionIndex + 1}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Soru {questionIndex + 1}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(sectionIndex, questionIndex)}
                              className="inline-flex items-center px-3 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Kaldır
                            </button>
                          </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Soru Türü / Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, { 
                            type: e.target.value as Question['type'],
                            options: e.target.value === 'multiple-choice' ? [''] : undefined,
                            audioSettings: e.target.value === 'audio' ? { canReRecord: true, maxDurationMinutes: 5 } : undefined,
                            fileSettings: e.target.value === 'file-upload' ? { allowedExtensions: [], maxFileSizeMB: 10 } : undefined,
                            dateTimeSettings: e.target.value === 'date-time' ? { includeDate: true, includeTime: true } : undefined,
                            multipleChoiceSettings: e.target.value === 'multiple-choice' ? { allowMultipleAnswers: false, randomizeOrder: false } : undefined,
                            likertSettings: e.target.value === 'likert-scale' ? { scaleType: 'agreement', scaleSize: 5, showNumbers: true, showNeutral: true } : undefined
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        >
                          <option value="short-answer">📝 Kısa Yanıt</option>
                          <option value="long-answer">📄 Uzun Yanıt</option>
                          <option value="multiple-choice">☑️ Çoktan Seçmeli</option>
                          <option value="likert-scale">📊 Likert Ölçeği</option>
                          <option value="date-time">📅 Tarih ve Saat</option>
                          <option value="audio">🎤 Ses Kaydı</option>
                          <option value="file-upload">📎 Dosya Yükleme</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Ayarlar / Settings</label>
                        <div className="flex items-center h-12">
                          <label className="flex items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                            <input
                              type="checkbox"
                              checked={question.required || false}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, { required: e.target.checked })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">Zorunlu Soru</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Soru Metni / Question Text <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, { question: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Sorunuzu buraya yazın..."
                        required
                      />
                    </div>

                    {question.type === 'multiple-choice' && (
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">☑️ Çoktan Seçmeli Ayarları</h4>
                            <p className="text-sm text-blue-700">Kullanıcıların seçebileceği seçenekleri ve davranışları yapılandırın</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addOption(sectionIndex, questionIndex)}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Seçenek Ekle
                          </button>
                        </div>
                        
                        {/* Multiple Choice Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                            <input
                              type="checkbox"
                              checked={question.multipleChoiceSettings?.allowMultipleAnswers || false}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                multipleChoiceSettings: {
                                  ...question.multipleChoiceSettings,
                                  allowMultipleAnswers: e.target.checked
                                }
                              })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">Çoklu seçim izni / Allow multiple selections</span>
                          </div>
                          <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                            <input
                              type="checkbox"
                              checked={question.multipleChoiceSettings?.randomizeOrder || false}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                multipleChoiceSettings: {
                                  ...question.multipleChoiceSettings,
                                  randomizeOrder: e.target.checked
                                }
                              })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">Seçenekleri karıştır / Randomize order</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-3">
                              <div className={`bg-white w-4 h-4 border-2 border-blue-300 flex-shrink-0 ${
                                question.multipleChoiceSettings?.allowMultipleAnswers ? 'rounded' : 'rounded-full'
                              }`}></div>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(sectionIndex, questionIndex, optionIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder={`Seçenek ${optionIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(sectionIndex, questionIndex, optionIndex)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conditional Logic Settings */}
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-4">🔗 Koşullu Mantık / Conditional Logic</h4>
                      <p className="text-sm text-yellow-700 mb-4">Bu sorunun başka bir sorunun cevabına bağlı olarak gösterilmesini sağlar</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Bağımlı Soru / Depends On Question</label>
                          <select
                            value={question.conditionalLogic?.dependsOn || ''}
                            onChange={(e) => {
                              if (e.target.value === '') {
                                updateQuestion(sectionIndex, questionIndex, { conditionalLogic: undefined });
                              } else {
                                updateQuestion(sectionIndex, questionIndex, {
                                  conditionalLogic: {
                                    ...question.conditionalLogic,
                                    dependsOn: e.target.value,
                                    showWhen: '',
                                    operator: 'equals'
                                  }
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          >
                            <option value="">Koşul yok / No condition</option>
                            {sections.flatMap((s, secIdx) => 
                              s.questions.map((q, qIdx) => ({...q, sectionIndex: secIdx, questionIndex: qIdx}))
                            )
                              .filter(q => {
                                // Only show questions that come before this one and are multiple-choice
                                const isBefore = q.sectionIndex < sectionIndex || 
                                  (q.sectionIndex === sectionIndex && q.questionIndex < questionIndex);
                                return isBefore && q.type === 'multiple-choice' && q.options && q.options.length > 0;
                              })
                              .map(q => (
                                <option key={q.id} value={q.id}>
                                  {q.question || `Soru ${q.sectionIndex + 1}.${q.questionIndex + 1}`}
                                </option>
                              ))}
                          </select>
                        </div>

                        {question.conditionalLogic?.dependsOn && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Gösterim Koşulu / Show When</label>
                            <select
                              value={question.conditionalLogic?.showWhen || ''}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                conditionalLogic: {
                                  ...question.conditionalLogic!,
                                  showWhen: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                              <option value="">Seçenek seçin / Select option</option>
                              {sections.flatMap(s => s.questions)
                                .find(q => q.id === question.conditionalLogic?.dependsOn)?.options?.filter(opt => opt.trim() !== '')
                                .map((option, idx) => (
                                  <option key={idx} value={option}>{option}</option>
                                )) || []}
                            </select>
                          </div>
                        )}
                      </div>

                      {question.conditionalLogic?.dependsOn && question.conditionalLogic?.showWhen && (
                        <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Bu soru sadece &quot;{sections.flatMap(s => s.questions).find(q => q.id === question.conditionalLogic?.dependsOn)?.question}&quot; 
                            sorusuna &quot;{question.conditionalLogic.showWhen}&quot; cevabı verildiğinde gösterilecek.
                          </p>
                        </div>
                      )}
                    </div>

                    {question.type === 'likert-scale' && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 mb-4">📊 Likert Ölçeği Ayarları</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Scale Type */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ölçek Türü / Scale Type</label>
                            <select
                              value={question.likertSettings?.scaleType || 'agreement'}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                likertSettings: {
                                  ...question.likertSettings,
                                  scaleType: e.target.value as 'agreement' | 'satisfaction' | 'frequency' | 'importance' | 'quality' | 'likelihood' | 'custom'
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                            >
                              <option value="agreement">🤝 Anlaşma / Agreement (Kesinlikle Katılmıyorum - Kesinlikle Katılıyorum)</option>
                              <option value="satisfaction">😊 Memnuniyet / Satisfaction (Çok Memnuniyetsiz - Çok Memnun)</option>
                              <option value="frequency">⏰ Sıklık / Frequency (Hiçbir Zaman - Her Zaman)</option>
                              <option value="importance">⭐ Önem / Importance (Hiç Önemli Değil - Çok Önemli)</option>
                              <option value="quality">🏆 Kalite / Quality (Çok Kötü - Mükemmel)</option>
                              <option value="likelihood">🎯 Olasılık / Likelihood (Kesinlikle Olmaz - Kesinlikle Olur)</option>
                              <option value="custom">⚙️ Özel / Custom</option>
                            </select>
                          </div>

                          {/* Scale Size */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ölçek Boyutu / Scale Size</label>
                            <select
                              value={question.likertSettings?.scaleSize || 5}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                likertSettings: {
                                  ...question.likertSettings,
                                  scaleSize: parseInt(e.target.value) as 3 | 4 | 5 | 7 | 10
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                            >
                              <option value={3}>3 Nokta</option>
                              <option value={4}>4 Nokta</option>
                              <option value={5}>5 Nokta (Önerilen)</option>
                              <option value={7}>7 Nokta</option>
                              <option value={10}>10 Nokta</option>
                            </select>
                          </div>

                          {/* Custom Labels for Custom Scale Type */}
                          {question.likertSettings?.scaleType === 'custom' && (
                            <div className="col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Özel Etiketler / Custom Labels</label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  placeholder="Sol etiket (örn: Hiç)"
                                  value={question.likertSettings?.leftLabel || ''}
                                  onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                    likertSettings: {
                                      ...question.likertSettings,
                                      leftLabel: e.target.value
                                    }
                                  })}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {(question.likertSettings?.scaleSize || 5) % 2 === 1 && (
                                  <input
                                    type="text"
                                    placeholder="Orta etiket (örn: Orta)"
                                    value={question.likertSettings?.centerLabel || ''}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                      likertSettings: {
                                        ...question.likertSettings,
                                        centerLabel: e.target.value
                                      }
                                    })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                )}
                                <input
                                  type="text"
                                  placeholder="Sağ etiket (örn: Çok)"
                                  value={question.likertSettings?.rightLabel || ''}
                                  onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                    likertSettings: {
                                      ...question.likertSettings,
                                      rightLabel: e.target.value
                                    }
                                  })}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                          )}

                          {/* Display Options */}
                          <div className="col-span-2">
                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                                <input
                                  type="checkbox"
                                  checked={question.likertSettings?.showNumbers !== false}
                                  onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                    likertSettings: {
                                      ...question.likertSettings,
                                      showNumbers: e.target.checked
                                    }
                                  })}
                                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-700">Sayıları göster</span>
                              </label>
                              
                              {(question.likertSettings?.scaleSize || 5) % 2 === 1 && (
                                <label className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                                  <input
                                    type="checkbox"
                                    checked={question.likertSettings?.showNeutral !== false}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                      likertSettings: {
                                        ...question.likertSettings,
                                        showNeutral: e.target.checked
                                      }
                                    })}
                                    className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                                  />
                                  <span className="ml-3 text-sm font-medium text-gray-700">Nötr seçeneği göster</span>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.type === 'audio' && (
                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-4">🎤 Ses Kaydı Ayarları</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Maksimum Süre (dakika)</label>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={question.audioSettings?.maxDurationMinutes || 5}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                audioSettings: {
                                  ...question.audioSettings,
                                  maxDurationMinutes: parseInt(e.target.value) || 5
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                              <input
                                type="checkbox"
                                checked={question.audioSettings?.canReRecord !== false}
                                onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                  audioSettings: {
                                    ...question.audioSettings,
                                    canReRecord: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-700">Yeniden kayda izin ver</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.type === 'file-upload' && (
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-4">📎 Dosya Yükleme Ayarları</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Maksimum Dosya Boyutu (MB)</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={question.fileSettings?.maxFileSizeMB || 10}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                fileSettings: {
                                  ...question.fileSettings,
                                  maxFileSizeMB: parseInt(e.target.value) || 10
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">İzin Verilen Uzantılar</label>
                            <input
                              type="text"
                              value={question.fileSettings?.allowedExtensions?.join(', ') || ''}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                fileSettings: {
                                  ...question.fileSettings,
                                  allowedExtensions: e.target.value.split(',').map(ext => ext.trim()).filter(ext => ext)
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                              placeholder="örn: pdf, doc, jpg, png"
                            />
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                          💡 Tüm dosya türlerine izin vermek için boş bırakın
                        </div>
                      </div>
                    )}

                    {question.type === 'date-time' && (
                      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 mb-4">📅 Tarih ve Saat Ayarları</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                            <input
                              type="checkbox"
                              checked={question.dateTimeSettings?.includeDate !== false}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                dateTimeSettings: {
                                  ...question.dateTimeSettings,
                                  includeDate: e.target.checked
                                }
                              })}
                              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">Tarih seçimi / Include date picker</span>
                          </div>
                          <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                            <input
                              type="checkbox"
                              checked={question.dateTimeSettings?.includeTime !== false}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                dateTimeSettings: {
                                  ...question.dateTimeSettings,
                                  includeTime: e.target.checked
                                }
                              })}
                              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">Saat seçimi / Include time picker</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Tarih / Min Date</label>
                            <input
                              type="date"
                              value={question.dateTimeSettings?.minDate || ''}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                dateTimeSettings: {
                                  ...question.dateTimeSettings,
                                  minDate: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Maksimum Tarih / Max Date</label>
                            <input
                              type="date"
                              value={question.dateTimeSettings?.maxDate || ''}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                dateTimeSettings: {
                                  ...question.dateTimeSettings,
                                  maxDate: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-indigo-700 bg-indigo-100 px-3 py-2 rounded-lg">
                          💡 Tarih aralığını sınırlamak için minimum ve maksimum tarih belirleyebilirsiniz
                        </div>
                      </div>
                    )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading || !title || sections.reduce((total, section) => total + section.questions.length, 0) === 0}
                className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Anket Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Anketi Oluştur / Create Survey
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                İptal / Cancel
              </button>
            </div>
            
            {(!title || sections.reduce((total, section) => total + section.questions.length, 0) === 0) && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-amber-800 text-sm font-medium">
                      {!title ? 'Lütfen anket başlığı ekleyin' : 'Lütfen en az bir soru ekleyin'} / Please {!title ? 'add a survey title' : 'add at least one question'} to create your survey
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}