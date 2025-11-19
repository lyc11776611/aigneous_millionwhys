/**
 * TypeScript type definitions for the Curious Minds question database
 *
 * Usage:
 * ```typescript
 * import type { Question, QuestionCategory } from '@/types/questions';
 * import chemistryData from '@/data/questions/chemistry.json';
 *
 * const data: QuestionCategory = chemistryData;
 * const firstQuestion: Question = data.questions[0];
 * ```
 */

/**
 * Difficulty level of a question
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Individual question with bilingual content
 */
export interface Question {
  /** Unique identifier (e.g., "chem_001") */
  id: string;

  /** Question text in English (≤45 characters) */
  question_en: string;

  /** Question text in Chinese (≤25 characters) */
  question_zh: string;

  /** Four answer choices in English (each ≤35 characters) */
  choices_en: [string, string, string, string];

  /** Four answer choices in Chinese (each ≤15 characters) */
  choices_zh: [string, string, string, string];

  /** Index of the correct answer (0-3) */
  correct_answer: 0 | 1 | 2 | 3;

  /**
   * Explanations for all four choices in English
   * - Correct answer starts with "Correct!"
   * - Wrong answers start with "Wrong."
   * - Total combined ≤400 characters
   */
  explanations_en: [string, string, string, string];

  /**
   * Explanations for all four choices in Chinese
   * - Correct answer starts with "正确！"
   * - Wrong answers start with "错误。"
   * - Total combined ≤180 characters
   */
  explanations_zh: [string, string, string, string];

  /** Difficulty level */
  difficulty: DifficultyLevel;
}

/**
 * Complete question category/topic with metadata
 */
export interface QuestionCategory {
  /** Category name in English */
  category_en: string;

  /** Category name in Chinese */
  category_zh: string;

  /** Array of questions in this category */
  questions: Question[];
}

/**
 * Available question categories
 */
export type CategoryName =
  | 'animals'
  | 'astronomy'
  | 'chemistry'
  | 'economics'
  | 'human-biology'
  | 'physics'
  | 'plants'
  | 'psychology'
  | 'technology'
  | 'weather';

/**
 * Helper type for importing question data
 */
export type QuestionData = {
  [K in CategoryName]: QuestionCategory;
};

/**
 * Type guard to check if a value is a valid question
 */
export function isQuestion(value: unknown): value is Question {
  if (typeof value !== 'object' || value === null) return false;

  const q = value as Partial<Question>;

  return (
    typeof q.id === 'string' &&
    typeof q.question_en === 'string' &&
    typeof q.question_zh === 'string' &&
    Array.isArray(q.choices_en) &&
    q.choices_en.length === 4 &&
    Array.isArray(q.choices_zh) &&
    q.choices_zh.length === 4 &&
    typeof q.correct_answer === 'number' &&
    q.correct_answer >= 0 &&
    q.correct_answer <= 3 &&
    Array.isArray(q.explanations_en) &&
    q.explanations_en.length === 4 &&
    Array.isArray(q.explanations_zh) &&
    q.explanations_zh.length === 4 &&
    (q.difficulty === 'easy' ||
      q.difficulty === 'medium' ||
      q.difficulty === 'hard')
  );
}

/**
 * Type guard to check if a value is a valid question category
 */
export function isQuestionCategory(
  value: unknown
): value is QuestionCategory {
  if (typeof value !== 'object' || value === null) return false;

  const qc = value as Partial<QuestionCategory>;

  return (
    typeof qc.category_en === 'string' &&
    typeof qc.category_zh === 'string' &&
    Array.isArray(qc.questions) &&
    qc.questions.every(isQuestion)
  );
}

/**
 * Utility type for question display language
 */
export type Language = 'en' | 'zh';

/**
 * Helper function to get question text in specified language
 */
export function getQuestionText(question: Question, lang: Language): string {
  return lang === 'en' ? question.question_en : question.question_zh;
}

/**
 * Helper function to get choices in specified language
 */
export function getChoices(
  question: Question,
  lang: Language
): [string, string, string, string] {
  return lang === 'en' ? question.choices_en : question.choices_zh;
}

/**
 * Helper function to get explanations in specified language
 */
export function getExplanations(
  question: Question,
  lang: Language
): [string, string, string, string] {
  return lang === 'en' ? question.explanations_en : question.explanations_zh;
}

/**
 * Helper function to check if an answer is correct
 */
export function isCorrectAnswer(
  question: Question,
  answerIndex: number
): boolean {
  return answerIndex === question.correct_answer;
}

/**
 * Helper function to get category display name
 */
export function getCategoryName(
  category: QuestionCategory,
  lang: Language
): string {
  return lang === 'en' ? category.category_en : category.category_zh;
}
