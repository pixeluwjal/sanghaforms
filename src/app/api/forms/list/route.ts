// app/api/forms/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const forms = await Form.find({})
      .select('title description theme sections settings status createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);

    return NextResponse.json({ 
      success: true,
      forms: forms.map(form => ({
        _id: form._id.toString(),
        title: form.title,
        description: form.description,
        theme: form.theme,
        sections: form.sections,
        settings: form.settings,
        status: form.status,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt
      }))
    });

  } catch (error) {
    console.error('Forms list error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch forms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}