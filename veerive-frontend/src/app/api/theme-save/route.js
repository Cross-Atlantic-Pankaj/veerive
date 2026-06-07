import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { themeId, email, action } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(themeId)) {
      return NextResponse.json({ error: 'Invalid theme ID' }, { status: 400 });
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
        (item) => item.SavedpostId.toString() === themeId && item.SavedpostType === 'Theme'
      );

      if (isAlreadySaved) {
        return NextResponse.json({ message: 'Theme already saved' }, { status: 200 });
      }

      user.savedPosts.push({
        SavedpostId: themeId,
        SavedpostType: 'Theme',
        savedAt: new Date(),
      });

      await user.save();

      return NextResponse.json({ message: 'Theme saved successfully' }, { status: 200 });
    } else if (action === 'unsave') {
      const isSaved = user.savedPosts.some(
        (item) => item.SavedpostId.toString() === themeId && item.SavedpostType === 'Theme'
      );

      if (!isSaved) {
        return NextResponse.json({ message: 'Theme not saved' }, { status: 200 });
      }

      user.savedPosts = user.savedPosts.filter(
        (item) => item.SavedpostId.toString() !== themeId || item.SavedpostType !== 'Theme'
      );

      await user.save();

      return NextResponse.json({ message: 'Theme unsaved successfully' }, { status: 200 });
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
    const themeId = searchParams.get('themeId');
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(themeId)) {
      return NextResponse.json({ error: 'Invalid theme ID' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isSaved = user.savedPosts.some(
      (item) => item.SavedpostId.toString() === themeId && item.SavedpostType === 'Theme'
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