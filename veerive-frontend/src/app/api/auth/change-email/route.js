import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateOTP, sendOTPEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    const { currentEmail, otp, newEmail } = await req.json();

    if (!currentEmail || !otp || !newEmail) {
      return NextResponse.json(
        { error: 'Current email, OTP, and new email are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: currentEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return NextResponse.json(
        { error: 'No OTP request found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      user.otp = undefined;
      await user.save();
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (String(user.otp.code) !== String(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      );
    }

    user.email = newEmail;
    user.otp = undefined;
    await user.save();

    return NextResponse.json({
      message: 'Email updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}