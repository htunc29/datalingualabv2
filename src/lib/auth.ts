import { NextRequest } from 'next/server';

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return false;
    }
    
    // Decode session token
    const sessionData = Buffer.from(sessionCookie.value, 'base64').toString();
    const [adminId, timestamp] = sessionData.split(':');
    
    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - parseInt(timestamp);
    if (sessionAge > 24 * 60 * 60 * 1000) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function getAdminFromSession(request: NextRequest): Promise<string | null> {
  try {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return null;
    }
    
    const sessionData = Buffer.from(sessionCookie.value, 'base64').toString();
    const [adminId, timestamp] = sessionData.split(':');
    
    const sessionAge = Date.now() - parseInt(timestamp);
    if (sessionAge > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return adminId;
  } catch (error) {
    return null;
  }
}