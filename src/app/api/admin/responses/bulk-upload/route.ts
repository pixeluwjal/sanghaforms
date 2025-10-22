import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import Form from '@/models/Form';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';
import FormResponse from '@/models/FormResponse';

// Gemini AI configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`;

async function analyzeWithGemini(data: any[], fileType: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `
    Analyze this form response data and help me map it to our database schema. 
    The data is from a ${fileType} file and needs to be imported into one of these collections: 
    "leads", "swayamsevak", or "form_responses".

    Based on the field names and data, determine the most appropriate collection:
    - leads: Contains contact info like name, email, phone, location - for potential contacts
    - swayamsevak: Contains volunteer data with sangha hierarchy fields
    - form_responses: Generic form submissions without specific contact/volunteer data

    Sample data to analyze:
    ${JSON.stringify(data.slice(0, 5), null, 2)}

    Respond with ONLY JSON format:
    {
      "collectionType": "leads" | "swayamsevak" | "form_responses",
      "fieldMappings": {
        "sourceColumnName": "targetFieldName"
      },
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation"
    }
  `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const result = await response.json();
    const analysisText = result.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not parse Gemini response as JSON');
    }
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
}

function detectCollectionType(row: any): string {
  const keys = Object.keys(row).map(k => k.toLowerCase());
  
  // Check for swayamsevak fields
  const swayamsevakFields = ['swayamsevakid', 'sangha', 'area', 'district', 'state', 'ghata', 'valaya', 'khanda', 'vibhaag'];
  const hasSwayamsevakFields = swayamsevakFields.some(field => 
    keys.some(key => key.includes(field))
  );
  
  if (hasSwayamsevakFields) {
    return 'swayamsevak';
  }
  
  // Check for lead fields (contact information)
  const contactFields = ['name', 'email', 'phone', 'mobile', 'contact', 'address', 'location', 'locality'];
  const hasContactFields = contactFields.some(field => 
    keys.some(key => key.includes(field))
  );
  
  if (hasContactFields) {
    return 'leads';
  }
  
  // Default to form_responses
  return 'form_responses';
}

