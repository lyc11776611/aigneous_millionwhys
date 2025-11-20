'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../layout';

interface Stats {
  total: number;
  sessions: number;
  accuracy: number;
  byCategory: Record<string, { total: number; correct: number }>;
  byDifficulty: Record<string, { total: number; correct: number }>;
  topUsers: Array<{ sessionId: string; total: number; correct: number; accuracy: number }>;
  recentAnswers: Array<{
    timestamp: string;
    sessionId: string;
    questionId: string;
    category: string;
    isCorrect: boolean;
    difficulty: string;
    language: string;
  }>;
  shares: {
    total: number;
    byMethod: Record<string, number>;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    recentShares: Array<{
      timestamp: string;
      sessionId: string;
      questionId: string;
      category: string;
      difficulty: string;
      method: string;
      language: string;
    }>;
  };
}

export default function AdminStatsPage() {
  const { password } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [password]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz_answers_${new Date().toISOString().split('T')[0]}.jsonl`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Analytics</h1>
          <p className="text-gray-600 mt-2">Real-time user answer tracking and insights</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg transition-colors font-semibold shadow-lg"
        >
          📥 Download Raw Data
        </button>
      </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Total Answers</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Unique Users</div>
            <div className="text-3xl font-bold text-gray-900">{stats.sessions}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Overall Accuracy</div>
            <div className="text-3xl font-bold text-gray-900">{stats.accuracy}%</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-gray-500 text-sm mb-2">Total Shares</div>
            <div className="text-3xl font-bold text-orange-600">{stats.shares?.total || 0}</div>
          </div>
        </div>

        {/* Top Users */}
        {stats.topUsers && stats.topUsers.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top 10 Active Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">Session ID</th>
                  <th className="text-right py-3 px-4 text-gray-600">Total</th>
                  <th className="text-right py-3 px-4 text-gray-600">Correct</th>
                  <th className="text-right py-3 px-4 text-gray-600">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {stats.topUsers.map((user, idx) => (
                  <tr key={user.sessionId} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900 font-mono text-sm">{user.sessionId.slice(0, 16)}...</td>
                    <td className="text-right py-3 px-4 font-bold text-gray-900">{user.total}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{user.correct}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{user.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* By Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">By Category</h2>
            <div className="space-y-3">
              {stats.byCategory && Object.entries(stats.byCategory).map(([category, data]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{category}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{data.total}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({Math.round((data.correct / data.total) * 100)}% correct)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">By Difficulty</h2>
            <div className="space-y-3">
              {stats.byDifficulty && Object.entries(stats.byDifficulty).map(([difficulty, data]) => (
                <div key={difficulty} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{difficulty}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{data.total}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({Math.round((data.correct / data.total) * 100)}% correct)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Share Analytics */}
        {stats.shares && stats.shares.total > 0 && (
        <>
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Share Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* By Method */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">By Method</h3>
                <div className="space-y-2">
                  {stats.shares.byMethod && Object.entries(stats.shares.byMethod).map(([method, count]) => (
                    <div key={method} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                      <span className="text-gray-700 capitalize">{method === 'web_share' ? 'Web Share API' : method === 'clipboard' ? 'Clipboard' : method}</span>
                      <span className="font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Category */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">By Category</h3>
                <div className="space-y-2">
                  {stats.shares.byCategory && Object.entries(stats.shares.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                        <span className="text-gray-700 capitalize">{category}</span>
                        <span className="font-bold text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* By Difficulty */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">By Difficulty</h3>
                <div className="space-y-2">
                  {stats.shares.byDifficulty && Object.entries(stats.shares.byDifficulty).map(([difficulty, count]) => (
                    <div key={difficulty} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                      <span className="text-gray-700 capitalize">{difficulty}</span>
                      <span className="font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Shares */}
          {stats.shares.recentShares && stats.shares.recentShares.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent 50 Shares</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600">Time</th>
                    <th className="text-left py-2 px-3 text-gray-600">Session</th>
                    <th className="text-left py-2 px-3 text-gray-600">Category</th>
                    <th className="text-left py-2 px-3 text-gray-600">Difficulty</th>
                    <th className="text-left py-2 px-3 text-gray-600">Method</th>
                    <th className="text-left py-2 px-3 text-gray-600">Lang</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.shares.recentShares.map((share, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">
                        {new Date(share.timestamp).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-2 px-3 text-gray-700 font-mono text-xs">{share.sessionId.slice(0, 8)}</td>
                      <td className="py-2 px-3 text-gray-700 capitalize">{share.category}</td>
                      <td className="py-2 px-3 text-gray-700 capitalize">{share.difficulty}</td>
                      <td className="py-2 px-3 text-gray-700">
                        <span className={`px-2 py-1 rounded text-xs ${
                          share.method === 'web_share'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {share.method === 'web_share' ? '📤 Share' : '📋 Copy'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-700">{share.language}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </>
        )}

        {/* Recent Answers */}
        {stats.recentAnswers && stats.recentAnswers.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent 100 Answers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600">Time</th>
                  <th className="text-left py-2 px-3 text-gray-600">Session</th>
                  <th className="text-left py-2 px-3 text-gray-600">Category</th>
                  <th className="text-left py-2 px-3 text-gray-600">Difficulty</th>
                  <th className="text-left py-2 px-3 text-gray-600">Result</th>
                  <th className="text-left py-2 px-3 text-gray-600">Lang</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAnswers.map((answer, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-700">
                      {new Date(answer.timestamp).toLocaleString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2 px-3 text-gray-700 font-mono text-xs">{answer.sessionId.slice(0, 8)}</td>
                    <td className="py-2 px-3 text-gray-700 capitalize">{answer.category}</td>
                    <td className="py-2 px-3 text-gray-700 capitalize">{answer.difficulty}</td>
                    <td className="py-2 px-3">
                      {answer.isCorrect ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-700">{answer.language}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
    </div>
  );
}
