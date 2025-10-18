// app/api/admin/setup-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Find admin with valid invitation token
    const admin = await Admin.findOne({
      invitationToken: token,
      invitationExpires: { $gt: new Date() },
      status: 'pending'
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid or expired invitation token' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update admin to active status
    admin.password = hashedPassword;
    admin.status = 'active';
    admin.invitationToken = undefined;
    admin.invitationExpires = undefined;
    admin.updatedAt = new Date();

    await admin.save();

    return NextResponse.json({ 
      success: true,
      message: 'Account setup successful'
    });

  } catch (error) {
    console.error('Setup account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}