'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';
import { isQuestion } from '@/types/questions';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (command: string, eventName: string, params?: any) => void;
  }
}

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

// Category file names to load
const QUESTION_CATEGORIES = [
  'animals',
  'astronomy',
  'chemistry',
  'earth-science',
  'economics',
  'food-nutrition',
  'human-biology',
  'physics',
  'plants',
  'psychology',
  'technology',
  'weather',
];

// Fetch and merge all questions from different categories
async function loadAllQuestions(): Promise<Question[]> {
  try {
    // Fetch all category files in parallel via API
    const responses = await Promise.all(
      QUESTION_CATEGORIES.map(category =>
        fetch(`/api/questions?category=${category}`).then(res => {
          if (!res.ok) throw new Error(`Failed to load ${category}`);
          return res.json();
        })
      )
    );

    const questions: Question[] = [];

    // Merge questions from all categories
    responses.forEach((data: any) => {
      const { category_en, category_zh, questions: categoryQuestions } = data;

      categoryQuestions.forEach((q: any) => {
        // Runtime type validation
        if (isQuestion(q)) {
          questions.push({
            ...q,
            category_en,
            category_zh,
          });
        } else {
          console.warn('Invalid question format:', q);
        }
      });
    });

    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    throw error;
  }
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

// Shuffle choices while maintaining correct answer mapping
function shuffleChoices(question: Question): ShuffledChoices {
  // Create indices array [0, 1, 2, 3]
  const indices = [0, 1, 2, 3];
  const shuffledIndices = shuffleArray(indices);

  return {
    choices_en: shuffledIndices.map(i => question.choices_en[i]),
    choices_zh: shuffledIndices.map(i => question.choices_zh[i]),
    explanations_en: shuffledIndices.map(i => question.explanations_en[i]),
    explanations_zh: shuffledIndices.map(i => question.explanations_zh[i]),
    correctAnswerIndex: shuffledIndices.indexOf(question.correct_answer),
  };
}

// Shuffled choices state interface
interface ShuffledChoices {
  choices_en: string[];
  choices_zh: string[];
  explanations_en: string[];
  explanations_zh: string[];
  correctAnswerIndex: number;
}

// Get today's date as string (YYYY-MM-DD)
function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Get color style based on daily count (1-20+: cool to hot, then FIRE!)
function getDailyCountStyle(count: number): { bg: string; text: string; border: string; fire: boolean } {
  if (count === 0) {
    return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', fire: false };
  }

  // 20+ questions = FIRE MODE! 🔥
  if (count >= 20) {
    return {
      bg: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500',
      text: 'text-white',
      border: 'border-orange-400',
      fire: true
    };
  }

  // Color progression: 1-19 questions
  // Cool blue → Fresh green → Warm yellow → Hot orange
  if (count <= 5) {
    // 1-5: Cool blue (冷静开始)
    return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', fire: false };
  } else if (count <= 10) {
    // 6-10: Fresh green (活力充沛)
    return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', fire: false };
  } else if (count <= 15) {
    // 11-15: Warm yellow (开始发光)
    return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', fire: false };
  } else {
    // 16-19: Hot orange (即将点燃)
    return { bg: 'bg-orange-200', text: 'text-orange-800', border: 'border-orange-400', fire: false };
  }
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<ShuffledChoices | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [dailyCount, setDailyCount] = useState(0); // Today's answered questions count
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [allQuestionsCompleted, setAllQuestionsCompleted] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shuffle choices whenever current question changes
  useEffect(() => {
    if (currentQuestion) {
      setShuffledChoices(shuffleChoices(currentQuestion));
    }
  }, [currentQuestion]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-container')) {
          setShowMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Initialize questions and load saved stats from localStorage
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch questions from public directory
        const questions = await loadAllQuestions();
        const shuffled = shuffleArray(questions);
        setAllQuestions(shuffled);

        // Load saved statistics from localStorage (daily stats)
        const today = getTodayString();
        const savedDate = localStorage.getItem('quiz_date');
        const savedDailyCount = localStorage.getItem('quiz_daily_count');
        const savedCorrectCount = localStorage.getItem('quiz_correct_count');
        const savedAnsweredIds = localStorage.getItem('quiz_answered_ids');

        // Reset stats if it's a new day
        if (savedDate !== today) {
          localStorage.setItem('quiz_date', today);
          localStorage.setItem('quiz_daily_count', '0');
          localStorage.setItem('quiz_correct_count', '0');
          setDailyCount(0);
          setCorrectCount(0);
        } else {
          // Load today's stats
          if (savedDailyCount) {
            setDailyCount(parseInt(savedDailyCount, 10));
          }
          if (savedCorrectCount) {
            setCorrectCount(parseInt(savedCorrectCount, 10));
          }
        }

        // Load answered question IDs
        const answeredIds = savedAnsweredIds ? new Set<string>(JSON.parse(savedAnsweredIds)) : new Set<string>();
        setAnsweredQuestionIds(answeredIds);

        // Check if a specific question was requested via URL parameter
        const requestedQuestion = searchParams.get('q');
        if (requestedQuestion) {
          // Find the question that matches the requested text (in either language)
          const matchingQuestion = shuffled.find(q =>
            q.question_en.toLowerCase().includes(requestedQuestion.toLowerCase()) ||
            q.question_zh.includes(requestedQuestion)
          );

          if (matchingQuestion) {
            setCurrentQuestion(matchingQuestion);
          } else {
            // If no matching question found, proceed with normal flow
            const unansweredQuestions = shuffled.filter(q => !answeredIds.has(q.id));
            if (unansweredQuestions.length > 0) {
              setCurrentQuestion(unansweredQuestions[0]);
            } else if (shuffled.length > 0) {
              setAllQuestionsCompleted(true);
              setCurrentQuestion(shuffled[0]);
            }
          }
        } else {
          // Normal flow - find first unanswered question
          const unansweredQuestions = shuffled.filter(q => !answeredIds.has(q.id));
          if (unansweredQuestions.length > 0) {
            setCurrentQuestion(unansweredQuestions[0]);
          } else if (shuffled.length > 0) {
            // All questions answered - show completion state
            setAllQuestionsCompleted(true);
            setCurrentQuestion(shuffled[0]);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError(language === 'en'
          ? 'Failed to load questions. Please refresh the page.'
          : '加载题目失败。请刷新页面。');
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [searchParams]); // Only re-run when URL searchParams change, not on language toggle

  const handleSelectAnswer = (index: number) => {
    if (showFeedback || !currentQuestion || !shuffledChoices) return; // Prevent changing answer after submission

    const isCorrect = index === shuffledChoices.correctAnswerIndex;
    const newDailyCount = dailyCount + 1;
    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;

    // Add current question ID to answered set
    const newAnsweredIds = new Set(answeredQuestionIds);
    newAnsweredIds.add(currentQuestion.id);

    setSelectedAnswer(index);
    setShowFeedback(true);
    setDailyCount(newDailyCount);
    setCorrectCount(newCorrectCount);
    setAnsweredQuestionIds(newAnsweredIds);

    // Save statistics to localStorage
    const today = getTodayString();
    localStorage.setItem('quiz_date', today);
    localStorage.setItem('quiz_daily_count', newDailyCount.toString());
    localStorage.setItem('quiz_correct_count', newCorrectCount.toString());
    localStorage.setItem('quiz_answered_ids', JSON.stringify(Array.from(newAnsweredIds)));

    // Track answer to backend (silent fail - don't block user experience)
    const sessionId = localStorage.getItem('quiz_session_id') || (() => {
      const newSessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('quiz_session_id', newSessionId);
      return newSessionId;
    })();

    fetch('/api/track-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        questionId: currentQuestion.id,
        category: currentQuestion.category_en,
        isCorrect,
        difficulty: currentQuestion.difficulty,
        language,
      }),
    }).catch(err => console.error('Tracking failed:', err));

    // GA4 Event: Track correct or incorrect answer
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', isCorrect ? 'quiz_answer_correct' : 'quiz_answer_incorrect', {
        question_id: currentQuestion.id,
        category: currentQuestion.category_en,
        difficulty: currentQuestion.difficulty,
        session_count: newDailyCount,
        accuracy: Math.round((newCorrectCount / newDailyCount) * 100),
      });

      // GA4 Event: Milestone tracking (5, 10, 20, 30, 40...)
      if (newDailyCount === 5 || newDailyCount === 10 || (newDailyCount >= 20 && newDailyCount % 10 === 0)) {
        window.gtag('event', 'quiz_milestone', {
          milestone: newDailyCount,
          accuracy: Math.round((newCorrectCount / newDailyCount) * 100),
          correct_count: newCorrectCount,
        });
      }
    }

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
    if (confirm(language === 'en' ? 'Reset today\'s statistics?' : '重置今日统计数据？')) {
      setDailyCount(0);
      setCorrectCount(0);
      setAnsweredQuestionIds(new Set());
      setAllQuestionsCompleted(false);
      const today = getTodayString();
      localStorage.setItem('quiz_date', today);
      localStorage.setItem('quiz_daily_count', '0');
      localStorage.setItem('quiz_correct_count', '0');
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

  const handleShareQuestion = async () => {
    if (!currentQuestion) return;

    const t = translations[language].quiz;
    const questionText = language === 'en' ? currentQuestion.question_en : currentQuestion.question_zh;

    // Create share URL with question as parameter
    const shareUrl = `${window.location.origin}/quiz?q=${encodeURIComponent(questionText)}`;

    const shareData = {
      title: `${questionText} - ${t.shareTitle}`,
      text: `${questionText}\n\n${t.shareText}`,
      url: shareUrl,
    };

    let shareMethod = 'unknown';
    let shareSuccessful = false;

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        shareMethod = 'web_share';
        shareSuccessful = true;
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert(language === 'en' ? 'Link copied to clipboard!' : '链接已复制到剪贴板！');
        shareMethod = 'clipboard';
        shareSuccessful = true;
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', err);
      shareSuccessful = false;
    }

    // Track share action (silent - don't block user experience)
    if (shareSuccessful) {
      const sessionId = localStorage.getItem('quiz_session_id') || 'unknown';

      // GA4 Event: Track share
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'share_question', {
          question_id: currentQuestion.id,
          category: currentQuestion.category_en,
          difficulty: currentQuestion.difficulty,
          method: shareMethod,
        });
      }

      // JSONL Backend tracking (silent fail)
      fetch('/api/track-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          category: currentQuestion.category_en,
          difficulty: currentQuestion.difficulty,
          method: shareMethod,
          language,
        }),
      }).catch(err => console.error('Share tracking failed:', err));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-xl text-gray-600">
            {language === 'en' ? 'Loading questions...' : '加载题目中...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {language === 'en' ? 'Oops!' : '哎呀！'}
          </h2>
          <p className="text-lg text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#D94E33] to-[#FF6B52] hover:from-[#FF6B52] hover:to-[#D94E33] text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {language === 'en' ? 'Refresh Page' : '刷新页面'}
          </button>
        </div>
      </div>
    );
  }

  // No questions loaded
  if (!currentQuestion || !shuffledChoices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-xl text-gray-600">
            {language === 'en' ? 'Loading questions...' : '加载题目中...'}
          </p>
        </div>
      </div>
    );
  }

  const isCorrect = showFeedback && selectedAnswer === shuffledChoices.correctAnswerIndex;
  const accuracy = dailyCount > 0 ? Math.round((correctCount / dailyCount) * 100) : 0;
  const dailyCountStyle = getDailyCountStyle(dailyCount);
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
            {/* Left: Daily stats */}
            <div className="flex items-center gap-3">
              <span className={`text-base font-bold px-4 py-2 rounded-full border transition-all duration-300 ${dailyCountStyle.bg} ${dailyCountStyle.text} ${dailyCountStyle.border} ${dailyCountStyle.fire ? 'shadow-lg ring-2 ring-orange-300' : ''}`}>
                {dailyCountStyle.fire && '🔥 '}
                {language === 'en' ? 'Today' : '今日'}: {dailyCount}
                {dailyCount > 0 && ` · ${accuracy}%`}
              </span>
            </div>

            {/* Right: Share button + Menu */}
            <div className="flex items-center gap-2 relative">
              {/* Share button */}
              <button
                onClick={handleShareQuestion}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-100 hover:bg-orange-200 active:bg-orange-300 transition-all hover:scale-105 shadow-sm hover:shadow"
                title={translations[language].quiz.shareButton}
                aria-label={translations[language].quiz.shareButton}
              >
                📤
              </button>

              {/* Menu button and dropdown container */}
              <div className="menu-container relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-all hover:scale-105 shadow-sm hover:shadow"
                  aria-label="Menu"
                >
                  <div className="flex flex-col gap-1 w-4">
                    <div className="h-0.5 bg-gray-700 rounded"></div>
                    <div className="h-0.5 bg-gray-700 rounded"></div>
                    <div className="h-0.5 bg-gray-700 rounded"></div>
                  </div>
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] z-10">
                  <button
                    onClick={() => {
                      router.push('/');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                  >
                    <span>🏠</span>
                    <span>{language === 'en' ? 'Home' : '返回首页'}</span>
                  </button>
                  <button
                    onClick={() => {
                      toggleLanguage();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                  >
                    <span>🌐</span>
                    <span>{language === 'en' ? '中文' : 'English'}</span>
                  </button>
                  {dailyCount > 0 && (
                    <button
                      onClick={() => {
                        handleResetStats();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <span>🔄</span>
                      <span>{language === 'en' ? 'Reset Stats' : '重置进度'}</span>
                    </button>
                  )}
                </div>
                )}
              </div>
            </div>
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
              <div className="flex items-center gap-2 flex-wrap">
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
              {(language === 'en' ? shuffledChoices.choices_en : shuffledChoices.choices_zh).map(
                (choice, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === shuffledChoices.correctAnswerIndex;
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
                <span className={`inline-flex items-center text-lg font-bold px-6 py-3 rounded-full border ${dailyCountStyle.bg} ${dailyCountStyle.text} ${dailyCountStyle.border} ${dailyCountStyle.fire ? 'shadow-lg ring-2 ring-orange-300' : ''}`}>
                  {dailyCountStyle.fire && '🔥 '}
                  {language === 'en' ? 'Today' : '今日'}: {dailyCount} · {accuracy}%
                </span>
              </div>
            )}

            {/* Action buttons - show after answering */}
            {showFeedback && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowExplanationModal(true);
                    // GA4 Event: Track explanation view
                    if (typeof window !== 'undefined' && window.gtag && currentQuestion) {
                      const isCorrect = selectedAnswer === shuffledChoices?.correctAnswerIndex;
                      window.gtag('event', isCorrect ? 'view_explanation_correct' : 'view_explanation_incorrect', {
                        question_id: currentQuestion.id,
                        category: currentQuestion.category_en,
                        difficulty: currentQuestion.difficulty,
                      });
                    }
                  }}
                  className={`${
                    allQuestionsCompleted ? 'w-full' : 'flex-1'
                  } bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-4 px-4 rounded-xl text-base transition-all duration-300 hover:shadow-lg transform hover:scale-105 whitespace-nowrap`}
                >
                  {language === 'en' ? '💡 View Explanation' : '💡 查看解答'}
                </button>
                {!allQuestionsCompleted && (
                  <button
                    onClick={handleNextQuestion}
                    className="flex-1 bg-gradient-to-r from-[#D94E33] to-[#FF6B52] hover:from-[#FF6B52] hover:to-[#D94E33] text-white font-bold py-4 px-4 rounded-xl text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
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
                  ? shuffledChoices.explanations_en[selectedAnswer]
                  : shuffledChoices.explanations_zh[selectedAnswer]}
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

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
