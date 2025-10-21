// app/api/admin/forms/[formId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import FormResponse from '@/models/FormResponse';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    await dbConnect();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Just verify the token - any authenticated admin can delete
    await verifyToken(token);
    const { formId } = await params;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Delete form and its responses (no ownership check)
    await Form.findByIdAndDelete(formId);
    await FormResponse.deleteMany({ formId });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}