import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import FormResponse from '@/models/FormResponse';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';

export async function POST(request: NextRequest) {
  try {
    const { responseIds, format = 'csv', filters } = await request.json();

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query based on filters
    let query: any = {};

    if (responseIds && responseIds.length > 0) {
      query._id = { $in: responseIds };
    }

    if (filters) {
      if (filters.form && filters.form !== 'all') {
        query.formId = filters.form;
      }
      if (filters.collection && filters.collection !== 'all') {
        // This will be handled by querying specific collections
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filters.dateRange));
        query.submittedAt = { $gte: daysAgo };
      }
    }

    // Fetch data from all collections
    const [formResponses, leadResponses, swayamsevakResponses] = await Promise.all([
      FormResponse.find(query).populate('formId', 'title form_name12'),
      LeadResponse.find(query).populate('formId', 'title form_name12'),
      SwayamsevakResponse.find(query).populate('formId', 'title form_name12')
    ]);

    // Combine and process all responses
    const allResponses = [
      ...formResponses.map(r => ({ ...r.toObject(), collection: 'form_responses' })),
      ...leadResponses.map(r => ({ ...r.toObject(), collection: 'leads' })),
      ...swayamsevakResponses.map(r => ({ ...r.toObject(), collection: 'swayamsevak' }))
    ];

    // Filter by collection if specified
    const filteredResponses = filters?.collection && filters.collection !== 'all' 
      ? allResponses.filter(r => r.collection === filters.collection)
      : allResponses;

    // Prepare data for export
    const exportData = filteredResponses.map(response => {
      const baseData: any = {
        'Response ID': response._id.toString(),
        'Form Title': response.formTitle,
        'Form Name': response.formId?.form_name12 || response.formId?.title,
        'Collection': response.collection,
        'Submitted At': response.submittedAt.toISOString(),
        'IP Address': response.ipAddress
      };

      // Add response fields
      if (response.responses && Array.isArray(response.responses)) {
        response.responses.forEach((resp: any) => {
          baseData[resp.fieldLabel] = resp.value;
        });
      }

      // Add collection-specific fields
      if (response.collection === 'leads') {
        baseData['Lead Score'] = response.leadScore;
        baseData['Status'] = response.status;
        baseData['Source'] = response.source;
        baseData['Name'] = response.name;
        baseData['Email'] = response.email;
        baseData['Phone'] = response.phone;
      } else if (response.collection === 'swayamsevak') {
        baseData['Swayamsevak ID'] = response.swayamsevakId;
        baseData['Sangha'] = response.sangha;
        baseData['Area'] = response.area;
        baseData['District'] = response.district;
        baseData['State'] = response.state;
        baseData['Name'] = response.name;
        baseData['Email'] = response.email;
        baseData['Phone'] = response.phone;
        baseData['Date of Birth'] = response.dateOfBirth;
      }

      return baseData;
    });

    if (format === 'excel') {
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="form-responses-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    } else {
      // Create CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [headers.join(',')];
      
      exportData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      });

      const csvContent = csvRows.join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="form-responses-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

  } catch (error) {
    console.error('Error exporting responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export responses' },
      { status: 500 }
    );
  }
}