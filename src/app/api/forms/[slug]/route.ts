// app/api/forms/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Form from '@/models/Form';
import FormResponse from '@/models/FormResponse';

// GET - Fetch form by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query to search by both custom slug and _id
    const query: any = {
      'settings.isActive': true,
      status: 'published'
    };

    // Check if slug is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(slug)) {
      // Search by both _id and customSlug to cover all cases
      query.$or = [
        { _id: new mongoose.Types.ObjectId(slug) },
        { 'settings.customSlug': slug }
      ];
    } else {
      // Search only by custom slug
      query['settings.customSlug'] = slug;
    }

    const form = await Form.findOne(query);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or is no longer available' },
        { status: 404 }
      );
    }

    // Return public form data (exclude sensitive info)
    const publicForm = {
      _id: form._id,
      title: form.title,
      description: form.description,
      sections: form.sections.map((section: any) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        order: section.order,
        conditionalRules: section.conditionalRules,
        fields: section.fields.map((field: any) => ({
          id: field.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          required: field.required,
          options: field.options,
          order: field.order
        }))
      })),
      theme: form.theme,
      images: form.images,
      status: form.status,
      createdAt: form.createdAt,
      settings: {
        customSlug: form.settings.customSlug,
        allowMultipleResponses: form.settings.allowMultipleResponses,
        enableProgressSave: form.settings.enableProgressSave,
        showGroupLinks: form.settings.showGroupLinks,
        whatsappGroupLink: form.settings.whatsappGroupLink,
        arrataiGroupLink: form.settings.arrataiGroupLink
      }
    };

    return NextResponse.json(publicForm);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Submit form responses
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { responses, submittedAt } = body;

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // First, find the form to get its ID and type
    const formQuery: any = {
      'settings.isActive': true,
      status: 'published'
    };

    if (mongoose.Types.ObjectId.isValid(slug)) {
      formQuery.$or = [
        { _id: new mongoose.Types.ObjectId(slug) },
        { 'settings.customSlug': slug }
      ];
    } else {
      formQuery['settings.customSlug'] = slug;
    }

    const form = await Form.findOne(formQuery);
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or is no longer available' },
        { status: 404 }
      );
    }

    // Determine collection based on form type (SS or Leads)
    const formType = form.settings.formType || 'ss';
    const collectionName = formType.toLowerCase() === 'leads' ? 'leads' : 'ss';

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate responses structure
    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Invalid responses format' },
        { status: 400 }
      );
    }

    // Create a map of field IDs to field details for quick lookup
    const fieldMap = new Map();
    form.sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        fieldMap.set(field.id, {
          type: field.type,
          label: field.label
        });
      });
    });

    // Enhance responses with field information
    const enhancedResponses = responses.map((response: any) => {
      const fieldInfo = fieldMap.get(response.fieldId);
      return {
        fieldId: response.fieldId,
        fieldType: fieldInfo?.type || 'unknown',
        fieldLabel: fieldInfo?.label || response.fieldId,
        value: response.value
      };
    });

    // Create and save the response with complete field information
    const formResponse = new FormResponse({
      formId: form._id,
      formTitle: form.title,
      formSlug: form.settings.customSlug || form._id.toString(),
      formType: formType,
      collection: collectionName,
      responses: enhancedResponses,
      submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      ipAddress: ipAddress,
      userAgent: userAgent
    });

    await formResponse.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Form response submitted successfully',
      responseId: formResponse._id,
      formTitle: form.title,
      collection: collectionName,
      formType: formType,
      groupLinks: {
        showGroupLinks: form.settings.showGroupLinks,
        whatsappGroupLink: form.settings.whatsappGroupLink,
        arrataiGroupLink: form.settings.arrataiGroupLink
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting form response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}