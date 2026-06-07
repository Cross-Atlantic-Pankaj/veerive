import React, { useState } from 'react';

export default function TrendAnalysisNav({ activeSection, onSectionChange, theme }) {
  const sections = [
    { 
      id: 'drivers-and-signals', 
      label: 'Drivers and Signals',
      hasData: theme?.trendAnalysis?.driversAndSignals?.keyDrivers?.length > 0 || 
               theme?.trendAnalysis?.driversAndSignals?.signalsInAction?.length > 0
    },
    { 
      id: 'impact-and-opinions', 
      label: 'Impact and Opinions',
      hasData: theme?.trendAnalysis?.impactAndOpinions?.title?.content || 
               theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.highLowContainer ||
               theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.highLowContainer
    },
    { 
      id: 'regional-dynamics', 
      label: 'Regional Dynamics',
      hasData: theme?.trendAnalysis?.regionalDynamics?.heatMapChartSection?.length > 0 ||
               theme?.trendAnalysis?.regionalDynamics?.regionalInsights?.regions?.length > 0
    },
    { 
      id: 'consumer-dynamics', 
      label: 'Consumer Dynamics',
      hasData: theme?.trendAnalysis?.consumerDynamics?.behavioralInsights?.length > 0 ||
               theme?.trendAnalysis?.consumerDynamics?.impactAnalyser?.length > 0
    }
  ];

  // Filter out sections with no data
  const availableSections = sections.filter(section => section.hasData);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm mb-6 p-6">
      <div className="flex gap-2">
        {availableSections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex-1 px-6 py-4 font-semibold text-base rounded-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-300 ${
              activeSection === section.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-transparent text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
