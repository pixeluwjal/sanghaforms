// app/api/forms/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { formId, formData } = await request.json();
    
    // Support both direct formData and formId lookup
    let sourceFormData = formData;
    
    // If formId is provided, fetch the form from database
    if (formId && !formData) {
      if (!mongoose.Types.ObjectId.isValid(formId)) {
        return NextResponse.json({ error: 'Invalid form ID format' }, { status: 400 });
      }
      
      const existingForm = await Form.findById(formId);
      if (!existingForm) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 });
      }
      
      sourceFormData = existingForm.toObject();
    }
    
    if (!sourceFormData) {
      return NextResponse.json({ error: 'Form data or formId is required' }, { status: 400 });
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

    // Ensure form_name12 is present - use form_name if form_name12 doesn't exist
    const formName12 = sourceFormData.form_name12 || 
                      sourceFormData.form_name || 
                      `${sourceFormData.title} (Copy)`;

    // Create a new form with the duplicated data
    const duplicatedForm = new Form({
      title: `${sourceFormData.title} (Copy)`,
      form_name12: formName12,
      description: sourceFormData.description,
      theme: sourceFormData.theme || {
        primaryColor: '#7C3AED',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter'
      },
      sections: sourceFormData.sections || [],
      settings: {
        ...sourceFormData.settings,
        customSlug: '', // Reset custom slug for duplicated form
        isActive: true, // Ensure duplicated form is active
      },
      images: sourceFormData.images || {},
      status: 'draft',
      createdBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await duplicatedForm.save();

    console.log('Form duplicated successfully:', {
      id: duplicatedForm._id,
      title: duplicatedForm.title,
      form_name12: duplicatedForm.form_name12,
      sectionsCount: duplicatedForm.sections?.length || 0
    });

    return NextResponse.json({ 
      success: true, 
      formId: duplicatedForm._id,
      form: {
        _id: duplicatedForm._id,
        title: duplicatedForm.title,
        form_name: duplicatedForm.form_name12,
        form_name12: duplicatedForm.form_name12,
        description: duplicatedForm.description,
        status: duplicatedForm.status,
        createdAt: duplicatedForm.createdAt,
        updatedAt: duplicatedForm.updatedAt,
        settings: duplicatedForm.settings,
        createdBy: duplicatedForm.createdBy
      },
      message: 'Form duplicated successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Form duplication error:', error);
    
    // Handle validation errors specifically
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'Form validation failed',
        details: errors
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to duplicate form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}