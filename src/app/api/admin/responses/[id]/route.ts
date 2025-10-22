import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import FormResponse from '@/models/FormResponse';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Try to find in all collections
    let response = await FormResponse.findById(id);
    let collection = 'form_responses';

    if (!response) {
      response = await LeadResponse.findById(id);
      collection = 'leads';
    }

    if (!response) {
      response = await SwayamsevakResponse.findById(id);
      collection = 'swayamsevak';
    }

    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      response: {
        ...response.toObject(),
        collection
      }
    });

  } catch (error) {
    console.error('Error fetching response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch response' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Determine which collection to update
    let ResponseModel = FormResponse;
    let response = await FormResponse.findById(id);

    if (!response) {
      ResponseModel = LeadResponse;
      response = await LeadResponse.findById(id);
    }

    if (!response) {
      ResponseModel = SwayamsevakResponse;
      response = await SwayamsevakResponse.findById(id);
    }

    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Response not found' },
        { status: 404 }
      );
    }

    // Update response
    const updatedResponse = await ResponseModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      response: updatedResponse
    });

  } catch (error) {
    console.error('Error updating response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update response' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Try to delete from all collections
    let deleted = await FormResponse.findByIdAndDelete(id);

    if (!deleted) {
      deleted = await LeadResponse.findByIdAndDelete(id);
    }

    if (!deleted) {
      deleted = await SwayamsevakResponse.findByIdAndDelete(id);
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Response deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete response' },
      { status: 500 }
    );
  }
}