function applyFieldMapping(row: any, mapping: any): any {
  const mappedRow: any = {};
  
  // Apply direct mappings from AI
  if (mapping?.fieldMappings) {
    Object.entries(mapping.fieldMappings).forEach(([source, target]) => {
      if (row[source] !== undefined) {
        mappedRow[target] = row[source];
      }
    });
  }

  // Auto-detect and map common fields
  for (const [key, value] of Object.entries(row)) {
    const lowerKey = key.toLowerCase();
    
    // Contact fields
    if ((lowerKey.includes('name') || lowerKey.includes('full name')) && !mappedRow.name) {
      mappedRow.name = value;
    }
    if (lowerKey.includes('email') && !mappedRow.email) {
      mappedRow.email = value;
    }
    if ((lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('contact')) && !mappedRow.phone) {
      mappedRow.phone = value;
    }
    if ((lowerKey.includes('location') || lowerKey.includes('locality') || lowerKey.includes('address')) && !mappedRow.location) {
      mappedRow.location = value;
    }
    
    // Lead fields
    if (lowerKey.includes('status') && !mappedRow.status) mappedRow.status = value;
    if (lowerKey.includes('score') && !mappedRow.leadScore) mappedRow.leadScore = value;
    if (lowerKey.includes('source') && !mappedRow.source) mappedRow.source = value;
    
    // Swayamsevak fields
    if ((lowerKey.includes('id') || lowerKey.includes('swayamsevak')) && !mappedRow.swayamsevakId) mappedRow.swayamsevakId = value;
    if (lowerKey.includes('sangha') && !mappedRow.sangha) mappedRow.sangha = value;
    if (lowerKey.includes('area') && !mappedRow.area) mappedRow.area = value;
    if (lowerKey.includes('district') && !mappedRow.district) mappedRow.district = value;
    if (lowerKey.includes('state') && !mappedRow.state) mappedRow.state = value;
  }

  // Copy any unmapped fields
  for (const [key, value] of Object.entries(row)) {
    if (!mappedRow[key] && value !== undefined && value !== null && value !== '') {
      mappedRow[key] = value;
    }
  }

  return mappedRow;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const useAI = formData.get('useAI') === 'true';
    const targetCollection = formData.get('collection') as string; // Optional: force specific collection

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Parse the file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (rawData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data found in file' },
        { status: 400 }
      );
    }

    console.log(`📊 Processing ${rawData.length} rows from ${file.name}`);

    let fieldMapping = null;
    let collectionType = targetCollection; // Use provided collection or auto-detect

    // Use Gemini AI for intelligent mapping if enabled
    if (useAI && GEMINI_API_KEY && !targetCollection) {
      try {
        const fileExtension = file.name.split('.').pop() || 'csv';
        fieldMapping = await analyzeWithGemini(rawData.slice(0, 5), fileExtension);
        collectionType = fieldMapping.collectionType;
        console.log('🤖 Gemini AI Analysis Result:', fieldMapping);
      } catch (error) {
        console.warn('⚠️ Gemini AI analysis failed, using fallback mapping:', error);
      }
    }

    // Auto-detect collection type if not provided and AI didn't work
    if (!collectionType && rawData.length > 0) {
      collectionType = detectCollectionType(rawData[0]);
      console.log(`🔍 Auto-detected collection type: ${collectionType}`);
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      aiAnalysis: fieldMapping,
      collectionType: collectionType
    };

    // Get all forms for mapping (use a default form if none exists)
    let forms = await Form.find({}).select('_id title form_name12 sections settings.userType');
    
    if (forms.length === 0) {
      console.log('📝 No forms found, creating a default form for bulk upload');
      // Create a default form for bulk uploads
      const defaultForm = new Form({
        title: 'Bulk Upload Form',
        form_name12: 'bulk-upload-form',
        sections: [{
          fields: [
            { id: 'name', label: 'Name', type: 'text' },
            { id: 'email', label: 'Email', type: 'email' },
            { id: 'phone', label: 'Phone', type: 'text' },
            { id: 'location', label: 'Location', type: 'text' }
          ]
        }],
        settings: { userType: 'general' }
      });
      await defaultForm.save();
      forms = [defaultForm];
    }

    const form = forms[0]; // Use the first form for all responses

    for (let i = 0; i < rawData.length; i++) {
      const rawRow = rawData[i];
      
      try {
        // Apply field mapping
        const row = fieldMapping 
          ? applyFieldMapping(rawRow, fieldMapping)
          : applyFieldMapping(rawRow, { fieldMappings: {} });

        // Determine final collection type
        const finalCollectionType = targetCollection || collectionType || detectCollectionType(row);

        // Prepare responses array from unmapped fields
        const responses = [];
        for (const [key, value] of Object.entries(row)) {
          // Skip metadata and special fields
          if (['_id', 'formId', 'formTitle', 'formName', 'collection', 'submittedAt', 'ipAddress', 'userAgent', 
               'leadScore', 'status', 'source', 'name', 'email', 'phone', 'location',
               'swayamsevakId', 'sangha', 'area', 'district', 'state', 'dateOfBirth'].includes(key)) {
            continue;
          }

          if (value !== undefined && value !== null && value !== '') {
            // Try to find matching field in form
            const field = form.sections?.flatMap(s => s.fields || []).find(f => 
              f.id === key || f.label.toLowerCase() === key.toLowerCase() || f.label.toLowerCase().includes(key.toLowerCase())
            );

            responses.push({
              fieldId: field?.id || key,
              fieldType: field?.type || 'text',
              fieldLabel: field?.label || key,
              value: value
            });
          }
        }

        // Base response data
        const baseResponseData = {
          formId: form._id,
          formTitle: row.formTitle || form.title,
          formSlug: row.formName || form.form_name12,
          responses: responses,
          submittedAt: row.submittedAt ? new Date(row.submittedAt) : new Date(),
          ipAddress: row.ipAddress || 'bulk_upload',
          userAgent: row.userAgent || 'bulk_upload'
        };

        let savedResponse;
        
        if (finalCollectionType === 'leads') {
          savedResponse = await LeadResponse.create({
            ...baseResponseData,
            leadScore: parseInt(row.leadScore) || 0,
            status: row.status || 'new',
            source: row.source || 'bulk_upload',
            name: row.name || 'Unknown',
            email: row.email,
            phone: row.phone
          });
          console.log(`✅ Created lead: ${row.name || 'Unknown'}`);
          
        } else if (finalCollectionType === 'swayamsevak') {
          savedResponse = await SwayamsevakResponse.create({
            ...baseResponseData,
            swayamsevakId: row.swayamsevakId || `SW${Date.now()}_${i}`,
            sangha: row.sangha || 'Not specified',
            area: row.area || 'Not specified',
            district: row.district,
            state: row.state,
            name: row.name || 'Unknown',
            email: row.email,
            phone: row.phone,
            dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined
          });
          console.log(`✅ Created swayamsevak: ${row.name || 'Unknown'}`);
          
        } else {
          // form_responses
          savedResponse = await FormResponse.create({
            ...baseResponseData,
            formType: row.formType || 'general',
            collection: 'form_responses'
          });
          console.log(`✅ Created form response for: ${row.name || 'Unknown'}`);
        }

        results.success++;
        
      } catch (error) {
        results.failed++;
        const errorMessage = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        results.errors.push(errorMessage);
        console.error(`❌ Error in row ${i + 1}:`, error);
      }
    }

    console.log(`🎉 Bulk upload completed: ${results.success} successful, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      ...results,
      aiUsed: !!fieldMapping,
      totalProcessed: rawData.length
    });

  } catch (error) {
    console.error('💥 Error in bulk upload:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process bulk upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}