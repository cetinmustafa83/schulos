// @ts-nocheck
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

/**
 * SnapGen AI Video Generation API
 * POST /api/ai/snapgen
 * Body: { prompt, duration?, aspectRatio?, style? }
 * 
 * Uses SnapGen API: https://api.snapgen.ai/uapi/v1/generate
 */

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only admin/teacher can generate videos
    const role = session.user.role;
    if (role !== 'SCHOOL_ADMIN' && role !== 'SUPER_ADMIN' && role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Only teachers and admins can generate videos' },
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

    if (!aiSettings || (!aiSettings.snapgenEnabled && !aiSettings.aiVideoGenEnabled)) {
      return NextResponse.json(
        { error: 'Video generation is disabled for your school. Enable it in Settings > AI.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      duration = 10,
      aspectRatio = '16:9',
      style = 'realistic',
      language = 'de',
      subject,
      topic,
    } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build the enhanced prompt for educational content
    const enhancedPrompt = buildEducationalPrompt(prompt, {
      duration,
      aspectRatio,
      style,
      language,
      subject,
      topic,
    });

    // Try SnapGen API first if enabled
    if (aiSettings.snapgenEnabled && aiSettings.snapgenApiKey) {
      try {
        const snapgenResponse = await fetch('https://api.snapgen.ai/uapi/v1/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiSettings.snapgenApiKey}`,
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            duration: `${duration}s`,
            aspect_ratio: aspectRatio,
            style,
            language,
            type: 'video',
          }),
        });

        if (snapgenResponse.ok) {
          const data = await snapgenResponse.json();
          return NextResponse.json({
            success: true,
            provider: 'snapgen',
            taskId: data.task_id || data.id || data.taskId,
            status: data.status || 'processing',
            videoUrl: data.video_url || data.url || null,
            thumbnailUrl: data.thumbnail_url || null,
            message: 'Video generation started with SnapGen AI.',
          });
        }
        // Fall through to z-ai-web-dev-sdk if SnapGen fails
        console.error('SnapGen API error:', snapgenResponse.status);
      } catch (snapgenError) {
        console.error('SnapGen API error:', snapgenError);
        // Fall through to z-ai-web-dev-sdk
      }
    }

    // Fallback to z-ai-web-dev-sdk
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const task = await zai.video.generations.create({
        prompt: enhancedPrompt,
        quality: 'standard',
        size: aspectRatio === '9:16' ? '720x1280' : '1280x720',
      });

      return NextResponse.json({
        success: true,
        provider: 'zai',
        taskId: task.id || task.taskId || 'pending',
        status: task.status || 'processing',
        message: 'Video generation started. Check status for updates.',
      });
    } catch (zaiError) {
      console.error('ZAI Video Generation error:', zaiError);
      return NextResponse.json(
        { error: 'Video generation failed. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('SnapGen Video API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/snapgen?taskId=xxx
 * Check video generation task status
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const provider = searchParams.get('provider') || 'zai';

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    if (provider === 'snapgen') {
      const aiSettings = await db.aISettings.findUnique({
        where: { schoolId: session.user.schoolId || '' },
      });

      if (aiSettings?.snapgenApiKey) {
        const statusResponse = await fetch(`https://api.snapgen.ai/uapi/v1/generate/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${aiSettings.snapgenApiKey}`,
          },
        });

        if (statusResponse.ok) {
          const data = await statusResponse.json();
          return NextResponse.json({
            status: data.status || 'processing',
            videoUrl: data.video_url || data.url || null,
            thumbnailUrl: data.thumbnail_url || null,
            progress: data.progress || 0,
          });
        }
      }
    }

    // Fallback to z-ai-web-dev-sdk
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();
      const status = await zai.video.generations.retrieve(taskId);
      return NextResponse.json({
        status: status.status || 'processing',
        videoUrl: status.video_url || status.url || null,
      });
    } catch (error) {
      return NextResponse.json({
        status: 'processing',
        message: 'Task is still being processed.',
      });
    }
  } catch (error) {
    console.error('SnapGen status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildEducationalPrompt(
  prompt: string,
  opts: { duration: number; aspectRatio: string; style: string; language: string; subject?: string; topic?: string }
): string {
  const langInstruction = opts.language === 'de'
    ? 'Erkläre auf Deutsch mit klarer, freundlicher Stimme.'
    : 'Explain in English with a clear, friendly voice.';

  const subjectContext = opts.subject ? `Fach: ${opts.subject}. ` : '';
  const topicContext = opts.topic ? `Thema: ${opts.topic}. ` : '';

  return `${subjectContext}${topicContext}${langInstruction} Inhalt: ${prompt}. Stil: ${opts.style}. Dauer: ${opts.duration} Sekunden. Aspect Ratio: ${opts.aspectRatio}.`;
}
