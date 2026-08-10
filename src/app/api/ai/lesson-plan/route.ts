// @ts-nocheck
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ZAI from 'z-ai-web-dev-sdk';

/**
 * AI Lesson Plan Generation API
 * POST /api/ai/lesson-plan
 * Body: { subject, topic, classLevel, duration, language }
 * 
 * Only teachers and admins can generate lesson plans.
 */

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only admin/teacher can generate lesson plans
    const role = session.user.role;
    if (role !== 'SCHOOL_ADMIN' && role !== 'SUPER_ADMIN' && role !== 'TEACHER' && role !== 'VICE_PRINCIPAL') {
      return NextResponse.json(
        { error: 'Only teachers and admins can generate lesson plans' },
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

    if (!aiSettings) {
      return NextResponse.json(
        { error: 'AI settings not configured' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subject, topic, classLevel, duration = 45, language = 'de' } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Build the lesson plan prompt
    const langText = language === 'de' ? 'Deutsch' : language === 'en' ? 'Englisch' : 'Türkçe';
    const prompt = `Erstelle einen detaillierten Unterrichtsentwurf auf ${langText}.

Fach: ${subject || 'Allgemein'}
Thema: ${topic}
Klassenstufe: ${classLevel || '3'}
Dauer: ${duration} Minuten

Struktur:
1. Lernziele (3-5 Ziele)
2. Einstieg/Motivation (5-10 Min.)
3. Erarbeitungsphase (15-20 Min.)
4. Übungsphase (10-15 Min.)
5. Sicherung/Reflexion (5-10 Min.)
6. Differenzierungsmöglichkeiten
7. Materialien/Medien
8. Hausaufgabe

Bitte strukturiere die Antwort mit klaren Überschriften und Bulletpoints.`;

    // Generate using z-ai-web-dev-sdk
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Du bist ein erfahrener Lehrer und Unterrichtsplaner. Du erstellst detaillierte, praxisnahe Unterrichtsentwürfe.' },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const content = response.choices?.[0]?.message?.content || 'Keine Antwort generiert.';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI Lesson Plan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
