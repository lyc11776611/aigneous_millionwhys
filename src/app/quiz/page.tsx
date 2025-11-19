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

// Emoji mapping based on English category keywords
// Note: Always pass English category to this function for consistent matching
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
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  // Initialize questions and load saved stats from localStorage
  useEffect(() => {
    const questions = loadAllQuestions();
    const shuffled = shuffleArray(questions);
    setAllQuestions(shuffled);

    // Load saved statistics from localStorage
    const savedAnsweredCount = localStorage.getItem('quiz_answered_count');
    const savedCorrectCount = localStorage.getItem('quiz_correct_count');
    const savedAnsweredIds = localStorage.getItem('quiz_answered_ids');

    if (savedAnsweredCount) {
      setAnsweredCount(parseInt(savedAnsweredCount, 10));
    }
    if (savedCorrectCount) {
      setCorrectCount(parseInt(savedCorrectCount, 10));
    }

    // Load answered question IDs
    const answeredIds = savedAnsweredIds ? new Set<string>(JSON.parse(savedAnsweredIds)) : new Set<string>();
    setAnsweredQuestionIds(answeredIds);

    // Find first unanswered question
    const unansweredQuestions = shuffled.filter(q => !answeredIds.has(q.id));
    if (unansweredQuestions.length > 0) {
      setCurrentQuestion(unansweredQuestions[0]);
    } else if (shuffled.length > 0) {
      // All questions answered - show completion state
      setAllQuestionsCompleted(true);
      setCurrentQuestion(shuffled[0]);
    }
  }, []);

  const handleSelectAnswer = (index: number) => {
    if (showFeedback || !currentQuestion) return; // Prevent changing answer after submission

    const newAnsweredCount = answeredCount + 1;
    const isCorrect = index === currentQuestion.correct_answer;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

    // Add current question ID to answered set
    const newAnsweredIds = new Set(answeredQuestionIds);
    newAnsweredIds.add(currentQuestion.id);

    setSelectedAnswer(index);
    setShowFeedback(true);
    setAnsweredCount(newAnsweredCount);
    setCorrectCount(newCorrectCount);
    setAnsweredQuestionIds(newAnsweredIds);

    // Save statistics to localStorage
    localStorage.setItem('quiz_answered_count', newAnsweredCount.toString());
    localStorage.setItem('quiz_correct_count', newCorrectCount.toString());
    localStorage.setItem('quiz_answered_ids', JSON.stringify(Array.from(newAnsweredIds)));

    // Check if all questions are now answered
    if (newAnsweredIds.size >= allQuestions.length) {
      setAllQuestionsCompleted(true);
    }
  };

  const handleNextQuestion = () => {
    // Get unanswered questions
    const unansweredQuestions = allQuestions.filter(q => !answeredQuestionIds.has(q.id));

    if (unansweredQuestions.length > 0) {
      // Pick a random unanswered question
      const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
      setCurrentQuestion(unansweredQuestions[randomIndex]);
      setAllQuestionsCompleted(false);
    } else {
      // All questions answered - keep showing completion state
      setAllQuestionsCompleted(true);
    }

    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowExplanationModal(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handleResetStats = () => {
    if (confirm(language === 'en' ? 'Reset all statistics and start fresh?' : '重置所有统计数据并重新开始？')) {
      setAnsweredCount(0);
      setCorrectCount(0);
      setAnsweredQuestionIds(new Set());
      setAllQuestionsCompleted(false);
      localStorage.removeItem('quiz_answered_count');
      localStorage.removeItem('quiz_correct_count');
      localStorage.removeItem('quiz_answered_ids');

      // Pick a random question to restart
      if (allQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        setCurrentQuestion(allQuestions[randomIndex]);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }
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
  // Always use English category for emoji matching, regardless of UI language
  const questionEmoji = getCategoryEmoji(
    currentQuestion.category_en || '',
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
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg font-bold text-gray-900">
                  🎯 {answeredQuestionIds.size}/{allQuestions.length} {language === 'en' ? 'completed' : '已完成'}
                </span>
                {answeredCount > 0 && (
                  <>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {accuracy}% {language === 'en' ? 'correct' : '正确率'}
                    </span>
                    <button
                      onClick={handleResetStats}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title={language === 'en' ? 'Reset statistics' : '重置统计'}
                      aria-label={language === 'en' ? 'Reset statistics' : '重置统计'}
                    >
                      🔄
                    </button>
                  </>
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

            {/* Completion message */}
            {allQuestionsCompleted && (
              <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'en' ? 'All Questions Completed!' : '所有题目已完成！'}
                </h3>
                <p className="text-gray-700 mb-4">
                  {language === 'en'
                    ? `You've answered all ${allQuestions.length} questions! Click reset to start again.`
                    : `你已经完成了全部 ${allQuestions.length} 道题目！点击重置按钮重新开始。`}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'en'
                    ? `Total: ${answeredCount} | Accuracy: ${accuracy}%`
                    : `总计：${answeredCount} 题 | 正确率：${accuracy}%`}
                </p>
              </div>
            )}

            {/* Action buttons - show after answering */}
            {showFeedback && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExplanationModal(true)}
                  className={`${
                    allQuestionsCompleted ? 'w-full' : 'flex-1'
                  } bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
                >
                  {language === 'en' ? '💡 View Explanation' : '💡 查看解答'}
                </button>
                {!allQuestionsCompleted && (
                  <button
                    onClick={handleNextQuestion}
                    className="flex-1 bg-gradient-to-r from-[#D94E33] to-[#FF6B52] hover:from-[#FF6B52] hover:to-[#D94E33] text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {language === 'en' ? 'Next →' : '下一题 →'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Explanation Modal */}
      {showExplanationModal && selectedAnswer !== null && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowExplanationModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`p-6 rounded-t-3xl ${
                isCorrect
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-b-2 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-4xl flex-shrink-0">
                    {isCorrect ? '✅' : 'ℹ️'}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {isCorrect
                        ? language === 'en'
                          ? 'Correct! 🎉'
                          : '正确！🎉'
                        : language === 'en'
                        ? "Let's learn together! 💪"
                        : '一起学习吧！💪'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? currentQuestion.question_en : currentQuestion.question_zh}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExplanationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-3xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                {language === 'en' ? 'Explanation' : '解释'}
              </h4>
              <p className="text-gray-700 leading-relaxed mb-6">
                {language === 'en'
                  ? currentQuestion.explanations_en[selectedAnswer]
                  : currentQuestion.explanations_zh[selectedAnswer]}
              </p>

              {/* Close button */}
              <button
                onClick={() => setShowExplanationModal(false)}
                className="w-full bg-gradient-to-r from-[#D94E33] to-[#FF6B52] hover:from-[#FF6B52] hover:to-[#D94E33] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {language === 'en' ? 'Got it!' : '明白了！'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add animations */}
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
