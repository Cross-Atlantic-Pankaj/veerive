'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ThemeInfo from '../../_Components/ThemeInfo';
import OverviewSnapshot from '../../_Components/OverviewSnapshot';
import TrendAnalysisNav from '../../_Components/TrendAnalysisNav';
import DriversAndSignals from '../../_Components/DriversAndSignals';
import ImpactAndOpinions from '../../_Components/ImpactAndOpinions';
import RegionalDynamics from '../../_Components/RegionalDynamics';
import ConsumerDynamics from '../../_Components/ConsumerDynamics';
import OtherKeyTrend from '../../_Components/RelatedEvents';
import RelatedContexts from '../../_Components/RelatedContexts';
import TrendingExpertOpinions from '../../_Components/TrendingExpertOpinions';

export default function ThemeDetails() {
  const [theme, setTheme] = useState(null);
  const [relatedThemes, setRelatedThemes] = useState([]);
  const [contexts, setContexts] = useState([]);
  const [trendingExpertOpinions, setTrendingExpertOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('drivers-and-signals');
  const { slug } = useParams();

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analyzer/theme-details?slug=${encodeURIComponent(slug)}`
        );
        const result = await response.json();
        console.log('API Response for theme details:', result);

        if (result.success) {
          setTheme(result.data.theme);
          setRelatedThemes(result.data.relatedThemes || []);
          setContexts(result.data.contexts || []);
          setTrendingExpertOpinions(result.data.trendingExpertOpinions || []);
        } else {
          setError(result.error || 'Failed to load theme details');
        }
      } catch (err) {
        setError('Failed to load theme details');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemeDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-xl">Theme not found</div>
      </div>
    );
  }

  const hasRelatedThemes = relatedThemes.length > 0;
  const hasTrendingOpinions = trendingExpertOpinions.length > 0;
  const hasRightContent = hasRelatedThemes || hasTrendingOpinions;
  
  // Hide right sidebar for trend analysis sections to use full width
  const isTrendAnalysisSection = ['drivers-and-signals', 'impact-and-opinions', 'regional-dynamics', 'consumer-dynamics'].includes(activeSection);
  const shouldShowRightSidebar = hasRightContent && !isTrendAnalysisSection;

  return (
    <div className="bg-gray-50 min-h-screen p-2 md:p-4">
      <ThemeInfo theme={theme} />
      
      {/* Overview/Snapshot - Full Width */}
      <div className="mx-auto mb-4">
        <OverviewSnapshot theme={theme} />
      </div>

      {/* Trend Analysis Section - Full Width */}
      <div className="mx-auto">
        <TrendAnalysisNav 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          theme={theme}
        />
        
        {/* Conditional Content Rendering */}
        {activeSection === 'drivers-and-signals' && (
          <DriversAndSignals theme={theme} />
        )}
        
        {activeSection === 'impact-and-opinions' && (
          <ImpactAndOpinions theme={theme} />
        )}
        
        {activeSection === 'regional-dynamics' && (
          <RegionalDynamics theme={theme} />
        )}
        
        {activeSection === 'consumer-dynamics' && (
          <ConsumerDynamics theme={theme} />
        )}
        
        <RelatedContexts contexts={contexts} />
      </div>

      {/* Other Key Trends and Trending Expert Opinions - Side by Side */}
      <div className="flex flex-col lg:flex-row mx-auto gap-4 mt-4">
        {hasRelatedThemes && (
          <div className="lg:w-[72%]">
            <OtherKeyTrend relatedThemes={relatedThemes} />
          </div>
        )}
        {hasTrendingOpinions && (
          <div className="lg:w-[28%]">
            <TrendingExpertOpinions trendingExpertOpinions={trendingExpertOpinions} />
          </div>
        )}
      </div>
    </div>
  );
}