'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Video, Image as ImageIcon, FileText, Send,
  Loader2, Download, Play, RefreshCw, Copy, Check,
  Film, Wand2, BookOpen, Lightbulb, GraduationCap,
  Clock, CheckCircle2, AlertCircle, Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type AITab = 'video' | 'image' | 'lesson' | 'agent';
type GenStatus = 'idle' | 'generating' | 'success' | 'error';

interface VideoResult {
  taskId?: string;
  status: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  message?: string;
  provider?: string;
}

interface ImageResult {
  url?: string | null;
  b64_json?: string | null;
  revised_prompt?: string;
  provider?: string;
}

export default function AIStudioView() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<AITab>('video');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            AI Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            KI-gestützte Content-Erstellung für den Unterricht
          </p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
          <Wand2 className="h-3 w-3 mr-1" />
          Agentic AI
        </Badge>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Video-Gen', icon: Video, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/30' },
          { label: 'Bild-Gen', icon: ImageIcon, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
          { label: 'Unterricht', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'KI-Agent', icon: Lightbulb, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('rounded-lg p-2.5', s.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">Bereit</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AITab)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="video">
            <Video className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Video-Lektion</span>
            <span className="sm:hidden">Video</span>
          </TabsTrigger>
          <TabsTrigger value="image">
            <ImageIcon className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Bild generieren</span>
            <span className="sm:hidden">Bild</span>
          </TabsTrigger>
          <TabsTrigger value="lesson">
            <BookOpen className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Unterrichtsentwurf</span>
            <span className="sm:hidden">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="agent">
            <Lightbulb className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">KI-Agent</span>
            <span className="sm:hidden">Agent</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-4">
          <VideoGenerationTab />
        </TabsContent>
        <TabsContent value="image" className="mt-4">
          <ImageGenerationTab />
        </TabsContent>
        <TabsContent value="lesson" className="mt-4">
          <LessonPlanTab />
        </TabsContent>
        <TabsContent value="agent" className="mt-4">
          <AgentChatTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Video Generation Tab ──────────────────────────────────────────

function VideoGenerationTab() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('10');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [style, setStyle] = useState('realistic');
  const [language, setLanguage] = useState('de');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenStatus>('idle');
  const [result, setResult] = useState<VideoResult | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Bitte gib einen Prompt ein');
      return;
    }
    setStatus('generating');
    setResult(null);

    try {
      const res = await fetch('/api/ai/snapgen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration: Number(duration), aspectRatio, style, language, subject, topic }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generierung fehlgeschlagen');
      }

      const data = await res.json();
      setResult(data);

      // If video is not ready, poll for status
      if (data.taskId && data.status !== 'completed' && !data.videoUrl) {
        startPolling(data.taskId, data.provider);
      } else if (data.videoUrl) {
        setStatus('success');
      } else {
        setStatus('generating');
        toast.info('Video wird generiert. Dies kann einige Minuten dauern.');
      }
    } catch (error: any) {
      setStatus('error');
      toast.error(error.message || 'Fehler bei der Video-Generierung');
    }
  }, [prompt, duration, aspectRatio, style, language, subject, topic]);

  const startPolling = (taskId: string, provider: string) => {
    if (pollInterval) clearInterval(pollInterval);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ai/snapgen?taskId=${taskId}&provider=${provider}`);
        if (res.ok) {
          const data = await res.json();
          if (data.videoUrl) {
            setResult(prev => ({ ...prev, videoUrl: data.videoUrl, status: 'completed' }));
            setStatus('success');
            toast.success('Video erfolgreich generiert!');
            clearInterval(interval);
          } else if (data.status === 'failed' || data.status === 'error') {
            setStatus('error');
            toast.error('Video-Generierung fehlgeschlagen');
            clearInterval(interval);
          }
        }
      } catch {
        // Continue polling
      }
    }, 5000);

    setPollInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  const promptSuggestions = [
    'Erkläre den Wasserkreislauf mit Animationen',
    'Wie funktionieren Brüche? Visuelle Erklärung',
    'Der Wasserstoff als chemisches Element',
    'Die Französische Revolution - Überblick',
    'Photosynthese einfach erklärt',
    'Teilen mit Rest - Schritt für Schritt',
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Input panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Film className="h-4 w-4 text-sky-500" />
            Video-Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Thema / Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Beschreibe, was das Video erklären soll..."
              rows={4}
              className="mt-1.5"
            />
          </div>

          {/* Prompt suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                className="text-xs rounded-full bg-muted hover:bg-muted/70 px-2.5 py-1 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Dauer (Sek.)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Sekunden</SelectItem>
                  <SelectItem value="10">10 Sekunden</SelectItem>
                  <SelectItem value="15">15 Sekunden</SelectItem>
                  <SelectItem value="30">30 Sekunden</SelectItem>
                  <SelectItem value="60">60 Sekunden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Format</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landschaft)</SelectItem>
                  <SelectItem value="9:16">9:16 (Hochformat)</SelectItem>
                  <SelectItem value="1:1">1:1 (Quadrat)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Stil</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistisch</SelectItem>
                  <SelectItem value="animated">Animiert</SelectItem>
                  <SelectItem value="cartoon">Zeichentrick</SelectItem>
                  <SelectItem value="whiteboard">Whiteboard</SelectItem>
                  <SelectItem value="3d">3D-Animation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Sprache</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">Englisch</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Fach (optional)</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="z.B. Mathematik" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Thema (optional)</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z.B. Brüche" className="mt-1" />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={status === 'generating' || !prompt.trim()}
            className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 hover:opacity-90"
          >
            {status === 'generating' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generiere Video...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Video generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-4 w-4 text-emerald-500" />
            Ergebnis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Film className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Generiere ein Video, um es hier zu sehen
                </p>
              </motion.div>
            )}

            {status === 'generating' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Loader2 className="h-12 w-12 text-sky-500 animate-spin mb-4" />
                <p className="text-sm font-medium">Video wird generiert...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dies kann 1-5 Minuten dauern
                </p>
                {result?.provider && (
                  <Badge variant="outline" className="mt-3 text-xs">
                    Provider: {result.provider}
                  </Badge>
                )}
              </motion.div>
            )}

            {status === 'success' && result?.videoUrl && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <video
                  src={result.videoUrl}
                  controls
                  className="w-full rounded-lg border"
                  poster={result.thumbnailUrl || undefined}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={result.videoUrl} download="ai-video.mp4">
                      <Download className="h-4 w-4 mr-1" /> Herunterladen
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setStatus('idle'); setResult(null); }}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Neu
                  </Button>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
                <p className="text-sm font-medium">Generierung fehlgeschlagen</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setStatus('idle')}>
                  Erneut versuchen
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Image Generation Tab ──────────────────────────────────────────

function ImageGenerationTab() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [status, setStatus] = useState<GenStatus>('idle');
  const [result, setResult] = useState<ImageResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Bitte gib einen Prompt ein');
      return;
    }
    setStatus('generating');
    setResult(null);

    try {
      const res = await fetch('/api/ai/perchance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generierung fehlgeschlagen');
      }

      const data = await res.json();
      setResult(data.image);
      setStatus('success');
      toast.success('Bild erfolgreich generiert!');
    } catch (error: any) {
      setStatus('error');
      toast.error(error.message || 'Fehler bei der Bild-Generierung');
    }
  }, [prompt, style]);

  const imageSrc = result?.b64_json
    ? `data:image/png;base64,${result.b64_json}`
    : result?.url || null;

  const promptSuggestions = [
    'Eine Sonne mit freundlichem Gesicht für Kinder',
    'Der Wasserstoff als blauer Ball',
    'Brüche visuell als Pizza dargestellt',
    'Eine Burg im Mittelalter',
    'Das Sonnensystem mit allen Planeten',
    'Eine Pflanze beim Wachsen',
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-violet-500" />
            Bild-Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Beschreibung</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Beschreibe das Bild, das generiert werden soll..."
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                className="text-xs rounded-full bg-muted hover:bg-muted/70 px-2.5 py-1 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          <div>
            <Label className="text-sm">Stil</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="realistic">Realistisch</SelectItem>
                <SelectItem value="cartoon">Zeichentrick</SelectItem>
                <SelectItem value="watercolor">Aquarell</SelectItem>
                <SelectItem value="pixel">Pixel-Art</SelectItem>
                <SelectItem value="sketch">Skizze</SelectItem>
                <SelectItem value="3d">3D-Render</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={status === 'generating' || !prompt.trim()}
            className="w-full bg-gradient-to-r from-violet-500 to-emerald-500 hover:opacity-90"
          >
            {status === 'generating' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generiere Bild...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Bild generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-emerald-500" />
            Ergebnis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Generiere ein Bild, um es hier zu sehen</p>
              </div>
            )}
            {status === 'generating' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-12 w-12 text-violet-500 animate-spin mb-4" />
                <p className="text-sm font-medium">Bild wird generiert...</p>
              </div>
            )}
            {status === 'success' && imageSrc && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <img src={imageSrc} alt={prompt} className="w-full rounded-lg border" />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={imageSrc} download="ai-image.png">
                      <Download className="h-4 w-4 mr-1" /> Herunterladen
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(imageSrc); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? 'Kopiert!' : 'Kopieren'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setStatus('idle'); setResult(null); }}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Neu
                  </Button>
                </div>
              </motion.div>
            )}
            {status === 'error' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
                <p className="text-sm font-medium">Generierung fehlgeschlagen</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setStatus('idle')}>
                  Erneut versuchen
                </Button>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Lesson Plan Tab ──────────────────────────────────────────────

function LessonPlanTab() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [classLevel, setClassLevel] = useState('3');
  const [duration, setDuration] = useState('45');
  const [status, setStatus] = useState<GenStatus>('idle');
  const [result, setResult] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('Bitte gib ein Thema ein');
      return;
    }
    setStatus('generating');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lesson-plan',
          subject,
          topic,
          classLevel,
          duration: Number(duration),
          language: 'de',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generierung fehlgeschlagen');
      }

      const data = await res.json();
      setResult(data.content || data.response || 'Keine Antwort erhalten.');
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      toast.error(error.message || 'Fehler');
    }
  }, [subject, topic, classLevel, duration]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            Unterrichtsentwurf
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Fach</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="z.B. Mathematik" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Klassenstufe</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['1','2','3','4','5','6','7','8','9','10','11','12','13'].map(l => (
                    <SelectItem key={l} value={l}>Klasse {l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-sm">Thema</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="z.B. Brüche teilen" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">Dauer (Min.)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Min.</SelectItem>
                <SelectItem value="45">45 Min.</SelectItem>
                <SelectItem value="60">60 Min.</SelectItem>
                <SelectItem value="90">90 Min.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={status === 'generating'} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90">
            {status === 'generating' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generiere...</> : <><Sparkles className="h-4 w-4 mr-2" /> Entwurf erstellen</>}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ergebnis</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Generiere einen Unterrichtsentwurf</p>
            </div>
          )}
          {status === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
              <p className="text-sm font-medium">Entwurf wird erstellt...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="space-y-3">
              <Textarea value={result} readOnly rows={20} className="font-mono text-sm" />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(result); toast.success('Kopiert!'); }}>
                  <Copy className="h-4 w-4 mr-1" /> Kopieren
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setStatus('idle'); setResult(''); }}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Neu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Agent Chat Tab ───────────────────────────────────────────────

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function AgentChatTab() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Hallo! Ich bin dein KI-Assistent für SchulOS. Ich kann dir helfen bei:\n\n- Unterrichtsvorbereitung\n- Bewertungsvorschlägen\n- Kompetenzanalyse\n- Ideen für Differenzierung\n\nWie kann ich dir heute helfen?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: input,
          context: 'teacher-assistant',
          language: 'de',
        }),
      });

      if (!res.ok) throw new Error('KI-Anfrage fehlgeschlagen');
      const data = await res.json();
      const aiMsg: ChatMsg = {
        role: 'assistant',
        content: data.response || data.content || 'Entschuldige, ich konnte keine Antwort generieren.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Entschuldige, es ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const suggestions = [
    'Hilf mir bei der Vorbereitung einer Mathestunde zum Thema Brüche',
    'Welche Kompetenzen sollte ich in Klasse 3 Deutsch abdecken?',
    'Erstelle 5 Differenzierungsideen für eine gemischte Lerngruppe',
    'Bewerte diesen Schülertext: "Der Hund lief schnell"',
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          KI-Agent (Agentic Mode)
          <Badge variant="outline" className="text-xs ml-auto">BETA</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 gap-3">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={cn(
                'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                msg.role === 'user'
                  ? 'bg-emerald-500 text-white rounded-br-sm'
                  : 'bg-muted rounded-bl-sm'
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="text-xs rounded-full bg-muted hover:bg-muted/70 px-2.5 py-1 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Frage den KI-Agenten..."
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
