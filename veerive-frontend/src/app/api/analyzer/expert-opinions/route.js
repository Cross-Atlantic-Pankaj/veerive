import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Source from '@/models/Source';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('themeId');

    if (!themeId) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    // Find all contexts where this theme is tagged
    const contexts = await Context.find({ themes: themeId })
      .populate('posts.postId')
      .lean();

    // Extract all post IDs from the contexts
    const postIds = [];
    contexts.forEach(context => {
      if (context.posts && Array.isArray(context.posts)) {
        context.posts.forEach(postRef => {
          if (postRef.postId && postRef.includeInContainer) {
            postIds.push(postRef.postId._id);
          }
        });
      }
    });

    if (postIds.length === 0) {
      return NextResponse.json({ expertOpinions: [] });
    }

    // Find posts where postType is 'Expert Opinion' and are in our postIds list
    const expertOpinions = await Post.find({
      _id: { $in: postIds },
      postType: 'Expert Opinion'
    })
      .populate('source', 'sourceName sourceType')
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(5) // Get only 5 most recent
      .lean();

    // Transform the data to include source information
    const transformedOpinions = expertOpinions.map(opinion => ({
      _id: opinion._id,
      postTitle: opinion.postTitle,
      summary: opinion.summary,
      sentiment: opinion.sentiment,
      sourceName: opinion.source?.sourceName || 'Unknown Source',
      sourceType: opinion.source?.sourceType || 'Industry Expert',
      sourceUrl: opinion.sourceUrl,
      createdAt: opinion.createdAt
    }));

    return NextResponse.json({ expertOpinions: transformedOpinions });

  } catch (error) {
    console.error('Error fetching expert opinions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch expert opinions',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
