// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import FormResponse from '@/models/FormResponse';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    
    // Build query based on role
    const formQuery: any = {};
    if (decoded.role !== 'super_admin') {
      formQuery.createdBy = decoded.adminId;
    }

    const forms = await Form.find(formQuery);
    const publishedForms = forms.filter(f => f.status === 'published');
    const draftForms = forms.filter(f => f.status === 'draft');

    // Get total responses
    const responseCount = await FormResponse.countDocuments({
      formId: { $in: forms.map(f => f._id) }
    });

    // Get recent forms
    const recentForms = await Form.find(formQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'email name')
      .lean();

    return NextResponse.json({
      total: forms.length,
      published: publishedForms.length,
      draft: draftForms.length,
      totalResponses: responseCount,
      recentForms: recentForms.map(form => ({
        ...form,
        responsesCount: 0 // You might want to aggregate this
      }))
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}