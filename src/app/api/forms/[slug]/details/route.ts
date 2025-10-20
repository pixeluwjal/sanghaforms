// app/api/forms/[slug]/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Form from '@/models/Form';

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

    const form = await Form.findOne(query).lean();

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or is no longer available' },
        { status: 404 }
      );
    }

    // Transform the data to ensure nested fields are properly structured
    const transformField = (field: any) => {
      return {
        id: field.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options || [],
        order: field.order,
        conditionalRules: field.conditionalRules || [],
        nestedFields: (field.nestedFields || []).map(transformField)
      };
    };

    const transformSection = (section: any) => {
      return {
        id: section.id,
        title: section.title,
        description: section.description,
        order: section.order,
        conditionalRules: section.conditionalRules || [],
        fields: (section.fields || []).map(transformField)
      };
    };

    const transformedForm = {
      _id: form._id,
      title: form.title,
      description: form.description,
      sections: (form.sections || []).map(transformSection),
      theme: form.theme || {
        primaryColor: '#ea6221',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter'
      },
      images: form.images || {},
      settings: {
        customSlug: form.settings?.customSlug,
        allowMultipleResponses: form.settings?.allowMultipleResponses || false,
        enableProgressSave: form.settings?.enableProgressSave || true,
        showGroupLinks: form.settings?.showGroupLinks || false,
        whatsappGroupLink: form.settings?.whatsappGroupLink || '',
        arrataiGroupLink: form.settings?.arrataiGroupLink || ''
      },
      status: form.status,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    };

    return NextResponse.json(transformedForm);
  } catch (error) {
    console.error('Error fetching form details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}