// app/api/admin/responses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import FormResponse from '@/models/FormResponse';
import Form from '@/models/Form';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    
    // Get all forms created by this admin
    let formQuery: any = {};
    if (decoded.role !== 'super_admin') {
      formQuery.createdBy = decoded.adminId;
    }

    const adminForms = await Form.find(formQuery).select('_id title sections settings').lean();
    const adminFormIds = adminForms.map(form => form._id.toString());

    console.log(`📋 Admin has ${adminForms.length} forms`);

    // Get responses only for admin's forms
    const responses = await FormResponse.find({
      formId: { $in: adminFormIds }
    })
    .sort({ submittedAt: -1 })
    .limit(1000)
    .lean();

    console.log(`📦 Found ${responses.length} responses`);

    // Create a field map for each form to get proper labels
    const formFieldMaps = new Map();
    adminForms.forEach(form => {
      const fieldMap = new Map();
      form.sections?.forEach(section => {
        section.fields?.forEach(field => {
          fieldMap.set(field.id, {
            label: field.label,
            type: field.type
          });
          // Add Sangha hierarchy fields
          if (field.type === 'sangha') {
            fieldMap.set(`${field.id}-vibhaag`, {
              label: `${field.label} - Vibhaag`,
              type: 'sangha_hierarchy'
            });
            fieldMap.set(`${field.id}-khanda`, {
              label: `${field.label} - Khanda`,
              type: 'sangha_hierarchy'
            });
            fieldMap.set(`${field.id}-valaya`, {
              label: `${field.label} - Valaya`,
              type: 'sangha_hierarchy'
            });
            fieldMap.set(`${field.id}-milan`, {
              label: `${field.label} - Milan`,
              type: 'sangha_hierarchy'
            });
          }
        });
      });
      formFieldMaps.set(form._id.toString(), fieldMap);
    });

    // Transform responses to include proper field labels and organize data
    const transformedResponses = responses.map(response => {
      const form = adminForms.find(f => f._id.toString() === response.formId.toString());
      const fieldMap = formFieldMaps.get(response.formId.toString()) || new Map();
      
      // Group responses by field and handle Sangha hierarchy
      const organizedResponses: any = {};
      const sanghaGroups = new Map();

      response.responses.forEach((resp: any) => {
        const fieldInfo = fieldMap.get(resp.fieldId);
        const label = fieldInfo?.label || resp.fieldLabel || resp.fieldId;
        
        // Handle Sangha hierarchy fields
        if (resp.fieldId.includes('-vibhaag') || resp.fieldId.includes('-khanda') || 
            resp.fieldId.includes('-valaya') || resp.fieldId.includes('-milan')) {
          
          const baseFieldId = resp.fieldId.split('-')[0];
          if (!sanghaGroups.has(baseFieldId)) {
            sanghaGroups.set(baseFieldId, {
              vibhaag: '',
              khanda: '',
              valaya: '',
              milan: ''
            });
          }
          
          const sanghaData = sanghaGroups.get(baseFieldId);
          if (resp.fieldId.includes('-vibhaag')) {
            sanghaData.vibhaag = resp.value;
          } else if (resp.fieldId.includes('-khanda')) {
            sanghaData.khanda = resp.value;
          } else if (resp.fieldId.includes('-valaya')) {
            sanghaData.valaya = resp.value;
          } else if (resp.fieldId.includes('-milan')) {
            sanghaData.milan = resp.value;
          }
        } else {
          // Regular fields
          organizedResponses[resp.fieldId] = {
            label,
            value: resp.value,
            type: fieldInfo?.type || resp.fieldType
          };
        }
      });

      // Add Sangha hierarchy data to organized responses
      sanghaGroups.forEach((sanghaData, baseFieldId) => {
        const fieldInfo = fieldMap.get(baseFieldId);
        organizedResponses[baseFieldId] = {
          label: fieldInfo?.label || baseFieldId,
          value: `${sanghaData.vibhaag} > ${sanghaData.khanda} > ${sanghaData.valaya} > ${sanghaData.milan}`,
          type: 'sangha_hierarchy',
          details: sanghaData
        };
      });

      // Handle special fields like opt-ins
      const specialFields = {
        whatsapp_optin_consent: {
          label: 'WhatsApp Consent',
          type: 'consent'
        },
        arratai_optin_consent: {
          label: 'Arratai Consent', 
          type: 'consent'
        }
      };

      Object.keys(specialFields).forEach(fieldId => {
        const specialResp = response.responses.find((r: any) => r.fieldId === fieldId);
        if (specialResp) {
          organizedResponses[fieldId] = {
            label: specialFields[fieldId as keyof typeof specialFields].label,
            value: specialResp.value === 'agreed' ? 'Yes' : 'No',
            type: specialFields[fieldId as keyof typeof specialFields].type
          };
        }
      });

      return {
        _id: response._id,
        formId: response.formId.toString(),
        formTitle: form?.title || 'Unknown Form',
        formType: response.formType,
        collection: response.collection,
        submittedAt: response.submittedAt,
        ipAddress: response.ipAddress,
        userAgent: response.userAgent,
        responses: organizedResponses,
        // Raw responses for debugging
        rawResponses: response.responses
      };
    });

    return NextResponse.json({ 
      success: true,
      responses: transformedResponses,
      forms: adminForms.map(form => ({
        _id: form._id,
        title: form.title,
        sections: form.sections
      }))
    });

  } catch (error: any) {
    console.error('❌ Get responses error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}