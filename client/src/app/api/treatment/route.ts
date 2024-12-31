import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured');
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const { prediction, confidence } = await request.json();
    
    if (!prediction || confidence === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Making treatment request with:', { prediction, confidence });

    const prompt = `As a medical expert, provide detailed treatment and management suggestions for a patient diagnosed with ${prediction} (confidence: ${(confidence * 100).toFixed(1)}%).

Please provide specific recommendations in these areas:

1. Key Management Strategies:
- What are the essential medical interventions?
- What type of cognitive therapies would be most beneficial?
- What daily routine adjustments are recommended?

2. Lifestyle Recommendations:
- What physical activities are most appropriate?
- What dietary considerations should be taken into account?
- What cognitive exercises or activities would be most beneficial?

3. Monitoring Considerations:
- What symptoms or changes should be monitored?
- What is the recommended frequency for medical check-ups?
- What potential complications should be watched for?

Please provide evidence-based, practical recommendations that can be implemented by healthcare providers and caregivers.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    return NextResponse.json({
      suggestions: data.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in treatment API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate treatment suggestions' },
      { status: 500 }
    );
  }
} 