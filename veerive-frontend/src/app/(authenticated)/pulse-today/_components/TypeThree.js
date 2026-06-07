import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ContextImage from '../../../../components/ContextImage';

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

const TypeThree = ({ context, isLastItem, lastContextCallback, tileTemplate }) => {
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const sectorsLabel = [...context.sectors, ...context.subSectors].join(' • ');

  const slug = context.contextTitle
    ? normalizeTitle(context.contextTitle)
    : 'context-unnamed';
  console.log(`Generated slug for context "${context.contextTitle}": ${slug}`);

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.email;
    }
    return null;
  };

  useEffect(() => {
    const checkSavedStatus = async () => {
      const email = getUserEmail();
      if (!email) return;

      try {
        const response = await fetch(
          `/api/context-save?contextId=${context.id}&email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await response.json();
        if (data.isSaved) {
          setIsSaved(true);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
        toast.error('Error checking saved status');
      }
    };
    checkSavedStatus();
  }, [context.id]);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const email = getUserEmail();
    if (!email) {
      toast.error('Login First to share');
      return;
    }
    
    try {
      const shareData = {
        title: context.contextTitle,
        text: `Check out this context: ${context.contextTitle}`,
        url: window.location.origin + `/context-details/${slug}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing context');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const email = getUserEmail();
    if (!email) {
      toast.error('Login First to save');
      return;
    }

    try {
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/context-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextId: context.id, email, action }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSaved(action === 'save');
        toast.success(data.message);
      } else {
        toast.error(data.error || `Failed to ${action} context`);
      }
    } catch (error) {
      console.error(`Error ${isSaved ? 'unsaving' : 'saving'} context:`, error);
      toast.error(`Error ${isSaved ? 'unsaving' : 'saving'} context`);
    }
  };

	return (
		<Link href={`/context-details/${slug}`}>
      <div
        ref={isLastItem ? lastContextCallback : null}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-2 sm:p-4 md:p-6 w-full cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 md:gap-4">
              <div className="w-full sm:w-1/3">
                <ContextImage
                  context={context}
                  tileTemplate={tileTemplate}
                  className="w-full h-20 lg:h-24"
                  fallbackText="1000 × 630"
                />
              </div>
              <div className="flex-1">
                <div className="text-red-600 text-xs font-semibold mb-1">
                  {[...(context.sectors || []), ...(context.subSectors || [])].map((name, idx) => (
                    <React.Fragment key={`sector-${idx}-${name}`}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/pulse-today?${context.sectors?.includes(name) ? 'sector' : 'subSector'}=${encodeURIComponent(name)}`);
                        }}
                        className="hover:text-red-800 transition-colors cursor-pointer bg-transparent border-none p-0"
                      >
                        {name}
                      </button>
                      {idx < [...(context.sectors || []), ...(context.subSectors || [])].length - 1 && ' • '}
                    </React.Fragment>
                  ))}
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight">
                  {context.contextTitle}
                </h2>
              </div>
            </div>
            <div className="sm:mt-3">
              {context.summary.length > 0 ? (
                <p
                                  className="text-black text-base sm:text-base line-clamp-4"
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

          <div className="w-full sm:w-1/3 flex flex-col justify-between mt-2 sm:mt-0">
            {context.posts?.slice(0, 3).map((post, i) => (
              <div
                key={`post-${i}-${post._id || post.postTitle}`}
                className="border-t border-gray-300 pt-0.5 mt-0.5 first:border-t-0 first:mt-0"
              >
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {post.postType}
                </div>
                <div className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base my-1 sm:my-2">
                  {post.postTitle}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-1 sm:gap-2 mt-2 sm:mt-4 md:mt-2">
          <button
            onClick={handleSave}
            className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs font-medium ${
              isSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 sm:h-5 w-4 sm:w-5 mr-1"
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
            className="inline-flex items-center bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-md hover:bg-gray-200 text-xs font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 sm:h-5 w-4 sm:w-5 mr-1"
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

export default TypeThree;