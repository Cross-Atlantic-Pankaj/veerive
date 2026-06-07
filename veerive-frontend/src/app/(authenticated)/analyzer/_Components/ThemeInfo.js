import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThemeInfo({ theme }) {
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);
  const router = useRouter();

  const handleSectorClick = (sector) => {
    router.push(`/analyzer/trend-analyzer?sectorId=${sector._id}`);
  };

  const handleSubSectorClick = (subSector) => {
    router.push(`/analyzer/trend-analyzer?subSectorId=${subSector._id}`);
  };

  return (
    <div className="max-w-full mx-auto md:py-6 p-3 md:px-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{theme.themeTitle}</h1>
      
      {/* Teaser Text */}
      {theme.teaser && (
        <div 
          className="text-gray-600 mb-4 text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: theme.teaser }}
        ></div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-start md:gap-8 mb-4">
        {/* Sectors and Subsectors */}
        <div className="flex-1">
          {theme.sectors?.length > 0 || theme.subSectors?.length > 0 ? (
            <div>
              <div className="flex flex-wrap gap-2 mt-2">
                {theme.sectors?.map((sector) => (
                  <button
                    key={sector._id}
                    onClick={() => handleSectorClick(sector)}
                    className="p-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    {sector.sectorName}
                  </button>
                ))}
                {theme.subSectors?.map((subSector) => (
                  <button
                    key={subSector._id}
                    onClick={() => handleSubSectorClick(subSector)}
                    className="p-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    {subSector.subSectorName}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Score Metrics */}
        <div className="flex-1 flex gap-4 items-center md:justify-end mt-4 md:mt-0">
          <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
            <div className="text-sm text-[#174c77] leading-tight text-center">
              Disruption Potential
            </div>
            <div className="bg-[#f76c3c] text-white font-bold w-16 h-9 p-2 flex items-center justify-center rounded">
              {theme.impactScore?.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
            <div className="text-sm text-[#174c77] leading-tight text-center">
              Predictive Momentum
            </div>
            <div className="bg-[#f76c3c] text-white font-bold w-16 h-9 p-2 flex items-center justify-center rounded">
              {theme.predictiveMomentumScore?.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center bg-[#f1f8ff] border border-[#174c77] rounded px-2 py-1 gap-2">
            <div className="text-sm text-[#174c77] leading-tight text-center">
              Trending Pulse
            </div>
            <div className="bg-[#f76c3c] text-white font-semibold w-16 h-9 p-2 flex items-center justify-center rounded">
              {theme.trendingScore?.toFixed(2)}
            </div>
          </div>
          <button
            onClick={() => setShowMethodologyModal(true)}
            className="w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <span className="text-xs font-bold">i</span>
          </button>
        </div>
      </div>

      {theme.themeDescription && (
        <div
          className="text-gray-600 mb-2 mt-4 text-base"
          dangerouslySetInnerHTML={{ __html: theme.themeDescription }}
        ></div>
      )}

      {/* Methodology Modal */}
      {showMethodologyModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Methodology</h3>
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-gray-700 leading-relaxed">
              {theme.methodology ? (
                <div 
                  style={{
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: theme.methodology.replace(
                      /<ul>/g, 
                      '<ul style="list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem;">'
                    ).replace(
                      /<li>/g, 
                      '<li style="margin-bottom: 0.5rem;">'
                    )
                  }} 
                />
              ) : (
                <p className="text-gray-500 italic">No methodology information available for this theme.</p>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}