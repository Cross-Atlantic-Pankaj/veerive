import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function ImpactAndOpinions({ theme }) {
  const [expertOpinions, setExpertOpinions] = useState([]);
  const [relatedThemes, setRelatedThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [showChartInfo, setShowChartInfo] = useState(false);
  const [expandedDisruptive, setExpandedDisruptive] = useState(false);
  const [expandedMomentum, setExpandedMomentum] = useState(false);

  const impactAndOpinions = theme?.trendAnalysis?.impactAndOpinions;
  const title = impactAndOpinions?.title;
  const disruptivePotential = impactAndOpinions?.disruptivePotential;
  const trendMomentum = impactAndOpinions?.trendMomentum;

  useEffect(() => {
    const fetchExpertOpinions = async () => {
      try {
        const response = await fetch(`/api/analyzer/expert-opinions?themeId=${theme._id}`);
        if (response.ok) {
          const data = await response.json();
          setExpertOpinions(data.expertOpinions || []);
        }
      } catch (error) {
        console.error('Error fetching expert opinions:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedThemes = async () => {
      try {
        setChartLoading(true);
        const response = await fetch(`/api/analyzer/related-themes?themeId=${theme._id}`);
        if (response.ok) {
          const data = await response.json();
          setRelatedThemes(data.relatedThemes || []);
          setCurrentTheme(data.currentTheme || null);
        }
      } catch (error) {
        console.error('Error fetching related themes:', error);
      } finally {
        setChartLoading(false);
      }
    };

    if (theme?._id) {
      fetchExpertOpinions();
      fetchRelatedThemes();
    }
  }, [theme?._id]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
        return 'bg-green-500 text-white';
      case 'bearish':
        return 'bg-red-500 text-white';
      case 'neutral':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // Chart colors for different themes
  const chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  
  const getChartColor = (index) => {
    return chartColors[index % chartColors.length];
  };

  // Prepare chart data - filter out invalid data points
  const chartData = relatedThemes
    .filter(theme => 
      theme.impactScore !== null && 
      theme.impactScore !== undefined && 
      theme.predictiveMomentumScore !== null && 
      theme.predictiveMomentumScore !== undefined &&
      !isNaN(theme.impactScore) && 
      !isNaN(theme.predictiveMomentumScore)
    )
    .map((theme, index) => {
      // Debug: log the theme data to see what properties are available
      console.log('Theme data:', theme);
      console.log('themeTitle:', theme.themeTitle);
      console.log('name:', theme.name);
      console.log('title:', theme.title);
      
      // Try different properties to get the correct label
      const labelText = theme.themeTitle || theme.name || theme.title || `Theme ${index + 1}`;
      const firstWord = labelText.split(' ')[0];
      
      return {
        ...theme,
        color: getChartColor(index),
        label: firstWord
      };
    });

  // Add current theme to chart data if available and valid
  if (currentTheme && 
      currentTheme.impactScore !== null && 
      currentTheme.impactScore !== undefined && 
      currentTheme.predictiveMomentumScore !== null && 
      currentTheme.predictiveMomentumScore !== undefined &&
      !isNaN(currentTheme.impactScore) && 
      !isNaN(currentTheme.predictiveMomentumScore)) {
    // Debug current theme
    console.log('Current theme data:', currentTheme);
    console.log('Current themeTitle:', currentTheme.themeTitle);
    console.log('Current name:', currentTheme.name);
    console.log('Current title:', currentTheme.title);
    
    const currentLabelText = currentTheme.themeTitle || currentTheme.name || currentTheme.title || 'Current';
    const currentFirstWord = currentLabelText.split(' ')[0];
    
    chartData.unshift({
      ...currentTheme,
      color: '#FF0000', // Red for current theme
      isCurrent: true,
      label: currentFirstWord
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Title and Explanation Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{title?.content || 'Context and Explanation'}</h2>
        <div 
          className="text-gray-600 leading-relaxed impact-opinions-content"
          dangerouslySetInnerHTML={{ __html: title?.explanation || 'No explanation available for this trend.' }}
        ></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Disruptive Potential and Trend Momentum */}
        <div className="lg:col-span-1 space-y-6">
          {/* Disruptive Potential */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">💣</span>
              Disruptive Potential
            </h3>
            
            {disruptivePotential?.highLowContainer && (
              <div className="bg-white border-2 border-black rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {disruptivePotential.highLowContainer.icon && (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img 
                          src={disruptivePotential.highLowContainer.icon} 
                          alt="Disruptive Potential Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {disruptivePotential.highLowContainer.impactArea || 'Impact Area'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    disruptivePotential.highLowContainer.impactRating?.toLowerCase() === 'high' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {disruptivePotential.highLowContainer.impactRating || 'Low'}
                  </span>
                </div>
              </div>
            )}

            {disruptivePotential?.content && (
              <div className="mt-3">
                {expandedDisruptive ? (
                  <div 
                    className="text-sm text-gray-600 leading-relaxed impact-opinions-content"
                    dangerouslySetInnerHTML={{ __html: disruptivePotential.content }}
                  ></div>
                ) : (
                  <div 
                    className="text-sm text-gray-600 leading-relaxed impact-opinions-content"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4'
                    }}
                    dangerouslySetInnerHTML={{ __html: disruptivePotential.content }}
                  ></div>
                )}
                
                {/* View More Button */}
                <button
                  onClick={() => setExpandedDisruptive(!expandedDisruptive)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors mt-2"
                >
                  {expandedDisruptive ? 'View Less' : 'View More'}
                  <svg 
                    className={`w-3 h-3 transition-transform ${expandedDisruptive ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Trend Momentum */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📈</span>
              Trend Momentum
            </h3>
            
            {trendMomentum?.highLowContainer && (
              <div className="bg-white border-2 border-black rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {trendMomentum.highLowContainer.icon && (
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img 
                          src={trendMomentum.highLowContainer.icon} 
                          alt="Trend Momentum Icon" 
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {trendMomentum.highLowContainer.impactArea || 'Impact Area'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    trendMomentum.highLowContainer.impactRating?.toLowerCase() === 'high' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {trendMomentum.highLowContainer.impactRating || 'Low'}
                  </span>
                </div>
              </div>
            )}

            {trendMomentum?.content && (
              <div className="mt-3">
                {expandedMomentum ? (
                  <div 
                    className="text-sm text-gray-600 leading-relaxed impact-opinions-content"
                    dangerouslySetInnerHTML={{ __html: trendMomentum.content }}
                  ></div>
                ) : (
                  <div 
                    className="text-sm text-gray-600 leading-relaxed impact-opinions-content"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4'
                    }}
                    dangerouslySetInnerHTML={{ __html: trendMomentum.content }}
                  ></div>
                )}
                
                {/* View More Button */}
                <button
                  onClick={() => setExpandedMomentum(!expandedMomentum)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors mt-2"
                >
                  {expandedMomentum ? 'View Less' : 'View More'}
                  <svg 
                    className={`w-3 h-3 transition-transform ${expandedMomentum ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Chart and Market Leaders & Influencer Opinions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scatter Plot Chart */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex-1 pr-8">Fintech Trends Quadrant: Predictive Momentum vs Disruption Potential</h3>
              <button
                onClick={() => setShowChartInfo(true)}
                className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <span className="text-xs font-bold">i</span>
              </button>
            </div>
            
            {chartLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    data={chartData}
                    margin={{ top: 60, right: 60, bottom: 40, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      type="number" 
                      dataKey="predictiveMomentumScore" 
                      name="Predictive Momentum"
                      domain={[0, 5]}
                      tickCount={6}
                      tickFormatter={(value) => value.toFixed(1)}
                      label={{ value: 'Predictive Momentum (1-5)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="impactScore" 
                      name="Disruption Potential"
                      domain={[0, 5]}
                      tickCount={6}
                      tickFormatter={(value) => value.toFixed(1)}
                      label={{ value: 'Disruption Potential (1-5)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-800">{data.label || data.name}</p>
                              <p className="text-sm text-gray-600">
                                Predictive Momentum: {data.predictiveMomentumScore?.toFixed(1) || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Disruption Potential: {data.impactScore?.toFixed(1) || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Overall Score: {data.overallScore?.toFixed(1) || 'N/A'}
                              </p>
                              {data.isCurrent && (
                                <p className="text-sm text-red-600 font-medium">Current Theme</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="predictiveMomentumScore">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList 
                        dataKey="label" 
                        position="top" 
                        style={{ 
                          fontSize: '10px', 
                          fontWeight: 'bold',
                          fill: '#374151'
                        }}
                        offset={12}
                      />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No related themes found for comparison.</p>
              </div>
            )}
          </div>

          {/* Market Leaders & Influencer Opinions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-lg">📄</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Market Leaders & Influencer Opinions</h3>
            </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : expertOpinions.length > 0 ? (
            <div className="space-y-4">
              {expertOpinions.map((opinion, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <span className="text-sm">👤</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {opinion.sourceName || 'Unknown Expert'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {opinion.sourceType || 'Industry Expert'}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        "{opinion.summary}"
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getSentimentColor(opinion.sentiment)}`}>
                        {opinion.sentiment || 'Neutral'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No expert opinions available for this trend.</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Chart Info Modal */}
      {showChartInfo && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Chart Data Information</h3>
              <button
                onClick={() => setShowChartInfo(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Current Theme */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Current Theme</h4>
                {currentTheme ? (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-1">{currentTheme.name}</div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                        <div>Score: {currentTheme.overallScore?.toFixed(1) || 'N/A'}</div>
                        <div>DP: {currentTheme.impactScore?.toFixed(1) || 'N/A'}</div>
                        <div>PM: {currentTheme.predictiveMomentumScore?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No current theme data</p>
                )}
              </div>

              {/* Sub-sectors */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Sub-sectors</h4>
                {theme?.subSectors?.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex flex-wrap gap-1">
                      {theme.subSectors.map((subSector, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {subSector.subSectorName}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No sub-sectors available</p>
                )}
              </div>
              
              {/* Top 7 Related Themes */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Top 7 Related Themes</h4>
                {chartData.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {chartData.filter(theme => !theme.isCurrent).slice(0, 7).map((theme, index) => (
                        <div key={theme.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: theme.color }}
                            ></div>
                             <span className="text-xs font-medium text-gray-700">{theme.label || theme.name}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {theme.overallScore?.toFixed(1) || 'N/A'} | {theme.impactScore?.toFixed(1) || 'N/A'} | {theme.predictiveMomentumScore?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No related themes found</p>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
