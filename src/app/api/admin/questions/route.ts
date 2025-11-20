import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const QUESTIONS_DIR = join(process.cwd(), 'src', 'data', 'questions');

// Verify admin authentication
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';
  return authHeader === `Bearer ${adminPassword}`;
}

// GET: List all questions from all categories
export async function GET(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const files = await readdir(QUESTIONS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const allQuestions: any[] = [];

    for (const file of jsonFiles) {
      const filePath = join(QUESTIONS_DIR, file);
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      const category = file.replace('.json', '');
      data.questions.forEach((q: any) => {
        allQuestions.push({
          ...q,
          category_file: category,
          category_en: data.category_en,
          category_zh: data.category_zh,
        });
      });
    }

    return NextResponse.json({
      total: allQuestions.length,
      questions: allQuestions,
      categories: jsonFiles.map(f => f.replace('.json', '')),
    });
  } catch (error) {
    console.error('Failed to list questions:', error);
    return NextResponse.json(
      { error: 'Failed to list questions' },
      { status: 500 }
    );
  }
}

// POST: Add new question or create new category file
export async function POST(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, question } = body;

    if (!category || !question) {
      return NextResponse.json(
        { error: 'Missing category or question data' },
        { status: 400 }
      );
    }

    const filePath = join(QUESTIONS_DIR, `${category}.json`);

    // Read existing file or create new structure
    let data: any;
    if (existsSync(filePath)) {
      const content = await readFile(filePath, 'utf-8');
      data = JSON.parse(content);
    } else {
      // Create new category file
      data = {
        category_en: question.category_en || category,
        category_zh: question.category_zh || category,
        questions: [],
      };
    }

    // Generate ID if not provided
    if (!question.id) {
      const prefix = category.substring(0, 4);
      const nextNum = data.questions.length + 1;
      question.id = `${prefix}_${nextNum.toString().padStart(3, '0')}`;
    }

    // Add question
    data.questions.push(question);

    // Write back to file
    await writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error('Failed to add question:', error);
    return NextResponse.json(
      { error: 'Failed to add question' },
      { status: 500 }
    );
  }
}

// PUT: Update existing question
export async function PUT(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, questionId, updatedQuestion } = body;

    if (!category || !questionId || !updatedQuestion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const filePath = join(QUESTIONS_DIR, `${category}.json`);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Category file not found' },
        { status: 404 }
      );
    }

    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const questionIndex = data.questions.findIndex((q: any) => q.id === questionId);

    if (questionIndex === -1) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Update question
    data.questions[questionIndex] = { ...updatedQuestion, id: questionId };

    // Write back to file
    await writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE: Remove question
export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const questionId = searchParams.get('id');

    if (!category || !questionId) {
      return NextResponse.json(
        { error: 'Missing category or question ID' },
        { status: 400 }
      );
    }

    const filePath = join(QUESTIONS_DIR, `${category}.json`);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Category file not found' },
        { status: 404 }
      );
    }

    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const questionIndex = data.questions.findIndex((q: any) => q.id === questionId);

    if (questionIndex === -1) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Remove question
    data.questions.splice(questionIndex, 1);

    // Write back to file
    await writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
