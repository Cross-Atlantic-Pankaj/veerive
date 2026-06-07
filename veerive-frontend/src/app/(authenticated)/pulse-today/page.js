'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import {
  TypeOne,
  TypeTwo,
  TypeThree,
  TypeFour,
  TypeFive,
  TypeNum,
} from './_components';

const parseJsxCode = (jsxCode) => {
  if (!jsxCode) return null;
  const regex = /bg="([^"]+)"\s+icon="([^"]+)"\s+color="([^"]+)"\s+size=\{(\d+)\}/;
  const match = jsxCode.match(regex);
  if (match) {
    return {
      bg: match[1],
      icon: match[2],
      color: match[3],
      size: parseInt(match[4], 10),
    };
  }
  console.warn(`Invalid jsxCode format: ${jsxCode}`);
  return null;
};

export default function PulseToday() {
  const searchParams = useSearchParams();
  const [contexts, setContexts] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [sidebarMessage, setSidebarMessage] = useState(null);
  const [trendingThemes, setTrendingThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expertPosts, setExpertPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [user, setUser] = useState(null);
  const mainContentRef = useRef(null);
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const observerRef = useRef();

  const lastContextCallback = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading) {
            console.log('Observer Triggered for Page:', page + 1);
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1 }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, page]
  );

  const fetchData = async (pageNum) => {
    try {
      setLoading(true);
      
      // Get filter parameters from URL
      const sector = searchParams.get('sector');
      const subSector = searchParams.get('subSector');
      const signalCategory = searchParams.get('signalCategory');
      const signalSubCategory = searchParams.get('signalSubCategory');
      
      const requestBody = { page: pageNum };
      
      // Add filters to request body if they exist
      if (sector) requestBody.sector = sector;
      if (subSector) requestBody.subSector = subSector;
      if (signalCategory) requestBody.signalCategory = signalCategory;
      if (signalSubCategory) requestBody.signalSubCategory = signalSubCategory;
      
      // Set active filter for display
      if (sector) setActiveFilter({ type: 'sector', value: sector });
      else if (subSector) setActiveFilter({ type: 'subSector', value: subSector });
      else if (signalCategory) setActiveFilter({ type: 'signalCategory', value: signalCategory });
      else if (signalSubCategory) setActiveFilter({ type: 'signalSubCategory', value: signalSubCategory });
      else setActiveFilter(null);
      
      const res = await fetch('/api/pulse-today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      console.log('Raw API Response:', data);
      console.log('Fetched Contexts:', data.contexts);

      setExpertPosts(data.expertPosts || []);

      const newContexts = data.contexts.filter(
        (newContext) => !contexts.some((prev) => prev.id === newContext.id)
      );

      if (pageNum === 1) {
        setContexts(data.contexts);
        setDisplayItems(processInitialContexts(data.contexts));
      } else {
        setContexts((prev) => {
          const updatedContexts = [...prev, ...newContexts];
          console.log('Updated Contexts:', updatedContexts);
          return updatedContexts;
        });
        setDisplayItems((prevDisplayItems) => {
          const newDisplayItems = processNewContexts(newContexts, prevDisplayItems).sort(
            (a, b) => {
              const aOrder = a.type === 'group' ? a.displayOrder : a.item.displayOrder || 0;
              const bOrder = b.type === 'group' ? b.displayOrder : b.item.displayOrder || 0;
              return aOrder - bOrder;
            }
          );
          const updatedDisplayItems = [...prevDisplayItems, ...newDisplayItems];
          console.log('Updated Display Items:', updatedDisplayItems);
          return updatedDisplayItems;
        });
      }
      setHasMore(data.hasMore);
      setSidebarMessage(data.messages?.[0] || null);
      setTrendingThemes(data.trendingThemes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for user authentication
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  // Reset page when search parameters change
  useEffect(() => {
    setPage(1);
    setContexts([]);
    setDisplayItems([]);
  }, [searchParams]);

  const processInitialContexts = (allContexts) => {
    const uniqueContexts = Array.from(new Map(allContexts.map((c) => [c.id, c])).values());
    const allTypeOneContexts = uniqueContexts.filter((c) => c.containerType === 'Type-One');
    const allTypeFiveContexts = uniqueContexts.filter((c) => c.containerType === 'Type-Five');
    const allOtherContexts = uniqueContexts.filter((c) => c.containerType !== 'Type-One' && c.containerType !== 'Type-Five');

    let currentGroup = [];
    const typeOneGroups = [];

    allTypeOneContexts.forEach((context) => {
      if (currentGroup.length < 3) {
        currentGroup.push(context);
      }
      if (
        currentGroup.length === 3 ||
        allTypeOneContexts.indexOf(context) === allTypeOneContexts.length - 1
      ) {
        if (currentGroup.length > 0) {
          const maxDisplayOrder = Math.max(...currentGroup.map((c) => c.displayOrder || 0));
          typeOneGroups.push({
            type: 'group',
            items: [...currentGroup],
            displayOrder: maxDisplayOrder,
          });
          currentGroup = [];
        }
      }
    });

    // Process Type-Five contexts as individual single items (not grouped)
    const typeFiveItems = allTypeFiveContexts.map((context) => ({
      type: 'single',
      item: context,
      displayOrder: context.displayOrder || 0,
    }));

    const otherItems = allOtherContexts.map((context) => ({
      type: 'single',
      item: context,
      displayOrder: context.displayOrder || 0,
    }));

    const result = [...typeOneGroups, ...typeFiveItems, ...otherItems].sort((a, b) => {
      const aOrder = a.type === 'group' ? a.displayOrder : a.item.displayOrder || 0;
      const bOrder = b.type === 'group' ? b.displayOrder : b.item.displayOrder || 0;
      return aOrder - bOrder;
    });

    console.log('Processed Initial Display Items:', result);
    return result;
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

  const processNewContexts = (newContexts, prevDisplayItems) => {
    const uniqueNewContexts = Array.from(new Map(newContexts.map((c) => [c.id, c])).values());
    const newTypeOneContexts = uniqueNewContexts.filter((c) => c.containerType === 'Type-One');
    const newTypeFiveContexts = uniqueNewContexts.filter((c) => c.containerType === 'Type-Five');
    const newOtherContexts = uniqueNewContexts.filter((c) => c.containerType !== 'Type-One' && c.containerType !== 'Type-Five');

    const allExistingTypeOneIds = new Set();
    prevDisplayItems.forEach((item) => {
      if (item.type === 'group') {
        item.items.forEach((context) => allExistingTypeOneIds.add(context.id));
      }
    });

    const filteredNewTypeOneContexts = newTypeOneContexts.filter(
      (context) => !allExistingTypeOneIds.has(context.id)
    );

    let lastGroupIndex = -1;
    let lastGroup = null;
    if (prevDisplayItems.length > 0) {
      for (let i = prevDisplayItems.length - 1; i >= 0; i--) {
        if (prevDisplayItems[i].type === 'group' && prevDisplayItems[i].items.length < 3) {
          lastGroupIndex = i;
          lastGroup = { ...prevDisplayItems[i] };
          break;
        }
      }
    }

    let currentGroup = lastGroup ? [...lastGroup.items] : [];
    const newTypeOneGroups = [];

    filteredNewTypeOneContexts.forEach((context) => {
      if (currentGroup.length < 3) {
        currentGroup.push(context);
      }
      if (
        currentGroup.length === 3 ||
        filteredNewTypeOneContexts.indexOf(context) === filteredNewTypeOneContexts.length - 1
      ) {
        if (currentGroup.length > 0) {
          const maxDisplayOrder = Math.max(...currentGroup.map((c) => c.displayOrder || 0));
          if (lastGroupIndex !== -1 && currentGroup.length <= 3) {
            const updatedLastGroup = {
              type: 'group',
              items: [...currentGroup],
              displayOrder: maxDisplayOrder,
            };
            prevDisplayItems[lastGroupIndex] = updatedLastGroup;
          } else {
            newTypeOneGroups.push({
              type: 'group',
              items: [...currentGroup],
              displayOrder: maxDisplayOrder,
            });
          }
          currentGroup = [];
        }
      }
    });

    // Process Type-Five contexts as individual single items (not grouped)
    const newTypeFiveItems = newTypeFiveContexts.map((context) => ({
      type: 'single',
      item: context,
      displayOrder: context.displayOrder || 0,
    }));

    const newOtherItems = newOtherContexts.map((context) => ({
      type: 'single',
      item: context,
      displayOrder: context.displayOrder || 0,
    }));

    const result = [...newTypeOneGroups, ...newTypeFiveItems, ...newOtherItems];
    console.log('Processed New Display Items:', result);
    return result;
  };

  const renderContextBox = (context, isLastItem, key) => {
    const tileTemplate = context.tileTemplates?.length > 0 ? parseJsxCode(context.tileTemplates[0].jsxCode) : null;
    const props = {
      context,
      isLastItem,
      lastContextCallback,
      tileTemplate,
    };

    switch (context.containerType) {
      case 'Type-One':
        return <TypeOne key={key} {...props} />;
      case 'Type-Two':
        return <TypeTwo key={key} {...props} />;
      case 'Type-Three':
        return <TypeThree key={key} {...props} />;
      case 'Type-Four':
        return <TypeFour key={key} {...props} />;
      case 'Type-Five':
        return <TypeFive key={key} {...props} />;
      case 'Type-Num':
        return <TypeNum key={key} {...props} />;
      default:
        return null;
    }
  };

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }

  return (
    <Suspense
      fallback={
        <div className="w-full py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      }
    >
      <main className="px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-16 xl:px-24 lg:py-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div ref={containerRef} className={`flex flex-col gap-4 sm:gap-6 lg:gap-8 relative ${activeFilter ? 'lg:flex-col max-w-7xl mx-auto' : 'lg:flex-row max-w-7xl mx-auto'}`}>
          
          {/* Active Filter Display */}
          {activeFilter && (
            <div className="w-full mb-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Filtered by:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {activeFilter.type === 'sector' && 'Sector'}
                      {activeFilter.type === 'subSector' && 'Sub-Sector'}
                      {activeFilter.type === 'signalCategory' && 'Signal Category'}
                      {activeFilter.type === 'signalSubCategory' && 'Signal Sub-Category'}
                      : {activeFilter.value}
                    </span>
                  </div>
                  <Link
                    href="/pulse-today"
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear Filter
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div
            ref={mainContentRef}
            className={`w-full transition-all duration-300 ease-in-out ${activeFilter ? 'lg:w-full' : 'lg:w-[72%]'} order-2 lg:order-1`}
          >
            {displayItems.map((displayItem, index) => {
              const isLastItem = index === displayItems.length - 1 && hasMore;
              if (displayItem.type === 'group') {
                const groupKey = `group-${displayItem.items
                  .map((item) => item.id)
                  .join('-')}-${index}`;
                
                // Check if any item in the group is Type-Five
                const hasTypeFive = displayItem.items.some(item => item.containerType === 'Type-Five');
                
                // Determine grid classes based on number of items and filter state
                const getGridClasses = (itemCount) => {
                  if (activeFilter) {
                    // When filtered, use more columns for better space utilization
                    if (itemCount === 1) return 'grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6';
                    if (itemCount === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6';
                    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6';
                  } else {
                    // Normal layout
                    if (itemCount === 1) return 'grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6';
                    if (itemCount === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6';
                    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6';
                  }
                };
                
                if (hasTypeFive) {
                  // For Type-Five containers, break out of normal layout completely
                  return (
                    <div key={groupKey} className="w-screen mb-4 sm:mb-6 -mx-3 sm:-mx-6 md:-mx-8 lg:-mx-16 xl:-mx-24">
                      <div className="px-3 sm:px-6 md:px-8 lg:px-16 xl:px-24">
                        {displayItem.items.map((context, itemIndex) =>
                          renderContextBox(
                            context,
                            isLastItem && itemIndex === displayItem.items.length - 1,
                            `${groupKey}-${context.id}-${itemIndex}`
                          )
                        )}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div
                    key={groupKey}
                    className={getGridClasses(displayItem.items.length)}
                  >
                    {displayItem.items.map((context, itemIndex) =>
                      renderContextBox(
                        context,
                        isLastItem && itemIndex === displayItem.items.length - 1,
                        `${groupKey}-${context.id}-${itemIndex}`
                      )
                    )}
                  </div>
                );
              } else {
                const singleKey = `${displayItem.item.id}-${index}`;
                const isTypeFive = displayItem.item.containerType === 'Type-Five';
                
                if (isTypeFive) {
                  // For Type-Five containers, break out of normal layout completely
                  return (
                    <div key={singleKey} className="w-screen mb-4 sm:mb-6 -mx-3 sm:-mx-6 md:-mx-8 lg:-mx-16 xl:-mx-24">
                      <div className="px-3 sm:px-6 md:px-8 lg:px-16 xl:px-24">
                        {renderContextBox(displayItem.item, isLastItem, singleKey)}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={singleKey} className="mb-4 sm:mb-6">
                    {renderContextBox(displayItem.item, isLastItem, singleKey)}
                  </div>
                );
              }
            })}

            {hasMore && (
              <div ref={loaderRef} className="text-center py-4 sm:py-6">
                {loading && (
                  <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 sm:border-4 border-solid border-indigo-500 border-r-transparent" />
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Mobile first, then desktop positioning */}
          {!activeFilter && (
            <div className="w-full lg:w-[28%] order-1 lg:order-2">
            {sidebarMessage && user && (
              <div className="bg-white p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-teal-500 text-sm sm:text-base lg:text-lg flex-shrink-0">✦</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg leading-tight">
                    {sidebarMessage.title}
                  </span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {sidebarMessage.content}
                </p>
              </div>
            )}

            <div className="bg-white p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-md">
              <div className="mb-3 sm:mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Trending Themes</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {trendingThemes.map((theme, index) => (
                  <div
                    key={`theme-${theme._id || index}`}
                    className="border-b border-dashed border-gray-300 pb-2 sm:pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-blue-500 text-blue-500 font-medium text-xs sm:text-sm">
                        {theme.score?.toFixed(1) ?? 'N/A'}
                      </div>
                      <div className="break-words min-w-0 flex-1">
                        <Link href={`/analyzer/theme-details/${slugify(theme.title)}`}>
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors leading-tight">{theme.title}</h3>
                        </Link>
                        {/* Sub-sector tags */}
                        {theme.subSectors && theme.subSectors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {theme.subSectors.slice(0, 2).map((subSector, subIndex) => (
                              <Link
                                key={`subsector-${subSector._id || subIndex}`}
                                href={`/analyzer/trend-analyzer?subSectorId=${subSector._id}`}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                              >
                                {subSector.subSectorName}
                              </Link>
                            ))}
                            {theme.subSectors.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{theme.subSectors.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* VIEW MORE button at bottom */}
              <div className="mt-3 sm:mt-4 text-center">
                <Link
                  href="/analyzer/trend-analyzer"
                  className="text-indigo-600 text-xs sm:text-sm font-medium hover:text-indigo-700 transition-colors"
                >
                  VIEW MORE →
                </Link>
              </div>
            </div>

            <div className="bg-white mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl shadow-md">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Trending Expert Opinion
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {expertPosts.map((post) => (
                  <a
                    key={post._id}
                    href={post.SourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border-b border-dashed border-gray-300 pb-2 sm:pb-3 last:border-none hover:text-indigo-600 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors leading-tight">
                      {post.postTitle}
                    </h3>
                    {/* Sub-sector tags */}
                    {post.subSectors && post.subSectors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.subSectors.slice(0, 3).map((subSector, index) => (
                          <span
                            key={`expert-subsector-${index}-${subSector}`}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                          >
                            {subSector}
                          </span>
                        ))}
                        {post.subSectors.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{post.subSectors.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </a>
                ))}
              </div>

              {hasMore && (
                <div className="mt-3 sm:mt-4 text-right">
                  <Link
                    href="/influencer-comment/expert-opinion"
                    className="text-indigo-600 text-xs sm:text-sm font-medium hover:underline"
                  >
                    VIEW MORE →
                  </Link>
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      </main>
    </Suspense>
  );
}