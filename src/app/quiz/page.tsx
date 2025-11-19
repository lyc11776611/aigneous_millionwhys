'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import all question files
import animalsData from '@/data/questions/animals.json';
import astronomyData from '@/data/questions/astronomy.json';
import chemistryData from '@/data/questions/chemistry.json';
import economicsData from '@/data/questions/economics.json';
import humanBiologyData from '@/data/questions/human-biology.json';
import physicsData from '@/data/questions/physics.json';
import plantsData from '@/data/questions/plants.json';
import psychologyData from '@/data/questions/psychology.json';
import technologyData from '@/data/questions/technology.json';
import weatherData from '@/data/questions/weather.json';

type Language = 'en' | 'zh';

interface Question {
  id: string;
  question_en: string;
  question_zh: string;
  choices_en: string[];
  choices_zh: string[];
  correct_answer: number;
  explanations_en: string[];
  explanations_zh: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category_en?: string;
  category_zh?: string;
}

const difficultyConfig = {
  easy: { label_en: 'Easy', label_zh: '简单', color: 'bg-green-100 text-green-700 border-green-300' },
  medium: { label_en: 'Medium', label_zh: '中等', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  hard: { label_en: 'Hard', label_zh: '困难', color: 'bg-red-100 text-red-700 border-red-300' },
};

const categoryEmojis: { [key: string]: string } = {
  'animal': '🐾',
  'astronomy': '🌌',
  'chemistry': '⚗️',
  'economics': '💰',
  'biology': '🧬',
  'physics': '⚛️',
  'plant': '🌱',
  'psychology': '🧠',
  'technology': '💻',
  'weather': '🌤️',
};

function getCategoryEmoji(category: string, question: string): string {
  const lowerCategory = category.toLowerCase();
  for (const [keyword, emoji] of Object.entries(categoryEmojis)) {
    if (lowerCategory.includes(keyword)) {
      return emoji;
    }
  }

  // Fallback to question-based emoji
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes('cat') || lowerQuestion.includes('purr')) return '🐱';
  if (lowerQuestion.includes('dog') || lowerQuestion.includes('wag')) return '🐶';
  if (lowerQuestion.includes('bird') || lowerQuestion.includes('migrate')) return '🐦';

  return '❓';
}

