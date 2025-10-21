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

    // REMOVED the role-based filtering - fetch ALL forms
    console.log('📋 Fetching ALL forms (no filters applied)');

    const forms = await Form.find({}) // Empty query to get all forms
      .select('-sections -theme')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📦 Found ${forms.length} forms total`);

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