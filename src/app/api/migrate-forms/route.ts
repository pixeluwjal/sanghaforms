// app/api/migrate-forms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Form from '@/models/Form';

export async function GET(request: NextRequest) {
  return await handleMigration(request);
}

export async function POST(request: NextRequest) {
  return await handleMigration(request);
}

async function handleMigration(request: NextRequest) {
  try {
    console.log('Starting form migration...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get all forms
    const forms = await Form.find({});
    console.log(`Found ${forms.length} forms to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errors: string[] = [];

    for (const form of forms) {
      try {
        let formUpdated = false;

        // Iterate through all sections and fields
        for (const section of form.sections) {
          for (const field of section.fields) {
            // Migration for sangha fields
            if (field.type === 'sangha') {
              // If defaultValue exists and contains JSON, ensure it's properly structured
              if (field.defaultValue) {
                try {
                  // Parse existing defaultValue to ensure it's valid JSON
                  const parsedData = JSON.parse(field.defaultValue);
                  
                  // Ensure it has the defaultValues structure
                  if (!parsedData.defaultValues) {
                    parsedData.defaultValues = {};
                  }
                  
                  // Update the field with proper structure
                  field.defaultValue = JSON.stringify(parsedData);
                  formUpdated = true;
                  console.log(`Updated sangha field structure for form: ${form.title}`);
                } catch (parseError) {
                  // If parsing fails, initialize with proper structure
                  field.defaultValue = JSON.stringify({
                    defaultValues: {},
                    selections: {}
                  });
                  formUpdated = true;
                  console.log(`Initialized sangha field structure for form: ${form.title}`);
                }
              } else {
                // Initialize empty structure for sangha fields without defaultValue
                field.defaultValue = JSON.stringify({
                  defaultValues: {},
                  selections: {}
                });
                formUpdated = true;
                console.log(`Initialized sangha field structure for form: ${form.title}`);
              }
            }

            // Handle nested fields recursively
            if (field.nestedFields && field.nestedFields.length > 0) {
              for (const nestedField of field.nestedFields) {
                if (nestedField.type === 'sangha') {
                  if (nestedField.defaultValue) {
                    try {
                      const parsedData = JSON.parse(nestedField.defaultValue);
                      if (!parsedData.defaultValues) {
                        parsedData.defaultValues = {};
                      }
                      nestedField.defaultValue = JSON.stringify(parsedData);
                      formUpdated = true;
                    } catch (parseError) {
                      nestedField.defaultValue = JSON.stringify({
                        defaultValues: {},
                        selections: {}
                      });
                      formUpdated = true;
                    }
                  } else {
                    nestedField.defaultValue = JSON.stringify({
                      defaultValues: {},
                      selections: {}
                    });
                    formUpdated = true;
                  }
                }
              }
            }
          }
        }

        if (formUpdated) {
          form.updatedAt = new Date();
          await form.save();
          migratedCount++;
          console.log(`Successfully migrated form: ${form.title}`);
        } else {
          skippedCount++;
        }
      } catch (formError) {
        const errorMessage = `Form ${form.title}: ${(formError as Error).message}`;
        errors.push(errorMessage);
        console.error(`Error migrating form ${form.title}:`, formError);
      }
    }

    console.log(`Migration completed: ${migratedCount} forms migrated, ${skippedCount} forms skipped`);

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully`,
      stats: {
        totalForms: forms.length,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Migration failed',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}