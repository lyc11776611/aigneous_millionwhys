/**
 * Type definitions index
 * Exports all types for easy importing
 */

export type {
  Question,
  QuestionCategory,
  DifficultyLevel,
  CategoryName,
  QuestionData,
  Language,
} from './questions';

export {
  isQuestion,
  isQuestionCategory,
  getQuestionText,
  getChoices,
  getExplanations,
  isCorrectAnswer,
  getCategoryName,
} from './questions';
