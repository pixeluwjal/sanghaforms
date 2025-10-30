// app/api/forms/[slug]/details/route.ts - UPDATED
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
        defaultValue: field.defaultValue || '',
        order: field.order,
        conditionalRules: field.conditionalRules || [],
        nestedFields: (field.nestedFields || []).map(transformField),
        customData: field.customData || {}
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

    // FIXED: Properly handle images structure
    const images = form.images || {};
    const settings = form.settings || {};
    
    // 🆕 CRITICAL FIX: Include conditionalGroupLinks and enableConditionalLinks
    const transformedForm = {
      _id: form._id,
      title: form.title,
      form_name12: form.form_name12,
      description: form.description,
      sections: (form.sections || []).map(transformSection),
      theme: form.theme || {
        primaryColor: '#ea6221',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter'
      },
      images: {
        logo: images.logo || '',
        banner: images.banner || '',
        background: images.background || '',
        favicon: images.favicon || ''
      },
      settings: {
        // 🆕 ADD THESE CRITICAL FIELDS:
        enableConditionalLinks: settings.enableConditionalLinks || false,
        conditionalGroupLinks: settings.conditionalGroupLinks || [],
        
        // Existing fields:
        customSlug: settings.customSlug,
        allowMultipleResponses: settings.allowMultipleResponses || false,
        enableProgressSave: settings.enableProgressSave || true,
        showGroupLinks: settings.showGroupLinks || false,
        whatsappGroupLink: settings.whatsappGroupLink || '',
        arrataiGroupLink: settings.arrataiGroupLink || '',
        pageTitle: settings.pageTitle || form.title || 'Form',
        isActive: settings.isActive !== false,
        userType: settings.userType || 'swayamsevak',
        validityDuration: settings.validityDuration || 1440,
        maxResponses: settings.maxResponses || 1000,
        collectEmail: settings.collectEmail !== false,
        enableCustomSlug: settings.enableCustomSlug || false,
        defaultSource: settings.defaultSource || ''
      },
      status: form.status,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    };

    console.log('🔍 Form details fetched:', {
      pageTitle: transformedForm.settings.pageTitle,
      favicon: transformedForm.images.favicon,
      hasFavicon: !!transformedForm.images.favicon,
      // 🆕 LOG CONDITIONAL LINKS:
      enableConditionalLinks: transformedForm.settings.enableConditionalLinks,
      conditionalGroupLinksCount: transformedForm.settings.conditionalGroupLinks?.length,
      conditionalGroupLinks: transformedForm.settings.conditionalGroupLinks
    });

    return NextResponse.json(transformedForm);
  } catch (error) {
    console.error('Error fetching form details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}