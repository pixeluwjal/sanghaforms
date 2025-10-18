// app/api/admin/forms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    
    // Build query based on role
    const query: any = {};
    if (decoded.role !== 'super_admin') {
      query.createdBy = decoded.adminId;
    }

    const forms = await Form.find(query)
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ forms });

  } catch (error) {
    console.error('Forms fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}