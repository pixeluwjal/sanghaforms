import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      submissionId,
      status,
      paymentId,
      orderId,
      error,
      paymentMethod = 'upi',
      customerDetails
    } = body;

    console.log('🔄 Updating payment status:', {
      submissionId,
      status,
      paymentId,
      orderId
    });

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // ✅ FIXED: Search in both collections
    let submission;
    let collectionName;

    // Try LeadResponse first
    submission = await LeadResponse.findById(submissionId);
    if (submission) {
      collectionName = 'leadresponses';
    } else {
      // Try SwayamsevakResponse
      submission = await SwayamsevakResponse.findById(submissionId);
      if (submission) {
        collectionName = 'swayamsevakresponses';
      }
    }

    if (!submission) {
      console.error('❌ Submission not found for ID:', submissionId);
      return NextResponse.json(
        { error: 'Form submission not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found submission in collection:', collectionName);

    // Update based on collection
    const updateData: any = {
      paymentStatus: status,
      paymentMethod: paymentMethod,
      ...(customerDetails && { customerDetails })
    };

    if (status === 'success') {
      updateData.paymentId = paymentId;
      updateData.paymentOrderId = orderId;
      updateData.paidAt = new Date();
    } else if (status === 'failed') {
      updateData.paymentError = error;
    }

    let updatedSubmission;
    if (collectionName === 'leadresponses') {
      updatedSubmission = await LeadResponse.findByIdAndUpdate(
        submissionId,
        updateData,
        { new: true }
      );
    } else {
      updatedSubmission = await SwayamsevakResponse.findByIdAndUpdate(
        submissionId,
        updateData,
        { new: true }
      );
    }

    console.log('✅ Payment status updated successfully:', {
      submissionId,
      status,
      paymentId
    });

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      submission: {
        id: updatedSubmission._id,
        paymentStatus: updatedSubmission.paymentStatus,
        paymentId: updatedSubmission.paymentId
      }
    });

  } catch (error: any) {
    console.error('❌ Error updating payment status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment status' },
      { status: 500 }
    );
  }
}