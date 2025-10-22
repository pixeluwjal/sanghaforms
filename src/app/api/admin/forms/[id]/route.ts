// app/api/admin/forms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const formId = params.id;
    const updateData = await request.json();
    
    console.log('Updating form:', formId, updateData);

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json({ error: 'Invalid form ID format' }, { status: 400 });
    }

    // Check if form exists
    const existingForm = await Form.findById(formId);
    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Prepare update data
    const safeUpdateData: any = {
      updatedAt: new Date()
    };

    // Handle form_name12 update
    if (updateData.form_name !== undefined) {
      safeUpdateData.form_name12 = updateData.form_name.trim();
    }

    // Handle other fields
    if (updateData.title !== undefined) {
      safeUpdateData.title = updateData.title.trim();
    }
    if (updateData.description !== undefined) {
      safeUpdateData.description = updateData.description.trim();
    }
    if (updateData.status !== undefined) {
      safeUpdateData.status = updateData.status;
    }

    // Validate lengths
    if (safeUpdateData.form_name12 && safeUpdateData.form_name12.length > 100) {
      return NextResponse.json({ error: 'Form name must be less than 100 characters' }, { status: 400 });
    }
    if (safeUpdateData.title && safeUpdateData.title.length > 100) {
      return NextResponse.json({ error: 'Title must be less than 100 characters' }, { status: 400 });
    }

    const form = await Form.findByIdAndUpdate(
      formId, 
      safeUpdateData,
      { 
        new: true,
        runValidators: true
      }
    );

    return NextResponse.json({ 
      success: true, 
      form: {
        _id: form._id,
        title: form.title,
        form_name: form.form_name12, // Map for frontend
        form_name12: form.form_name12,
        description: form.description,
        status: form.status,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        settings: form.settings,
        createdBy: form.createdBy
      },
      message: 'Form updated successfully'
    });

  } catch (error) {
    console.error('Form update error:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'Validation failed',
        details: errors
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to update form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const formId = params.id;

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