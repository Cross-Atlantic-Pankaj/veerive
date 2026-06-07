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

const TypeFive = ({ context, isLastItem, lastContextCallback, tileTemplate }) => {
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

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
      toast.error('Login First to Save');
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
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 w-full cursor-pointer"
      >
        {/* Main content area with image, title, summary, and bordered posts */}
        <div className="flex gap-4 mb-4">
          {/* Image section - top left */}
          <div className="flex-shrink-0">
            <ContextImage
              context={context}
              tileTemplate={tileTemplate}
              className="w-32 h-32 lg:w-40 lg:h-40"
              fallbackText="1000 × 630"
            />
          </div>

          {/* Content section - beside image */}
          <div className="flex-1 min-w-0">
            {/* Category/Tags */}
            {context.originalContextSector && context.originalContextSector.length > 0 && (
              <div className="text-xs text-red-600 font-medium mb-1">
                {context.originalContextSector.slice(0, 2).map((name, idx) => (
                  <React.Fragment key={`sector-${idx}-${name}`}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/pulse-today?sector=${encodeURIComponent(name)}`);
                      }}
                      className="hover:text-red-800 transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      {name}
                    </button>
                    {idx < context.originalContextSector.slice(0, 2).length - 1 && ' • '}
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* Context title */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {context.contextTitle}
            </h2>
            
            {/* Summary snippet */}
            {context.summary && context.summary.length > 0 ? (
              <p 
                className="text-sm text-gray-600 line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: context.summary
                }}
              />
            ) : (
              <p className="text-sm text-gray-400 italic">
                Summary will be available soon
              </p>
            )}
          </div>

          {/* Bordered posts section - top right */}
          {context.posts && context.posts.length >= 2 && (
            <div className="flex-shrink-0 w-64 space-y-3">
              {context.posts.slice(0, 2).map((post, index) => (
                <div 
                  key={`bordered-post-${index}-${post._id || post.postTitle}`} 
                  className="border border-black rounded-lg p-3 bg-white"
                >
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    {post.postType}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                    {post.postTitle}
                  </h3>
                  {post.summary && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {post.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom posts section - horizontal row */}
        {context.posts && context.posts.length > 2 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {context.posts.slice(2, 5).map((post, index) => (
                <div key={`bottom-post-${index}-${post._id || post.postTitle}`} className="group">
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    {post.postType}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
                    {post.postTitle}
                  </h3>
                  {post.summary && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {post.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleSave}
            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
              isSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
              className="h-4 w-4 mr-1"
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

export default TypeFive;