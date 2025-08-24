import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Survey from '@/models/Survey';

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
      
      if (decoded.type !== 'user') {
        return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
      }

      // Return only surveys created by this user
      const surveys = await Survey.find({ 
        createdBy: decoded.userId, 
        createdByType: 'user' 
      }).sort({ createdAt: -1 });
      
      return NextResponse.json(surveys);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching user surveys:', error);
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}