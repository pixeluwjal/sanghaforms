// app/api/admin/responses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import FormResponse from '@/models/FormResponse'; // Import from correct model
import Form from '@/models/Form';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    
    // Get all forms created by this admin
    let formQuery: any = {};
    if (decoded.role !== 'super_admin') {
      formQuery.createdBy = decoded.adminId;
    }

    const adminForms = await Form.find(formQuery).select('_id title settings').lean();
    const adminFormIds = adminForms.map(form => form._id.toString());

    console.log(`📋 Admin has ${adminForms.length} forms`);
    console.log(`📋 Form IDs:`, adminFormIds);

    // Get responses only for admin's forms
    const responses = await FormResponse.find({
      formId: { $in: adminFormIds }
    })
    .populate('formId', 'title') // Populate form title
    .sort({ submittedAt: -1 })
    .limit(1000)
    .lean();

    console.log(`📦 Found ${responses.length} responses`);

    return NextResponse.json({ 
      success: true,
      responses,
      forms: adminForms
    });

  } catch (error: any) {
    console.error('❌ Get responses error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}