// Merge all questions from different categories
function loadAllQuestions(): Question[] {
  const allData = [
    { data: animalsData, category_en: animalsData.category_en, category_zh: animalsData.category_zh },
    { data: astronomyData, category_en: astronomyData.category_en, category_zh: astronomyData.category_zh },
    { data: chemistryData, category_en: chemistryData.category_en, category_zh: chemistryData.category_zh },
    { data: economicsData, category_en: economicsData.category_en, category_zh: economicsData.category_zh },
    { data: humanBiologyData, category_en: humanBiologyData.category_en, category_zh: humanBiologyData.category_zh },
    { data: physicsData, category_en: physicsData.category_en, category_zh: physicsData.category_zh },
    { data: plantsData, category_en: plantsData.category_en, category_zh: plantsData.category_zh },
    { data: psychologyData, category_en: psychologyData.category_en, category_zh: psychologyData.category_zh },
    { data: technologyData, category_en: technologyData.category_en, category_zh: technologyData.category_zh },
    { data: weatherData, category_en: weatherData.category_en, category_zh: weatherData.category_zh },
  ];

  const questions: Question[] = [];

  allData.forEach(({ data, category_en, category_zh }) => {
    data.questions.forEach((q: any) => {
      questions.push({
        ...q,
        category_en,
        category_zh,
      });
    });
  });

  return questions;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizPage() {
  const router = useRouter();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Initialize questions on mount
  useEffect(() => {
    const questions = loadAllQuestions();
    const shuffled = shuffleArray(questions);
    setAllQuestions(shuffled);
    setCurrentQuestion(shuffled[0]);
  }, []);

  const handleSelectAnswer = (index: number) => {
    if (showFeedback) return; // Prevent changing answer after submission

    setSelectedAnswer(index);
    setShowFeedback(true);
    setAnsweredCount(answeredCount + 1);

    if (index === currentQuestion?.correct_answer) {
      setCorrectCount(correctCount + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = (answeredCount % allQuestions.length);

    // If we've gone through all questions, reshuffle
    if (nextIndex === 0 && answeredCount > 0) {
      const reshuffled = shuffleArray(allQuestions);
      setAllQuestions(reshuffled);
      setCurrentQuestion(reshuffled[0]);
    } else {
      setCurrentQuestion(allQuestions[nextIndex]);
    }

    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-xl text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const isCorrect = showFeedback && selectedAnswer === currentQuestion.correct_answer;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const questionEmoji = getCategoryEmoji(
    language === 'en' ? currentQuestion.category_en || '' : currentQuestion.category_zh || '',
    language === 'en' ? currentQuestion.question_en : currentQuestion.question_zh
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-2xl hover:scale-110 transition-transform"
                aria-label="Back to home"
              >
                🏠
              </button>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900">
                  🎯 {answeredCount} {language === 'en' ? 'answered' : '已答'}
                </span>
                {answeredCount > 0 && (
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {accuracy}% {language === 'en' ? 'correct' : '正确率'}
                  </span>
                )}
              </div>
            </div>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700"
            >
              <span className="text-sm">🌐</span>
              <span className="text-sm">{language === 'en' ? '中文' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main quiz content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="max-w-3xl w-full">
          {/* Question card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
            {/* Category & Difficulty */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {language === 'en' ? currentQuestion.category_en : currentQuestion.category_zh}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                    difficultyConfig[currentQuestion.difficulty].color
                  }`}
                >
                  {language === 'en'
                    ? difficultyConfig[currentQuestion.difficulty].label_en
                    : difficultyConfig[currentQuestion.difficulty].label_zh}
                </span>
              </div>
              <span className="text-4xl">{questionEmoji}</span>
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
              {language === 'en' ? currentQuestion.question_en : currentQuestion.question_zh}
            </h2>

            {/* Choices */}
            <div className="space-y-3 mb-6">
              {(language === 'en' ? currentQuestion.choices_en : currentQuestion.choices_zh).map(
                (choice, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correct_answer;
                  const showAsCorrect = showFeedback && isCorrectAnswer;
                  const showAsIncorrect = showFeedback && isSelected && !isCorrectAnswer;

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={showFeedback}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                        showAsCorrect
                          ? 'bg-green-50 border-green-500 shadow-lg scale-[1.02]'
                          : showAsIncorrect
                          ? 'bg-red-50 border-red-500 shadow-lg'
                          : isSelected
                          ? 'bg-orange-50 border-orange-500 shadow-md transform scale-[1.02]'
                          : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md hover:transform hover:scale-[1.01]'
                      } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio button indicator */}
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            showAsCorrect
                              ? 'border-green-500 bg-green-500'
                              : showAsIncorrect
                              ? 'border-red-500 bg-red-500'
                              : isSelected
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {showAsCorrect && <span className="text-white text-sm font-bold">✓</span>}
                          {showAsIncorrect && <span className="text-white text-sm font-bold">✗</span>}
                          {isSelected && !showFeedback && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>

                        {/* Choice text */}
                        <span
                          className={`text-base md:text-lg ${
                            showAsCorrect || showAsIncorrect ? 'font-semibold' : ''
                          }`}
                        >
                          {choice}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {/* Feedback section - expands when answered */}
            {showFeedback && selectedAnswer !== null && (
              <div
                className={`mb-6 p-6 rounded-2xl border-2 transition-all duration-500 ease-out transform ${
                  isCorrect
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-slideUp'
                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 animate-slideUp'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">
                    {isCorrect ? '✅' : 'ℹ️'}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {isCorrect
                        ? language === 'en'
                          ? 'Correct! 🎉'
                          : '正确！🎉'
                        : language === 'en'
                        ? "Let's learn together! 💪"
                        : '一起学习吧！💪'}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {language === 'en'
                        ? currentQuestion.explanations_en[selectedAnswer]
                        : currentQuestion.explanations_zh[selectedAnswer]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action button - only show after answering */}
            {showFeedback && (
              <div className="flex justify-center">
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-[#D94E33] to-[#FF6B52] hover:from-[#FF6B52] hover:to-[#D94E33] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {language === 'en' ? 'Next Question →' : '下一题 →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add slide-up animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
