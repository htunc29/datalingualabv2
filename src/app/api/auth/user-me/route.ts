import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('user-token');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default-secret') as any;
      
      // Check if it's a user token
      if (decoded.type !== 'user') {
        return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
      }

      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check if user is still approved and active
      if (!user.isApproved || !user.isActive) {
        return NextResponse.json({ error: 'Account not approved or inactive' }, { status: 403 });
      }

      return NextResponse.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organization: user.organization,
          researchArea: user.researchArea
        }
      });
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('User me error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}