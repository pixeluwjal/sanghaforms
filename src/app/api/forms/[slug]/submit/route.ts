import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Form from '@/models/Form';
import FormResponse from '@/models/FormResponse';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { responses, submittedAt } = body;

    console.log('🔍 DEBUG: Form submission started');
    console.log('📥 Slug received:', slug);
    console.log('📝 Responses count:', responses?.length);

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build form query dynamically based on slug type
    const formQuery: any = {
      status: 'published',
      'settings.isActive': true
    };

    // Check if slug is a valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(slug);
    console.log('🔍 Slug is valid ObjectId:', isValidObjectId);

    if (isValidObjectId) {
      // If slug is a valid ObjectId, search by _id
      formQuery.$or = [
        { _id: new mongoose.Types.ObjectId(slug) },
        { customLink: slug },
        { 'settings.customSlug': slug }
      ];
    } else {
      // If slug is not a valid ObjectId, search by customLink and customSlug
      formQuery.$or = [
        { customLink: slug },
        { 'settings.customSlug': slug }
      ];
    }

    console.log('🔍 Final form query:', JSON.stringify(formQuery, null, 2));

    const form = await Form.findOne(formQuery);

    console.log('🔍 Form query result:', {
      slug,
      formFound: !!form,
      formTitle: form?.title,
      formCustomLink: form?.customLink,
      formId: form?._id?.toString(),
      formStatus: form?.status,
      formIsActive: form?.settings?.isActive
    });

    if (!form) {
      // Debug: Show what forms are available
      const availableForms = await Form.find({
        status: 'published',
        'settings.isActive': true
      }, 'title customLink _id settings.customSlug status settings.isActive');
      
      console.log('📋 AVAILABLE ACTIVE FORMS:');
      availableForms.forEach(f => {
        console.log(`   - "${f.title}" | customLink: "${f.customLink}" | _id: ${f._id} | customSlug: "${f.settings?.customSlug}"`);
      });

      return NextResponse.json(
        { 
          error: 'Form not found or is no longer available',
          debug: {
            searchedSlug: slug,
            isObjectId: isValidObjectId,
            availableForms: availableForms.map(f => ({
              title: f.title,
              customLink: f.customLink,
              _id: f._id.toString(),
              customSlug: f.settings?.customSlug,
              status: f.status,
              isActive: f.settings?.isActive
            }))
          }
        },
        { status: 404 }
      );
    }

    console.log('✅ FORM FOUND:', form.title);

    // Validate responses
    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Invalid responses format' },
        { status: 400 }
      );
    }

    // Create field map
    const fieldMap = new Map();
    form.sections?.forEach((section: any) => {
      section.fields?.forEach((field: any) => {
        fieldMap.set(field.id, {
          type: field.type,
          label: field.label
        });

        // Handle nested fields
        if (field.nestedFields && Array.isArray(field.nestedFields)) {
          field.nestedFields.forEach((nestedField: any) => {
            fieldMap.set(nestedField.id, {
              type: nestedField.type,
              label: nestedField.label
            });
          });
        }
      });
    });

    // Enhance responses
    const enhancedResponses = responses.map((response: any) => {
      const fieldInfo = fieldMap.get(response.fieldId);
      return {
        fieldId: response.fieldId,
        fieldType: fieldInfo?.type || 'unknown',
        fieldLabel: fieldInfo?.label || response.fieldId,
        value: response.value
      };
    });

    // Check if payment is required
    const requiresPayment = form.settings?.acceptPayments && 
                           form.settings?.paymentAmount && 
                           form.settings.paymentAmount > 0;

    // Extract customer details for payment
    const nameResponse = enhancedResponses.find(r => 
      r.fieldLabel.toLowerCase().includes('name')
    );
    const emailResponse = enhancedResponses.find(r => 
      r.fieldType === 'email'
    );
    const phoneResponse = enhancedResponses.find(r => 
      r.fieldLabel.toLowerCase().includes('phone') || 
      r.fieldLabel.toLowerCase().includes('mobile')
    );

    const customerDetails = {
      name: nameResponse?.value || 'Customer',
      email: emailResponse?.value || '',
      contact: phoneResponse?.value || ''
    };

    // Save to FormResponse collection
    const submission = new FormResponse({
      formId: form._id,
      formTitle: form.title,
      formSlug: form.customLink || form._id.toString(),
      formType: form.settings?.userType || 'lead',
      collectionName: form.settings?.userType === 'swayamsevak' ? 'swayamsevak' : 'leads',
      responses: enhancedResponses,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      submittedAt: new Date(),
      paymentRequired: requiresPayment,
      paymentAmount: requiresPayment ? form.settings.paymentAmount : 0,
      paymentStatus: requiresPayment ? 'pending' : 'not_required',
      customerDetails: customerDetails
    });

    const savedSubmission = await submission.save();
    console.log('💾 Response saved to database with ID:', savedSubmission._id);

    // Check for WhatsApp/Arratai opt-ins
    const whatsappOptin = enhancedResponses.find(r => 
      r.fieldType === 'whatsapp_optin' && r.value === 'true'
    );
    
    const arrataiOptin = enhancedResponses.find(r => 
      r.fieldType === 'arratai_optin' && r.value === 'true'
    );

    console.log('📱 WhatsApp Opt-in:', !!whatsappOptin);
    console.log('👥 Arratai Opt-in:', !!arrataiOptin);

    return NextResponse.json({ 
      success: true, 
      message: 'Form response submitted successfully',
      submissionId: savedSubmission._id.toString(),
      formTitle: form.title,
      userType: form.settings?.userType || 'lead',
      paymentRequired: requiresPayment,
      paymentAmount: requiresPayment ? form.settings.paymentAmount : 0,
      customerDetails,
      groupLinks: {
        showGroupLinks: form.settings?.showGroupLinks || false,
        whatsappGroupLink: form.settings?.whatsappGroupLink || '',
        arrataiGroupLink: form.settings?.arrataiGroupLink || '',
        enableConditionalLinks: form.settings?.enableConditionalLinks || false,
        conditionalGroupLinks: form.settings?.conditionalGroupLinks || []
      },
      optIns: {
        whatsapp: !!whatsappOptin,
        arratai: !!arrataiOptin
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Form submission error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid form identifier' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to submit form response' },
      { status: 500 }
    );
  }
}