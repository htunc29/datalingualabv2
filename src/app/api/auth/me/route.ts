import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Decode session token
    const sessionData = Buffer.from(sessionCookie.value, 'base64').toString();
    const [adminId, timestamp] = sessionData.split(':');
    
    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - parseInt(timestamp);
    if (sessionAge > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    
    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 401 });
    }
    
    return NextResponse.json({
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}