import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

const TypeNum = ({ context, handleUnsave, isLastItem, lastContextCallback }) => {
  const [isSaved, setIsSaved] = useState(true);

  const slug = context.contextTitle
    ? normalizeTitle(context.contextTitle)
    : `context-${context._id}`;
  console.log(`Generated slug for context "${context.contextTitle}": ${slug}`);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const shareData = {
        title: context.contextTitle,
        text: `Check out this context: ${context.contextTitle}\nSectors: ${context.sectorNames.join(', ')}\nSub-Sectors: ${context.subSectorNames.join(', ')}`,
        url: window.location.origin + `/context-details/${slug}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${context.contextTitle}\n\nSectors: ${context.sectorNames.join(', ')}\nSub-Sectors: ${context.subSectorNames.join(', ')}\n\nCheck out this context: ${window.location.origin}/context-details/${slug}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing context');
    }
  };

  const onUnsave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await handleUnsave(context._id);
    setIsSaved(false);
  };

  return (
    <Link href={`/context-details/${slug}`}>
      <div
        ref={isLastItem ? lastContextCallback : null}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer mb-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="w-full sm:w-1/3 flex items-center justify-center">
            <div className="text-3xl sm:text-4xl font-bold text-indigo-600 whitespace-nowrap">
              {context.dataForTypeNum || 'N/A'}
            </div>
          </div>
          <div className="flex-1">
            {context.summary.length > 0 ? (
            <p
                                  className="text-black text-base sm:text-base mt-3"
                                  dangerouslySetInnerHTML={{
                                    __html:context.summary
                                  }}
                                />
            ) : (
              <div className="text-gray-400 text-xs sm:text-sm italic line-clamp-1">
                Summary will be available soon
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onUnsave}
            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
              isSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill={isSaved ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 text-xs font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
        </div>
      </div>
    </Link>
  );
};

export default TypeNum;