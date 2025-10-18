// app/api/admin/validate-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
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

    return NextResponse.json({ 
      valid: true,
      email: admin.email,
      role: admin.role
    });

  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}