// @ts-nocheck
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

/**
 * Perchance AI Image Generation API
 * POST /api/ai/perchance
 * Body: { prompt, style?, size? }
 * 
 * Uses Perchance AI: https://perchance.org/text-to-image-plugin
 * Falls back to z-ai-web-dev-sdk if Perchance is not configured
 */

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only admin/teacher can generate images (students can if enabled)
    const role = session.user.role;
    const isStaff = role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN' || role === 'TEACHER';
    
    if (!isStaff && role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only teachers, admins, and students can generate images' },
        { status: 403 }
      );
    }

    const { schoolId } = session.user;
    if (!schoolId) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 403 });
    }

    // Check AI settings
    const aiSettings = await db.aISettings.findUnique({
      where: { schoolId },
    });

    if (!aiSettings || (!aiSettings.perchanceEnabled && !aiSettings.aiImageGenEnabled)) {
      return NextResponse.json(
        { error: 'Image generation is disabled for your school. Enable it in Settings > AI.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      style = 'realistic',
      size = '1024x1024',
      negativePrompt,
      seed,
    } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Try Perchance API first if enabled
    if (aiSettings.perchanceEnabled) {
      try {
        // Perchance uses a web-based generator. We'll use their API endpoint.
        const perchanceResponse = await fetch('https://image-generation.perchance.org/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            style,
            size,
            negativePrompt: negativePrompt || '',
            seed: seed || Math.floor(Math.random() * 1000000),
          }),
        });

        if (perchanceResponse.ok) {
          const data = await perchanceResponse.json();
          return NextResponse.json({
            success: true,
            provider: 'perchance',
            image: {
              url: data.imageUrl || data.url || null,
              b64_json: data.b64_json || null,
              revised_prompt: prompt,
              seed: data.seed || seed,
            },
          });
        }
      } catch (perchanceError) {
        console.error('Perchance API error:', perchanceError);
        // Fall through to z-ai-web-dev-sdk
      }
    }

    // Fallback to z-ai-web-dev-sdk
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const response = await zai.images.generations.create({
        prompt: `${prompt}. Style: ${style}`,
        size,
      });

      const imageData = response.data?.[0];

      if (!imageData) {
        return NextResponse.json(
          { error: 'Failed to generate image' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        provider: 'zai',
        image: {
          url: imageData.url || null,
          b64_json: imageData.b64_json || null,
          revised_prompt: imageData.revised_prompt || prompt,
        },
      });
    } catch (zaiError) {
      console.error('ZAI Image Generation error:', zaiError);
      return NextResponse.json(
        { error: 'Image generation failed. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Perchance Image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
