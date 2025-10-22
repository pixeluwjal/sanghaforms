// app/api/generate-section/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, currentSections = [] } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found in environment variables');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Construct the system prompt for form section generation
    const systemPrompt = `You are a professional form builder assistant. Generate a complete, well-structured form section based on the user's prompt.

Current sections in the form (for context): ${JSON.stringify(currentSections.map((s: any) => s.title))}

IMPORTANT: Respond with ONLY a valid JSON object in this exact format, no additional text or explanations:

{
  "section": {
    "title": "Clear and concise section title",
    "description": "Brief description explaining what this section collects and why",
    "fields": [
      {
        "type": "field_type",
        "label": "Field Label",
        "placeholder": "Placeholder text",
        "required": true/false,
        "description": "Clear instructions for this field",
        "options": ["Option 1", "Option 2"] // only for radio, checkbox, select types
      }
    ]
  }
}

Available field types: 
- text: For short text inputs (names, titles, etc.)
- email: For email addresses with validation
- number: For numeric inputs
- textarea: For longer text responses
- select: For dropdown selections
- radio: For single choice from options
- checkbox: For multiple selections
- date: For date picker
- file: For file uploads
- sangha: For sangha/organization hierarchy selection
- whatsapp_optin: For WhatsApp notifications opt-in
- arratai_optin: For Arrat AI platform opt-in

Guidelines:
1. Make the section logical and user-friendly
2. Include appropriate validation and field types
3. Consider the context of existing sections
4. Balance comprehensiveness with usability
5. Ensure all required business fields are included
6. Add descriptive help text where helpful`;

    // Use Gemini 1.5 Flash model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('🔄 Making request to Gemini 1.5 Flash API...');
    console.log('📝 User prompt:', prompt);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser Prompt: ${prompt}\n\nRespond with ONLY the JSON object:`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    console.log('📡 Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Gemini API response received');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
      console.error('❌ Invalid response structure from Gemini API:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('📄 Raw Gemini response text length:', responseText.length);
    
    // Extract JSON from the response
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                   responseText.match(/```([\s\S]*?)```/) ||
                   responseText.match(/{[\s\S]*}/);
    
    let jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
    
    // Clean up the JSON string
    jsonString = jsonString.trim();
    
    try {
      const generatedData = JSON.parse(jsonString);
      
      // Validate the structure
      if (!generatedData.section || !generatedData.section.title || !Array.isArray(generatedData.section.fields)) {
        console.error('❌ Invalid section structure:', generatedData);
        throw new Error('Invalid section structure in AI response');
      }

      // Validate each field has required properties
      generatedData.section.fields.forEach((field: any, index: number) => {
        if (!field.type || !field.label) {
          throw new Error(`Field at index ${index} missing type or label`);
        }
        
        // Set default values for optional properties
        if (field.required === undefined) field.required = false;
        if (!field.description) field.description = '';
        if (!field.placeholder) field.placeholder = '';
        
        // Ensure options is an array for relevant field types
        if (['select', 'radio', 'checkbox'].includes(field.type) && !Array.isArray(field.options)) {
          field.options = [];
        }
      });

      console.log('🎉 Successfully parsed generated section:', {
        title: generatedData.section.title,
        fieldCount: generatedData.section.fields.length,
        fieldTypes: generatedData.section.fields.map((f: any) => f.type)
      });
      
      return NextResponse.json({ 
        success: true, 
        data: generatedData.section,
        model: 'gemini-1.5-flash'
      });
      
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('📄 Raw response text that failed to parse:', responseText.substring(0, 500) + '...');
      console.error('🔧 Extracted JSON string:', jsonString);
      
      // Enhanced JSON fixing with multiple attempts
      try {
        const fixedJson = fixJsonString(jsonString);
        console.log('🔧 Fixed JSON attempt:', fixedJson.substring(0, 200) + '...');
        
        const generatedData = JSON.parse(fixedJson);
        
        if (generatedData.section && generatedData.section.title && Array.isArray(generatedData.section.fields)) {
          console.log('✅ Second parse attempt successful');
          return NextResponse.json({ 
            success: true, 
            data: generatedData.section,
            model: 'gemini-1.5-flash',
            note: 'Required JSON correction'
          });
        } else {
          throw new Error('Fixed JSON still invalid');
        }
      } catch (secondParseError) {
        console.error('❌ Second parse attempt failed:', secondParseError);
        
        // Final fallback - create section from prompt
        try {
          const fallbackSection = createIntelligentFallbackSection(prompt, responseText);
          console.log('🔄 Using intelligent fallback section');
          return NextResponse.json({ 
            success: true, 
            data: fallbackSection,
            model: 'gemini-1.5-flash',
            note: 'Used fallback section due to parsing issues'
          });
        } catch (fallbackError) {
          console.error('❌ All parsing attempts failed');
          return NextResponse.json(
            { 
              error: 'Failed to parse AI response', 
              rawResponse: responseText.substring(0, 1000),
              details: (secondParseError as Error).message
            },
            { status: 500 }
          );
        }
      }
    }
  } catch (error) {
    console.error('💥 Section generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate section: ' + (error as Error).message,
        model: 'gemini-1.5-flash'
      },
      { status: 500 }
    );
  }
}

// Enhanced JSON fixing function
function fixJsonString(jsonString: string): string {
  let fixed = jsonString
    // Remove any markdown code block markers
    .replace(/```json/g, '')
    .replace(/```/g, '')
    // Fix trailing commas
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    // Ensure proper property quoting
    .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
    // Replace single quotes with double quotes
    .replace(/'/g, '"')
    // Remove any non-printable characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Fix common escape sequences
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    // Ensure the string starts with {
    .replace(/^[^{]*{/, '{')
    // Ensure the string ends with }
    .replace(/}[^}]*$/, '}')
    // Remove any extra whitespace
    .trim();

  return fixed;
}

// Intelligent fallback section creation
function createIntelligentFallbackSection(prompt: string, responseText: string) {
  console.log('🔄 Creating intelligent fallback section for:', prompt);
  
  // Try to extract meaningful information from the response text
  const lowerPrompt = prompt.toLowerCase();
  const lowerResponse = responseText.toLowerCase();
  
  let title = `Generated: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`;
  let description = `Section for collecting ${prompt}`;
  let fields = [];
  
  // Determine field types based on prompt content
  if (lowerPrompt.includes('contact') || lowerPrompt.includes('information')) {
    title = "Contact Information";
    description = "Please provide your contact details";
    fields = [
      {
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        description: "Your complete name as per official records"
      },
      {
        type: "email",
        label: "Email Address",
        placeholder: "your.email@example.com",
        required: true,
        description: "We'll send important updates to this email"
      },
      {
        type: "text",
        label: "Phone Number",
        placeholder: "+91 9876543210",
        required: true,
        description: "Your primary contact number"
      }
    ];
  } else if (lowerPrompt.includes('address') || lowerPrompt.includes('location')) {
    title = "Address Details";
    description = "Please provide your complete address";
    fields = [
      {
        type: "textarea",
        label: "Full Address",
        placeholder: "House no, Street, Area, City, State, PIN",
        required: true,
        description: "Your complete residential address"
      },
      {
        type: "text",
        label: "City",
        placeholder: "Enter your city",
        required: true,
        description: "Name of your city"
      },
      {
        type: "text",
        label: "PIN Code",
        placeholder: "560001",
        required: true,
        description: "6-digit postal code"
      }
    ];
  } else if (lowerPrompt.includes('sangha') || lowerPrompt.includes('organization')) {
    title = "Sangha Information";
    description = "Details about your sangha affiliation";
    fields = [
      {
        type: "sangha",
        label: "Sangha Hierarchy",
        placeholder: "Select your sangha level",
        required: true,
        description: "Choose your position in the sangha hierarchy"
      },
      {
        type: "text",
        label: "Role/Position",
        placeholder: "Enter your role",
        required: false,
        description: "Your specific role in the sangha"
      }
    ];
  } else if (lowerPrompt.includes('education') || lowerPrompt.includes('qualification')) {
    title = "Educational Background";
    description = "Your academic qualifications and background";
    fields = [
      {
        type: "text",
        label: "Highest Qualification",
        placeholder: "e.g., B.Tech, MBA, PhD",
        required: true,
        description: "Your highest educational qualification"
      },
      {
        type: "text",
        label: "Institution",
        placeholder: "Name of college/university",
        required: true,
        description: "Name of your educational institution"
      },
      {
        type: "number",
        label: "Year of Completion",
        placeholder: "2020",
        required: false,
        description: "Year you completed your education"
      }
    ];
  } else {
    // Generic fallback
    fields = [
      {
        type: "text",
        label: "Primary Information",
        placeholder: "Enter relevant information",
        required: true,
        description: "Main information related to your request"
      },
      {
        type: "textarea",
        label: "Additional Details",
        placeholder: "Provide any additional context or details",
        required: false,
        description: "Any extra information that might be helpful"
      },
      {
        type: "text",
        label: "Reference/ID",
        placeholder: "Any reference number or identifier",
        required: false,
        description: "Optional reference information"
      }
    ];
  }
  
  const fallbackSection = {
    title,
    description,
    fields
  };
  
  console.log('✅ Created fallback section:', fallbackSection);
  return fallbackSection;
}