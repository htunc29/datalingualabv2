import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('user-token');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('User logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}