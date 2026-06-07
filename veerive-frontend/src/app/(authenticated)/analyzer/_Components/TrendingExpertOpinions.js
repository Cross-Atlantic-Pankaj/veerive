import React from 'react';
import Link from 'next/link';

const TrendingExpertOpinions = ({ trendingExpertOpinions }) => {
  if (!trendingExpertOpinions || trendingExpertOpinions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md md:mr-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-base text-gray-900">
          Trending Expert Opinions
        </h2>
      </div>
      <div className="space-y-4">
        {trendingExpertOpinions.map((post, index) => (
          <div
            key={`opinion-${post.postId}-${index}`}
            className="border-b border-dashed border-gray-300 pb-3 last:border-none"
          >
            <Link
              href={post.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
                {post.postTitle}
              </h3>
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
        <Link
          href="/trend-analyzer"
          className="text-indigo-600 text-sm font-medium hover:underline"
        >
          VIEW More →
        </Link>
      </div>
    </div>
  );
};

export default TrendingExpertOpinions;