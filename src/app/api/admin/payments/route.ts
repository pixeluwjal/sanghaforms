import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Payment from '@/models/Payment';
import mongoose from 'mongoose';
import Admin from '@/models/Admin';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB using mongoose.connect
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    const skip = (page - 1) * limit;

    // Build filter query
    let filter: any = {};

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { paymentId: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Get payments with pagination
    const payments = await Payment.find(filter)
      .populate('formId', 'title')
      .populate('submissionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Payment.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get summary stats
    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          successfulAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0]
            }
          },
          totalCount: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
            }
          },
          failedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
            }
          },
          attemptedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'attempted'] }, 1, 0]
            }
          },
          createdCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'created'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const summary = stats[0] || {
      totalAmount: 0,
      successfulAmount: 0,
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
      attemptedCount: 0,
      createdCount: 0
    };

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      summary
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}