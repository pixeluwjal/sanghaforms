// app/api/admin/bulk-upload/[id]/route.ts
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
    console.log(`📄 Fetching upload: ${id}`);
    
    // Try to populate, but if it fails, get upload without populate
    let upload;
    try {
      upload = await BulkUpload.findById(id)
        .populate('uploadedBy', 'email') // Only email, no name
        .lean();
    } catch (populateError) {
      console.warn('Populate failed, fetching without populate:', populateError);
      upload = await BulkUpload.findById(id).lean();
      
      // Add email field manually if populate failed
      if (upload) {
        upload.uploadedBy = { email: 'system@admin.com' };
      }
    }
    
    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Found upload: ${upload.originalName}`);
    
    return NextResponse.json(upload);
    
  } catch (error) {
    console.error('Error fetching upload:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    console.log(`🗑️ Deleting upload: ${id}`);
    
    const upload = await BulkUpload.findById(id);
    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      );
    }
    
    console.log(`🗑️ Deleting associated records for source: ${upload.source}`);
    
    // Also delete associated records
    let deletedRecords = 0;
    if (upload.targetCollection === 'SwayamsevakResponse') {
      const result = await SwayamsevakResponse.deleteMany({ 
        $or: [
          { source: upload.source },
          { formTitle: 'Bulk Upload - Swayamsevak' }
        ]
      });
      deletedRecords = result.deletedCount || 0;
      console.log(`🗑️ Deleted ${deletedRecords} Swayamsevak records`);
    } else if (upload.targetCollection === 'LeadResponse') {
      const result = await LeadResponse.deleteMany({ 
        $or: [
          { source: upload.source },
          { formTitle: 'Bulk Upload - Lead' }
        ]
      });
      deletedRecords = result.deletedCount || 0;
      console.log(`🗑️ Deleted ${deletedRecords} Lead records`);
    }
    
    // Delete the upload record itself
    await BulkUpload.findByIdAndDelete(id);
    
    console.log(`✅ Deleted upload: ${id} and ${deletedRecords} associated records`);
    
    return NextResponse.json({
      success: true,
      message: 'Upload and associated records deleted successfully',
      deletedUpload: id,
      deletedRecords: deletedRecords
    });
    
  } catch (error) {
    console.error('Error deleting upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete upload: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}