'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RelatedEvents({ relatedThemes }) {
  const router = useRouter();
  const [savedThemes, setSavedThemes] = useState({});

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.email;
    }
    return null;
  };

  const fetchSavedStatuses = async (themeIds, email) => {
    try {
      const savedStatuses = {};
      for (const themeId of themeIds) {
        const response = await fetch(
          `/api/theme-save?themeId=${themeId}&email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await response.json();
        savedStatuses[themeId] = data.isSaved || false;
      }
      setSavedThemes(savedStatuses);
    } catch (error) {
      console.error('Error fetching saved statuses:', error);
      toast.error('Error checking saved themes');
    }
  };

  useEffect(() => {
    const email = getUserEmail();
    if (email && relatedThemes.length > 0) {
      const themeIds = relatedThemes.map((theme) => theme._id.toString());
      fetchSavedStatuses(themeIds, email);
    }
  }, [relatedThemes]);

  const handleThemeClick = (theme) => {
    const slugified = slugify(theme.themeTitle);
    router.push(`/analyzer/theme-details/${slugified}`);
  };

  const handleShare = async (theme) => {
    try {
      const slugified = slugify(theme.themeTitle);
      const shareData = {
        title: theme.themeTitle,
        text: `Check out this trend: ${theme.themeTitle}`,
        url: window.location.origin + `/analyzer/theme-details/${slugified}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${theme.themeTitle}\n\nCheck out this trend: ${window.location.origin}/analyzer/theme-details/${slugified}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Error sharing theme');
    }
  };

  const handleSave = async (themeId) => {
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }

    try {
      const isSaved = savedThemes[themeId];
      const action = isSaved ? 'unsave' : 'save';
      const response = await fetch('/api/theme-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, email, action }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedThemes((prev) => ({ ...prev, [themeId]: action === 'save' }));
        toast.success(data.message);
      } else {
        toast.error(data.error || `Failed to ${action} theme`);
      }
    } catch (error) {
      console.error(`Error ${savedThemes[themeId] ? 'unsaving' : 'saving'} theme:`, error);
      toast.error(`Error ${savedThemes[themeId] ? 'unsaving' : 'saving'} theme`);
    }
  };

  if (!relatedThemes.length) return null;

  return (
    <div className="bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-base sm:text-lg text-gray-800">Other Key Trends</h2>
        <Link
          href="/analyzer/trend-analyzer"
          className="text-indigo-600 text-xs sm:text-sm flex items-center hover:text-indigo-700 self-start sm:self-auto"
        >
          VIEW MORE →
        </Link>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {relatedThemes.map((relatedTheme) => (
          <div
            key={relatedTheme._id.toString()}
            className="border-b border-dashed border-gray-300 pb-2 sm:pb-3 last:border-0 last:pb-0"
          >
            <Link href={`/analyzer/theme-details/${slugify(relatedTheme.themeTitle)}`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-blue-500 text-blue-500 font-medium text-xs sm:text-sm">
                  {relatedTheme.overallScore?.toFixed(1)}
                </div>
                <div className="break-words min-w-0 flex-1">
                  <h3 className="font-medium text-gray-800 text-xs sm:text-sm leading-tight">{relatedTheme.themeTitle}</h3>
                  <div className="mt-1 text-xs text-gray-500">
                    {relatedTheme.sectors?.[0]?.sectorName || 'No sector available'}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}