import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'data', 'logs');
const LOG_FILE = join(DATA_DIR, 'quiz_answers.jsonl');

export async function GET(request: NextRequest) {
  try {
    // Simple password protection
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';

    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if log file exists
    if (!existsSync(LOG_FILE)) {
      return NextResponse.json({
        total: 0,
        sessions: 0,
        accuracy: 0,
        byCategory: {},
        byDifficulty: {},
        recentAnswers: [],
      });
    }

    // Read and parse JSONL file
    const content = await readFile(LOG_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const answers = lines.map(line => JSON.parse(line));

    // Calculate statistics
    const totalAnswers = answers.length;
    const uniqueSessions = new Set(answers.map(a => a.sessionId)).size;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    // Group by category
    const byCategory: Record<string, { total: number; correct: number }> = {};
    answers.forEach(a => {
      if (!byCategory[a.category]) {
        byCategory[a.category] = { total: 0, correct: 0 };
      }
      byCategory[a.category].total++;
      if (a.isCorrect) byCategory[a.category].correct++;
    });

    // Group by difficulty
    const byDifficulty: Record<string, { total: number; correct: number }> = {};
    answers.forEach(a => {
      if (!byDifficulty[a.difficulty]) {
        byDifficulty[a.difficulty] = { total: 0, correct: 0 };
      }
      byDifficulty[a.difficulty].total++;
      if (a.isCorrect) byDifficulty[a.difficulty].correct++;
    });

    // Get recent 100 answers
    const recentAnswers = answers.slice(-100).reverse();

    // Per-session stats
    const sessionStats: Record<string, { total: number; correct: number }> = {};
    answers.forEach(a => {
      if (!sessionStats[a.sessionId]) {
        sessionStats[a.sessionId] = { total: 0, correct: 0 };
      }
      sessionStats[a.sessionId].total++;
      if (a.isCorrect) sessionStats[a.sessionId].correct++;
    });

    const topUsers = Object.entries(sessionStats)
      .map(([sessionId, stats]) => ({
        sessionId,
        total: stats.total,
        correct: stats.correct,
        accuracy: Math.round((stats.correct / stats.total) * 100),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return NextResponse.json({
      total: totalAnswers,
      sessions: uniqueSessions,
      accuracy,
      byCategory,
      byDifficulty,
      topUsers,
      recentAnswers,
    });
  } catch (error) {
    console.error('Failed to read stats:', error);
    return NextResponse.json(
      { error: 'Failed to read statistics' },
      { status: 500 }
    );
  }
}

// Download raw JSONL file
export async function POST(request: NextRequest) {
  try {
    // Simple password protection
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';

    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!existsSync(LOG_FILE)) {
      return new NextResponse('No data available', { status: 404 });
    }

    const content = await readFile(LOG_FILE, 'utf-8');

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Content-Disposition': `attachment; filename="quiz_answers_${new Date().toISOString().split('T')[0]}.jsonl"`,
      },
    });
  } catch (error) {
    console.error('Failed to download file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
