import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Form from '@/models/Form';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, status, settings, theme } = body;

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Validate slug availability if enabling custom slug
    if (settings.enableCustomSlug && settings.customSlug) {
      const slugCheckQuery: any = {
        _id: { $ne: new mongoose.Types.ObjectId(formId) },
        $or: [
          { 'settings.customSlug': settings.customSlug }
        ],
        'settings.isActive': true
      };

      // Also check if slug matches any form ID (if it's a valid ObjectId)
      if (mongoose.Types.ObjectId.isValid(settings.customSlug)) {
        slugCheckQuery.$or.push({ _id: new mongoose.Types.ObjectId(settings.customSlug) });
      }

      const existingFormWithSlug = await Form.findOne(slugCheckQuery);
      
      if (existingFormWithSlug) {
        return NextResponse.json({ 
          error: 'The chosen slug is already taken by another form' 
        }, { status: 400 });
      }
    }

    // Update the form
    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      {
        status,
        settings: {
          ...settings,
          isActive: status === 'published',
          // Ensure customSlug is properly set
          customSlug: settings.enableCustomSlug ? settings.customSlug : undefined
        },
        theme,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      form: updatedForm 
    });

  } catch (error: any) {
    console.error('Error updating form settings:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}