// app/api/forms/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { formData } = await request.json();
    
    if (!formData) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 });
    }

    // Get creator from token
    const token = request.cookies.get('token')?.value;
    let createdBy = null;
    
    if (token) {
      try {
        const decoded = await verifyToken(token);
        createdBy = decoded.adminId;
      } catch (error) {
        console.log('No valid token, creating form without creator');
      }
    }

    // Create a new form with the duplicated data
    const form = new Form({
      title: formData.title,
      description: formData.description,
      theme: formData.theme,
      sections: formData.sections || [],
      settings: formData.settings,
      images: formData.images || {},
      status: 'draft',
      createdBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await form.save();

    console.log('Form duplicated successfully:', {
      id: form._id,
      title: form.title,
      sectionsCount: form.sections?.length || 0
    });

    return NextResponse.json({ 
      success: true, 
      formId: form._id,
      message: 'Form duplicated successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Form duplication error:', error);
    return NextResponse.json({ 
      error: 'Failed to duplicate form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}