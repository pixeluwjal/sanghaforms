// app/api/admin/forms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting forms API...');
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    console.log('👤 Admin making request:', decoded);

    // Build query based on role
    const query: any = {};
    
    if (decoded.role !== 'super_admin') {
      // For regular admins, only show forms they created
      query.createdBy = decoded.adminId;
    }
    // For super_admin, no filter - show all forms

    console.log('📋 Query being used:', query);

    const forms = await Form.find(query)
      .select('-sections -theme')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📦 Found ${forms.length} forms for admin ${decoded.adminId} (role: ${decoded.role})`);

    return NextResponse.json({ 
      success: true,
      forms 
    });

  } catch (error: any) {
    console.error('❌ Forms fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}