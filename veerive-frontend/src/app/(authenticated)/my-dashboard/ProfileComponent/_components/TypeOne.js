import React, { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ContextImage from '@/components/ContextImage';
import { parseJsxCode, Tile } from '../../../../utils/Tile';

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

const TypeOne = ({ context, handleUnsave, isLastItem, lastContextCallback }) => {
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

    const tileProps =
      context.tileTemplates && context.tileTemplates.length > 0
        ? parseJsxCode(context.tileTemplates[0].jsxCode)
        : null;

  return (
    <Link href={`/context-details/${slug}`}>
      <div
        ref={isLastItem ? lastContextCallback : null}
        className="bg-white rounded-lg overflow-hidden w-full cursor-pointer hover:shadow-md transition-all duration-200 mb-4"
      >
        <ContextImage
          context={context}
          tileTemplate={tileProps}
          className="w-full h-[120px] sm:h-[140px] md:h-[160px] rounded-t-lg"
          fallbackText="1000 × 630"
        />
        <div className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-1">
            {[...context.sectorNames, ...context.subSectorNames].slice(0, 3).map((name, idx) => (
              <span
                key={idx}
                className="text-[10px] sm:text-xs text-black-600 relative inline-block font-medium border-b-2 border-green-500"
              >
                {name}
              </span>
            ))}
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
            {context.contextTitle}
          </h3>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={onUnsave}
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                isSaved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
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
              className="inline-flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 text-xs font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
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
      </div>
    </Link>
  );
};

export default TypeOne;