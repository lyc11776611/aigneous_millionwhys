'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClickVolcanoEffect from './components/ClickVolcanoEffect';
import KnowledgeGraphBackground from './components/KnowledgeGraphBackground';
import LanguageSwitcher from './components/LanguageSwitcher';
import InfiniteCarousel from './components/InfiniteCarousel';
import { useLanguage } from './contexts/LanguageContext';
import { getCarouselQuestions } from './lib/loadQuestions';

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const router = useRouter();
  const { t, language } = useLanguage();
  const [allQuestions, setAllQuestions] = useState({
    en: { row1: [] as string[], row2: [] as string[] },
    zh: { row1: [] as string[], row2: [] as string[] }
  });

  const handleQuestionClick = (question: string) => {
    // Navigate to quiz with the question as a query parameter
    const encodedQuestion = encodeURIComponent(question);
    router.push(`/quiz?q=${encodedQuestion}`);
  };

  const handleInPrep = () => {
    // Show coming soon message
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  // Load questions only once
  useEffect(() => {
    // Load questions for both languages once
    const questionsEn = getCarouselQuestions('en');
    const questionsZh = getCarouselQuestions('zh');
    setAllQuestions({
      en: questionsEn,
      zh: questionsZh
    });
  }, []); // Only run once on mount

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % t.features.items.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [t.features.items.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white relative overflow-hidden">
      {/* Coming Soon Toast */}
      {showComingSoon && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{language === 'zh' ? '功能开发中...' : 'Coming Soon...'}</span>
          </div>
        </div>
      )}

      {/* Enhanced click effect */}
      <ClickVolcanoEffect />

      {/* Animated knowledge graph background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <KnowledgeGraphBackground />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-radial from-[#FF6B52]/20 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-radial from-[#D94E33]/15 to-transparent rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-gradient-radial from-orange-400/10 to-transparent rounded-full blur-3xl animate-float"></div>

        {/* Geometric patterns */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-orange-200/20 rounded-full animate-spin-slower"></div>
        <div className="absolute bottom-40 left-10 w-24 h-24 border-2 border-orange-300/10 rotate-45 animate-bounce-slow"></div>
      </div>

      {/* Main content */}
      <div className="relative">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-orange-100/50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 relative transform group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src="/logo.color.svg"
                    alt="AIgneous"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tracking-tight">
                    <span className="italic text-[#D94E33]">A</span>
                    <span className="text-gray-900">Igneous</span>
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Million Whys</span>
                </div>
              </div>

              {/* Language Switcher only */}
              <LanguageSwitcher />
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-sm font-medium text-orange-800">{t.hero.badge}</span>
              </div>

              {/* Main headline - smaller and fixed 2 lines */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
                <span className="block text-gray-900">{t.hero.headline1}</span>
                <span className="block bg-gradient-to-r from-[#D94E33] to-[#FF6B52] bg-clip-text text-transparent animate-gradient">
                  {t.hero.headline2}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
                {t.hero.subheadline}
              </p>

              {/* Floating Question Carousel */}
              <div className="relative w-full overflow-hidden mb-12 py-4">
                <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">
                  {t.hero.questionsLabel}
                </p>

                {/* Row 1 - Scrolling Left */}
                <div className="mb-4">
                  <InfiniteCarousel
                    items={allQuestions[language].row1}
                    direction="left"
                    speed={100}
                    className=""
                    onItemClick={handleQuestionClick}
                    icon="❓"
                  />
                </div>

                {/* Row 2 - Scrolling Right */}
                <div className="">
                  <InfiniteCarousel
                    items={allQuestions[language].row2}
                    direction="right"
                    speed={100}
                    className=""
                    onItemClick={handleQuestionClick}
                    icon="🤔"
                  />
                </div>

                {/* Gradient fade on edges - very narrow for mobile */}
                <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 md:w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-20"></div>
                <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 md:w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-20"></div>
              </div>

              {/* CTA Button */}
              <div className="flex items-center justify-center">
                <Link href="/quiz" className="inline-block">
                  <button className="relative px-10 py-4 bg-gradient-to-r from-[#D94E33] to-[#FF6B52] text-white font-semibold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-orange-400/50 group">
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>{t.hero.cta}</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex items-center justify-center space-x-4 sm:space-x-8 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t.hero.noSignup}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t.hero.freeTrial}</span>
                </span>
                <span className="hidden sm:flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{t.hero.anyDevice}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="relative py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent w-20 sm:w-32"></div>
                <div className="relative">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent w-20 sm:w-32"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-white via-orange-50/20 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t.features.title.split('AIgneous')[0]}
                <span className="italic text-[#D94E33]">A</span>Igneous
                {t.features.title.split('AIgneous')[1] || ''}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Feature cards */}
              <div className="space-y-4">
                {t.features.items.map((feature, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveFeature(index)}
                    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-500 ${
                      activeFeature === index
                        ? 'bg-white shadow-2xl shadow-orange-200/50 scale-105'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${index === 0 ? 'from-amber-500 to-orange-500' : index === 1 ? 'from-orange-500 to-red-500' : index === 2 ? 'from-red-500 to-pink-500' : 'from-pink-500 to-rose-500'} rounded-xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                        {feature.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm font-medium text-[#D94E33] mb-2">
                          {feature.subtitle}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeFeature === index && (
                      <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-[#D94E33] to-[#FF6B52] rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Visual demonstration */}
              <div className="relative">
                <div className="relative mx-auto max-w-md">
                  {/* Phone mockup */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-700 rounded-[2.5rem] p-3 shadow-2xl">
                    <div className="bg-white rounded-[2rem] p-8 h-[500px] flex flex-col items-center justify-center">
                      {/* Demo content based on active feature */}
                      <div className="text-center space-y-6">
                        <div className="text-6xl animate-bounce-slow">
                          {t.features.items[activeFeature].icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {t.features.items[activeFeature].title}
                        </h3>
                        <p className="text-gray-600">
                          {t.features.items[activeFeature].subtitle}
                        </p>
                        <div className="pt-4">
                          <Link href="/quiz" className="inline-block">
                            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#D94E33] to-[#FF6B52] text-white rounded-full cursor-pointer hover:shadow-lg transition-shadow">
                              <span className="font-medium">{t.features.tryNow}</span>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -z-10 -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-orange-300/30 to-red-300/30 rounded-full blur-2xl"></div>
                  <div className="absolute -z-10 -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-red-300/30 to-pink-300/30 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t.useCases.title}
              </h2>
              <p className="text-lg text-gray-600">
                {t.useCases.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {t.useCases.items.map((useCase, index) => (
                <div
                  key={index}
                  className="group relative p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#D94E33]/50 hover:shadow-xl hover:shadow-orange-200/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="text-center space-y-3">
                    <div className="text-4xl group-hover:scale-125 transition-transform duration-300">
                      {useCase.icon}
                    </div>
                    <p className="text-xs font-medium text-gray-700 group-hover:text-[#D94E33] transition-colors">
                      {useCase.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-orange-50/30 to-white">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D94E33]/5 to-[#FF6B52]/5 rounded-3xl transform rotate-1"></div>
              <div className="absolute inset-0 bg-gradient-to-l from-orange-100/50 to-red-100/50 rounded-3xl transform -rotate-1"></div>

              {/* Content */}
              <div className="relative bg-white rounded-3xl shadow-xl p-12">
                <div className="text-center space-y-6">
                  <div className="inline-block p-3 bg-gradient-to-br from-[#D94E33]/10 to-[#FF6B52]/10 rounded-2xl">
                    <svg className="w-8 h-8 text-[#D94E33]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900">
                    {t.vision.title}
                  </h2>

                  <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    {t.vision.description}
                  </p>

                  <div className="pt-4">
                    <blockquote className="text-xl italic text-[#D94E33] font-medium">
                      {t.vision.quote}
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-br from-[#D94E33] via-[#FF6B52] to-orange-400">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl text-white/90 mb-10">
              {t.cta.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/quiz" className="inline-block">
                <button className="px-10 py-4 bg-white text-[#D94E33] font-semibold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-white/30">
                  {t.cta.startNow}
                </button>
              </Link>
              <button onClick={handleInPrep} className="px-10 py-4 border-2 border-white/50 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white transition-all duration-300">
                {t.cta.learnMore}
              </button>
            </div>

            <p className="mt-8 text-white/70 text-sm">
              {t.cta.noCreditCard}
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative bg-gray-900 text-gray-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 relative">
                    <Image src="/logo.color.svg" alt="AIgneous" fill className="object-contain brightness-0 invert" />
                  </div>
                  <span className="text-lg font-semibold text-white">
                    <span className="italic">A</span>Igneous
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-4">
                  {t.footer.tagline}
                </p>
                <div className="flex space-x-4">
                  <button className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                    <span className="sr-only">GitHub</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">{t.nav.product}</h3>
                <ul className="space-y-2">
                  <li><button onClick={handleInPrep} className="hover:text-white transition-colors">{t.nav.howItWorks}</button></li>
                  <li><button onClick={handleInPrep} className="hover:text-white transition-colors">{t.nav.features}</button></li>
                  <li><button onClick={handleInPrep} className="hover:text-white transition-colors">{t.nav.pricing}</button></li>
                  <li><button onClick={handleInPrep} className="hover:text-white transition-colors">{t.nav.faq}</button></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">{t.nav.company}</h3>
                <ul className="space-y-2">
                  <li><button onClick={handleInPrep} className="hover:text-white transition-colors">{t.nav.about}</button></li>
                  <li><button onClick={handleInPrep} className="hover:text-white transition-colors">{t.nav.blog}</button></li>
                  <li><button onClick={handleInPrep} className="hover:text-white transition-colors">{t.nav.careers}</button></li>
                  <li><button onClick={handleInPrep} className="hover:text-white transition-colors">{t.nav.contact}</button></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm">
                {t.footer.copyright}
              </p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <button onClick={handleInPrep} className="text-sm hover:text-white transition-colors">{t.footer.privacy}</button>
                <button onClick={handleInPrep} className="text-sm hover:text-white transition-colors">{t.footer.terms}</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}