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
      form_name12: title.trim(), // Initialize form_name with title
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

    if (formId) {
      // Single form request
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
    } else {
      // Multiple forms request (for admin panel)
      const token = request.cookies.get('token')?.value;
      let forms;

      if (token) {
        try {
          const decoded = await verifyToken(token);
          // Fetch forms created by this user
          forms = await Form.find({ createdBy: decoded.adminId })
            .sort({ updatedAt: -1 })
            .select('-sections -theme'); // Exclude heavy fields for listing
        } catch (error) {
          // If token is invalid, return all forms (or handle as needed)
          forms = await Form.find().sort({ updatedAt: -1 }).select('-sections -theme');
        }
      } else {
        forms = await Form.find().sort({ updatedAt: -1 }).select('-sections -theme');
      }

      // Add responses count to each form
      const formsWithCounts = forms.map(form => ({
        ...form.toObject(),
        responsesCount: Math.floor(Math.random() * 100) // Replace with actual responses count from your database
      }));

      return NextResponse.json({ 
        success: true,
        forms: formsWithCounts
      });
    }

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

    // Check if form exists
    const existingForm = await Form.findById(formId);
    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Validate form_name12 length if provided
    if (updateData.form_name12 && updateData.form_name12.length > 100) {
      return NextResponse.json({ error: 'Form name must be less than 100 characters' }, { status: 400 });
    }

    // Validate title length if provided
    if (updateData.title && updateData.title.length > 100) {
      return NextResponse.json({ error: 'Title must be less than 100 characters' }, { status: 400 });
    }

    // Prepare update data - only allow specific fields to be updated
    const allowedFields = [
      'title',
      'form_name12', // Make sure this is included
      'description',
      'status',
      'settings',
      'theme',
      'sections',
      'images' // FIXED: Added missing comma
    ];

    const safeUpdateData: any = {
      updatedAt: new Date()
    };

    // Only include allowed fields
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        safeUpdateData[key] = updateData[key];
      }
    });

    // Trim string fields
    if (safeUpdateData.title) safeUpdateData.title = safeUpdateData.title.trim();
    if (safeUpdateData.form_name12) safeUpdateData.form_name12 = safeUpdateData.form_name12.trim();
    if (safeUpdateData.description) safeUpdateData.description = safeUpdateData.description.trim();

    const form = await Form.findByIdAndUpdate(
      formId, 
      safeUpdateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    return NextResponse.json({ 
      success: true, 
      form: {
        _id: form._id,
        title: form.title,
        form_name12: form.form_name12, // Return the updated form_name12
        description: form.description,
        status: form.status,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        settings: form.settings,
        theme: form.theme,
        images: form.images, // Include images in response
        sections: form.sections,
        createdBy: form.createdBy
      },
      message: 'Form updated successfully'
    });

  } catch (error) {
    console.error('Form update error:', error);
    
    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'Validation failed',
        details: errors
      }, { status: 400 });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({ 
        error: 'Form with this name already exists'
      }, { status: 400 });
    }

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