import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Form from '@/models/Form';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';

// GET - Fetch form by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const query: any = {
      'settings.isActive': true,
      status: 'published'
    };

    if (mongoose.Types.ObjectId.isValid(slug)) {
      query.$or = [
        { _id: new mongoose.Types.ObjectId(slug) },
        { 'settings.customSlug': slug }
      ];
    } else {
      query['settings.customSlug'] = slug;
    }

    const form = await Form.findOne(query);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found or is no longer available' },
        { status: 404 }
      );
    }

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
          order: field.order,
          conditionalRules: field.conditionalRules,
          nestedFields: field.nestedFields
        }))
      })),
      theme: form.theme,
      images: form.images,
      status: form.status,
      createdAt: form.createdAt,
      settings: {
        userType: form.settings.userType,
        customSlug: form.settings.customSlug,
        allowMultipleResponses: form.settings.allowMultipleResponses,
        enableProgressSave: form.settings.enableProgressSave,
        showGroupLinks: form.settings.showGroupLinks,
        whatsappGroupLink: form.settings.whatsappGroupLink,
        arrataiGroupLink: form.settings.arrataiGroupLink,
        enableConditionalLinks: form.settings.enableConditionalLinks,
        conditionalGroupLinks: form.settings.conditionalGroupLinks
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

// POST - Submit form responses to SPECIFIC collection based on userType
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { responses, submittedAt } = body;

    console.log('📥 Form submission received for slug:', slug);
    console.log('📝 Responses count:', responses?.length);

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find the form
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
      console.log('❌ Form not found for slug:', slug);
      return NextResponse.json(
        { error: 'Form not found or is no longer available' },
        { status: 404 }
      );
    }

    console.log('📋 Form found:', form.title);
    console.log('👥 Form userType:', form.settings.userType);

    const userType = form.settings.userType || 'swayamsevak';
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Invalid responses format' },
        { status: 400 }
      );
    }

    // Create field map for enhanced responses
    const fieldMap = new Map();
    form.sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        fieldMap.set(field.id, {
          type: field.type,
          label: field.label
        });
        
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

    let savedResponse;
    let collectionName;

    // Save to SPECIFIC collection based on userType
    if (userType === 'lead') {
      console.log('💼 Saving to LEAD collection...');
      collectionName = 'leads';

      // Extract lead-specific information
      const name = enhancedResponses.find(r => 
        r.fieldLabel.toLowerCase().includes('name') || 
        r.fieldType === 'text'
      )?.value || '';

      const email = enhancedResponses.find(r => 
        r.fieldType === 'email'
      )?.value || '';

      const phone = enhancedResponses.find(r => 
        r.fieldLabel.toLowerCase().includes('phone') || 
        r.fieldLabel.toLowerCase().includes('mobile')
      )?.value || '';

      const leadResponse = new LeadResponse({
        formId: form._id,
        formTitle: form.title,
        formSlug: form.settings.customSlug || form._id.toString(),
        responses: enhancedResponses,
        // Lead-specific fields
        name: name,
        email: email,
        phone: phone,
        leadScore: calculateLeadScore(enhancedResponses),
        status: 'new',
        source: 'form_submission',
        ipAddress: ipAddress,
        userAgent: userAgent
      });
      
      savedResponse = await leadResponse.save();
      console.log('✅ Saved to LEAD collection with ID:', savedResponse._id);

    } else {
      console.log('🕉️ Saving to SWAYAMSEVAK collection...');
      collectionName = 'swayamsevak';

      // Extract swayamsevak-specific information
      const swayamsevakId = enhancedResponses.find(r => 
        r.fieldLabel.toLowerCase().includes('id') ||
        r.fieldLabel.toLowerCase().includes('swayamsevak')
      )?.value || '';

      const sangha = enhancedResponses.find(r => 
        r.fieldType === 'sangha'
      )?.value || '';

      const area = enhancedResponses.find(r => 
        r.fieldLabel.toLowerCase().includes('area')
      )?.value || '';

      const name = enhancedResponses.find(r => 
        r.fieldLabel.toLowerCase().includes('name')
      )?.value || '';

      const email = enhancedResponses.find(r => 
        r.fieldType === 'email'
      )?.value || '';

      const phone = enhancedResponses.find(r => 
        r.fieldLabel.toLowerCase().includes('phone') || 
        r.fieldLabel.toLowerCase().includes('mobile')
      )?.value || '';

      const swayamsevakResponse = new SwayamsevakResponse({
        formId: form._id,
        formTitle: form.title,
        formSlug: form.settings.customSlug || form._id.toString(),
        responses: enhancedResponses,
        // Swayamsevak-specific fields
        swayamsevakId: swayamsevakId,
        sangha: sangha,
        area: area,
        name: name,
        email: email,
        phone: phone,
        ipAddress: ipAddress,
        userAgent: userAgent
      });
      
      savedResponse = await swayamsevakResponse.save();
      console.log('✅ Saved to SWAYAMSEVAK collection with ID:', savedResponse._id);
    }

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
      message: `Form response submitted successfully to ${collectionName} collection`,
      responseId: savedResponse._id,
      formTitle: form.title,
      userType: userType,
      collection: collectionName,
      groupLinks: {
        showGroupLinks: form.settings.showGroupLinks,
        whatsappGroupLink: form.settings.whatsappGroupLink,
        arrataiGroupLink: form.settings.arrataiGroupLink
      },
      optIns: {
        whatsapp: !!whatsappOptin,
        arratai: !!arrataiOptin
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error submitting form response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate lead score
function calculateLeadScore(responses: any[]): number {
  let score = 0;
  
  responses.forEach(response => {
    if (response.fieldType === 'email' && response.value) score += 25;
    if (response.fieldType === 'phone' && response.value) score += 25;
    if (response.fieldLabel.toLowerCase().includes('name') && response.value) score += 15;
    if (response.fieldLabel.toLowerCase().includes('interest') && response.value) score += 20;
    if (response.fieldType === 'whatsapp_optin' && response.value === 'true') score += 15;
  });
  
  return Math.min(score, 100);
}