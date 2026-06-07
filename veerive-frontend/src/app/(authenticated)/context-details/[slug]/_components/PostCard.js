import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ContextImage from '@/components/ContextImage';
import { parseJsxCode } from '@/app/utils/Tile';

const PostCard = ({ post }) => {
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.email;
    }
    return null;
  };

  useEffect(() => {
    const fetchSavedStatus = async () => {
      const email = getUserEmail();
      if (!email || !post.postId) return;

      try {
        const response = await fetch(
          `/api/post-save?postId=${post.postId}&email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setIsSaved(data.isSaved || false);
        } else {
          console.error('Error fetching saved status:', data.error);
          toast.error(data.error || 'Error checking saved status');
        }
      } catch (error) {
        console.error('Error fetching saved status:', error);
        toast.error('Error checking saved status');
      }
    };

    fetchSavedStatus();
  }, [post.postId]);

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
        title: post.postTitle,
        text: `Check out this post: ${post.postTitle}`,
        url: post.sourceUrl || window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${post.postTitle}\n\nCheck out this post: ${post.sourceUrl || window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing post');
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

    if (!post.postId) {
      toast.error('Invalid post ID');
      return;
    }

    try {
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/post-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.postId, email, action }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSaved(action === 'save');
        toast.success(data.message);
      } else {
        toast.error(data.error || `Failed to ${action} post`);
      }
    } catch (error) {
      console.error(`Error ${isSaved ? 'unsaving' : 'saving'} post:`, error);
      toast.error(`Error ${isSaved ? 'unsaving' : 'saving'} post`);
    }
  };

  const tileTemplate = post.tileTemplateId && post.tileTemplateId.jsxCode
      ? parseJsxCode(post.tileTemplateId.jsxCode)
      : null;

  return (
    <Link href={post.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="relative w-full h-[150px]">
          <ContextImage
            post={post}
            tileTemplate={tileTemplate}
            className="w-full h-full rounded-t-lg"
            fallbackText="1000 × 630"
          />
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-2">
            <span className="text-xs text-black border-b-2 border-green-500 inline-block">
              {post.postType}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-gray-900">
            {post.postTitle}
          </h3>

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
              className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 text-xs font-medium"
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

export default PostCard;