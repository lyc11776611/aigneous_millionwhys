import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const QUESTIONS_DIR = join(process.cwd(), 'src', 'data', 'questions');

const VALID_CATEGORIES = [
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // If no category specified, return all categories
    if (!category) {
      const allQuestions = await Promise.all(
        VALID_CATEGORIES.map(async (cat) => {
          const filePath = join(QUESTIONS_DIR, `${cat}.json`);
          if (existsSync(filePath)) {
            const content = await readFile(filePath, 'utf-8');
            return JSON.parse(content);
          }
          return null;
        })
      );

      return NextResponse.json(allQuestions.filter(Boolean));
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const filePath = join(QUESTIONS_DIR, `${category}.json`);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load questions:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
}
