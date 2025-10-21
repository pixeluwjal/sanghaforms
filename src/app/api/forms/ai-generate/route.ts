import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service not configured' 
      }, { status: 500 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const aiPrompt = {
      contents: [
        {
          parts: [
            {
              text: `You are a form builder assistant. Generate a form structure based on the user's description.

Return ONLY a JSON object with this exact structure:
{
  "title": "Form Title",
  "description": "Form Description",
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title",
      "description": "Section description",
      "order": 0,
      "fields": [
        {
          "id": "field-1",
          "type": "text|email|number|textarea|select|radio|checkbox|date|sangha|file|whatsapp_optin|arratai_optin",
          "label": "Field Label",
          "placeholder": "Optional placeholder",
          "required": true,
          "options": ["Option 1", "Option 2"],
          "order": 0,
          "conditionalRules": [],
          "nestedFields": []
        }
      ],
      "conditionalRules": []
    }
  ]
}

CRITICAL RULES:
1. Field types must be one of: text, email, number, textarea, select, radio, checkbox, date, sangha, file, whatsapp_optin, arratai_optin
2. Every section must have conditionalRules array
3. Every field must have conditionalRules array and nestedFields array
4. Use appropriate field types based on context
5. Return ONLY valid JSON, no other text

User description: ${prompt}`
            }
          ]
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiPrompt),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response format from AI API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    // Clean and parse JSON
    const cleanedResponse = aiResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    let formData;
    try {
      formData = JSON.parse(cleanedResponse);
    } catch (error) {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        formData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON from AI');
      }
    }

    // Transform AI data to match your exact Mongoose schema
    const transformedForm = transformAIDataToSchema(formData);

    return NextResponse.json({ form: transformedForm });
    
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate form with AI: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

// Function to transform AI data to match your Mongoose schema
function transformAIDataToSchema(aiFormData: any) {
  // Generate proper IDs if they're missing
  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Transform sections and fields to ensure they match the schema
  const transformedSections = aiFormData.sections?.map((section: any, index: number) => ({
    id: section.id || generateId('section'),
    title: section.title || `Section ${index + 1}`,
    description: section.description || '',
    order: section.order !== undefined ? section.order : index,
    fields: section.fields?.map((field: any, fieldIndex: number) => ({
      id: field.id || generateId('field'),
      type: field.type || 'text',
      label: field.label || `Field ${fieldIndex + 1}`,
      placeholder: field.placeholder || '',
      required: field.required !== undefined ? field.required : false,
      options: field.options || [],
      order: field.order !== undefined ? field.order : fieldIndex,
      conditionalRules: field.conditionalRules || [],
      nestedFields: field.nestedFields || []
    })) || [],
    conditionalRules: section.conditionalRules || []
  })) || [];

  // Return the complete form structure matching your schema
  return {
    title: aiFormData.title || 'AI Generated Form',
    description: aiFormData.description || '',
    sections: transformedSections,
    theme: {
      primaryColor: '#7C3AED',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter'
    },
    images: {
      logo: '',
      banner: '',
      background: ''
    },
    settings: {
      userType: 'swayamsevak',
      validityDuration: 1440,
      maxResponses: 1000,
      allowMultipleResponses: false,
      enableProgressSave: true,
      collectEmail: true,
      customSlug: '',
      enableCustomSlug: false,
      isActive: true,
      showGroupLinks: false,
      whatsappGroupLink: '',
      arrataiGroupLink: ''
    },
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}