// app/api/admin/bulk-upload/[id]/extracted-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BulkUpload from '@/models/BulkUpload';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';
import LeadResponse from '@/models/LeadResponse';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    console.log(`📊 Fetching extracted data for upload: ${id}`);
    
    // Get the bulk upload record
    const bulkUpload = await BulkUpload.findById(id).lean();
    if (!bulkUpload) {
      return NextResponse.json(
        { error: 'Bulk upload not found' },
        { status: 404 }
      );
    }
    
    // Get the actual data records based on target collection
    let records = [];
    if (bulkUpload.targetCollection === 'SwayamsevakResponse') {
      records = await SwayamsevakResponse.find({ 
        $or: [
          { source: bulkUpload.source },
          { formTitle: 'Bulk Upload - Swayamsevak' }
        ]
      })
      .sort({ submittedAt: -1 })
      .lean();
    } else if (bulkUpload.targetCollection === 'LeadResponse') {
      records = await LeadResponse.find({ 
        $or: [
          { source: bulkUpload.source },
          { formTitle: 'Bulk Upload - Lead' }
        ]
      })
      .sort({ submittedAt: -1 })
      .lean();
    }
    
    console.log(`📊 Found ${records.length} records for upload ${id}`);
    
    // Enhanced transformation with complete response data
    const transformedRecords = records.map(record => {
      const baseRecord: any = {
        _id: record._id,
        // Core fields
        name: record.name,
        source: record.source,
        // Organizational structure
        khanda: (record as any).khanda,
        valaya: (record as any).valaya,
        milanGhat: (record as any).milanGhat,
        // Lead-specific
        ...((record as any).leadScore !== undefined && { leadScore: (record as any).leadScore }),
        ...((record as any).status !== undefined && { status: (record as any).status }),
        // Timestamps
        submittedAt: record.submittedAt,
        createdAt: record.createdAt,
        // Complete responses array
        responses: record.responses || []
      };
      
      // Flatten all responses for easy table display
      const flattenedData: any = {};
      if (record.responses && Array.isArray(record.responses)) {
        record.responses.forEach((response: any) => {
          if (response.fieldId && response.value !== undefined && response.value !== null && response.value !== '') {
            // Create readable key from fieldLabel or fieldId
            const readableKey = response.fieldLabel 
              ? response.fieldLabel.replace(/\s+/g, '_')
              : response.fieldId;
            flattenedData[readableKey] = response.value;
            
            // Keep original fieldId mapping
            flattenedData[response.fieldId] = response.value;
          }
        });
      }
      
      return {
        ...baseRecord,
        ...flattenedData
      };
    });
    
    // Extract all unique columns for frontend
    const allColumns = new Set<string>([
      '_id', 'name', 'source', 'khanda', 'valaya', 'milanGhat', 
      'leadScore', 'status', 'submittedAt', 'createdAt'
    ]);
    
    transformedRecords.forEach(record => {
      Object.keys(record).forEach(key => {
        if (typeof record[key] !== 'object') { // Exclude arrays/objects
          allColumns.add(key);
        }
      });
    });
    
    return NextResponse.json({
      upload: bulkUpload,
      records: transformedRecords,
      totalRecords: records.length,
      availableColumns: Array.from(allColumns),
      summary: {
        totalRecords: records.length,
        withResponses: records.filter(r => r.responses && r.responses.length > 0).length,
        averageResponses: records.length > 0 
          ? (records.reduce((sum, r) => sum + (r.responses?.length || 0), 0) / records.length).toFixed(1)
          : 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching extracted data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extracted data: ' + (error as Error).message },
      { status: 500 }
    );
  }
}