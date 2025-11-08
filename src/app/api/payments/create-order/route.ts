import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import Payment from '@/models/Payment';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, submissionId, amount, currency = 'INR', customerDetails } = body;

    console.log('💰 Creating payment order:', { 
      formId, 
      submissionId, 
      amount,
      customerName: customerDetails?.name 
    });

    // ✅ FIXED: Better validation
    if (!formId || !submissionId || !amount) {
      console.error('❌ Missing required fields:', { formId, submissionId, amount });
      return NextResponse.json(
        { error: 'Missing required fields: formId, submissionId, amount' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // ✅ FIXED: Search in BOTH collections
    let submission;
    try {
      // Try LeadResponse first
      submission = await LeadResponse.findById(submissionId);
      
      // If not found, try SwayamsevakResponse
      if (!submission) {
        submission = await SwayamsevakResponse.findById(submissionId);
      }

    } catch (error) {
      console.error('❌ Error finding submission:', error);
      return NextResponse.json(
        { error: 'Invalid submission ID format' },
        { status: 400 }
      );
    }

    if (!submission) {
      console.error('❌ Submission not found for ID:', submissionId);
      return NextResponse.json(
        { error: 'Form submission not found in any collection' },
        { status: 404 }
      );
    }

    console.log('✅ Found submission:', {
      id: submission._id,
      collection: submission.collection?.name || 'unknown',
      formTitle: submission.formTitle
    });

    // Convert amount to paise
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${submissionId}`,
      notes: {
        formId: formId.toString(),
        submissionId: submissionId.toString(),
        customerName: customerDetails?.name || 'Customer',
        customerEmail: customerDetails?.email || ''
      },
      payment_capture: 1
    };

    console.log('📦 Creating Razorpay order with options:', options);

    // Create Razorpay order
    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (razorpayError: any) {
      console.error('❌ Razorpay order creation failed:', razorpayError);
      return NextResponse.json(
        { error: `Razorpay error: ${razorpayError.error?.description || razorpayError.message}` },
        { status: 400 }
      );
    }

    // Save payment details to database
    try {
      const payment = new Payment({
        orderId: order.id,
        formId: new mongoose.Types.ObjectId(formId),
        submissionId: new mongoose.Types.ObjectId(submissionId),
        amount: amountInPaise,
        currency,
        status: 'created',
        customerDetails: {
          name: customerDetails?.name || 'Customer',
          email: customerDetails?.email || '',
          contact: customerDetails?.contact || ''
        }
      });

      await payment.save();

      // ✅ FIXED: Update submission in the correct collection
      if (submission.collection?.collectionName === 'leadresponses') {
        await LeadResponse.findByIdAndUpdate(submissionId, {
          paymentOrderId: order.id,
          paymentStatus: 'pending'
        });
      } else {
        await SwayamsevakResponse.findByIdAndUpdate(submissionId, {
          paymentOrderId: order.id,
          paymentStatus: 'pending'
        });
      }

      console.log('✅ Payment order created successfully:', order.id);

      return NextResponse.json({
        success: true,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      });

    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save payment details' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error creating payment order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}