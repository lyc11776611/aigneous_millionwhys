import { NextRequest, NextResponse } from 'next/server';
import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'data', 'logs');
const LOG_FILE = join(DATA_DIR, 'quiz_answers.jsonl');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      questionId,
      category,
      isCorrect,
      difficulty,
      language,
    } = body;

    // Validate required fields
    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId,
      questionId,
      category,
      isCorrect,
      difficulty,
      language: language || 'unknown',
    };

    // Append as single line JSON
    await appendFile(LOG_FILE, JSON.stringify(logEntry) + '\n');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log quiz answer:', error);
    return NextResponse.json(
      { error: 'Failed to log answer' },
      { status: 500 }
    );
  }
}
