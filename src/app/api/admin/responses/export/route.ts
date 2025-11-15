import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';
import Form from '@/models/Form';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting export process...');

    // Parse request body
    const body = await request.json();
    const { responseIds, format = 'csv', filters = {} } = body;

    console.log('📦 Export request received:', {
      responseIdsCount: responseIds?.length || 0,
      format,
      filters
    });

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query based on filters and selected IDs
    let query: any = {};

    // Filter by response IDs if provided
    if (responseIds && responseIds.length > 0) {
      query._id = { $in: responseIds };
    }

    // Apply additional filters
    if (filters.form && filters.form !== 'all') {
      query.formId = filters.form;
    }

    if (filters.collection && filters.collection !== 'all') {
      // This will be handled separately for each collection
    }

    console.log('🔍 Query for export:', query);

    // Fetch responses from both collections
    const [leadResponses, swayamsevakResponses] = await Promise.all([
      filters.collection === 'all' || filters.collection === 'leads' 
        ? LeadResponse.find(query)
            .populate('formId', 'title form_name12')
            .lean()
        : [],
      
      filters.collection === 'all' || filters.collection === 'swayamsevak'
        ? SwayamsevakResponse.find(query)
            .populate('formId', 'title form_name12')
            .lean()
        : []
    ]);

    console.log(`📥 Export data fetched: ${leadResponses.length} leads, ${swayamsevakResponses.length} swayamsevak`);

    // Combine and process responses
    const allResponses = [
      ...leadResponses.map(response => ({
        ...response,
        collection: 'leads',
        _id: response._id?.toString()
      })),
      ...swayamsevakResponses.map(response => ({
        ...response,
        collection: 'swayamsevak',
        _id: response._id?.toString()
      }))
    ];

    if (allResponses.length === 0) {
      console.log('❌ No responses found for export');
      return NextResponse.json(
        { error: 'No responses found to export' },
        { status: 400 }
      );
    }

    // Get all unique field labels for CSV headers
    const allFieldLabels = new Set<string>();
    allResponses.forEach(response => {
      if (response.responses && Array.isArray(response.responses)) {
        response.responses.forEach((resp: any) => {
          if (resp.fieldLabel) {
            allFieldLabels.add(resp.fieldLabel);
          }
        });
      }
    });

    const fieldLabels = Array.from(allFieldLabels);

    // Prepare CSV data
    const csvHeaders = [
      'Response ID',
      'Form Title',
      'Form Name',
      'Collection',
      'Submitted At',
      'IP Address',
      ...fieldLabels
    ];

    const csvRows = allResponses.map(response => {
      const baseData = [
        response._id || '',
        response.formTitle || response.formId?.title || '',
        response.formId?.form_name12 || response.formId?.title || '',
        response.collection,
        new Date(response.submittedAt || response.createdAt).toISOString(),
        response.ipAddress || ''
      ];

      // Map field values in the same order as headers
      const fieldValues = fieldLabels.map(label => {
        if (response.responses && Array.isArray(response.responses)) {
          const field = response.responses.find((r: any) => r.fieldLabel === label);
          return field ? String(field.value || '').replace(/"/g, '""') : '';
        }
        return '';
      });

      return [...baseData, ...fieldValues];
    });

    // Create CSV content
    const csvContent = [
      csvHeaders.map(header => `"${header}"`).join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    console.log(`✅ Export completed: ${allResponses.length} responses, ${fieldLabels.length} fields`);

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="form-responses-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Export error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export responses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'Export API is working. Use POST method with export parameters.',
      example: {
        method: 'POST',
        body: {
          responseIds: ['optional_array_of_ids'],
          format: 'csv',
          filters: {
            form: 'form_id',
            collection: 'leads',
            dateRange: '7',
            searchTerm: 'search_text'
          }
        }
      }
    },
    { status: 200 }
  );
}