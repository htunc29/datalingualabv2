import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Survey from '@/models/Survey';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    await dbConnect();
    const surveys = await Survey.find({}).sort({ createdAt: -1 });
    return NextResponse.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Check if user is authenticated and get user info
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin-token');
    const userToken = cookieStore.get('user-token');
    
    let createdBy = null;
    let createdByType = 'admin';
    
    if (userToken) {
      try {
        const decoded = jwt.verify(userToken.value, process.env.JWT_SECRET || 'default-secret') as any;
        if (decoded.type === 'user') {
          createdBy = decoded.userId;
          createdByType = 'user';
        }
      } catch (jwtError) {
        return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
      }
    } else if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken.value, process.env.JWT_SECRET || 'default-secret') as any;
        createdBy = decoded.adminId || 'admin';
        createdByType = 'admin';
      } catch (jwtError) {
        return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const surveyData = {
      ...body,
      shareableId: uuidv4(),
      createdBy,
      createdByType
    };
    
    const survey = new Survey(surveyData);
    await survey.save();
    
    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    console.error('Error creating survey:', error);
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}