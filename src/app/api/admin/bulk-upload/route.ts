// app/api/admin/bulk-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BulkUpload from '@/models/BulkUpload';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';
import LeadResponse from '@/models/LeadResponse';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    console.log('Fetching bulk uploads...');
    
    // Try to populate, but if it fails, get uploads without populate
    let uploads;
    try {
      uploads = await BulkUpload.find()
        .sort({ createdAt: -1 })
        .populate('uploadedBy', 'email')
        .lean();
    } catch (populateError) {
      console.warn('Populate failed, fetching without populate:', populateError);
      uploads = await BulkUpload.find()
        .sort({ createdAt: -1 })
        .lean();
      
      // Add email field manually if populate failed
      uploads = uploads.map(upload => ({
        ...upload,
        uploadedBy: { email: 'system@admin.com' } // Default fallback
      }));
    }
    
    console.log(`Found ${uploads.length} uploads`);
    
    return NextResponse.json(Array.isArray(uploads) ? uploads : []);
  } catch (error) {
    console.error('Error fetching bulk uploads:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetCollection = formData.get('targetCollection') as 'SwayamsevakResponse' | 'LeadResponse';
    const uploadType = formData.get('uploadType') as 'append' | 'replace';
    const source = formData.get('source') as string;
    const sanghaHierarchy = formData.get('sanghaHierarchy') as string;
    const enableAIParsing = formData.get('enableAIParsing') === 'true';

    if (!file || !targetCollection || !source) {
      return NextResponse.json(
        { error: 'File, target collection, and source are required' },
        { status: 400 }
      );
    }

    // Validate sangha hierarchy for SwayamsevakResponse
    if (targetCollection === 'SwayamsevakResponse') {
      let sanghaData = {};
      try {
        sanghaData = sanghaHierarchy ? JSON.parse(sanghaHierarchy) : {};
      } catch (error) {
        console.error('Error parsing sangha hierarchy:', error);
      }
      
      if (!sanghaData || !(sanghaData as any).khandaId) {
        return NextResponse.json(
          { error: 'Khanda selection is required for Swayamsevak responses' },
          { status: 400 }
        );
      }
    }

    // Parse sangha hierarchy if provided
    let sanghaData = {};
    try {
      sanghaData = sanghaHierarchy ? JSON.parse(sanghaHierarchy) : {};
    } catch (error) {
      console.error('Error parsing sangha hierarchy:', error);
    }

    // Create uploads directory in public folder for better access
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    console.log('Saving file to:', filePath);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Verify file was saved
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error('File was not saved successfully');
    }

    console.log('File saved successfully, size:', buffer.length, 'bytes');

    // Create a default admin ID for testing
    const defaultAdminId = new mongoose.Types.ObjectId('000000000000000000000000');

    // Create bulk upload record
    const bulkUpload = new BulkUpload({
      filename: uniqueFilename,
      originalName: file.name,
      filePath,
      mimeType: file.type,
      size: file.size,
      targetCollection,
      uploadType,
      source,
      sanghaHierarchy: sanghaData,
      enableAIParsing,
      uploadedBy: defaultAdminId,
      status: 'processing',
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      metadata: {
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        encoding: '7bit',
        enableAIParsing
      }
    });

    await bulkUpload.save();
    console.log('Bulk upload record created:', bulkUpload._id);

    // Process the file in background with AI parsing option
    processBulkUpload(bulkUpload._id, filePath, targetCollection, uploadType, source, sanghaData, enableAIParsing)
      .catch(error => console.error('Background processing error:', error));

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully. Processing started.',
      uploadId: bulkUpload._id
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Enhanced background processing with better file handling
async function processBulkUpload(
  uploadId: any, 
  filePath: string, 
  targetCollection: 'SwayamsevakResponse' | 'LeadResponse',
  uploadType: 'append' | 'replace',
  source: string,
  sanghaHierarchy: any,
  enableAIParsing: boolean = false
) {
  try {
    await dbConnect();
    const bulkUpload = await BulkUpload.findById(uploadId);
    if (!bulkUpload) {
      console.error('Bulk upload not found:', uploadId);
      return;
    }

    console.log('Processing file:', filePath);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read and parse file
    const fileExtension = path.extname(filePath).toLowerCase();
    let records: any[] = [];

    try {
      if (fileExtension === '.csv') {
        const csv = require('csv-parser');
        
        records = await new Promise((resolve, reject) => {
          const results: any[] = [];
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: any) => results.push(data))
            .on('end', () => {
              console.log(`Parsed ${results.length} CSV records`);
              resolve(results);
            })
            .on('error', reject);
        });
      } else if (fileExtension === '.json') {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        records = JSON.parse(fileContent);
        if (!Array.isArray(records)) {
          throw new Error('JSON file must contain an array of records');
        }
        console.log(`Parsed ${records.length} JSON records`);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        const XLSX = require('xlsx');
        
        // Read file as buffer first
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        records = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Parsed ${records.length} Excel records from sheet: ${sheetName}`);
        
        if (records.length === 0) {
          throw new Error('Excel file appears to be empty or could not be parsed');
        }
      } else {
        throw new Error(`Unsupported file format: ${fileExtension}`);
      }
    } catch (parseError) {
      console.error('Error parsing file:', parseError);
      await BulkUpload.findByIdAndUpdate(uploadId, {
        status: 'failed',
        errors: [`File parsing error: ${(parseError as Error).message}`]
      });
      return;
    }

    // Update total records count
    bulkUpload.totalRecords = records.length;
    await bulkUpload.save();

    console.log(`Processing ${records.length} records...`);

    let successfulRecords = 0;
    let failedRecords = 0;
    const errors: string[] = [];

    // Handle replace upload type
    if (uploadType === 'replace') {
      try {
        if (targetCollection === 'SwayamsevakResponse') {
          const deletedCount = await SwayamsevakResponse.deleteMany({ source });
          console.log(`Cleared ${deletedCount.deletedCount} existing Swayamsevak records`);
        } else if (targetCollection === 'LeadResponse') {
          const deletedCount = await LeadResponse.deleteMany({ source });
          console.log(`Cleared ${deletedCount.deletedCount} existing Lead records`);
        }
      } catch (deleteError) {
        console.error('Error clearing existing records:', deleteError);
        errors.push(`Failed to clear existing records: ${deleteError}`);
      }
    }

    // Process each record with AI enhancement if enabled
    for (let i = 0; i < records.length; i++) {
      try {
        const record = records[i];
        let enhancedRecord = record;
        
        // Enhance with AI if enabled
        if (enableAIParsing && process.env.GEMINI_API_KEY) {
          try {
            enhancedRecord = await enhanceWithGeminiAI(record, targetCollection, sanghaHierarchy);
            console.log(`AI enhanced record ${i + 1}`);
          } catch (aiError) {
            console.warn(`AI enhancement failed for record ${i + 1}:`, aiError);
            // Continue with original record if AI fails
          }
        }
        
        if (targetCollection === 'SwayamsevakResponse') {
          await processSwayamsevakResponseRecord(enhancedRecord, source, sanghaHierarchy);
        } else if (targetCollection === 'LeadResponse') {
          await processLeadResponseRecord(enhancedRecord, source, sanghaHierarchy);
        }

        successfulRecords++;
      } catch (error: any) {
        failedRecords++;
        const errorMsg = `Record ${i + 1}: ${error.message || 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Update progress periodically
      if (i % 10 === 0 || i === records.length - 1) {
        try {
          await BulkUpload.findByIdAndUpdate(uploadId, {
            processedRecords: i + 1,
            successfulRecords,
            failedRecords,
            errors: errors.slice(-50)
          });
          console.log(`Progress: ${i + 1}/${records.length} records processed`);
        } catch (updateError) {
          console.error('Error updating progress:', updateError);
        }
      }
    }

    // Update final status
    const finalStatus = failedRecords === 0 ? 'completed' : 
                       successfulRecords === 0 ? 'failed' : 'partial';
    
    await BulkUpload.findByIdAndUpdate(uploadId, {
      status: finalStatus,
      processedRecords: records.length,
      successfulRecords,
      failedRecords
    });

    console.log(`Bulk upload ${uploadId} completed: ${successfulRecords} successful, ${failedRecords} failed`);

    // Clean up uploaded file after processing
    try {
      fs.unlinkSync(filePath);
      console.log('Cleaned up uploaded file:', filePath);
    } catch (cleanupError) {
      console.warn('Could not clean up file:', cleanupError);
    }

  } catch (error) {
    console.error('Error processing bulk upload:', error);
    await BulkUpload.findByIdAndUpdate(uploadId, {
      status: 'failed',
      errors: [`Processing error: ${(error as Error).message}`]
    });
  }
}

// Gemini AI Enhancement Function
async function enhanceWithGeminiAI(data: any, recordType: 'SwayamsevakResponse' | 'LeadResponse', sanghaHierarchy: any) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = recordType === 'SwayamsevakResponse' 
    ? `Analyze this swayamsevak data and enhance it: ${JSON.stringify(data)}. 
       Extract and structure:
       - Personal details: name
       - Organization hierarchy: khanda, valaya, milanGhat
       - Clean and standardize all fields
       Return enhanced JSON with proper field mapping.`
    : `Analyze this lead data and enhance it: ${JSON.stringify(data)}.
       Extract and structure:
       - Contact information: name
       - Lead details: interests, requirements, potential score
       - Organization context: khanda, valaya, milanGhat
       - Clean and categorize data
       Return enhanced JSON with proper field mapping.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
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
            maxOutputTokens: 2000,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const result = await response.json();
    const enhancedText = result.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = enhancedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return data; // Return original if no JSON found
  } catch (error) {
    console.error('Gemini AI enhancement failed:', error);
    throw error;
  }
}

// Enhanced record processing functions
async function processSwayamsevakResponseRecord(data: any, source: string, sanghaHierarchy: any) {
  try {
    const hierarchyNames = await resolveHierarchyNames(sanghaHierarchy);

    const swayamsevakResponse = new SwayamsevakResponse({
      formId: new mongoose.Types.ObjectId(data.formId || '000000000000000000000000'),
      formTitle: data.formTitle || 'Bulk Upload - Swayamsevak',
      formSlug: data.formSlug || 'bulk-upload-swayamsevak',
      responses: parseSwayamsevakResponses(data),
      source: source,
      // Khanda, Valaya, Milan Ghat fields
      khanda: data.khanda || hierarchyNames.khandaName,
      valaya: data.valaya || hierarchyNames.valayaName,
      milanGhat: data.milanGhat || hierarchyNames.milanName,
      // Personal information
      name: data.name || data.fullName || 'Unknown Name',
      // Metadata
      ipAddress: data.ipAddress || '0.0.0.0',
      userAgent: data.userAgent || 'Bulk Upload',
    });

    await swayamsevakResponse.save();
    console.log('Swayamsevak record saved');
  } catch (error) {
    console.error('Error processing Swayamsevak record:', error);
    throw error;
  }
}

async function processLeadResponseRecord(data: any, source: string, sanghaHierarchy: any) {
  try {
    const hierarchyNames = await resolveHierarchyNames(sanghaHierarchy);

    const leadResponse = new LeadResponse({
      formId: new mongoose.Types.ObjectId(data.formId || '000000000000000000000000'),
      formTitle: data.formTitle || 'Bulk Upload - Lead',
      formSlug: data.formSlug || 'bulk-upload-lead',
      responses: parseLeadResponses(data),
      leadScore: parseInt(data.leadScore) || calculateLeadScore(data),
      status: data.status || 'new',
      source: source,
      // Organizational hierarchy fields
      khanda: data.khanda || hierarchyNames.khandaName,
      valaya: data.valaya || hierarchyNames.valayaName,
      milanGhat: data.milanGhat || hierarchyNames.milanName,
      // Contact information
      name: data.name || data.fullName,
      // Metadata
      ipAddress: data.ipAddress || '0.0.0.0',
      userAgent: data.userAgent || 'Bulk Upload',
    });

    await leadResponse.save();
    console.log('Lead record saved');
  } catch (error) {
    console.error('Error processing Lead record:', error);
    throw error;
  }
}

// Helper function to calculate lead score based on data quality
function calculateLeadScore(data: any): number {
  let score = 0;
  if (data.name) score += 50;
  if (data.interests || data.requirements) score += 30;
  if (data.contacted) score += 20;
  return Math.min(score, 100);
}

// Helper function to resolve hierarchy names
async function resolveHierarchyNames(sanghaHierarchy: any) {
  let khandaName = 'Unknown Khanda';
  let valayaName = 'Unknown Valaya';
  let milanName = 'Unknown Milan';

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/organization`);
    if (response.ok) {
      const orgData = await response.json();
      const organization = orgData.organizations?.[0];

      if (organization?.khandas && sanghaHierarchy) {
        const khanda = organization.khandas.find((k: any) => k._id === sanghaHierarchy.khandaId);
        if (khanda) {
          khandaName = khanda.name;
          const valaya = khanda.valays?.find((v: any) => v._id === sanghaHierarchy.valayaId);
          if (valaya) {
            valayaName = valaya.name;
            const milan = valaya.milans?.find((m: any) => m._id === sanghaHierarchy.milanId);
            if (milan) {
              milanName = milan.name;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error resolving hierarchy names:', error);
  }

  return { khandaName, valayaName, milanName };
}

function parseSwayamsevakResponses(data: any) {
  const responses: any[] = [];
  const excludedFields = [
    'formId', 'formTitle', 'formSlug', 'source', 'khanda', 'valaya', 'milanGhat',
    'name', 'fullName', 'ipAddress', 'userAgent'
  ];
  
  for (const [key, value] of Object.entries(data)) {
    if (!excludedFields.includes(key) && value !== undefined && value !== '') {
      responses.push({
        fieldId: key,
        fieldType: typeof value === 'number' ? 'number' : 'text',
        fieldLabel: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        value: value
      });
    }
  }
  
  return responses;
}

function parseLeadResponses(data: any) {
  const responses: any[] = [];
  const excludedFields = [
    'formId', 'formTitle', 'formSlug', 'leadScore', 'status', 'source',
    'name', 'fullName', 'ipAddress', 'userAgent', 'khanda', 'valaya', 'milanGhat'
  ];
  
  for (const [key, value] of Object.entries(data)) {
    if (!excludedFields.includes(key) && value !== undefined && value !== '') {
      responses.push({
        fieldId: key,
        fieldType: typeof value === 'number' ? 'number' : 'text',
        fieldLabel: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        value: value
      });
    }
  }
  
  return responses;
}