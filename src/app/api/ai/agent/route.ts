// @ts-nocheck
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ZAI from 'z-ai-web-dev-sdk';

/**
 * AI Agent Chat API (Agentic Mode)
 * POST /api/ai/agent
 * Body: { message, context, language, conversationHistory }
 * 
 * Only teachers and admins can use the agentic AI.
 */

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only admin/teacher can use AI agent
    const role = session.user.role;
    if (role !== 'SCHOOL_ADMIN' && role !== 'SUPER_ADMIN' && role !== 'TEACHER' && role !== 'VICE_PRINCIPAL') {
      return NextResponse.json(
        { error: 'Only teachers and admins can use the AI agent' },
        { status: 403 }
      );
    }

    const { schoolId } = session.user;
    if (!schoolId) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 403 });
    }

    const body = await request.json();
    const { message, context = 'teacher-assistant', language = 'de', conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build system prompt based on context
    const systemPrompts: Record<string, string> = {
      'teacher-assistant': `Du bist ein KI-Assistent für Lehrkräfte an einer deutschen Schule.
Du hilfst bei Unterrichtsvorbereitung, Bewertungsvorschlägen, Kompetenzanalyse und Differenzierung.
Du kennst das deutsche Schulsystem (Grundschule, Gymnasium) und die kompetenzorientierte Beurteilung.
Antworte auf Deutsch, es sei denn es wird explizit anders verlangt.
Sei konkret, praktisch und praxisnah.`,
      'lesson-planner': `Du bist ein Experte für Unterrichtsplanung nach dem kompetenzorientierten Ansatz.
Du erstellst strukturierte Unterrichtsentwürfe mit Phasen, Lernzielen und Differenzierung.`,
      'assessment-helper': `Du bist ein Experte für Leistungsbewertung.
Du hilfst bei der Erstellung von Bewertungsrastern, Kompetenzchecklisten und Notenbegründungen.`,
    };

    const systemPrompt = systemPrompts[context] || systemPrompts['teacher-assistant'];

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Generate using z-ai-web-dev-sdk
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    const responseContent = response.choices?.[0]?.message?.content || 'Ich konnte keine Antwort generieren.';

    return NextResponse.json({ response: responseContent });
  } catch (error) {
    console.error('AI Agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
