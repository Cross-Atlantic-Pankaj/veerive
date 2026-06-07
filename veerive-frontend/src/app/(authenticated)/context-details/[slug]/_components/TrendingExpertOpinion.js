'use client';

import React from 'react';
import Link from 'next/link';

const TrendingThemes = ({ trendingExpertOpinions }) => {
  return (
    <div className="bg-white mt-4 p-4 sm:p-5 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-base sm:text-lg text-gray-900">
					Trending Expert Opinion
				</h2>
        <Link
					href="/influencer-comment/expert-opinion"
					className="text-indigo-600 text-xs sm:text-sm font-medium hover:underline"
				>
					VIEW MORE →
				</Link>
      </div>
      <div className="space-y-3">
        {trendingExpertOpinions?.length > 0 ? (
          trendingExpertOpinions.map((post, index) => (
					<div
						key={`opinion-${post.postId}-${index}`}
						className="block border-b border-dashed border-gray-300 pb-3 last:border-none hover:text-indigo-600 transition-colors"
					>
						<Link
							href={post.sourceUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							<h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
								{post.postTitle}
							</h3>
						</Link>
					</div>
				))
        ) : (
          <p className="text-gray-600 text-sm">Trending Expert Opinion will be Available Soon.</p>
        )}
      </div>
    </div>
  );
};

export default TrendingThemes;