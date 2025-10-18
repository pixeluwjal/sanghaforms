import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Form from '@/models/Form';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const formId = searchParams.get('formId');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Basic slug validation
    if (slug.length < 3) {
      return NextResponse.json({ available: false, message: 'Slug must be at least 3 characters' });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ available: false, message: 'Only lowercase letters, numbers, and hyphens allowed' });
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query to check if slug is taken
    const query: any = {
      $or: [
        { 'settings.customSlug': slug }
      ],
      'settings.isActive': true
    };

    // Only exclude current form if formId is provided and is a valid ObjectId
    if (formId && mongoose.Types.ObjectId.isValid(formId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(formId) };
    }

    // Also check if slug matches any form ID (if it's a valid ObjectId)
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(slug) });
    }

    const existingForm = await Form.findOne(query);
    const available = !existingForm;

    return NextResponse.json({ 
      available,
      message: available ? 'Slug is available!' : 'Slug is already taken'
    });

  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      available: false 
    }, { status: 500 });
  }
}