import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import { registerModels } from '@/lib/registerModels';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('themeId');

    if (!themeId) {
      return NextResponse.json({ success: false, error: 'Theme ID is required' }, { status: 400 });
    }

    // Ensure models are registered
    registerModels();

    // Find the current theme to get its sub-sectors
    const currentTheme = await Theme.findById(themeId)
      .populate('subSectors', 'subSectorName')
      .lean();

    if (!currentTheme) {
      return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
    }

    const currentSubSectorIds = currentTheme.subSectors?.map(sub => sub._id) || [];

    if (currentSubSectorIds.length === 0) {
      return NextResponse.json({ success: true, relatedThemes: [] }, { status: 200 });
    }

    // Find themes that share at least one sub-sector with the current theme
    const relatedThemes = await Theme.find({
      _id: { $ne: themeId }, // Exclude the current theme
      subSectors: { $in: currentSubSectorIds }
    })
      .populate('subSectors', 'subSectorName')
      .select('themeTitle overallScore impactScore predictiveMomentumScore')
      .sort({ overallScore: -1 }) // Sort by overallScore descending
      .limit(7) // Get top 7
      .lean();

    // Transform data for the chart
    const chartData = relatedThemes.map(theme => ({
      id: theme._id,
      name: theme.themeTitle,
      themeTitle: theme.themeTitle,
      impactScore: theme.impactScore || 0,
      predictiveMomentumScore: theme.predictiveMomentumScore || 0,
      overallScore: theme.overallScore || 0
    }));

    return NextResponse.json({ 
      success: true, 
      relatedThemes: chartData,
      currentTheme: {
        id: currentTheme._id,
        name: currentTheme.themeTitle,
        themeTitle: currentTheme.themeTitle,
        impactScore: currentTheme.impactScore || 0,
        predictiveMomentumScore: currentTheme.predictiveMomentumScore || 0,
        overallScore: currentTheme.overallScore || 0
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching related themes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related themes', details: error.message },
      { status: 500 }
    );
  }
}
