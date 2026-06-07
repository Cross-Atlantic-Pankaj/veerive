import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { contextId, email, action } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(contextId)) {
      return NextResponse.json({ error: 'Invalid context ID' }, { status: 400 });
    }

    if (!['save', 'unsave'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'save') {
      const isAlreadySaved = user.savedPosts.some(
        (post) => post.SavedpostId.toString() === contextId && post.SavedpostType === 'Context'
      );

      if (isAlreadySaved) {
        return NextResponse.json({ message: 'Context already saved' }, { status: 200 });
      }

      user.savedPosts.push({
        SavedpostId: contextId,
        SavedpostType: 'Context',
        savedAt: new Date(),
      });

      await user.save();

      return NextResponse.json({ message: 'Context saved successfully' }, { status: 200 });
    } else if (action === 'unsave') {
      const isSaved = user.savedPosts.some(
        (post) => post.SavedpostId.toString() === contextId && post.SavedpostType === 'Context'
      );

      if (!isSaved) {
        return NextResponse.json({ message: 'Context not saved' }, { status: 200 });
      }

      user.savedPosts = user.savedPosts.filter(
        (post) => post.SavedpostId.toString() !== contextId || post.SavedpostType !== 'Context'
      );

      await user.save();

      return NextResponse.json({ message: 'Context unsaved successfully' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const contextId = searchParams.get('contextId');
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(contextId)) {
      return NextResponse.json({ error: 'Invalid context ID' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isSaved = user.savedPosts.some(
      (post) => post.SavedpostId.toString() === contextId && post.SavedpostType === 'Context'
    );

    return NextResponse.json({ isSaved }, { status: 200 });
  } catch (error) {
    console.error('Error checking saved status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}