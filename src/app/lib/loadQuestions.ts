// Load questions from JSON files for the carousel
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

export interface Question {
  id: string;
  question_en: string;
  question_zh: string;
}

export function getAllQuestions(): { en: string[], zh: string[] } {
  const allData = [
    animalsData,
    astronomyData,
    chemistryData,
    economicsData,
    humanBiologyData,
    physicsData,
    plantsData,
    psychologyData,
    technologyData,
    weatherData,
  ];

  const questionsEn: string[] = [];
  const questionsZh: string[] = [];

  // Extract all questions from each category
  allData.forEach(category => {
    category.questions.forEach((q: Question) => {
      questionsEn.push(q.question_en);
      questionsZh.push(q.question_zh);
    });
  });

  // Shuffle questions to get a nice mix
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return {
    en: shuffleArray(questionsEn),
    zh: shuffleArray(questionsZh),
  };
}

// Get two rows of questions for the carousel
export function getCarouselQuestions(language: 'en' | 'zh'): { row1: string[], row2: string[] } {
  const allQuestions = getAllQuestions();
  const questions = language === 'en' ? allQuestions.en : allQuestions.zh;

  // Take first 16 questions for the carousel (8 per row)
  const row1 = questions.slice(0, 8);
  const row2 = questions.slice(8, 16);

  return { row1, row2 };
}