import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Survey from '@/models/Survey';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // Check if user is authenticated
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin-token');
    const userToken = cookieStore.get('user-token');
    
    let isAdmin = false;
    let userId = null;
    
    if (adminToken) {
      try {
        jwt.verify(adminToken.value, process.env.JWT_SECRET || 'default-secret');
        isAdmin = true;
      } catch (jwtError) {
        // Admin token is invalid
      }
    }
    
    if (userToken && !isAdmin) {
      try {
        const decoded = jwt.verify(userToken.value, process.env.JWT_SECRET || 'default-secret') as any;
        if (decoded.type === 'user') {
          userId = decoded.userId;
        }
      } catch (jwtError) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }
    
    if (!isAdmin && !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Find the survey first to check ownership
    const survey = await Survey.findById(id);
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }
    
    // Check if user has permission to delete this survey
    if (!isAdmin && survey.createdBy !== userId) {
      return NextResponse.json({ error: 'You can only delete your own surveys' }, { status: 403 });
    }
    
    await Survey.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 });
  }
}