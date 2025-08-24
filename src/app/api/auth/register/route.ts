import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email, password, firstName, lastName, organization, researchArea, purpose } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !organization || !researchArea || !purpose) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification code (6-digit number)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user (not approved by default, email not verified)
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      organization,
      researchArea,
      purpose,
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
      isApproved: false,
      isActive: true
    });

    await user.save();

    // Send verification email
    console.log('Generated verification code:', verificationCode);
    console.log('Verification expires at:', verificationExpires);
    
    const emailResult = await sendVerificationEmail(user.email, verificationCode);
    
    if (!emailResult.success) {
      // If email sending fails, still return success but mention the issue
      console.error('Failed to send verification email:', emailResult.error);
    } else {
      console.log('Verification email sent successfully to:', user.email);
    }

    // Return success without sensitive data
    return NextResponse.json({
      message: 'Registration successful. Please check your email for verification code.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
        isEmailVerified: user.isEmailVerified,
        isApproved: user.isApproved
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}