// app/api/admin/migrate-forms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Verify admin authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all existing forms
    const existingForms = await Form.find({});
    
    let migratedCount = 0;
    let errorCount = 0;
    const migrationResults = [];

    for (const oldForm of existingForms) {
      try {
        // Check if form already has the new schema structure
        if (oldForm.form_name12) {
          migrationResults.push({
            formId: oldForm._id,
            title: oldForm.title,
            status: 'already_migrated',
            message: 'Form already has new schema'
          });
          continue;
        }

        // Migration logic for old forms
        const updateData: any = {
          // Migrate form_name to form_name12
          form_name12: oldForm.title || 'Untitled Form',
          
          // Ensure settings has the new structure
          settings: {
            userType: 'swayamsevak',
            validityDuration: oldForm.settings?.validityDuration || 1440,
            maxResponses: oldForm.settings?.maxResponses || 1000,
            allowMultipleResponses: false,
            enableProgressSave: true,
            collectEmail: true,
            customSlug: oldForm.settings?.customSlug || '',
            enableCustomSlug: !!oldForm.settings?.customSlug,
            isActive: oldForm.settings?.isActive !== false,
            showGroupLinks: oldForm.settings?.showGroupLinks || false,
            whatsappGroupLink: oldForm.settings?.whatsappGroupLink || '',
            arrataiGroupLink: oldForm.settings?.arrataiGroupLink || ''
          },
          
          // Ensure theme has proper structure
          theme: {
            primaryColor: oldForm.theme?.primaryColor || '#7C3AED',
            backgroundColor: oldForm.theme?.backgroundColor || '#FFFFFF',
            textColor: oldForm.theme?.textColor || '#1F2937',
            fontFamily: oldForm.theme?.fontFamily || 'Inter'
          },
          
          updatedAt: new Date()
        };

        // Migrate sections and fields to include new field types
        if (oldForm.sections && Array.isArray(oldForm.sections)) {
          updateData.sections = oldForm.sections.map((section: any) => {
            if (section.fields && Array.isArray(section.fields)) {
              return {
                ...section,
                fields: section.fields.map((field: any) => {
                  // Add defaultValue for readonly_text fields if needed
                  const migratedField = {
                    ...field,
                    defaultValue: field.defaultValue || ''
                  };
                  
                  // Ensure conditionalRules exists
                  if (!migratedField.conditionalRules) {
                    migratedField.conditionalRules = [];
                  }
                  
                  // Ensure nestedFields exists
                  if (!migratedField.nestedFields) {
                    migratedField.nestedFields = [];
                  }
                  
                  return migratedField;
                })
              };
            }
            return section;
          });
        }

        // Update the form with new schema
        const updatedForm = await Form.findByIdAndUpdate(
          oldForm._id,
          updateData,
          { new: true, runValidators: true }
        );

        migratedCount++;
        migrationResults.push({
          formId: oldForm._id,
          title: oldForm.title,
          status: 'success',
          message: 'Form migrated successfully'
        });

      } catch (error) {
        errorCount++;
        migrationResults.push({
          formId: oldForm._id,
          title: oldForm.title,
          status: 'error',
          message: error instanceof Error ? error.message : 'Migration failed'
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalForms: existingForms.length,
        migrated: migratedCount,
        errors: errorCount,
        alreadyMigrated: existingForms.length - migratedCount - errorCount
      },
      details: migrationResults,
      message: `Migration completed: ${migratedCount} forms migrated, ${errorCount} errors`
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check migration status
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify admin authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Analyze forms for migration status
    const allForms = await Form.find({});
    
    const migrationAnalysis = {
      totalForms: allForms.length,
      formsWithNewSchema: allForms.filter(form => form.form_name12).length,
      formsWithOldSchema: allForms.filter(form => !form.form_name12).length,
      sampleForms: allForms.slice(0, 5).map(form => ({
        _id: form._id,
        title: form.title,
        hasFormName12: !!form.form_name12,
        form_name12: form.form_name12,
        settings: form.settings,
        sectionsCount: form.sections?.length || 0
      }))
    };

    return NextResponse.json({
      success: true,
      analysis: migrationAnalysis,
      readyForMigration: migrationAnalysis.formsWithOldSchema > 0
    });

  } catch (error) {
    console.error('Migration analysis error:', error);
    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}