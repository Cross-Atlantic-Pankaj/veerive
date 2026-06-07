'use client';

import React, { useState, useRef, useEffect } from 'react';

const PDFPageSlideshow = ({ contextId, className = '' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pageImages, setPageImages] = useState([]);
  const iframeRef = useRef(null);

  // Fetch PDF URL from the API
  useEffect(() => {
    let createdUrl = null;

    const fetchPdfUrl = async () => {
      if (!contextId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/ppt-file/${contextId}/pdf`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          createdUrl = url;
          setPdfUrl(url);
          
          // For now, we'll use a reasonable default page count
          // In a real implementation, you might want to get this from the API
          setTotalPages(10);
          setIsLoading(false);
        } else {
          setError('Failed to fetch PDF');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('Error fetching PDF');
        setIsLoading(false);
      }
    };

    fetchPdfUrl();

    // Cleanup function to revoke the object URL when component unmounts
    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [contextId]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!pdfUrl || totalPages === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-gray-600">
          <p>No PDF available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* PDF Page Container */}
      <div className="relative bg-gray-100 flex items-center justify-center min-h-[600px]">
        <iframe
          ref={iframeRef}
          src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`}
          className="w-full h-[600px] border-0"
          title={`PDF Page ${currentPage}`}
          key={currentPage} // Force re-render when page changes
        />
        
        {/* Navigation Controls */}
        {totalPages > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Page Indicator and Controls */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>

            {/* Page Dots */}
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-orange-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                );
              })}
              {totalPages > 10 && (
                <span className="text-xs text-gray-500 ml-2">
                  ...{totalPages}
                </span>
              )}
            </div>

            {/* Download Button */}
            <a
              href={pdfUrl}
              download
              className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFPageSlideshow;