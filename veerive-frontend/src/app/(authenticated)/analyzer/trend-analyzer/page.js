'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Select from 'react-select';
import toast from 'react-hot-toast';
import ContextImage from '@/components/ContextImage';
import { parseJsxCode, Tile } from '../../../utils/Tile';

export default function TrendAnalyzer() {
  const [themes, setThemes] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalThemes, setTotalThemes] = useState(0);
  const [savedThemes, setSavedThemes] = useState({});
  const limit = 9;
  const fetchedPages = useRef(new Set());
  const isInitialMount = useRef(true);
  const lastFetchFilter = useRef('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const observer = useRef(null);
  const lastThemeElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        debounce((entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        }, 300),
        { threshold: 0.1 }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
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
      setSavedThemes((prev) => ({ ...prev, ...savedStatuses }));
    } catch (error) {
      console.error('Error fetching saved statuses:', error);
      toast.error('Error checking saved themes');
    }
  };

  const fetchThemes = useCallback(
    async (pageToFetch, reset = false) => {
      if (loading && !reset) return;
      if (
        fetchedPages.current.has(pageToFetch) &&
        !reset &&
        lastFetchFilter.current === selectedFilter
      )
        return;

      setLoading(true);
      fetchedPages.current.add(pageToFetch);
      try {
        const params = new URLSearchParams({ page: pageToFetch, limit });
        if (selectedFilter) {
          const isSector = sectors.some(
            (sector) => sector.sectorId === selectedFilter
          );
          if (isSector) {
            params.append('sectorId', selectedFilter);
          } else {
            params.append('subSectorId', selectedFilter);
          }
        }

        console.log(
          `Fetching themes for page ${pageToFetch}, params: ${params}`
        );
        const response = await fetch(`/api/analyzer/trend-analyzer?${params}`);
        const result = await response.json();
        console.log('API Response:', result);

        if (result.success) {
          const newThemes = result.data || [];
          console.log(
            `Fetched page ${pageToFetch} theme IDs:`,
            newThemes.map((t) => t._id.toString())
          );

          setThemes((prev) => {
            const existingIds = new Set(
              prev.map((theme) => theme._id.toString())
            );
            const uniqueNewThemes = newThemes.filter(
              (theme) => !existingIds.has(theme._id.toString()) || reset
            );
            const updatedThemes = reset
              ? uniqueNewThemes
              : [...prev, ...uniqueNewThemes];
            console.log(
              'Updated themes state:',
              updatedThemes.map((t) => ({ _id: t._id, title: t.themeTitle }))
            );
            return updatedThemes;
          });

          setTotalThemes(result.totalThemes);
          setHasMore(
            (pageToFetch - 1) * limit + newThemes.length < result.totalThemes
          );
          if (reset) {
            setSectors(result.Sectordata || []);
            fetchedPages.current.clear();
            fetchedPages.current.add(pageToFetch);
            lastFetchFilter.current = selectedFilter;
            console.log('Sectors set to:', result.Sectordata);
          }

          const email = getUserEmail();
          if (email && newThemes.length > 0) {
            const themeIds = newThemes.map((theme) => theme._id.toString());
            await fetchSavedStatuses(themeIds, email);
          }
        } else {
          setError(result.error || 'Failed to fetch themes');
        }
      } catch (err) {
        setError('Failed to fetch themes data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [selectedFilter, sectors, loading]
  );

  // Handle URL parameters on page load
  useEffect(() => {
    const subSectorId = searchParams.get('subSectorId');
    const sectorId = searchParams.get('sectorId');
    
    if (subSectorId || sectorId) {
      const filterValue = subSectorId || sectorId;
      setSelectedFilter(filterValue);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchThemes(1, true);
    } else if (selectedFilter !== lastFetchFilter.current) {
      setThemes([]);
      setPage(1);
      setHasMore(true);
      fetchThemes(1, true);
    }
  }, [selectedFilter, fetchThemes]);

  useEffect(() => {
    if (page > 1) {
      fetchThemes(page);
    }
  }, [page, fetchThemes]);

  const handleFilterChange = (selectedOption) => {
    setSelectedFilter(selectedOption ? selectedOption.value : '');
  };

  const clearFilters = () => {
    setSelectedFilter('');
  };

  const handleThemeClick = (theme) => {
    const slug = slugify(theme.themeTitle);
    router.push(`/analyzer/theme-details/${slug}`);
  };

  const handleShare = async (theme) => {
    const email = getUserEmail();
    if (!email) {
      toast.error('Login First to share');
      return;
    }
    try {
      const shareData = {
        title: theme.themeTitle,
        text: `Check out this trend: ${theme.themeTitle}`,
        url: window.location.origin + `/analyzer/theme-details/${slugify(theme.themeTitle)}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const shareText = `${theme.themeTitle}\n\nCheck out this trend: ${window.location.origin}/analyzer/theme-details/${slugify(theme.themeTitle)}`;
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
      toast.error('Login First to save');
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

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const sectorOptions = sectors.flatMap((sector) => [
    { label: sector.sectorName, value: sector.sectorId },
    ...sector.subsectors.map((subsector) => ({
      label: `-- ${subsector.subSectorName}`,
      value: subsector.subSectorId,
    })),
  ]);

  return (
    <div className="p-3 md:py-8 bg-gray-50 min-h-screen md:px-12">
      <div className="mb-8 bg-white p-2 md:p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Filter Trends by Sector
          </h2>
          {selectedFilter && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Select
                id="filter"
                value={selectedFilter ? sectorOptions.find(
                  (option) => option.value === selectedFilter
                ) : null}
                onChange={handleFilterChange}
                options={sectorOptions}
                placeholder="Search and select a sector or sub-sector"
                className="w-full"
                isClearable={true}
                filterOption={(candidate, input) => {
                  const inputLower = input.toLowerCase();
                  return (
                    candidate.label.toLowerCase().includes(inputLower) ||
                    candidate.label.toLowerCase().startsWith(inputLower)
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {themes.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Trend available
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            No themes match your current filter criteria. Try adjusting your
            filters or check back later.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {themes.map((theme, index) => {
                      const isLastElement = themes.length === index + 1;

                      const tileProps = theme.tileTemplateId
                        ? parseJsxCode(theme.tileTemplateId.jsxCode)
                        : null;

            return (
              <div
                key={theme._id.toString()}
                ref={isLastElement ? lastThemeElementRef : null}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 cursor-pointer"
                onClick={() => handleThemeClick(theme)}
              >
                <div className="relative w-full h-[160px]">
                  <ContextImage
                    theme={theme}
                    tileTemplate={tileProps}
                    className="w-full h-full rounded-t-lg"
                    fallbackText="1000 × 180"
                  />
                </div>

                <div className="p-2 md:p-5">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    {theme.themeTitle}
                  </h2>

                  <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                    <div className="p-1 md:p-3 text-center border-r border-white">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Trending <br /> Pulse
                      </div>
                      <div className="text-base font-bold text-blue-600">
                        {theme.trendingScore?.toFixed(2) || 'N/A'}
                      </div>
                    </div>

                    <div className="p-1 md:p-3 text-center border-r border-white">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Disruption Potential
                      </div>
                      <div className="text-base font-bold text-purple-600">
                        {theme.impactScore?.toFixed(2) || 'N/A'}
                      </div>
                    </div>

                    <div className="p-1 md:p-3 text-center">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Predictive Momentum
                      </div>
                      <div className="text-base font-bold text-indigo-600">
                        {theme.predictiveMomentumScore?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {theme.subSectors?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {theme.subSectors.slice(0, 4).map((subSector) => (
                          <span
                            key={subSector._id}
                            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium inline-flex items-center"
                          >
                            {subSector.subSectorName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      theme.sectors?.slice(0, 4).map((sector) => (
                        <div
                          className="flex flex-wrap gap-2"
                          key={sector._id}
                        >
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium inline-flex items-center">
                            {sector.sectorName}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(theme._id.toString());
                      }}
                      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                        savedThemes[theme._id.toString()]
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill={savedThemes[theme._id.toString()] ? 'currentColor' : 'none'}
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
                      {savedThemes[theme._id.toString()] ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(theme);
                      }}
                      className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
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
            );
          })}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}