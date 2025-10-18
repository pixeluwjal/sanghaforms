import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import FormResponse from '@/models/FormResponse';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { formId, formSlug, responses, submittedAt } = await request.json();

    // Verify form exists and is active
    const form = await Form.findOne({ 
      _id: formId,
      customLink: formSlug,
      isActive: true 
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    // Check if form has expired
    if (form.expiresAt && new Date() > new Date(form.expiresAt)) {
      return NextResponse.json(
        { error: 'Form has expired' },
        { status: 410 }
      );
    }

    // Check response limit if enabled
    if (form.settings?.limitResponses) {
      const responseCount = await FormResponse.countDocuments({ formId });
      if (responseCount >= form.settings.maxResponses) {
        return NextResponse.json(
          { error: 'Form has reached maximum response limit' },
          { status: 429 }
        );
      }
    }

    // Save response to database
    const formResponse = new FormResponse({
      formId,
      formSlug,
      responses,
      submittedAt: new Date(submittedAt),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    await formResponse.save();

    return NextResponse.json({
      success: true,
      message: 'Response submitted successfully',
      responseId: formResponse._id
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
}