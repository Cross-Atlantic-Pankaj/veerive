import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';
import { generateOTP, sendOTPEmail } from '@/lib/mail';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 4);

    const hashedPassword = await bcrypt.hash(password, 10);

    await PendingUser.findOneAndDelete({ email });

    await PendingUser.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json({
      message: 'OTP sent to your email for verification',
      email: email
    }, { status: 200 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 