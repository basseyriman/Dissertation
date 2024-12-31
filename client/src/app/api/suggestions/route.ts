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

    console.log('Making request with:', { prediction, confidence });

    const prompt = `As a neuroradiology expert, interpret the attention map visualization for an MRI scan that was classified as ${prediction} with ${(confidence * 100).toFixed(1)}% confidence.

The attention map uses a "jet" colormap where:
- Blue/Dark Blue indicates areas of low attention
- Cyan/Yellow indicates areas of medium attention
- Orange/Red indicates areas of high attention

Based on this classification and typical patterns in brain MRI attention maps:
1. What regions of the brain is the model likely focusing on?
2. Why are these regions significant for this classification?
3. What are the key anatomical features being highlighted?
4. How does this align with known patterns in ${prediction} cases?

Please provide a concise, technical interpretation focusing on the attention map's significance.`;

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
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
} 