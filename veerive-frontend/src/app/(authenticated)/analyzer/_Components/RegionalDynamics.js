import React, { useState } from 'react';

export default function RegionalDynamics({ theme }) {
  const [expandedRegions, setExpandedRegions] = useState({});
  const [showHeatMapInfo, setShowHeatMapInfo] = useState(false);

  const regionalDynamics = theme?.trendAnalysis?.regionalDynamics;
  const heatMapData = regionalDynamics?.heatMapChartSection || [];
  const regionalInsights = regionalDynamics?.regionalInsights;
  const overallSummary = regionalInsights?.overallSummary;
  const regions = regionalInsights?.regions || [];

  const toggleRegionExpansion = (index) => {
    setExpandedRegions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatDescription = (description, isExpanded) => {
    if (!description) return '';
    
    if (isExpanded) {
      return description;
    }
    
    // Show first 2 lines by limiting character count (approximately 2 lines)
    const maxChars = 150; // Approximate characters for 2 lines
    if (description.length <= maxChars) {
      return description;
    }
    
    // Find the last space before the limit to avoid cutting words
    const truncated = description.substring(0, maxChars);
    const lastSpace = truncated.lastIndexOf(' ');
    const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
    
    return finalText + '...';
  };

  const getCircleColor = (value) => {
    if (value >= 80) return '#900000'; // dark red
    if (value >= 60) return '#ee2400'; // light red
    if (value >= 40) return '#ea580c'; // dark orange
    if (value >= 20) return '#fb923c'; // light orange
    return '#eab308'; // yellow
  };

  // Create circle data for regions
  const createCircleData = () => {
    return heatMapData.map(item => ({
      region: item.nameOfRegion,
      value: item.values || 0,
      color: getCircleColor(item.values || 0)
    }));
  };

  const circleData = createCircleData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Regional Adoption Heat Map Container */}
      <div className="rounded-xl shadow-sm border border-gray-100 p-6" style={{backgroundColor: '#f2fbfb'}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Regional Adoption Heat Map</h3>
              <p className="text-sm text-gray-600 mt-1">BNPL penetration and risk assessment by region</p>
            </div>
            <button
              onClick={() => setShowHeatMapInfo(true)}
              className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <span className="text-xs font-bold">i</span>
            </button>
          </div>
          
          {heatMapData.length > 0 ? (
            <div className="space-y-4">
              {/* Regional Data Circles */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {circleData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg"
                        style={{ backgroundColor: item.color }}
                        title={`${item.region}: ${item.value}%`}
                      >
                        {item.value}%
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center">
                        {item.region}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                  <span className="text-gray-700 font-medium">0-20%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fb923c' }}></div>
                  <span className="text-gray-700 font-medium">20-40%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ea580c' }}></div>
                  <span className="text-gray-700 font-medium">40-60%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ee2400' }}></div>
                  <span className="text-gray-700 font-medium">60-80%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#900000' }}></div>
                  <span className="text-gray-700 font-medium">80-100%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No heat map data available</p>
            </div>
          )}
      </div>

      {/* Regional Insights Container */}
      <div className="rounded-xl shadow-sm border border-gray-100 p-6" style={{backgroundColor: '#f2fbfb'}}>
        <h3 className="text-lg font-bold text-gray-800 mb-6">Regional Insights</h3>
        
        {/* Overall Summary - Direct content without container */}
        {overallSummary && (
          <div 
            className="text-sm text-gray-600 leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: overallSummary }}
          ></div>
        )}

          {/* All Regions Display */}
          {regions.length > 0 && (
            <div className="space-y-4">
              {regions.map((region, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Region Icon from Region collection or fallback */}
                    <div className="w-8 h-8 flex items-center justify-center">
                      {region.regionId?.regionIcon ? (
                        <img 
                          src={region.regionId.regionIcon} 
                          alt="Region Map Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      ) : region.regionMapIcon ? (
                        <img 
                          src={region.regionMapIcon} 
                          alt="Region Map Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">🌍</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-800">
                      {region.regionId?.regionName || region.regionName || `Region ${index + 1}`}
                    </h4>
                  </div>
                  
                  {/* Region Description from Region collection or fallback */}
                  {(region.regionId?.regionDescription || region.regionDescription) && (
                    <div className="text-sm text-gray-600 leading-relaxed">
                      <div 
                        className="whitespace-pre-wrap font-sans"
                        dangerouslySetInnerHTML={{ __html: formatDescription(
                          region.regionId?.regionDescription || region.regionDescription, 
                          expandedRegions[index]
                        ) }}
                      ></div>
                      
                      {(region.regionId?.regionDescription || region.regionDescription)?.length > 150 && (
                        <button
                          onClick={() => toggleRegionExpansion(index)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 mt-2 transition-colors"
                        >
                          {expandedRegions[index] ? 'View Less' : 'View More'}
                          <svg 
                            className={`w-4 h-4 transition-transform ${expandedRegions[index] ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* No regions available */}
        {regions.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No regional insights available</p>
          </div>
        )}
      </div>

      {/* Heat Map Info Modal */}
      {showHeatMapInfo && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg mx-4 shadow-2xl border border-gray-200 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Regional Adoption Heat Map</h3>
              <button
                onClick={() => setShowHeatMapInfo(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">About This Chart</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  BNPL penetration and risk assessment by region. Circle size and color indicate percentage values and risk levels.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Current Data</h4>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {heatMapData.length > 0 ? (
                    <div className="space-y-1">
                      {heatMapData.map((region, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium">{region.nameOfRegion}</span>
                          <span className="text-gray-600">{region.values}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No data available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Color Legend</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                    <span className="text-gray-700">0-20% (Yellow)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fb923c' }}></div>
                    <span className="text-gray-700">20-40% (Light Orange)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ea580c' }}></div>
                    <span className="text-gray-700">40-60% (Dark Orange)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ee2400' }}></div>
                    <span className="text-gray-700">60-80% (Light Red)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#900000' }}></div>
                    <span className="text-gray-700">80-100% (Dark Red)</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
