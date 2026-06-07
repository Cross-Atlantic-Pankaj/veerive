import React, { useState } from 'react';

export default function OverviewSnapshot({ theme }) {
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [showFullExecutiveSummary, setShowFullExecutiveSummary] = useState(false);

  const executiveSummary = theme?.overviewSnapshot?.executiveSummary;
  const marketMetrics = theme?.overviewSnapshot?.marketMetrics || [];

  // Filter out empty market metrics
  const validMarketMetrics = marketMetrics.filter(metric => 
    metric.value && metric.text && metric.value.trim() !== '' && metric.text.trim() !== ''
  );

  // Helper function to get first paragraph of content
  const getFirstParagraph = (content) => {
    if (!content) return '';
    // Split by paragraph tags and get the first one
    const paragraphs = content.split('</p>');
    return paragraphs[0] + '</p>';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-6">
      
      {/* Executive Summary Container */}
      <div className="lg:col-span-6 rounded-xl shadow-sm border border-gray-100 p-6" style={{backgroundColor: '#f2fbfb'}}>
        <div className="flex items-center gap-3 mb-6">
          {executiveSummary?.executiveSummaryIcon && (
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <img 
                src={executiveSummary.executiveSummaryIcon} 
                alt="Executive Summary" 
                className="w-6 h-6"
              />
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-800" style={{fontFamily: 'sans-serif'}}>Trend Snapshot</h3>
        </div>

        {/* Executive Summary Content - Direct Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {/* Trend Significance */}
          {executiveSummary?.trendSignificance?.content && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 mt-1 flex-shrink-0">
                <img 
                  src="/assets/Picture1.png" 
                  alt="Trend Significance" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-600 mb-2" style={{fontFamily: 'Arial'}}>Trend Significance</h4>
                <div 
                  className="text-gray-700 text-sm leading-relaxed executive-summary-content" 
                  style={{fontFamily: 'Arial'}}
                  dangerouslySetInnerHTML={{ 
                    __html: showFullExecutiveSummary 
                      ? executiveSummary.trendSignificance.content 
                      : getFirstParagraph(executiveSummary.trendSignificance.content)
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Potential Challenges */}
          {executiveSummary?.potentialChallenges?.content && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 mt-1 flex-shrink-0">
                <img 
                  src="/assets/Picture2.png" 
                  alt="Potential Challenges" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-600 mb-2" style={{fontFamily: 'Arial'}}>Potential Challenges</h4>
                <div 
                  className="text-gray-700 text-sm leading-relaxed executive-summary-content" 
                  style={{fontFamily: 'Arial'}}
                  dangerouslySetInnerHTML={{ 
                    __html: showFullExecutiveSummary 
                      ? executiveSummary.potentialChallenges.content 
                      : getFirstParagraph(executiveSummary.potentialChallenges.content)
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* View More Button */}
        <button
          onClick={() => setShowFullExecutiveSummary(!showFullExecutiveSummary)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 transition-colors group"
        >
          {showFullExecutiveSummary ? 'View Less' : 'View More'}
          <svg 
            className={`w-4 h-4 transition-transform group-hover:translate-y-0.5 ${showFullExecutiveSummary ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Market Metrics Container */}
      <div className="lg:col-span-4 rounded-xl shadow-sm border border-gray-100 p-6" style={{backgroundColor: '#f2fbfb'}}>
        <h3 className="text-lg font-bold text-gray-800 mb-6" style={{fontFamily: 'sans-serif'}}>Market Metrics</h3>
        
         {validMarketMetrics.length > 0 ? (
           <div className="grid grid-cols-2 gap-3">
             {validMarketMetrics.map((metric, index) => (
               <div 
                 key={index}
                 className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
               >
                 {/* Icon */}
                 {metric.icon && (
                   <div className="flex-shrink-0">
                     <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                       <img 
                         src={metric.icon} 
                         alt="Metric Icon" 
                         className="w-5 h-5 object-contain"
                       />
                     </div>
                   </div>
                 )}
                 
                 {/* Content */}
                 <div className="flex-1">
                   {/* Value */}
                   <div className="font-bold text-lg text-orange-500 mb-1">
                     {metric.value}
                   </div>
                   
                   {/* Text */}
                   <div 
                     className="text-xs text-gray-600 leading-tight"
                     dangerouslySetInnerHTML={{ __html: metric.text }}
                   ></div>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No market metrics available</p>
          </div>
        )}
      </div>
    </div>
  );
}
