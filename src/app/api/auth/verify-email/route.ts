import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, verificationCode } = await request.json();

    console.log('Verification request:', { email, verificationCode });

    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // First, let's find the user and see what verification code they have
    const userCheck = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', userCheck ? {
      email: userCheck.email,
      storedCode: userCheck.emailVerificationCode,
      expires: userCheck.emailVerificationExpires,
      isExpired: userCheck.emailVerificationExpires ? userCheck.emailVerificationExpires < new Date() : 'No expiry date'
    } : 'No user found');

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationCode: verificationCode,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      // More detailed error checking
      const userForEmail = await User.findOne({ email: email.toLowerCase() });
      if (!userForEmail) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 400 }
        );
      }
      
      if (userForEmail.emailVerificationCode !== verificationCode) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }
      
      if (userForEmail.emailVerificationExpires && userForEmail.emailVerificationExpires < new Date()) {
        return NextResponse.json(
          { error: 'Verification code has expired' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: 'Email verified successfully. Please wait for admin approval.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}