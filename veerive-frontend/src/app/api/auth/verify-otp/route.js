import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return NextResponse.json(
        { error: 'No pending registration found. Please sign up again.' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(pendingUser.otpExpiry)) {
      await PendingUser.findByIdAndDelete(pendingUser._id);
      return NextResponse.json(
        { error: 'OTP has expired. Please sign up again.' },
        { status: 400 }
      );
    }

    if (String(pendingUser.otp) !== String(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: pendingUser.email });
    if (existingUser) {
      await PendingUser.findByIdAndDelete(pendingUser._id);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified: true
    });

    await PendingUser.findByIdAndDelete(pendingUser._id);

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Account created and verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 