import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'Your account has been deactivated. Please contact the administrator.' 
      }, { status: 403 });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email address before logging in.' 
      }, { status: 403 });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return NextResponse.json({ 
        error: 'Your account is pending approval. Please wait for administrator approval.' 
      }, { status: 403 });
    }

    // Check if user is banned
    if (user.isBanned) {
      // Check if ban has expired
      if (user.banExpiresAt && new Date() > user.banExpiresAt) {
        // Ban has expired, automatically unban the user
        await User.findByIdAndUpdate(user._id, {
          isBanned: false,
          banReason: null,
          banDuration: null,
          bannedAt: null,
          bannedBy: null,
          banExpiresAt: null
        });
      } else {
        // User is still banned
        const banInfo: any = {
          reason: user.banReason,
          bannedAt: user.bannedAt,
        };

        if (user.banExpiresAt) {
          banInfo.expiresAt = user.banExpiresAt;
          banInfo.daysRemaining = Math.ceil((user.banExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        } else {
          banInfo.isPermanent = true;
        }

        return NextResponse.json({ 
          error: 'Your account has been banned.',
          banInfo
        }, { status: 403 });
      }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        type: 'user' // Distinguish from admin tokens
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
        researchArea: user.researchArea
      }
    });

  } catch (error) {
    console.error('User login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}