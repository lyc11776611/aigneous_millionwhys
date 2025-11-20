'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../layout';

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
  category_en: string;
  category_zh: string;
  category_file: string;
}

export default function QuestionBankPage() {
  const { password } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [password]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory, selectedDifficulty]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions', {
        headers: { 'Authorization': `Bearer ${password}` },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.question_zh.includes(searchTerm) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category_file === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading questions...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
        <p className="text-gray-600 mt-2">
          Total: {questions.length} questions across {categories.length} categories
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-gray-500">{question.id}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {question.category_en}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {question.question_en}
                </h3>
                <p className="text-gray-600">{question.question_zh}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700 mb-2">Choices (EN):</div>
                <div className="space-y-2">
                  {question.choices_en.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => setViewingQuestion(question)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 ${
                        idx === question.correct_answer
                          ? 'bg-green-50 text-green-700 font-semibold border-2 border-green-200'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{idx + 1}.</span> {choice}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-2">Choices (ZH):</div>
                <div className="space-y-2">
                  {question.choices_zh.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => setViewingQuestion(question)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 ${
                        idx === question.correct_answer
                          ? 'bg-green-50 text-green-700 font-semibold border-2 border-green-200'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{idx + 1}.</span> {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No questions found matching your filters.
          </div>
        )}
      </div>

      {/* Explanation Modal */}
      {viewingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingQuestion.question_en}</h2>
                <p className="text-lg text-gray-600 mt-2">{viewingQuestion.question_zh}</p>
                <p className="text-sm text-gray-500 mt-2">ID: <span className="font-mono">{viewingQuestion.id}</span></p>
              </div>
              <button
                onClick={() => setViewingQuestion(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* English Explanations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Explanations (English)</h3>
                <div className="space-y-3">
                  {viewingQuestion.explanations_en.map((explanation, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        idx === viewingQuestion.correct_answer
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`font-bold ${
                          idx === viewingQuestion.correct_answer ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {idx + 1}.
                        </span>
                        <div className="flex-1">
                          <div className={`font-medium mb-1 ${
                            idx === viewingQuestion.correct_answer ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {viewingQuestion.choices_en[idx]}
                            {idx === viewingQuestion.correct_answer && (
                              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chinese Explanations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">解释（中文）</h3>
                <div className="space-y-3">
                  {viewingQuestion.explanations_zh.map((explanation, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        idx === viewingQuestion.correct_answer
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`font-bold ${
                          idx === viewingQuestion.correct_answer ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {idx + 1}.
                        </span>
                        <div className="flex-1">
                          <div className={`font-medium mb-1 ${
                            idx === viewingQuestion.correct_answer ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {viewingQuestion.choices_zh[idx]}
                            {idx === viewingQuestion.correct_answer && (
                              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                ✓ 正确答案
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingQuestion(null)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
