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
    const systemPrompt = `You are a form builder assistant. Generate a complete form section based on the user's prompt.

Current sections in the form (for context): ${JSON.stringify(currentSections.map((s: any) => s.title))}

Respond with a JSON object in this exact format:
{
  "section": {
    "title": "Section Title",
    "description": "Section description explaining what this section is about",
    "fields": [
      {
        "type": "field_type",
        "label": "Field Label",
        "placeholder": "Placeholder text",
        "required": true/false,
        "description": "Field description or instructions",
        "options": ["Option 1", "Option 2"] // only for radio, checkbox, select
      }
    ]
  }
}

Available field types: text, email, number, textarea, select, radio, checkbox, date, file, sangha, whatsapp_optin, arratai_optin

Make the section comprehensive but focused. Include appropriate field types based on the context.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Making request to Gemini API...');
    
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
                text: `${systemPrompt}\n\nUser Prompt: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
      console.error('Invalid response structure from Gemini API:', data);
      throw new Error('Invalid response structure from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response text:', responseText);
    
    // Extract JSON from the response (Gemini might wrap it in markdown code blocks)
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
        console.error('Invalid section structure:', generatedData);
        throw new Error('Invalid section structure in AI response');
      }

      console.log('Successfully parsed generated section:', generatedData.section);
      return NextResponse.json({ success: true, data: generatedData.section });
      
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response text that failed to parse:', responseText);
      console.error('Extracted JSON string:', jsonString);
      
      // Try to fix common JSON issues and parse again
      try {
        // Remove any trailing commas and other common JSON issues
        const fixedJson = jsonString
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure proper quoting
          .replace(/'/g, '"'); // Replace single quotes with double quotes
        
        console.log('Fixed JSON attempt:', fixedJson);
        
        const generatedData = JSON.parse(fixedJson);
        return NextResponse.json({ success: true, data: generatedData.section });
      } catch (secondParseError) {
        console.error('Second parse attempt failed:', secondParseError);
        
        // If all parsing fails, try to extract just the fields manually
        try {
          const fallbackSection = createFallbackSection(prompt, responseText);
          return NextResponse.json({ success: true, data: fallbackSection });
        } catch (fallbackError) {
          return NextResponse.json(
            { 
              error: 'Failed to parse AI response', 
              rawResponse: responseText,
              details: (secondParseError as Error).message
            },
            { status: 500 }
          );
        }
      }
    }
  } catch (error) {
    console.error('Section generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate section: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Fallback function to create a basic section if parsing fails
function createFallbackSection(prompt: string, responseText: string) {
  console.log('Creating fallback section for prompt:', prompt);
  
  const fallbackSection = {
    title: `Generated: ${prompt.substring(0, 30)}...`,
    description: `Section generated based on: ${prompt}`,
    fields: [
      {
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        description: "Please enter your complete name"
      },
      {
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email",
        required: true,
        description: "We'll send a confirmation to this email"
      },
      {
        type: "textarea",
        label: "Additional Information",
        placeholder: "Enter any additional details",
        required: false,
        description: "Any other information you'd like to share"
      }
    ]
  };
  
  return fallbackSection;
}