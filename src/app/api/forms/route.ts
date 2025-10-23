// app/api/forms/route.ts - Updated
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
      form_name12: title.trim(),
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
        arrataiGroupLink: '',
        pageTitle: title.trim() // Set initial page title
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
          forms = await Form.find({ createdBy: decoded.adminId })
            .sort({ updatedAt: -1 })
            .select('-sections -theme');
        } catch (error) {
          forms = await Form.find().sort({ updatedAt: -1 }).select('-sections -theme');
        }
      } else {
        forms = await Form.find().sort({ updatedAt: -1 }).select('-sections -theme');
      }

      const formsWithCounts = forms.map(form => ({
        ...form.toObject(),
        responsesCount: Math.floor(Math.random() * 100)
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

    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json({ error: 'Invalid form ID format' }, { status: 400 });
    }

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

    // Validate page title length if provided
    if (updateData.settings?.pageTitle && updateData.settings.pageTitle.length > 60) {
      return NextResponse.json({ error: 'Page title must be less than 60 characters' }, { status: 400 });
    }

    // Prepare update data
    const allowedFields = [
      'title',
      'form_name12',
      'description',
      'status',
      'settings',
      'theme',
      'sections',
      'images'
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
    if (safeUpdateData.settings?.pageTitle) safeUpdateData.settings.pageTitle = safeUpdateData.settings.pageTitle.trim();

    // FIXED: Handle images merging properly
 // In your PUT handler, update the images section:
if (updateData.images) {
  console.log('🖼️ Updating images - RAW DATA:', updateData.images);
  
  // FIXED: Handle nested images structure
  let imagesToUpdate = updateData.images;
  
  // If images is nested (images.images), extract the inner images object
  if (updateData.images.images && typeof updateData.images.images === 'object') {
    console.log('🖼️ Detected nested images structure, extracting...');
    imagesToUpdate = {
      ...updateData.images.images,
      ...updateData.images // Merge with top-level properties if any
    };
  }
  
  console.log('🖼️ Processed images for update:', imagesToUpdate);
  
  // Get existing images or create empty object
  const existingImages = existingForm.images || {};
  
  // Merge images properly
  safeUpdateData.images = {
    logo: imagesToUpdate.logo !== undefined ? imagesToUpdate.logo : existingImages.logo || '',
    banner: imagesToUpdate.banner !== undefined ? imagesToUpdate.banner : existingImages.banner || '',
    background: imagesToUpdate.background !== undefined ? imagesToUpdate.background : existingImages.background || '',
    favicon: imagesToUpdate.favicon !== undefined ? imagesToUpdate.favicon : existingImages.favicon || ''
  };
  
  console.log('🖼️ Final merged images:', safeUpdateData.images);
}

    console.log('📦 Final update data:', {
      images: safeUpdateData.images,
      settings: safeUpdateData.settings,
      theme: safeUpdateData.theme
    });

    const form = await Form.findByIdAndUpdate(
      formId, 
      safeUpdateData,
      { 
        new: true,
        runValidators: true
      }
    );

    console.log('✅ Form updated successfully:', {
      formId: form._id,
      images: form.images,
      hasFavicon: !!form.images?.favicon,
      settings: form.settings
    });

    return NextResponse.json({ 
      success: true, 
      form: {
        _id: form._id,
        title: form.title,
        form_name12: form.form_name12,
        description: form.description,
        status: form.status,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        settings: form.settings,
        theme: form.theme,
        images: form.images,
        sections: form.sections,
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

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('id');

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

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