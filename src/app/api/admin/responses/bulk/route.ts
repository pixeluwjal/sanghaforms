import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import FormResponse from '@/models/FormResponse';
import LeadResponse from '@/models/LeadResponse';
import SwayamsevakResponse from '@/models/SwayamsevakResponse';

export async function DELETE(request: NextRequest) {
  try {
    const { responseIds } = await request.json();

    if (!responseIds || !Array.isArray(responseIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response IDs' },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    console.log(`🗑️ Starting bulk delete for ${responseIds.length} responses`);

    // Delete from all collections
    const results = await Promise.allSettled([
      FormResponse.deleteMany({ _id: { $in: responseIds } }),
      LeadResponse.deleteMany({ _id: { $in: responseIds } }),
      SwayamsevakResponse.deleteMany({ _id: { $in: responseIds } })
    ]);

    const totalDeleted = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        return acc + (result.value.deletedCount || 0);
      }
      return acc;
    }, 0);

    console.log(`✅ Bulk delete completed: ${totalDeleted} responses deleted`);

    return NextResponse.json({
      success: true,
      deletedCount: totalDeleted,
      message: `${totalDeleted} responses deleted successfully`
    });

  } catch (error) {
    console.error('❌ Error bulk deleting responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete responses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { operation, responseIds, updates } = await request.json();

    if (!operation || !responseIds || !Array.isArray(responseIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    console.log(`🔄 Starting bulk ${operation} for ${responseIds.length} responses`);

    let result;
    
    switch (operation) {
      case 'update':
        if (!updates) {
          return NextResponse.json(
            { success: false, error: 'Updates required for update operation' },
            { status: 400 }
          );
        }
        result = await bulkUpdateResponses(responseIds, updates);
        break;
      
      case 'changeCollection':
        if (!updates?.collection) {
          return NextResponse.json(
            { success: false, error: 'Collection type required for changeCollection operation' },
            { status: 400 }
          );
        }
        result = await bulkChangeCollection(responseIds, updates.collection);
        break;
      
      case 'export':
        result = await bulkExportResponses(responseIds);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Error in bulk operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk operation' },
      { status: 500 }
    );
  }
}

// Bulk update responses
async function bulkUpdateResponses(responseIds: string[], updates: any) {
  let totalUpdated = 0;
  const errors: string[] = [];

  // Update in all collections
  const updatePromises = [
    FormResponse.updateMany(
      { _id: { $in: responseIds } },
      { $set: updates },
      { runValidators: true }
    ),
    LeadResponse.updateMany(
      { _id: { $in: responseIds } },
      { $set: updates },
      { runValidators: true }
    ),
    SwayamsevakResponse.updateMany(
      { _id: { $in: responseIds } },
      { $set: updates },
      { runValidators: true }
    )
  ];

  const results = await Promise.allSettled(updatePromises);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      totalUpdated += result.value.modifiedCount || 0;
    } else {
      errors.push(`Collection ${index}: ${result.reason.message}`);
    }
  });

  return {
    updatedCount: totalUpdated,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Bulk change collection type
async function bulkChangeCollection(responseIds: string[], targetCollection: string) {
  if (!['leads', 'swayamsevak', 'form_responses'].includes(targetCollection)) {
    throw new Error('Invalid target collection');
  }

  let totalMoved = 0;
  const errors: string[] = [];

  // Find responses from all source collections
  const [formResponses, leadResponses, swayamsevakResponses] = await Promise.all([
    FormResponse.find({ _id: { $in: responseIds } }),
    LeadResponse.find({ _id: { $in: responseIds } }),
    SwayamsevakResponse.find({ _id: { $in: responseIds } })
  ]);

  const allResponses = [
    ...formResponses.map(r => ({ ...r.toObject(), sourceCollection: 'form_responses' })),
    ...leadResponses.map(r => ({ ...r.toObject(), sourceCollection: 'leads' })),
    ...swayamsevakResponses.map(r => ({ ...r.toObject(), sourceCollection: 'swayamsevak' }))
  ];

  // Delete from source collections and create in target collection
  for (const response of allResponses) {
    try {
      // Delete from source collection
      await deleteFromCollection(response._id, response.sourceCollection);
      
      // Create in target collection
      await createInTargetCollection(response, targetCollection);
      
      totalMoved++;
    } catch (error) {
      errors.push(`Failed to move response ${response._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    movedCount: totalMoved,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Bulk export responses
async function bulkExportResponses(responseIds: string[]) {
  // Find responses from all collections
  const [formResponses, leadResponses, swayamsevakResponses] = await Promise.all([
    FormResponse.find({ _id: { $in: responseIds } }).populate('formId', 'title form_name12'),
    LeadResponse.find({ _id: { $in: responseIds } }).populate('formId', 'title form_name12'),
    SwayamsevakResponse.find({ _id: { $in: responseIds } }).populate('formId', 'title form_name12')
  ]);

  const allResponses = [
    ...formResponses.map(r => ({ ...r.toObject(), collection: 'form_responses' })),
    ...leadResponses.map(r => ({ ...r.toObject(), collection: 'leads' })),
    ...swayamsevakResponses.map(r => ({ ...r.toObject(), collection: 'swayamsevak' }))
  ];

  return {
    responses: allResponses,
    totalCount: allResponses.length,
    collectionBreakdown: {
      form_responses: formResponses.length,
      leads: leadResponses.length,
      swayamsevak: swayamsevakResponses.length
    }
  };
}

// Helper function to delete from specific collection
async function deleteFromCollection(responseId: string, collection: string) {
  switch (collection) {
    case 'form_responses':
      await FormResponse.findByIdAndDelete(responseId);
      break;
    case 'leads':
      await LeadResponse.findByIdAndDelete(responseId);
      break;
    case 'swayamsevak':
      await SwayamsevakResponse.findByIdAndDelete(responseId);
      break;
    default:
      throw new Error(`Unknown collection: ${collection}`);
  }
}

// Helper function to create in target collection
async function createInTargetCollection(response: any, targetCollection: string) {
  const baseData = {
    formId: response.formId,
    formTitle: response.formTitle,
    formSlug: response.formSlug,
    responses: response.responses,
    submittedAt: response.submittedAt,
    ipAddress: response.ipAddress,
    userAgent: response.userAgent
  };

  switch (targetCollection) {
    case 'form_responses':
      await FormResponse.create({
        ...baseData,
        formType: response.formType || 'general',
        collection: 'form_responses'
      });
      break;
    
    case 'leads':
      await LeadResponse.create({
        ...baseData,
        leadScore: response.leadScore || 0,
        status: response.status || 'new',
        source: response.source || 'bulk_move',
        name: response.name,
        email: response.email,
        phone: response.phone
      });
      break;
    
    case 'swayamsevak':
      await SwayamsevakResponse.create({
        ...baseData,
        swayamsevakId: response.swayamsevakId || `SW${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sangha: response.sangha || 'Not specified',
        area: response.area || 'Not specified',
        district: response.district,
        state: response.state,
        name: response.name || 'Unknown',
        email: response.email,
        phone: response.phone,
        dateOfBirth: response.dateOfBirth
      });
      break;
    
    default:
      throw new Error(`Unknown target collection: ${targetCollection}`);
  }
}

// GET endpoint to get bulk operation status or statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    switch (operation) {
      case 'stats':
        const stats = await getBulkStats();
        return NextResponse.json({ success: true, stats });
      
      case 'collections':
        const collections = await getCollectionStats();
        return NextResponse.json({ success: true, collections });
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Error in bulk GET operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Get bulk statistics
async function getBulkStats() {
  const [formCount, leadCount, swayamsevakCount] = await Promise.all([
    FormResponse.countDocuments(),
    LeadResponse.countDocuments(),
    SwayamsevakResponse.countDocuments()
  ]);

  const total = formCount + leadCount + swayamsevakCount;

  return {
    total,
    form_responses: formCount,
    leads: leadCount,
    swayamsevak: swayamsevakCount,
    collections: {
      form_responses: { count: formCount, percentage: total > 0 ? (formCount / total * 100).toFixed(1) : '0' },
      leads: { count: leadCount, percentage: total > 0 ? (leadCount / total * 100).toFixed(1) : '0' },
      swayamsevak: { count: swayamsevakCount, percentage: total > 0 ? (swayamsevakCount / total * 100).toFixed(1) : '0' }
    }
  };
}

// Get collection-specific statistics
async function getCollectionStats() {
  const [recentForm, recentLead, recentSwayamsevak] = await Promise.all([
    FormResponse.findOne().sort({ submittedAt: -1 }).select('submittedAt'),
    LeadResponse.findOne().sort({ submittedAt: -1 }).select('submittedAt'),
    SwayamsevakResponse.findOne().sort({ submittedAt: -1 }).select('submittedAt')
  ]);

  const [leadStatus, swayamsevakAreas] = await Promise.all([
    LeadResponse.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    SwayamsevakResponse.aggregate([
      { $group: { _id: '$area', count: { $sum: 1 } } }
    ])
  ]);

  return {
    recentActivity: {
      form_responses: recentForm?.submittedAt || null,
      leads: recentLead?.submittedAt || null,
      swayamsevak: recentSwayamsevak?.submittedAt || null
    },
    leadStatus: leadStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as any),
    swayamsevakAreas: swayamsevakAreas.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as any)
  };
}