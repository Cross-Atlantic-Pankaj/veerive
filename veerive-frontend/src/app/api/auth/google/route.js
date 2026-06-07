import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    if (!email) {
      return NextResponse.json({ error: 'Google authentication failed' }, { status: 401 });
    }

    await connectDB();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ googleId: sub, email, name, avatar: picture });
      await user.save();
    }

    const authToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Google login successful',
      token: authToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
