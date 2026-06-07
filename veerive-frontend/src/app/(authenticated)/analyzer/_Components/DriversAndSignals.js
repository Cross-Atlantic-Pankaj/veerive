import React, { useState } from 'react';
import Image from 'next/image';
import keyDriverIcon from '../../../utils/key driver.png';
import signalsInActionIcon from '../../../utils/signals in action.png';

export default function DriversAndSignals({ theme }) {
  const [expandedDrivers, setExpandedDrivers] = useState({});
  const [expandedSignals, setExpandedSignals] = useState({});

  const driversAndSignals = theme?.trendAnalysis?.driversAndSignals;
  const keyDrivers = driversAndSignals?.keyDrivers || [];
  const signalsInAction = driversAndSignals?.signalsInAction || [];

  const toggleDriverExpansion = (index) => {
    setExpandedDrivers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSignalExpansion = (index) => {
    setExpandedSignals(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDescription = (description, isExpanded) => {
    if (!description) return '';
    
    if (isExpanded) {
      return description;
    }
    
    // Create a temporary element to measure text with HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    tempDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: 100%;
      font-size: 12px;
      line-height: 1.4;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(tempDiv);
    
    const lineHeight = tempDiv.offsetHeight / (tempDiv.textContent.split('\n').length || 1);
    const maxHeight = lineHeight * 2; // 2 lines
    
    document.body.removeChild(tempDiv);
    
    // If content is already within 2 lines, return as is
    if (tempDiv.offsetHeight <= maxHeight) {
      return description;
    }
    
    // Truncate by characters to show exactly 2 lines (roughly 60-80 characters for 2 lines)
    const plainText = description.replace(/<[^>]*>/g, '');
    if (plainText.length <= 60) {
      return description;
    }
    
    // Find a good break point near 60 characters for exactly 2 lines
    let truncateAt = 60;
    const text = plainText.substring(0, truncateAt);
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > 40) {
      truncateAt = lastSpace;
    }
    
    // Reconstruct with HTML tags preserved up to truncation point
    let truncatedHtml = '';
    let charCount = 0;
    let inTag = false;
    let currentTag = '';
    
    for (let i = 0; i < description.length; i++) {
      const char = description[i];
      
      if (char === '<') {
        inTag = true;
        currentTag = char;
      } else if (char === '>') {
        inTag = false;
        currentTag += char;
        truncatedHtml += currentTag;
        currentTag = '';
      } else if (inTag) {
        currentTag += char;
      } else {
        if (charCount >= truncateAt) {
          break;
        }
        truncatedHtml += char;
        charCount++;
      }
    }
    
    return truncatedHtml + '...';
  };

  const formatSignalContent = (content, isExpanded) => {
    if (!content) return '';
    
    if (isExpanded) {
      return content;
    }
    
    // Truncate by characters to show exactly 2 lines (roughly 60-80 characters for 2 lines)
    const plainText = content.replace(/<[^>]*>/g, '');
    if (plainText.length <= 60) {
      return content;
    }
    
    // Find a good break point near 60 characters for exactly 2 lines
    let truncateAt = 60;
    const text = plainText.substring(0, truncateAt);
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > 40) {
      truncateAt = lastSpace;
    }
    
    // Reconstruct with HTML tags preserved up to truncation point
    let truncatedHtml = '';
    let charCount = 0;
    let inTag = false;
    let currentTag = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (char === '<') {
        inTag = true;
        currentTag = char;
      } else if (char === '>') {
        inTag = false;
        currentTag += char;
        truncatedHtml += currentTag;
        currentTag = '';
      } else if (inTag) {
        currentTag += char;
      } else {
        if (charCount >= truncateAt) {
          break;
        }
        truncatedHtml += char;
        charCount++;
      }
    }
    
    return truncatedHtml + '...';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
      
      {/* Key Drivers Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Image 
            src={keyDriverIcon} 
            alt="Key Drivers Icon" 
            width={32} 
            height={32} 
            className="object-contain"
          />
          Key Drivers
        </h3>
        
        {keyDrivers.length > 0 ? (
          <div className="space-y-4">
            {keyDrivers.slice(0, 8).map((driver, index) => (
              <div 
                key={index}
                className="rounded-lg p-3 hover:shadow-md transition-shadow duration-200 border border-gray-200"
                style={{backgroundColor: '#f2fbfb'}}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  {driver.icon && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={driver.icon} 
                          alt="Driver Icon" 
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1">
                    {/* Driver Type */}
                    {driver.driverType && (
                      <div className="mb-1">
                        <span className="inline-block bg-transparent border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-600 font-medium uppercase tracking-wide">
                          {typeof driver.driverType === 'object' ? driver.driverType.driverName : driver.driverType}
                        </span>
                      </div>
                    )}
                    
                    {/* Title */}
                    <h4 className="font-bold text-gray-800 mb-1 text-base">
                      {driver.driverTitle}
                    </h4>
                    
                    {/* Description */}
                    <div className="text-sm text-gray-600 leading-relaxed mb-2">
                      {expandedDrivers[index] ? (
                        <div 
                          className="whitespace-pre-wrap font-sans drivers-signals-content"
                          dangerouslySetInnerHTML={{ __html: driver.description }}
                        ></div>
                      ) : (
                        <div 
                          className="whitespace-pre-wrap font-sans drivers-signals-content"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.4'
                          }}
                          dangerouslySetInnerHTML={{ __html: driver.description }}
                        ></div>
                      )}
                    </div>
                    
                    {/* View More Button */}
                    {driver.description && (
                      <button
                        onClick={() => toggleDriverExpansion(index)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors"
                      >
                        {expandedDrivers[index] ? 'View Less' : 'View More'}
                        <svg 
                          className={`w-3 h-3 transition-transform ${expandedDrivers[index] ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No key drivers available</p>
          </div>
        )}
      </div>

      {/* Signals in Action Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Image 
            src={signalsInActionIcon} 
            alt="Signals in Action Icon" 
            width={46} 
            height={46} 
            className="object-contain"
          />
          Signals in Action
        </h3>
        
        {signalsInAction.length > 0 ? (
          <div className="space-y-6">
            {signalsInAction.map((signal, index) => (
              <div 
                key={index}
                className="rounded-lg p-4 shadow-sm border border-green-700"
                style={{backgroundColor: '#effdf7'}}
              >
                {/* Header Section */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Logo */}
                  {signal.logo && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <img 
                          src={signal.logo} 
                          alt="Signal Logo" 
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Title */}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-base">
                      {signal.title}
                    </h4>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-gray-50 p-3 mb-4 -mx-4 relative z-10">
                  <div 
                    className="text-gray-600 leading-relaxed text-sm drivers-signals-content"
                    dangerouslySetInnerHTML={{ __html: signal.description }}
                  ></div>
                </div>
                
                {/* Content Sections */}
                <div className="flex flex-col lg:flex-row gap-3">
                  {/* Initiative Section */}
                  {signal.initiative?.description && (
                    <div className="flex-1">
                        <h5 className="font-bold text-green-700 mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                           Initiative
                        </h5>
                      <div className="text-gray-700 leading-relaxed text-sm">
                        {expandedSignals[index] ? (
                          <div 
                            className="whitespace-pre-wrap font-sans drivers-signals-content"
                            dangerouslySetInnerHTML={{ __html: signal.initiative.description }}
                          ></div>
                        ) : (
                          <div 
                            className="whitespace-pre-wrap font-sans drivers-signals-content"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.4'
                            }}
                            dangerouslySetInnerHTML={{ __html: signal.initiative.description }}
                          ></div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Strategic Imperative Section */}
                  {signal.strategicImperative?.description && (
                    <div className="flex-1">
                        <h5 className="font-bold text-green-700 mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                           Strategic Imperative
                        </h5>
                      <div className="text-gray-700 leading-relaxed text-sm">
                        {expandedSignals[index] ? (
                          <div 
                            className="whitespace-pre-wrap font-sans drivers-signals-content"
                            dangerouslySetInnerHTML={{ __html: signal.strategicImperative.description }}
                          ></div>
                        ) : (
                          <div 
                            className="whitespace-pre-wrap font-sans drivers-signals-content"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.4'
                            }}
                            dangerouslySetInnerHTML={{ __html: signal.strategicImperative.description }}
                          ></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* View More Button */}
                {((signal.initiative?.description) || (signal.strategicImperative?.description)) && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleSignalExpansion(index)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 transition-colors group"
                    >
                      {expandedSignals[index] ? 'View Less' : 'View More'}
                      <svg 
                        className={`w-4 h-4 transition-transform group-hover:translate-y-0.5 ${expandedSignals[index] ? 'rotate-180' : ''}`} 
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
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No signals in action available</p>
          </div>
        )}
      </div>
    </div>
  );
}
