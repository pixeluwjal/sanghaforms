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
          "type": "text|email|number|textarea|select|radio|checkbox|date|organization",
          "label": "Field Label",
          "placeholder": "Optional placeholder",
          "required": true,
          "options": ["Option 1", "Option 2"],
          "order": 0
        }
      ],
      "conditionalRules": []
    }
  ]
}

CRITICAL RULES:
2. Every section must have conditionalRules array
3. Use appropriate field types based on context
4. Return ONLY valid JSON, no other text

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

    return NextResponse.json({ form: formData });
    
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate form with AI: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}