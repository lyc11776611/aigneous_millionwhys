'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ClickVolcanoEffect from './components/ClickVolcanoEffect';
import KnowledgeGraphBackground from './components/KnowledgeGraphBackground';

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Click volcano effect */}
      <ClickVolcanoEffect />

      {/* Interactive knowledge graph background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <KnowledgeGraphBackground />
      </div>

      {/* Playful background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header>
          <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#e44d5a]/20 via-orange-500/15 to-transparent backdrop-blur-md border-b border-gray-200/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 relative flex-shrink-0">
                    <Image src="/logo.color.svg" alt="AIgneous" fill className="object-contain" />
                  </div>
                  <span className="text-gray-900 font-bold text-lg sm:text-xl">AIgneous</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0">
                  <a
                    href="#get-started"
                    className="bg-gradient-to-r from-[#D94E33] to-[#FF6B52] text-white font-medium px-4 py-2 text-sm rounded-lg hover:shadow-lg transition-all"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* Main content area */}
        <main>
          {/* Hero Section */}
          <section aria-label="Hero" className="flex-1 px-6 lg:px-8 pt-8 md:pt-16 pb-12">
            <div className="max-w-7xl mx-auto text-center">
              {/* Playful illustration */}
              <div className="mb-6 md:mb-8 flex justify-center items-center gap-4">
                <div className="text-6xl md:text-7xl animate-float" style={{ animationDelay: '0s', opacity: 1 }}>💡</div>
                <div className="text-5xl md:text-6xl animate-float" style={{ animationDelay: '0.5s', opacity: 1 }}>✨</div>
                <div className="text-6xl md:text-7xl animate-float" style={{ animationDelay: '1s', opacity: 1 }}>🎮</div>
              </div>

              {/* Main Headline */}
              <h1 className="mb-3 md:mb-6 leading-tight">
                <div className="headline-container font-bold text-gray-900 mb-2 md:mb-3">
                  <span className="headline-line">Turn scattered learning</span><br />
                  <span className="headline-line">into <span className="gradient-text-animated">knowledge map</span></span>
                </div>
                <div className="text-lg md:text-xl lg:text-2xl font-light text-gray-500">
                  Learn <span className="deep-effect">deep</span>, learn <span className="fast-effect">fast</span>, with your <span className="companion-effect">AI learning companion</span>
                </div>
              </h1>

              <style jsx>{`
                .headline-container {
                  font-size: clamp(2rem, 5vw, 2.5rem);
                  max-width: 100%;
                  overflow-wrap: break-word;
                  text-align: center;
                }

                .headline-line {
                  display: inline-block;
                }

                @media (min-width: 768px) {
                  .headline-container {
                    font-size: clamp(2.5rem, 5vw, 3.5rem);
                  }
                }

                @media (min-width: 1024px) {
                  .headline-container {
                    font-size: clamp(2.5rem, 4vw, 3.5rem);
                    max-width: 90%;
                    margin: 0 auto;
                  }
                }

                @keyframes float {
                  0%, 100% {
                    transform: translateY(0px);
                    opacity: 1;
                  }
                  50% {
                    transform: translateY(-2px);
                    opacity: 1;
                  }
                }

                @keyframes gradient-shift {
                  0%, 100% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                }

                .animate-float {
                  animation: float 6s ease-in-out infinite;
                  display: inline-block;
                  opacity: 1;
                }

                .gradient-text-animated {
                  background: linear-gradient(90deg, #D94E33 0%, #FF6B52 25%, #D94E33 50%, #FF6B52 75%, #D94E33 100%);
                  background-size: 200% auto;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  animation: gradient-shift 3s ease-in-out infinite;
                }

                .deep-effect {
                  display: inline-block;
                  color: #3b82f6;
                  font-weight: 600;
                }

                .fast-effect {
                  display: inline-block;
                  color: #f97316;
                  font-weight: 600;
                }

                .companion-effect {
                  display: inline-block;
                  font-weight: 700;
                  color: #1f2937;
                  position: relative;
                  cursor: default;
                  transition: all 0.3s ease;
                }

                .companion-effect::after {
                  content: '';
                  position: absolute;
                  bottom: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0%;
                  height: 2px;
                  background: linear-gradient(90deg, #D94E33, #FF6B52);
                  transition: width 0.4s ease;
                }

                .companion-effect:hover {
                  transform: translateY(-2px);
                  color: #D94E33;
                }

                .companion-effect:hover::after {
                  width: 100%;
                }
              `}</style>
            </div>
          </section>

          {/* CTA Section */}
          <section id="get-started" className="px-6 lg:px-8 pb-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-3">
                <a
                  href="#"
                  className="group relative bg-gradient-to-r from-[#D94E33] to-[#FF6B52] hover:from-[#FF6B52] hover:to-[#D94E33] text-white font-bold py-4 px-16 rounded-2xl text-lg transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-110 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10">Start Learning!</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:translate-x-full transition-all duration-700 -translate-x-full"></div>
                </a>

                <p className="text-xs text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">
                  ✨ Free access to all features, no credit card required<br />
                  🚀 Join early users and shape the perfect product with our team
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-500">Learning sessions</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-orange-500">4.7</div>
                    <div className="flex relative">
                      {[...Array(5)].map((_, i) => {
                        if (i < 4) {
                          return <span key={i} className="text-2xl text-orange-400">★</span>;
                        } else {
                          return (
                            <span key={i} className="relative inline-block text-2xl">
                              <span className="text-gray-300">★</span>
                              <span
                                className="absolute left-0 top-0 overflow-hidden text-orange-400"
                                style={{ width: '70%' }}
                              >
                                ★
                              </span>
                            </span>
                          );
                        }
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">User rating</div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section aria-label="Features" className="w-full max-w-6xl mx-auto mb-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Why Choose AIgneous?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-white">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Knowledge Maps</h3>
                <p className="text-gray-600">
                  See your learning progress through interactive knowledge graphs. Watch concepts connect as you learn.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white">
                <div className="text-5xl mb-4">⏱️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">5-Minute Learning</h3>
                <p className="text-gray-600">
                  Master new concepts in just 5 minutes. Perfect for busy schedules and on-the-go learning.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-white">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Tutor</h3>
                <p className="text-gray-600">
                  Get personalized guidance from AI that adapts to your learning style and pace.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section aria-label="Call to action" className="text-center bg-orange-50 py-12 px-6 rounded-3xl mb-12 mx-4 sm:mx-6 lg:mx-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start learning?</h2>
            <p className="text-gray-600 mb-6">Start free, no credit card needed</p>
            <a
              href="#get-started"
              className="group relative inline-block bg-gradient-to-r from-[#D94E33] to-[#FF6B52] hover:from-[#FF6B52] hover:to-[#D94E33] text-white font-bold py-4 px-16 rounded-2xl text-lg transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-110 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">Start Learning!</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:translate-x-full transition-all duration-700 -translate-x-full"></div>
            </a>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative bg-gray-50 border-t border-gray-200 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
            <p>© 2025 AIgneous. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
