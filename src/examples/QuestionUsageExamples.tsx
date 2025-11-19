/**
 * Usage examples for Question types
 *
 * This file demonstrates how to use the TypeScript types for questions.
 * Delete this file if not needed, or use it as a reference.
 */

'use client';

import { useState } from 'react';
import type {
  Question,
  QuestionCategory,
  Language,
} from '@/types/questions';
import {
  getQuestionText,
  getChoices,
  getExplanations,
  isCorrectAnswer,
  getCategoryName,
} from '@/types/questions';

// Example 1: Import and type a question category
import chemistryData from '@/data/questions/chemistry.json';

// Type assertion (with validation in production)
const chemistry: QuestionCategory = chemistryData as QuestionCategory;

/**
 * Example 2: Simple question display component
 */
export function SimpleQuestionDisplay() {
  const question: Question = chemistry.questions[0];

  return (
    <div>
      <h2>{question.question_en}</h2>
      <ul>
        {question.choices_en.map((choice, index) => (
          <li key={index}>{choice}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 3: Bilingual question component
 */
export function BilingualQuestion({ question }: { question: Question }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('zh')}
          className={`px-4 py-2 ml-2 ${language === 'zh' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          中文
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {getQuestionText(question, language)}
      </h2>

      <div className="space-y-2">
        {getChoices(question, language).map((choice, index) => (
          <div
            key={index}
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
          >
            {choice}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Interactive quiz component with explanations
 */
export function InteractiveQuiz({ question }: { question: Question }) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const explanations = getExplanations(question, language);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <span className={`px-3 py-1 rounded ${
          question.difficulty === 'easy' ? 'bg-green-200' :
          question.difficulty === 'medium' ? 'bg-yellow-200' :
          'bg-red-200'
        }`}>
          {question.difficulty.toUpperCase()}
        </span>

        <div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            {language === 'en' ? '中文' : 'English'}
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">
        {getQuestionText(question, language)}
      </h2>

      <div className="space-y-3">
        {getChoices(question, language).map((choice, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = isCorrectAnswer(question, index);

          let bgColor = 'bg-white hover:bg-gray-50';
          if (showExplanation && isSelected) {
            bgColor = isCorrect ? 'bg-green-100' : 'bg-red-100';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation}
              className={`w-full p-4 text-left border-2 rounded-lg transition ${bgColor} ${
                isSelected ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="font-semibold mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{choice}</span>
                {showExplanation && isSelected && (
                  <span className="ml-auto">
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showExplanation && selectedAnswer !== null && (
        <div className={`mt-6 p-4 rounded-lg ${
          isCorrectAnswer(question, selectedAnswer)
            ? 'bg-green-50 border-l-4 border-green-500'
            : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          <p className="font-semibold mb-2">
            {isCorrectAnswer(question, selectedAnswer) ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p>{explanations[selectedAnswer]}</p>
        </div>
      )}

      {showExplanation && (
        <button
          onClick={() => {
            setSelectedAnswer(null);
            setShowExplanation(false);
          }}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Example 5: Category browser
 */
export function CategoryBrowser({ category }: { category: QuestionCategory }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {getCategoryName(category, language)}
      </h1>

      <div className="mb-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          {language === 'en' ? 'Switch to 中文' : 'Switch to English'}
        </button>
      </div>

      <div className="grid gap-4">
        {category.questions.map((question) => (
          <div
            key={question.id}
            className="p-4 border rounded-lg hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold flex-1">
                {getQuestionText(question, language)}
              </h3>
              <span className={`ml-4 px-2 py-1 text-sm rounded ${
                question.difficulty === 'easy' ? 'bg-green-200' :
                question.difficulty === 'medium' ? 'bg-yellow-200' :
                'bg-red-200'
              }`}>
                {question.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ID: {question.id}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 6: Dynamic category loading
 */
export function DynamicCategoryLoader() {
  const [category, setCategory] = useState<QuestionCategory | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCategory = async (categoryName: string) => {
    setLoading(true);
    try {
      // Dynamic import - only loads the selected category
      const data = await import(`@/data/questions/${categoryName}.json`);
      setCategory(data as QuestionCategory);
    } catch (error) {
      console.error('Failed to load category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Select a Category</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[
          'animals',
          'astronomy',
          'chemistry',
          'economics',
          'human-biology',
          'physics',
          'plants',
          'psychology',
          'technology',
          'weather',
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => loadCategory(cat)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 capitalize"
          >
            {cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}

      {category && !loading && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">{category.category_en}</h3>
          <p className="text-gray-600">{category.questions.length} questions</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: Type-safe question filter
 */
export function QuestionFilter() {
  const [difficulty, setDifficulty] = useState<Question['difficulty'] | 'all'>('all');

  const allQuestions: Question[] = chemistry.questions;

  const filteredQuestions = difficulty === 'all'
    ? allQuestions
    : allQuestions.filter((q) => q.difficulty === difficulty);

  return (
    <div className="p-6">
      <div className="mb-4">
        <label className="mr-4">Filter by difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as any)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <p className="mb-4 text-gray-600">
        Showing {filteredQuestions.length} questions
      </p>

      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="p-4 border rounded">
            <p className="font-semibold">{question.question_en}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
