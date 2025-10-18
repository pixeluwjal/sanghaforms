// app/api/forms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { title, description, theme } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // ADD AUTH TO GET THE CREATOR ID
    const token = request.cookies.get('token')?.value;
    let createdBy = null;
    
    if (token) {
      try {
        const decoded = await verifyToken(token);
        createdBy = decoded.adminId;
      } catch (error) {
        console.log('No valid token, creating form without creator');
      }
    }

    const form = new Form({
      title,
      description,
      theme: theme || {
        primaryColor: '#7C3AED',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter'
      },
      settings: {
        validityDuration: 30,
        maxResponses: 1000,
        isActive: true
      },
      sections: [],
      status: 'draft',
      createdBy: createdBy // ADD THIS LINE
    });

    await form.save();

    return NextResponse.json({ 
      success: true, 
      formId: form._id 
    });

  } catch (error) {
    console.error('Form creation error:', error);
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('id');

    if (!formId) {
      return NextResponse.json({ error: 'Form ID required' }, { status: 400 });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ form });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { formId, ...updateData } = await request.json();
    
    if (!formId) {
      return NextResponse.json({ error: 'Form ID required' }, { status: 400 });
    }

    const form = await Form.findByIdAndUpdate(
      formId, 
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, form });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}