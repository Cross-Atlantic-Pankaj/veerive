import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Context from '@/models/Context';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import Post from '@/models/Post';
import Drivers from '@/models/Drivers';
import Region from '@/models/Region';
import tileTemplate from '@/models/TileTemplate';
import { registerModels } from '@/lib/registerModels';

function normalizeTitle(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-') 
    .replace(/--+/g, '-') 
    .replace(/^-+|-+$/g, '');
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    registerModels();
    const normalizedSlug = normalizeTitle(slug);

    const themes = await Theme.find({ doNotPublish: { $ne: true } })
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .populate({
        path: 'trendAnalysis.driversAndSignals.keyDrivers.driverType',
        model: 'Drivers',
        select: 'driverName'
      })
      .populate({
        path: 'trendAnalysis.regionalDynamics.regionalInsights.regions.regionId',
        model: 'Region',
        select: 'regionName regionIcon regionDescription'
      })
      .lean();

    const targetTheme = themes.find(t => normalizeTitle(t.themeTitle) === normalizedSlug);

    if (!targetTheme) {
      console.log(`No theme found for slug: ${slug}, normalized slug: ${normalizedSlug}`);
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    const targetSubSectorIds = targetTheme.subSectors.map(sub => sub._id.toString());

    const relatedThemes = await Theme.find({
      subSectors: { $in: targetSubSectorIds },
      _id: { $ne: targetTheme._id },
      doNotPublish: { $ne: true }
    })
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .select('themeTitle sectors subSectors overallScore')
      .sort({ overallScore: -1 })
      .lean();

    const contexts = await Context.find({
      themes: targetTheme._id,
      isTrending: true,
      doNotPublish: { $ne: true }
    })
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .populate('signalCategories', 'signalName')
      .populate('signalSubCategories', 'subSignalName')
      .populate('themes', 'themeTitle')
      .populate({
        path: 'posts.postId',
        model: 'Post'
      })
      .populate({
				path: 'tileTemplates',
				model: 'TileTemplate',
				select: 'name type jsxCode',
				options: { strictPopulate: false },
			})
      .sort({ date: -1 })
      .lean();

    const trendingExpertOpinions = [];
    contexts.forEach(ctx => {
      if (ctx.posts && ctx.posts.length > 0) {
        ctx.posts.forEach(post => {
          if (
            post.postId &&
            typeof post.postId === 'object' &&
            (post.postId.postType === 'ExpertOpinion' || post.postId.postType === 'Expert Opinion') &&
            post.postId.isTrending === true
          ) {
            trendingExpertOpinions.push({
              postId: post.postId._id,
              postTitle: post.postId.postTitle,
              postType: post.postId.postType,
              date: post.postId.date,
              contextTitle: ctx.contextTitle,
              sourceUrl: post.postId.sourceUrl || (post.postId.sourceUrls && post.postId.sourceUrls[0]) || '',
            });
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        theme: targetTheme,
        relatedThemes: relatedThemes,
        contexts: contexts,
        trendingExpertOpinions: trendingExpertOpinions
      }
    });
  } catch (error) {
    console.error('Error fetching theme details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch theme details' },
      { status: 500 }
    );
  }
}