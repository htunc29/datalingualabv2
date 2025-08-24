import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { action, banReason, banDuration } = body;

    if (!action || !['approve', 'reject', 'ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updateData: any = {};
    
    if (action === 'approve') {
      updateData.isApproved = true;
      updateData.isActive = true;
      updateData.approvedAt = new Date();
      updateData.approvedBy = 'admin'; // In a real app, you'd get this from the session
    } else if (action === 'reject') {
      updateData.isApproved = false;
      updateData.isActive = false;
    } else if (action === 'ban') {
      console.log('Processing ban action:', { banReason, banDuration });
      
      if (!banReason) {
        return NextResponse.json({ error: 'Ban reason is required' }, { status: 400 });
      }
      
      updateData.isBanned = true;
      updateData.banReason = banReason;
      updateData.banDuration = banDuration || null; // null for permanent ban
      updateData.bannedAt = new Date();
      updateData.bannedBy = 'admin'; // In a real app, you'd get this from the session
      
      // Calculate ban expiration date if duration is provided
      if (banDuration && banDuration > 0) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + banDuration);
        updateData.banExpiresAt = expirationDate;
        console.log('Temporary ban set to expire at:', expirationDate);
      } else {
        updateData.banExpiresAt = null; // Permanent ban
        console.log('Permanent ban set');
      }
      
      console.log('Ban update data:', updateData);
    } else if (action === 'unban') {
      updateData.isBanned = false;
      updateData.banReason = null;
      updateData.banDuration = null;
      updateData.bannedAt = null;
      updateData.bannedBy = null;
      updateData.banExpiresAt = null;
    }

    console.log('Updating user with data:', updateData);
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      console.log('User not found with id:', id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('User updated successfully:', {
      id: user._id,
      email: user.email,
      isBanned: user.isBanned,
      banReason: user.banReason,
      bannedAt: user.bannedAt,
      banExpiresAt: user.banExpiresAt
    });

    // Send welcome email if user was approved
    if (action === 'approve' && user.isEmailVerified) {
      try {
        await sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the approval process if email fails
      }
    }

    return NextResponse.json({
      message: `User ${action}ed successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}