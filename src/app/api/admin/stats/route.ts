// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import FormResponse from '@/models/FormResponse';
import Admin from '@/models/Admin'; // Import Admin model

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    
    // REMOVE role-based filtering - get ALL forms
    const forms = await Form.find({}); // Empty query to get all forms
    const publishedForms = forms.filter(f => f.status === 'published');
    const draftForms = forms.filter(f => f.status === 'draft');

    // Get total responses from ALL forms
    const responseCount = await FormResponse.countDocuments({});

    // Get recent forms from ALL forms - populate with Admin instead of User
    const recentForms = await Form.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'email name') // This will now work with Admin model
      .lean();

    // Get responses count for each recent form
    const recentFormsWithCounts = await Promise.all(
      recentForms.map(async (form) => {
        const responsesCount = await FormResponse.countDocuments({ 
          formId: form._id 
        });
        return {
          ...form,
          responsesCount
        };
      })
    );

    return NextResponse.json({
      total: forms.length,
      published: publishedForms.length,
      draft: draftForms.length,
      totalResponses: responseCount,
      recentForms: recentFormsWithCounts
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}