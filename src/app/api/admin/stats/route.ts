import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'data', 'logs');
const ANSWERS_LOG_FILE = join(DATA_DIR, 'quiz_answers.jsonl');
const SHARES_LOG_FILE = join(DATA_DIR, 'quiz_shares.jsonl');

export async function GET(request: NextRequest) {
  try {
    // Simple password protection
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';

    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read answers data
    let answers: any[] = [];
    if (existsSync(ANSWERS_LOG_FILE)) {
      const content = await readFile(ANSWERS_LOG_FILE, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      answers = lines.map(line => JSON.parse(line));
    }

    // Read shares data
    let shares: any[] = [];
    if (existsSync(SHARES_LOG_FILE)) {
      const content = await readFile(SHARES_LOG_FILE, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      shares = lines.map(line => JSON.parse(line));
    }

    // If no data at all, return empty stats
    if (answers.length === 0 && shares.length === 0) {
      return NextResponse.json({
        total: 0,
        sessions: 0,
        accuracy: 0,
        byCategory: {},
        byDifficulty: {},
        recentAnswers: [],
        shares: {
          total: 0,
          byMethod: {},
          byCategory: {},
          byDifficulty: {},
          recentShares: [],
        },
      });
    }

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

    // Calculate share statistics
    const totalShares = shares.length;

    // Group by method (web_share vs clipboard)
    const sharesByMethod: Record<string, number> = {};
    shares.forEach(s => {
      const method = s.method || 'unknown';
      sharesByMethod[method] = (sharesByMethod[method] || 0) + 1;
    });

    // Group by category
    const sharesByCategory: Record<string, number> = {};
    shares.forEach(s => {
      const category = s.category || 'unknown';
      sharesByCategory[category] = (sharesByCategory[category] || 0) + 1;
    });

    // Group by difficulty
    const sharesByDifficulty: Record<string, number> = {};
    shares.forEach(s => {
      const difficulty = s.difficulty || 'unknown';
      sharesByDifficulty[difficulty] = (sharesByDifficulty[difficulty] || 0) + 1;
    });

    // Get recent 50 shares
    const recentShares = shares.slice(-50).reverse();

    return NextResponse.json({
      total: totalAnswers,
      sessions: uniqueSessions,
      accuracy,
      byCategory,
      byDifficulty,
      topUsers,
      recentAnswers,
      shares: {
        total: totalShares,
        byMethod: sharesByMethod,
        byCategory: sharesByCategory,
        byDifficulty: sharesByDifficulty,
        recentShares,
      },
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

    if (!existsSync(ANSWERS_LOG_FILE)) {
      return new NextResponse('No data available', { status: 404 });
    }

    const content = await readFile(ANSWERS_LOG_FILE, 'utf-8');

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
