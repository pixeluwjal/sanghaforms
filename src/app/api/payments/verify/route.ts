import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Payment from '@/models/Payment';
import FormResponse from '@/models/FormResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      submissionId 
    } = body;

    console.log('🔍 Verifying payment:', { 
      razorpay_order_id, 
      razorpay_payment_id,
      submissionId 
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !submissionId) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Verify signature
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(bodyString)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    console.log('🔐 Signature verification:', {
      isAuthentic,
      expectedSignature,
      receivedSignature: razorpay_signature
    });

    if (isAuthentic) {
      // Update payment status to success
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          status: 'success',
          razorpaySignature: razorpay_signature,
          paidAt: new Date()
        }
      );

      // Update form submission with payment success
      await FormResponse.findByIdAndUpdate(
        submissionId,
        {
          paymentStatus: 'success',
          paymentId: razorpay_payment_id,
          paymentOrderId: razorpay_order_id,
          paymentCompletedAt: new Date()
        }
      );

      console.log('✅ Payment verified successfully for submission:', submissionId);

      return NextResponse.json({ 
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      // Payment verification failed
      console.log('❌ Payment signature verification failed');

      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          status: 'failed',
          error: 'Signature verification failed',
          failedAt: new Date()
        }
      );

      await FormResponse.findByIdAndUpdate(
        submissionId,
        {
          paymentStatus: 'failed',
          paymentError: 'Signature verification failed'
        }
      );

      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment verification failed - invalid signature' 
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error verifying payment:', error);
    
    // Update payment status to failed in case of error
    try {
      const { submissionId } = await request.json();
      if (submissionId) {
        await FormResponse.findByIdAndUpdate(submissionId, {
          paymentStatus: 'failed',
          paymentError: 'Verification process error'
        });
      }
    } catch (updateError) {
      console.error('Error updating payment status after verification error:', updateError);
    }

    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}