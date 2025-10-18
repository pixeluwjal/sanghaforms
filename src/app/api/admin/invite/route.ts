// app/api/admin/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { sendInvitationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if admin already exists (both active and pending)
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (existingAdmin) {
      if (existingAdmin.status === 'active') {
        return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 400 });
      } else if (existingAdmin.status === 'pending') {
        // Resend invitation for pending admin
        const invitationToken = randomBytes(32).toString('hex');
        const invitationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        existingAdmin.invitationToken = invitationToken;
        existingAdmin.invitationExpires = invitationExpires;
        existingAdmin.role = role;
        await existingAdmin.save();

        const invitationLink = `${process.env.NEXTAUTH_URL}/admin/setup-account?token=${invitationToken}`;
        await sendInvitationEmail(email, invitationLink, role);

        return NextResponse.json({ 
          success: true, 
          message: 'Invitation resent successfully' 
        });
      }
    }

    // Generate invitation token for new admin
    const invitationToken = randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create pending admin
    const admin = new Admin({
      email: email.toLowerCase(),
      role,
      status: 'pending',
      invitationToken,
      invitationExpires,
    });

    await admin.save();

    // Send invitation email
    const invitationLink = `${process.env.NEXTAUTH_URL}/admin/setup-account?token=${invitationToken}`;
    await sendInvitationEmail(email, invitationLink, role);

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully' 
    });

  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}