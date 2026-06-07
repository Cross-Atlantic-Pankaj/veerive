'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PostCard from './_components/PostCard';
import ContextInfo from './_components/ContextInfo';
import TrendingThemes from './_components/TrendingThemes';
import RelatedEvents from './_components/RelatedEvents';
import TrendingExpertOpinion from './_components/TrendingExpertOpinion';
import Head from 'next/head';

const normalizeTitle = (text) => {
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

export default function ContextDetails() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const sliderRef = useRef(null);

  useEffect(() => {
    if (!slug) {
      setError('No slug provided');
      setLoading(false);
      return;
    }

    const fetchContextDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/context-details?slug=${encodeURIComponent(slug)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        // Check if the response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response is not JSON:', contentType);
          const textResponse = await response.text();
          console.error('Response text:', textResponse.substring(0, 500));
          throw new Error('Server returned non-JSON response');
        }

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          console.error('API error response:', errorData);
          
          // Handle redirect case
          if (errorData.redirectUrl) {
            console.log('Redirecting to:', errorData.redirectUrl);
            router.replace(errorData.redirectUrl);
            return;
          }
          
          throw new Error(errorData.error || 'Failed to fetch context details');
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse success response as JSON:', parseError);
          throw new Error('Server returned invalid JSON response');
        }
        
        console.log('Fetched context:', data.context);
        setContext(data.context);
      } catch (err) {
        console.error('Error fetching context details:', err.message, err.stack);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContextDetails();
  }, [slug]);

  useEffect(() => {
    if (context && slug) {
      const expectedSlug = normalizeTitle(context.contextTitle);
      if (slug !== expectedSlug) {
        console.log(`Redirecting from slug: ${slug} to: ${expectedSlug}`);
        router.replace(`/context-details/${expectedSlug}`);
      }
    }
  }, [context, slug, router]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4 text-center">Error</h1>
        <p className="text-gray-800 text-center">{error}</p>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">Context Not Found</h1>
        <p className="text-gray-600 text-center">The requested context could not be found.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{context.contextTitle}</title>
        <meta
          name="description"
          content={
            context.seoData?.metaDescription ||
            context.summary?.replace(/<[^>]*>/g, '').slice(0, 160) ||
            'Explore detailed insights and updates.'
          }
        />
      </Head>
      <div className="min-h-screen bg-white py-2 sm:py-4">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8">
          <div className="bg-[#f0f0f0] py-4 flex justify-center mb-4 px-2 sm:px-4">
            <form onSubmit={handleSearch} className="flex w-full max-w-md sm:max-w-lg lg:w-1/2">
              <input
                type="text"
                className="flex-grow px-2 sm:px-3 py-3 text-sm text-gray-800 bg-white border border-gray-300 rounded-l-md focus:outline-none"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#5d4be6] w-10 sm:w-12 flex items-center justify-center rounded-r-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
          </div>

          <ContextInfo
            context={context}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            sliderRef={sliderRef}
          />

          <div className="flex flex-col lg:flex-row sm:px-4 lg:px-8">
            <div className="w-full lg:w-[68%] md:mb-6 lg:mb-0">
              {context.contextPosts?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-4 bg-yellow-200 w-fit px-2">
                    Explore Event
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {context.contextPosts.map((post) => (
                      <PostCard key={post.postId} post={post} />
                    ))}
                  </div>
                </div>
              )}

              <RelatedEvents matchingContexts={context.matchingContexts} />
            </div>

            <div className="w-full lg:w-[32%]">
              <div className="px-2 sm:px-4 lg:px-10">
                <TrendingThemes trendingThemes={context.trendingThemes} />
                <TrendingExpertOpinion
                  trendingExpertOpinions={context.trendingExpertOpinions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}