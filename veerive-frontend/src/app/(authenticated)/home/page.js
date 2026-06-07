'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import ContextImage from '../../../components/ContextImage';
import { parseJsxCode } from '../../utils/Tile';

const normalizeTitle = (text) => {
  if (!text || typeof text !== 'string') {
    return 'untitled';
  }
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\$/g, 'dollar')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function HomePage() {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [trendingOpinions, setTrendingOpinions] = useState([]);
  const [marketStatistics, setMarketStatistics] = useState([]);
  const [trendingThemes, setTrendingThemes] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch('/api/home', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 504) {
            throw new Error('Server timeout - please try again');
          } else if (response.status >= 500) {
            throw new Error('Server error - please try again later');
          } else {
            throw new Error('Failed to fetch data');
          }
        }
        
        const data = await response.json();
        
        // Handle partial data gracefully with additional safety checks
        setContexts(Array.isArray(data.trendingEvents) ? data.trendingEvents : []);
        setTrendingOpinions(Array.isArray(data.trendingOpinions) ? data.trendingOpinions : []);
        setMarketStatistics(Array.isArray(data.marketStatistics) ? data.marketStatistics : []);
        setTrendingThemes(Array.isArray(data.trendingThemes) ? data.trendingThemes : []);
        setSlides([
          data.slides?.slide1,
          data.slides?.slide2,
          data.slides?.slide3,
          data.slides?.slide4,
        ].filter(Boolean)); // Remove any undefined slides
      } catch (err) {
        if (err.name === 'AbortError') {
          console.error('Request timeout:', err);
          setError('Request timeout - please try again');
        } else {
          console.error('Error fetching data:', err);
          setError(err.message);
        }
        // Set empty arrays as fallback to prevent UI errors
        setContexts([]);
        setTrendingOpinions([]);
        setMarketStatistics([]);
        setTrendingThemes([]);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if ((slides?.length || 0) === 0) return;
    
    // Ensure currentSlide is within bounds
    if (currentSlide >= (slides?.length || 0)) {
      setCurrentSlide(0);
    }
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (slides?.length || 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [slides?.length, currentSlide]);

  const handleSlideChange = (index) => {
    if (index >= 0 && index < (slides?.length || 0)) {
      setCurrentSlide(index);
    }
  };

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil((contexts?.length || 0) / ITEMS_PER_PAGE);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleSubscribe = () => {
    router.push('/signup');
  };

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full">
        <div className="w-full bg-[#5F32D6] min-h-[500px] flex items-center">
          <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col max-[530px]:flex-col min-[531px]:flex-row items-center min-[531px]:items-start py-8 max-[530px]:py-6 min-[531px]:py-12">
              <div className="w-full min-[531px]:w-2/5 min-[531px]:pr-4 text-center min-[531px]:text-left">
                <h1 className="text-white block text-[20px] sm:text-[26px] md:text-[32px] lg:text-[38px] font-bold leading-tight">
                One platform. Every fintech insight that matters - Quantified. Contextualized. Actionable.
                </h1>
                <p className="mt-3 max-[530px]:mt-2 text-white/90 text-xs max-[530px]:text-xs sm:text-sm md:text-base lg:text-xl leading-relaxed max-w-[400px] mx-auto min-[531px]:mx-0">
                  Fintech information analytics platform that helps you see beyond the headlines. Anticipate the signals that define tomorrow's fintech landscape.
                </p>
                <div className="mt-4 max-[530px]:mt-3 flex justify-center min-[531px]:justify-start">
                  <div className="flex flex-col sm:flex-row gap-3 max-[530px]:gap-2 w-full max-w-[400px] max-[530px]:max-w-[300px]">
                    <Link href="/analyzer/trend-analyzer">
                      <button className="w-full sm:w-auto px-6 max-[530px]:px-4 py-3 max-[530px]:py-2 bg-white text-black rounded-full font-medium text-sm max-[530px]:text-xs hover:bg-[#5F32D6] hover:text-white transition-all duration-300 transform hover:scale-105">
                        Uncover Fintech Signals
                      </button>
                    </Link>
                    <Link href="/pulse-today">
                      <button className="w-full sm:w-auto px-6 max-[530px]:px-4 py-3 max-[530px]:py-2 bg-black text-white rounded-full font-medium text-sm max-[530px]:text-xs hover:bg-[#7A5AF8] hover:text-white transition-all duration-300 transform hover:scale-105">
                        Actionable Stories
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="w-full min-[531px]:w-3/5 mt-6 max-[530px]:mt-4 min-[531px]:mt-0 flex justify-end">
                <div className="relative w-full max-w-[450px]">
                  {(slides?.length || 0) > 0 ? (
                    <div className="flex flex-col">
                      <div className="h-fit">
                        {slides.map((slide, index) => (
                          <div
                            key={index}
                            className={`transition-opacity duration-500 ${
                              currentSlide === index
                                ? 'opacity-100'
                                : 'opacity-0 hidden'
                            }`}
                          >
                            <div className="bg-white rounded-lg p-6 flex flex-col justify-between">
                              <div>
                                <p className="text-[#A084E8] text-sm uppercase font-semibold mb-2">
                                  Featured {slide.title?.split('Featured ')?.[1]}
                                </p>
                                <h2 className="text-[#5F32D6] text-xl sm:text-xl lg:text-2xl font-bold leading-tight">
                                  {slide.themeTitle ||
                                    slide.contextTitle ||
                                    slide.postTitle ||
                                    'N/A'}
                                </h2>
                                <p
                                  className="text-black text-base sm:text-base mt-3 line-clamp-4"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      slide.themeDescription ||
                                      slide.summary ||
                                      slide.postSummary,
                                  }}
                                />
                              </div>
                              <div className="flex justify-end mt-4">
                                <Link href={slide.redirectUrl}>
                                  <button className="bg-[#7A5AF8] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#E550A3] transition-colors">
                                    Read More
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2 mt-4 pl-6 z-10">
                        {slides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlideChange(index)}
                            className={`w-8 h-1 rounded-full transition-opacity duration-300 ${
                              currentSlide === index
                                ? 'bg-[#A084E8] opacity-100'
                                : 'bg-[#E0D4FD] opacity-70 hover:opacity-90'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-lg h-[300px] flex items-center justify-center text-gray-500">
                      No slides available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Strength Section */}
        <div className="w-full bg-gray-50 py-12 md:py-16">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px bg-orange-500 w-8"></div>
                <span className="text-orange-500 text-sm font-semibold uppercase tracking-wide mx-4">OUR STRENGTH</span>
                <div className="h-px bg-orange-500 w-8"></div>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Predictive Models, Powered by Fintech Experts. Handpicked Data and Insights. Actionable Futures.
              </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* First Column - Data Assimilation */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M98.0469 50.0002C98.0469 23.4647 76.5355 1.95337 50 1.95337C23.4645 1.95337 1.95312 23.4647 1.95312 50.0002C1.95312 67.3782 11.1789 82.6012 25 91.0387C32.2832 95.485 40.8424 98.0471 50 98.0471C76.5357 98.0471 98.0469 76.5358 98.0469 50.0002Z" fill="#78D2FA"/>
                      <path d="M37.5406 55.1848L5.79846 68.8624C9.74612 78.1012 16.5043 85.8522 25 91.0387C29.6553 93.8807 34.8324 95.9512 40.3533 97.0764L40.8428 96.7282L44.3309 90.3944H47.0785C50.1447 90.3944 52.6303 87.9088 52.6303 84.8426V82.1467C52.6303 80.969 53.0047 79.8219 53.6996 78.8711L46.0914 67.5079L37.5406 55.1848Z" fill="#A5DC69"/>
                      <path d="M50 1.95337C40.7464 1.95337 32.1056 4.57173 24.7732 9.10454V10.3292L36.7072 14.8694C37.7681 15.2731 38.4542 16.3075 38.4134 17.4418C39.3744 20.2067 42.5582 21.4834 45.1634 20.1487L47.7562 18.7788C55.2873 14.7999 64.1931 20.8979 63.2082 29.3584L63.1841 29.5643C62.9419 31.6446 61.466 33.3038 59.4839 33.7717C58.1941 34.0762 56.7253 34.4264 55.4667 34.7272C53.6427 35.1633 52.238 36.6186 51.8667 38.4571L50.1906 46.7557C49.6017 49.6713 51.7687 52.419 54.7412 52.526L56.8921 52.6034C57.5113 52.6256 58.1205 52.767 58.6861 53.02L70.2876 66.4959L69.0533 81.1165C68.7689 85.6032 71.513 89.1016 75.0994 90.4633L75.7886 90.545C89.1707 82.0157 98.0468 67.045 98.0468 50.0002C98.0468 23.4647 76.5357 1.95337 50 1.95337Z" fill="#A5DC69"/>
                      <path d="M37.5 58.6113C37.5 48.7953 29.5426 40.8379 19.7266 40.8379C9.91055 40.8379 1.95312 48.7953 1.95312 58.6113C1.95312 62.8664 3.44922 66.7719 5.94297 69.8316H5.9418L19.7266 87.5002L33.4455 69.9242H33.4352C35.9744 66.8508 37.5 62.9094 37.5 58.6113Z" fill="#F5B955"/>
                      <path d="M19.7266 68.2695C24.9042 68.2695 29.1016 64.0722 29.1016 58.8945C29.1016 53.7169 24.9042 49.5195 19.7266 49.5195C14.5489 49.5195 10.3516 53.7169 10.3516 58.8945C10.3516 64.0722 14.5489 68.2695 19.7266 68.2695Z" fill="white"/>
                      <path d="M98.0468 16.3736C98.0468 8.40938 91.5906 1.95312 83.6263 1.95312C75.6621 1.95312 69.2058 8.40938 69.2058 16.3736C69.2058 19.8262 70.4197 22.9947 72.4431 25.4773H72.4421L83.6265 39.8129L94.7576 25.5525H94.7492C96.8091 23.0588 98.0468 19.8607 98.0468 16.3736Z" fill="#FF5A5A"/>
                      <path d="M83.627 22.8789C87.0928 22.8789 89.9023 20.0693 89.9023 16.6035C89.9023 13.1377 87.0928 10.3281 83.627 10.3281C80.1612 10.3281 77.3516 13.1377 77.3516 16.6035C77.3516 20.0693 80.1612 22.8789 83.627 22.8789Z" fill="white"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                  Assimilate handpicked credible datasets
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We curate and track thousands of high-quality datasets and insights, ensuring every signal comes from credible, expert-driven sources.
                </p>
              </div>

              {/* Second Column - Expert Analysis */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M36.7548 65.7744L29.8394 64.1172L22.8825 65.7791C17.6417 67.0311 13.9445 71.7154 13.9445 77.1037V90.2328H19.7193L42.4238 69.0193C40.9214 67.4596 38.9781 66.3072 36.7548 65.7744Z" fill="#72D8FF"/>
                      <path d="M27.4985 59.1382C31.7287 57.627 34.7569 53.5862 34.7569 48.8368V42.0419H20.2399V48.8368C20.2399 53.5862 23.268 57.627 27.4985 59.1382Z" fill="#FFCDAC"/>
                      <path d="M20.4015 44.191H20.4206C25.1421 44.191 29.7751 42.9092 33.8251 40.4824L34.7568 44.191V41.558C34.7568 37.1944 32.2007 33.4285 28.5044 31.6735C23.7417 33.6963 20.4015 38.4162 20.4015 43.9168C20.4015 43.9168 20.4015 44.191 20.4015 44.191Z" fill="#898998"/>
                      <path d="M89.1088 65.7794L81.0939 63.8647V58.9432H71.2809V63.8489L69.2559 64.3341L75.3053 65.7792C80.5461 67.0311 84.2434 71.7155 84.2434 77.1038V90.2329H98.0469V77.1038C98.0469 71.7157 94.3496 67.0313 89.1088 65.7794Z" fill="#A0E557"/>
                      <path d="M49.6406 71.5092L58.7856 69.3178L56.8233 68.849L43.1551 68.8271L31.9625 71.5092C24.668 73.2572 19.524 79.7793 19.524 87.2801V98.0453H37.2024V87.2801C37.2022 79.7793 42.3461 73.2572 49.6406 71.5092Z" fill="white"/>
                      <path d="M67.9865 71.5159L58.7855 69.3179L49.6406 71.5093C42.3461 73.2573 37.2021 79.7794 37.2021 87.2802V98.0454H80.4359V87.2895C80.4361 79.7845 75.2863 73.2599 67.9865 71.5159Z" fill="#FF5D5D"/>
                      <path d="M23.5352 58.9432H18.75V63.9989L23.8371 76.1796L26.2293 70.4497L23.5352 63.9989V58.9432Z" fill="white"/>
                      <path d="M75.8553 58.9432H71.0702V63.9813L76.1628 76.1796L78.5557 70.4497L75.8553 63.9813V58.9432Z" fill="white"/>
                      <path d="M28.9297 58.9432H23.5352V63.9989L26.2293 70.4497L28.9297 63.9813V58.9432Z" fill="#FFCDAC"/>
                      <path d="M81.25 58.9432H75.8555V63.9813L78.5559 70.4497L81.25 63.9989V58.9432Z" fill="#FFCDAC"/>
                      <path d="M49.5132 64.8889V63.2985H43.5561V64.8889C43.5561 66.0061 43.2491 67.0615 42.7098 67.9688L50.002 84.5178L52.98 77.7569L48.6669 67.9688C49.2061 67.0615 49.5132 66.0061 49.5132 64.8889Z" fill="white"/>
                      <path d="M56.44 64.8887V63.2985H49.513V64.8889C49.513 66.0061 49.206 67.0615 48.6667 67.9688L52.9798 77.7569L57.289 67.9733C56.7482 67.0651 56.44 66.0078 56.44 64.8887Z" fill="#FFEFD5"/>
                      <path d="M55.1758 62.2485C61.0414 60.1296 65.2344 54.5138 65.2344 47.9173V37.4058H45.1172V47.9173C45.1172 54.5138 49.3102 60.1298 55.1758 62.2485Z" fill="#FFEFD5"/>
                      <path d="M56.2213 23.8737C49.7066 26.5428 45.1172 32.9457 45.1172 40.4217V41.1918C48.9672 40.5139 52.4932 38.5026 55.0434 35.4594L64.9603 41.2858C65.0525 41.2227 65.1436 41.1576 65.2346 41.093V37.7795C65.2344 31.5824 61.5324 26.2537 56.2213 23.8737Z" fill="#FFB954"/>
                      <path d="M79.9161 59.1192C84.1175 57.5926 87.1187 53.5655 87.1187 48.8365V42.0416H72.7134V48.8365C72.7134 53.5655 75.7147 57.5928 79.9161 59.1192Z" fill="#FFCDAC"/>
                      <path d="M81.0241 31.7509C76.4665 33.729 73.1966 38.1087 72.8062 43.2936C73.1333 43.3817 73.4624 43.4624 73.7929 43.5376L73.931 42.9878C74.4474 43.2973 74.9731 43.588 75.5042 43.8675C76.8472 44.08 78.2091 44.1913 79.5792 44.1913H87.1188V41.5583C87.1188 37.2569 84.6349 33.5374 81.0241 31.7509Z" fill="#898998"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                  and underpin it with analyst-driven models
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our domain experts apply structured, sector-specific models to decode fintech value-chain dynamics, turning raw data into strategic clarity.
                </p>
              </div>

              {/* Third Column - Opportunity Prediction */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <svg width="80" height="80" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M98.3871 74.2061V79.0448C98.3868 80.328 97.8769 81.5585 96.9695 82.4659C96.0622 83.3733 94.8316 83.8832 93.5484 83.8835H6.45162C5.16842 83.8832 3.93786 83.3733 3.03049 82.4659C2.12313 81.5585 1.61324 80.328 1.61292 79.0448V74.2061H98.3871Z" fill="#57565C"/>
                      <path d="M98.3871 30.6577V74.2061H1.61292V30.6577C1.61324 29.3745 2.12313 28.1439 3.03049 27.2365C3.93786 26.3292 5.16842 25.8193 6.45162 25.819H93.5484C94.8316 25.8193 96.0622 26.3292 96.9695 27.2365C97.8769 28.1439 98.3868 29.3745 98.3871 30.6577Z" fill="#BDDBFF"/>
                      <path d="M61.2904 93.561H38.7097L41.9355 83.8835H58.0646L61.2904 93.561Z" fill="#E0E0E2"/>
                      <path d="M32.2581 93.5609H67.7419V98.3996H32.2581V93.5609Z" fill="#57565C"/>
                      <path d="M8.06458 30.6577H14.5162V41.948H8.06458V30.6577Z" fill="#AB2300"/>
                      <path d="M53.2258 30.6577H59.6774V41.948H53.2258V30.6577Z" fill="#FF9811"/>
                      <path d="M19.3549 12.9158H25.8065V41.948H19.3549V12.9158Z" fill="#83D8F4"/>
                      <path d="M30.6451 1.62537H37.0968V41.9479H30.6451V1.62537Z" fill="#91CC04"/>
                      <path d="M41.9354 8.07703H48.387V41.948H41.9354V8.07703Z" fill="#FFDA44"/>
                      <path d="M11.2904 61.3028C13.0719 61.3028 14.5162 59.8586 14.5162 58.077C14.5162 56.2954 13.0719 54.8512 11.2904 54.8512C9.50882 54.8512 8.06458 56.2954 8.06458 58.077C8.06458 59.8586 9.50882 61.3028 11.2904 61.3028Z" fill="#83D8F4"/>
                      <path d="M37.0968 69.3674C38.8783 69.3674 40.3226 67.9231 40.3226 66.1416C40.3226 64.36 38.8783 62.9158 37.0968 62.9158C35.3152 62.9158 33.871 64.36 33.871 66.1416C33.871 67.9231 35.3152 69.3674 37.0968 69.3674Z" fill="#91CC04"/>
                      <path d="M62.9032 54.8513C64.6847 54.8513 66.129 53.407 66.129 51.6255C66.129 49.8439 64.6847 48.3997 62.9032 48.3997C61.1216 48.3997 59.6774 49.8439 59.6774 51.6255C59.6774 53.407 61.1216 54.8513 62.9032 54.8513Z" fill="#AB2300"/>
                      <path d="M88.7097 66.1416C90.4913 66.1416 91.9355 64.6973 91.9355 62.9157C91.9355 61.1342 90.4913 59.6899 88.7097 59.6899C86.9281 59.6899 85.4839 61.1342 85.4839 62.9157C85.4839 64.6973 86.9281 66.1416 88.7097 66.1416Z" fill="#FF9811"/>
                      <path d="M14.5161 58.077L33.871 66.1415L14.5161 58.077Z" fill="#E0E0E2"/>
                      <path d="M40.3226 66.1415L59.6775 51.6254L40.3226 66.1415Z" fill="#E0E0E2"/>
                      <path d="M66.1292 51.6254L85.484 62.9157L66.1292 51.6254Z" fill="#E0E0E2"/>
                      <path d="M93.5482 14.5287C93.548 17.0807 92.7911 19.5753 91.3731 21.6972C89.9552 23.8191 87.94 25.4729 85.5823 26.4496C83.2246 27.4262 80.6302 27.6819 78.1271 27.1843C75.6241 26.6866 73.3248 25.458 71.52 23.6537L80.645 14.5287H93.5482Z" fill="#83D8F4"/>
                      <path d="M80.645 1.62537V14.5286L71.52 23.6536C69.7157 21.8488 68.4871 19.5495 67.9894 17.0465C67.4918 14.5434 67.7475 11.9491 68.7241 9.59133C69.7008 7.2336 71.3546 5.21838 73.4765 3.80047C75.5984 2.38256 78.093 1.62563 80.645 1.62537Z" fill="#FFDA44"/>
                      <path d="M93.5485 14.5286H80.6453V1.62537C84.0674 1.62537 87.3494 2.98481 89.7692 5.40463C92.189 7.82446 93.5485 11.1064 93.5485 14.5286Z" fill="#AB2300"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                  to deliver sector-specific, market-ready futuristic view
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We deliver sector-specific foresight and quantified opportunities, helping businesses and investors anticipate shifts and act with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Events Section */}
        <div className="w-full bg-white border-t border-gray-200">
          <div className="max-w-[1200px] mx-auto p-2 mt-6 md:mt-0 md:px-6 md:py-8">
            <div className="relative mb-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  What's moving the market right now
                </h1>
                <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Handpicked events, expert insights, and strategic spotlights, designed to transform information into actionable intelligence
                </p>
              </div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  TRENDING EVENTS
                </h2>
                <Link
                  href="/pulse-today"
                  className="flex items-center text-[15px] text-blue-600"
                >
                  VIEW ALL ›
                </Link>
              </div>
              <div className="absolute bottom-[-8px] left-0 w-full h-[1px] bg-gray-300"></div>
            </div>

            {(contexts?.length || 0) === 0 ? (
              <div className="text-gray-600 text-center py-12">
                No trending events found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contexts
                    .slice(
                      currentPage * ITEMS_PER_PAGE,
                      (currentPage + 1) * ITEMS_PER_PAGE
                    )
                    .map((context) => {
                      const slug = context.contextTitle
                        ? normalizeTitle(context.contextTitle)
                        : `context-${context._id}`;
                      // Removed console.log for production

                      // Parse tileTemplates.jsxCode if available
                      const tileTemplate =
                        context.tileTemplates?.length > 0
                          ? parseJsxCode(context.tileTemplates[0].jsxCode)
                          : null;

                      return (
                        <div
                          key={context._id}
                          className="flex flex-col"
                        >
                          <Link href={`/context-details/${slug}`}>
                            <div className="bg-gray-100 aspect-[1000/630] relative mb-4 w-full">
                              <ContextImage
                                context={context}
                                tileTemplate={tileTemplate}
                                className="w-full h-full"
                                fallbackText="1000 × 630"
                              />
                            </div>

                            {context.subSectors?.filter(
                              (subSector) => subSector.subSectorName
                            ).length > 0 && (
                              <div className="flex flex-wrap gap-x-2 gap-y-2 mb-3">
                                {context.subSectors
                                  .filter((subSector) => subSector.subSectorName)
                                  .slice(0, 3)
                                  .map((subSector, index) => (
                                    <div
                                      key={subSector._id}
                                      className="relative group inline-flex items-center"
                                    >
                                      {index > 0 && (
                                        <span className="mx-2 text-gray-400">
                                          |
                                        </span>
                                      )}
                                      <div className="relative">
                                        <span className="text-sm md:text-[15px] text-gray-600">
                                          {subSector.subSectorName}
                                        </span>
                                        <div className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-green-600"></div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}

                            <h3 className="text-base md:text-[17px] font-medium text-gray-900 leading-tight">
                              {context.contextTitle}
                            </h3>
                          </Link>
                        </div>
                      );
                    })}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-4">
                    <button
                      onClick={prevPage}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                      aria-label="Previous page"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextPage}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                      aria-label="Next page"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Trending Opinions and Market Statistics Section */}
        <div className="w-full bg-gray-50 py-4 sm:py-6 md:py-8">
          <div className="max-w-[1400px] mx-auto px-2 sm:px-4 md:px-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                From opinion to evidence backed by numbers
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Decode emerging shifts, quantify momentum, and uncover actionable opportunities
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    TRENDING OPINIONS
                  </h2>
                  <Link
                    href="/influencer-comment/expert-opinion"
                    className="text-indigo-600 text-xs sm:text-sm flex items-center hover:text-indigo-700"
                  >
                    VIEW ALL →
                  </Link>
                </div>
                <div className="h-[1px] bg-gray-200 w-full mt-2 sm:mt-4 mb-3 sm:mb-6"></div>

                <div className="space-y-3 sm:space-y-4">
                  {trendingOpinions.map((post) => {
                    const tileTemplate = post.tileTemplateId
                      ? parseJsxCode(post.tileTemplateId.jsxCode)
                      : null;

                    return (
                      <a
                        key={post._id}
                        href={post.sourceUrl || (post.sourceUrls?.length > 0 ? post.sourceUrls[0] : '#')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row gap-2 sm:gap-4 group"
                      >
                        <div className="w-full sm:w-[80px] md:w-[120px] h-[150px] sm:h-[50px] md:h-[75px] bg-gray-100 relative flex-shrink-0">
                          <ContextImage
                            post={post}
                            tileTemplate={tileTemplate}
                            className="w-full h-full"
                            fallbackText="1000 × 630"
                          />
                        </div>
                        <div className="flex-1 min-w-0 mt-2 sm:mt-0">
                          <h3 className="text-sm sm:text-base text-gray-900 group-hover:text-indigo-600 mb-1 sm:mb-2 line-clamp-2 font-medium">
                            {post.postTitle}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(post.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                            {post.source?.sourceName && (
                              <>
                                <span className="mx-1 sm:mx-2">|</span>
                                {post.source.sourceName}
                              </>
                            )}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    MARKET STATISTICS
                  </h2>
                  <Link
                    href="/influencer-comment/market-statistics"
                    className="text-indigo-600 text-xs sm:text-sm flex items-center hover:text-indigo-700"
                  >
                    VIEW ALL →
                  </Link>
                </div>
                <div className="h-[1px] bg-gray-200 w-full mt-2 sm:mt-4 mb-3 sm:mb-6"></div>

                <div className="space-y-3 sm:space-y-4">
                  {marketStatistics.map((post) => {
                    const tileTemplate = post.tileTemplateId
                      ? parseJsxCode(post.tileTemplateId.jsxCode)
                      : null;
                    return (
                      <a
                        key={post._id}
                        href={post.sourceUrl || (post.sourceUrls?.length > 0 ? post.sourceUrls[0] : '#')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col sm:flex-row gap-2 sm:gap-4 group"
                      >
                        <div className="w-full sm:w-[80px] md:w-[120px] h-[150px] sm:h-[50px] md:h-[75px] bg-gray-100 relative flex-shrink-0">
                          <ContextImage
                            post={post}
                            tileTemplate={tileTemplate}
                            className="w-full h-full"
                            fallbackText="1000 × 630"
                          />
                        </div>
                        <div className="flex-1 min-w-0 mt-2 sm:mt-0">
                          <h3 className="text-sm sm:text-base text-gray-900 group-hover:text-indigo-600 mb-1 sm:mb-2 line-clamp-2 font-medium">
                            {post.postTitle}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(post.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                            {post.source?.sourceName && (
                              <>
                                <span className="mx-1 sm:mx-2">| </span>
                                {post.source.sourceName}
                              </>
                            )}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOT Trends Section */}
        <div className="w-full bg-white py-8">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Trend predictive momentum and disruptive potential - quantified and actionable
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Decode emerging shifts, quantify momentum, uncover real impact, and compare opportunities and risks across fintech trends
              </p>
            </div>
            <div className="relative pb-4 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  HOT TRENDS
                </h2>
                <Link
                  href="/analyzer/trend-analyzer"
                  className="text-[#6366F1] text-sm"
                >
                  VIEW ALL →
                </Link>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-200"></div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-[40%]">
                {trendingThemes?.[0] && (
                  <Link
                    href={`/analyzer/theme-details/${normalizeTitle(
                      trendingThemes[0].themeTitle || 'untitled'
                    )}`}
                    className="block"
                  >
                    <div className="bg-gray-100 h-[320px] relative w-full">
                      <ContextImage
                        theme={trendingThemes[0]}
                        tileTemplate={trendingThemes[0].tileTemplateId ? parseJsxCode(trendingThemes[0].tileTemplateId.jsxCode) : null}
                        className="w-full h-full"
                        fallbackText="1000 × 630"
                      />
                    </div>
                    <div className="mt-3">
                      <div className="text-sm mb-2">
                        {trendingThemes[0].subSectors
                          ?.slice(0, 3)
                          .map((subSector, index) => (
                            <React.Fragment key={subSector._id}>
                              <span className="text-[#6366F1] relative inline-block">
                                {subSector.subSectorName}
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></span>
                              </span>
                              {index <
                                (trendingThemes[0].subSectors?.length || 0) - 1 && (
                                <span className="text-gray-400 mx-1">|</span>
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                      <h3 className="text-base font-medium mb-2">
                        {trendingThemes[0].themeTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {trendingThemes[0].themeDescription?.replace(
                          /<[^>]*>/g,
                          ''
                        )}
                      </p>
                      <button className="text-white bg-[#6366F1] px-4 py-2 rounded text-sm hidden md:block hover:bg-[#5457E5] transition-colors">
                        Continue reading
                      </button>
                    </div>
                  </Link>
                )}
              </div>
              <div className="lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingThemes?.slice(1, 5).map((theme) => (
                  <Link
                    key={theme._id}
                    href={`/analyzer/theme-details/${normalizeTitle(
                      theme.themeTitle || 'untitled'
                    )}`}
                    className="block"
                  >
                    <div className="bg-gray-100 h-[150px] relative w-full">
                      <ContextImage
                        theme={theme}
                        tileTemplate={theme.tileTemplateId ? parseJsxCode(theme.tileTemplateId.jsxCode) : null}
                        className="w-full h-full"
                        fallbackText="1000 × 630"
                      />
                    </div>
                    <div className="mt-3">
                      <div className="text-sm mb-2">
                        {theme.subSectors
                          ?.slice(0, 3)
                          .map((subSector, index) => (
                            <React.Fragment key={subSector._id}>
                              <span className="text-[#6366F1] relative inline-block">
                                {subSector.subSectorName}
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></span>
                              </span>
                              {index < (theme.subSectors?.length || 0) - 1 && (
                                <span className="text-gray-400 mx-1">| </span>
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                      <h3 className="text-base font-medium">
                        {theme.themeTitle}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Email Subscription Section */}
        <div className="w-full bg-[#6366F1] py-10">
          <div className="max-w-[990px] mx-auto px-4">
            <div className="text-center">
              <div className="text-white/90 text-base font-medium mb-1">
                Get Started
              </div>
              <h2 className="text-white text-3xl sm:text-4xl font-medium mb-6">
                Enter your e-mail address
                <br />
                and get started for free
              </h2>
              <div className="relative max-w-[600px] mx-auto">
                <input
                  type="email"
                  placeholder="Your Email address"
                  className="w-full px-5 h-14 rounded-full text-base border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all pr-[140px]"
                />
                <button
                  onClick={handleSubscribe}
                  className="absolute right-1 top-1 bg-black text-white px-8 h-12 rounded-full text-base hover:bg-gray-900 transition-colors font-medium"
                >
                  Subscribe
                </button>
              </div>
              <div className="text-white/80 text-sm mt-3">
                (We will never share your email with anyone, anywhere. Promise.)
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}