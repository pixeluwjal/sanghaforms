// app/api/forms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { title, description, theme } = await request.json();
    
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate title length
    if (title.length > 100) {
      return NextResponse.json({ error: 'Title must be less than 100 characters' }, { status: 400 });
    }

    // Get creator from token
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
      title: title.trim(),
      description: description?.trim() || '',
      theme: theme || {
        primaryColor: '#7C3AED',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter'
      },
      settings: {
        validityDuration: 30,
        maxResponses: 1000,
        isActive: true,
        showGroupLinks: false,
        whatsappGroupLink: '',
        arrataiGroupLink: ''
      },
      sections: [],
      status: 'draft',
      createdBy: createdBy
    });

    await form.save();

    return NextResponse.json({ 
      success: true, 
      formId: form._id,
      message: 'Form created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Form creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('id');

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json({ error: 'Invalid form ID format' }, { status: 400 });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      form 
    });

  } catch (error) {
    console.error('Form fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { formId, ...updateData } = await request.json();
    
    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json({ error: 'Invalid form ID format' }, { status: 400 });
    }

    // Prevent updating certain fields
    const { _id, createdBy, createdAt, ...safeUpdateData } = updateData;

    const form = await Form.findByIdAndUpdate(
      formId, 
      { 
        ...safeUpdateData, 
        updatedAt: new Date() 
      },
      { 
        new: true,
        runValidators: true // Ensure schema validation runs
      }
    );

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      form,
      message: 'Form updated successfully'
    });

  } catch (error) {
    console.error('Form update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Add DELETE endpoint
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('id');

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json({ error: 'Invalid form ID format' }, { status: 400 });
    }

    const form = await Form.findByIdAndDelete(formId);

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Form deleted successfully'
    });

  } catch (error) {
    console.error('Form deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}