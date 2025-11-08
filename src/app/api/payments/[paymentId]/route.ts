import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Payment from '@/models/Payment';
import FormResponse from '@/models/FormResponse';

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find payment by order ID or payment ID
    const payment = await Payment.findOne({
      $or: [
        { orderId: paymentId },
        { paymentId: paymentId }
      ]
    }).populate('formId', 'title settings');

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get submission details
    const submission = await FormResponse.findById(payment.submissionId);

    const responseData = {
      payment: {
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        amount: payment.amount / 100, // Convert back to rupees
        currency: payment.currency,
        status: payment.status,
        customerDetails: payment.customerDetails,
        paidAt: payment.paidAt,
        failedAt: payment.failedAt,
        createdAt: payment.createdAt
      },
      form: {
        title: (payment.formId as any)?.title,
        paymentAmount: (payment.formId as any)?.settings?.paymentAmount
      },
      submission: submission ? {
        submittedAt: submission.submittedAt,
        paymentStatus: submission.paymentStatus
      } : null
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error: any) {
    console.error('❌ Error fetching payment details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}