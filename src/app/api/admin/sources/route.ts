// app/api/admin/sources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Source from '@/models/Source';

// GET - Fetch all sources for admin (including inactive)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const sources = await Source.find()
      .sort({ order: 1, name: 1 })
      .lean();
    
    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching sources for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// POST - Create new source
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, description, order = 0, isActive = true } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Source name is required' },
        { status: 400 }
      );
    }
    
    const existingSource = await Source.findOne({ name });
    if (existingSource) {
      return NextResponse.json(
        { error: 'Source with this name already exists' },
        { status: 409 }
      );
    }
    
    const source = new Source({
      name,
      description,
      order,
      isActive
    });
    
    await source.save();
    
    return NextResponse.json(
      { message: 'Source created successfully', source },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}