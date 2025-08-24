import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST() {
  try {
    await dbConnect();
    
    // Check if any admin exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin already exists' });
    }
    
    // Create default admin
    const hashedPassword = await bcrypt.hash('1234', 10);
    const defaultAdmin = new Admin({
      username: 'admin',
      password: hashedPassword
    });
    
    await defaultAdmin.save();
    
    return NextResponse.json({ 
      message: 'Default admin created successfully',
      username: 'admin',
      password: '1234'
    });
    
  } catch (error) {
    console.error('Admin initialization error:', error);
    return NextResponse.json({ error: 'Failed to initialize admin' }, { status: 500 });
  }
}