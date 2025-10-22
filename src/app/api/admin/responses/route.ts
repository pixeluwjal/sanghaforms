import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Form from '@/models/Form';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting to fetch responses...');

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Fetch all forms first
    const forms = await Form.find({})
      .select('_id title form_name12 sections settings.userType')
      .lean();

    console.log(`📋 Found ${forms.length} forms`);

    // Fetch responses from BOTH collections
    const [leadResponses, swayamsevakResponses] = await Promise.all([
      LeadResponse.find({})
        .populate('formId', 'title form_name12')
        .sort({ submittedAt: -1 })
        .lean(),
      SwayamsevakResponse.find({})
        .populate('formId', 'title form_name12')
        .sort({ submittedAt: -1 })
        .lean()
    ]);

    console.log(`📥 Lead responses: ${leadResponses.length}`);
    console.log(`🕉️ Swayamsevak responses: ${swayamsevakResponses.length}`);

    // Process lead responses
    const processedLeadResponses = leadResponses.map(response => {
      const form = forms.find(f => f._id.toString() === response.formId?._id?.toString());
      
      // Create a proper responses object
      const responsesObj: any = {};
      if (response.responses && Array.isArray(response.responses)) {
        response.responses.forEach((resp: any) => {
          responsesObj[resp.fieldId] = {
            label: resp.fieldLabel || 'Unknown Field',
            value: resp.value,
            type: resp.fieldType || 'text'
          };
        });
      }

      return {
        _id: response._id?.toString(),
        formId: response.formId?._id?.toString(),
        formTitle: response.formTitle || response.formId?.title || 'Unknown Form',
        formName: response.formId?.form_name12 || response.formId?.title || 'Unknown Form',
        formType: 'lead',
        collection: 'leads',
        submittedAt: response.submittedAt || response.createdAt,
        ipAddress: response.ipAddress || 'unknown',
        userAgent: response.userAgent || 'unknown',
        responses: responsesObj,
        rawResponses: response.responses || []
      };
    });

    // Process swayamsevak responses
    const processedSwayamsevakResponses = swayamsevakResponses.map(response => {
      const form = forms.find(f => f._id.toString() === response.formId?._id?.toString());
      
      // Create a proper responses object
      const responsesObj: any = {};
      if (response.responses && Array.isArray(response.responses)) {
        response.responses.forEach((resp: any) => {
          responsesObj[resp.fieldId] = {
            label: resp.fieldLabel || 'Unknown Field',
            value: resp.value,
            type: resp.fieldType || 'text'
          };
        });
      }

      return {
        _id: response._id?.toString(),
        formId: response.formId?._id?.toString(),
        formTitle: response.formTitle || response.formId?.title || 'Unknown Form',
        formName: response.formId?.form_name12 || response.formId?.title || 'Unknown Form',
        formType: 'swayamsevak',
        collection: 'swayamsevak',
        submittedAt: response.submittedAt || response.createdAt,
        ipAddress: response.ipAddress || 'unknown',
        userAgent: response.userAgent || 'unknown',
        responses: responsesObj,
        rawResponses: response.responses || []
      };
    });

    // Combine all responses
    const allResponses = [...processedLeadResponses, ...processedSwayamsevakResponses];
    
    console.log(`🎯 Total responses fetched: ${allResponses.length}`);

    return NextResponse.json({
      success: true,
      responses: allResponses,
      forms: forms.map(form => ({
        _id: form._id.toString(),
        title: form.title,
        form_name12: form.form_name12,
        sections: form.sections || [],
        userType: form.settings?.userType || 'swayamsevak'
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching responses:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch responses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}