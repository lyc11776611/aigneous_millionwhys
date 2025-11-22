'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from './auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [password, setPasswordState] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      setPasswordState(savedPassword);
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Test password by making a request
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${inputPassword}`,
        },
      });

      if (response.status === 401) {
        setError('Invalid password');
        setAuthenticated(false);
        return;
      }

      if (response.ok) {
        sessionStorage.setItem('admin_password', inputPassword);
        setPasswordState(inputPassword);
        setAuthenticated(true);
      }
    } catch (err) {
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_password');
    setPasswordState('');
    setAuthenticated(false);
    setInputPassword('');
    router.push('/admin');
  };

  const setPassword = (pw: string) => {
    sessionStorage.setItem('admin_password', pw);
    setPasswordState(pw);
    setAuthenticated(true);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">AIgneous Quiz Management</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !inputPassword}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ password, setPassword, logout }}>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  🎓 AIgneous Admin
                </Link>
                <div className="flex space-x-4">
                  <Link
                    href="/admin/questions"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pathname.startsWith('/admin/questions')
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    📚 Question Bank
                  </Link>
                  <Link
                    href="/admin/stats"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pathname === '/admin/stats'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    📊 Analytics
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  🏠 Back to Site
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AuthContext.Provider>
  );
}
