// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    
    let admins;
    
    // Super admins can view all admins
    if (decoded.role === 'super_admin') {
      admins = await Admin.find()
        .select('-password -invitationToken')
        .populate('createdBy', 'email role')
        .sort({ createdAt: -1 });
    } 
    // Regular admins can only view admins they created
    else {
      admins = await Admin.find({ createdBy: decoded.adminId })
        .select('-password -invitationToken')
        .populate('createdBy', 'email role')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ admins });

  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}