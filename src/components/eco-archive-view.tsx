'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Archive, FileText, Search, Upload, Trash2, Download, Filter,
  Shield, Lock, FileCheck, Calendar, Tag, HardDrive, Cloud, RefreshCw,
  Leaf, TreePine, Droplets, Wind, BarChart3, TrendingDown,
  Building2, Send, CheckCircle2, Clock, AlertCircle, FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de as deLocale } from 'date-fns/locale';

// ─── Eco Dashboard Tab ──────────────────────────────────────────────

function EcoDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/eco-metrics').then((d: any) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-emerald-500" /></div>;

  const totals = data?.totals || { paperSavedSheets: 0, paperSavedGrams: 0, co2SavedKg: 0, waterSavedLiters: 0, treesSaved: 0 };

  const ecoCards = [
    { icon: FileText, label: 'Papier gespart', value: totals.paperSavedSheets.toLocaleString('de-DE'), unit: 'Blätter', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { icon: TreePine, label: 'Bäume gerettet', value: totals.treesSaved.toFixed(2), unit: 'Bäume', color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
    { icon: Wind, label: 'CO₂-Einsparung', value: totals.co2SavedKg.toFixed(1), unit: 'kg', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/30' },
    { icon: Droplets, label: 'Wasser gespart', value: totals.waterSavedLiters.toFixed(0), unit: 'Liter', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white">
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Umweltbeitrag der Schule</h2>
          </div>
          <p className="text-sm opacity-90 max-w-2xl">
            Durch die Digitalisierung mit SchulOS sparen wir Papier, schützen Bäume und reduzieren den CO₂-Fußabdruck.
            Jedes digitale Heft, jede digitale Mitteilung und jedes Zeugnis als PDF sp wertvolle Ressourcen.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ecoCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-5">
                  <div className={cn('inline-flex rounded-xl p-2.5 mb-3', card.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.unit}</p>
                  <p className="text-sm font-medium mt-1">{card.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            Monatliche Papiereinsparung
          </CardTitle>
          <CardDescription>Blätter Papier pro Monat durch Digitalisierung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-48">
            {(data?.metrics || []).slice(-6).reverse().map((m: any, i: number) => {
              const max = Math.max(...(data?.metrics || []).map((x: any) => x.paperSavedSheets), 1);
              const height = (m.paperSavedSheets / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold">{m.paperSavedSheets}</span>
                  <div className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all" style={{ height: `${height}%`, minHeight: '4px' }} />
                  <span className="text-[10px] text-muted-foreground">{format(new Date(m.date), 'MMM', { locale: deLocale })}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Digital Archive Tab ────────────────────────────────────────────

const DOC_TYPES = [
  { value: 'REPORT_CARD', label: 'Zeugnis' },
  { value: 'CERTIFICATE', label: 'Bescheinigung' },
  { value: 'ENROLLMENT', label: 'Einschulung' },
  { value: 'LETTER', label: 'Brief' },
  { value: 'CONTRACT', label: 'Vertrag' },
  { value: 'OTHER', label: 'Sonstiges' },
];

const DOC_CATEGORIES = [
  { value: 'STUDENT', label: 'Schüler' },
  { value: 'STAFF', label: 'Personal' },
  { value: 'FINANCE', label: 'Finanzen' },
  { value: 'ADMIN', label: 'Verwaltung' },
  { value: 'LEGAL', label: 'Recht' },
];

function DigitalArchive() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'ALL') params.set('category', category);
      const data = await apiGet(`/api/archived-documents?${params}`);
      setDocuments(data || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Archive className="h-5 w-5 text-emerald-500" />
            Digitales Archiv
          </h2>
          <p className="text-sm text-muted-foreground">Papierlose Dokumentenverwaltung — alles digital, alles durchsuchbar</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Dokument archivieren
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Volltextsuche (OCR, Titel, Tags)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle Kategorien</SelectItem>
            {DOC_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Documents list */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Archive className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Keine Dokumente im Archiv</p>
              <p className="text-xs text-muted-foreground mt-1">Scannen Sie Dokumente ein oder laden Sie PDFs hoch</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="divide-y">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <div className="rounded-lg p-2 bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        {doc.isConfidential && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">{DOC_TYPES.find(t => t.value === doc.documentType)?.label || doc.documentType}</Badge>
                        <Badge variant="outline" className="text-[10px]">{DOC_CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(doc.scanDate), 'dd.MM.yyyy')}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toast.info('Download wird vorbereitet...')}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog placeholder */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setUploadOpen(false)}>
          <Card className="max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-base">Dokument archivieren</CardTitle>
              <CardDescription>Dokument einlesen und ins digitale Archiv aufnehmen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Datei hierher ziehen oder klicken</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOCX — max 50 MB</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Typ</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Wählen..." /></SelectTrigger><SelectContent>{DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-xs">Kategorie</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Wählen..." /></SelectTrigger><SelectContent>{DOC_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setUploadOpen(false)}>Abbrechen</Button>
              <Button onClick={() => { toast.success('Dokument archiviert'); setUploadOpen(false); }}>Archivieren</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Government Portal Tab ──────────────────────────────────────────

const REPORT_TYPES = [
  { value: 'STATISTIK_SCHULAMT', label: 'Schulstatistik (Schulamt)' },
  { value: 'SCHULBESUCH', label: 'Schulbesuchsstatistik' },
  { value: 'FUERDERUNG', label: 'Fördermittelbericht' },
  { value: 'PERSONAL', label: 'Personalstatistik' },
  { value: 'BILDUNGSBERICHT', label: 'Bildungsbericht' },
];

function GovernmentPortal() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/government-reports');
      setReports(data || []);
    } catch { setReports([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    DRAFT: { color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300', icon: FileText, label: 'Entwurf' },
    SUBMITTED: { color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', icon: Send, label: 'Eingereicht' },
    ACKNOWLEDGED: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2, label: 'Bestätigt' },
    REJECTED: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', icon: AlertCircle, label: 'Abgelehnt' },
  };

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-700 to-slate-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-7 w-7" />
            <h2 className="text-xl font-bold">Behördenportal</h2>
          </div>
          <p className="text-sm opacity-90 max-w-2xl">
            Vorbereitung der elektronischen Berichterstattung an Schulamt, Bildungsministerium und weitere Behörden.
            Statistiken und Berichte werden digital erstellt und können exportiert werden.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-white/20 text-white border-0">Vorbereitungsphase</Badge>
            <Badge className="bg-amber-500/20 text-amber-200 border-0">Manuelle Übermittlung</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reports list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            Berichte an Behörden
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Noch keine Berichte erstellt</p>
            </div>
          ) : (
            <div className="divide-y">
              {reports.map(r => {
                const sc = statusConfig[r.status] || statusConfig.DRAFT;
                const SIcon = sc.icon;
                return (
                  <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-muted/30">
                    <div className={cn('rounded-lg p-2 shrink-0', sc.color)}>
                      <SIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{REPORT_TYPES.find(t => t.value === r.reportType)?.label || r.reportType}</p>
                      <p className="text-xs text-muted-foreground">Zeitraum: {r.reportingPeriod}</p>
                    </div>
                    <Badge variant="outline" className={cn('text-xs', sc.color)}>{sc.label}</Badge>
                    <span className="text-xs text-muted-foreground shrink-0">{format(new Date(r.createdAt), 'dd.MM.yyyy')}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">Hinweis zur Behördenanbindung</p>
              <p className="text-xs text-muted-foreground mt-1">
                Die elektronische Anbindung an Behördenportale (z.B. BILDUNGS-Portal NRW, Schulportal Bayern)
                erfordert eine offizielle Vereinbarung mit dem jeweiligen Bundesland.
                SchulOS bereitet die Daten vor — die Übermittlung erfolgt aktuell manuell via Export.
                Eine direkte API-Anbindung ist für eine spätere Version geplant.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── NAS/Storage Settings Tab ──────────────────────────────────────

function StorageSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet('/api/storage-config').then((d) => {
      setConfig(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPost('/api/storage-config', config);
      toast.success('Speichereinstellungen gespeichert');
    } catch {
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-8"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-emerald-500" />
            NAS-Server Anbindung
          </CardTitle>
          <CardDescription>Verbinden Sie einen lokalen NAS-Server für automatische Backups und Archivierung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div>
              <Label className="text-sm font-medium">NAS aktivieren</Label>
              <p className="text-xs text-muted-foreground">Automatische Backups auf NAS-Server</p>
            </div>
            <Select value={config?.nasEnabled ? 'true' : 'false'} onValueChange={(v) => setConfig({ ...config, nasEnabled: v === 'true' })}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">Aktiv</SelectItem><SelectItem value="false">Inaktiv</SelectItem></SelectContent>
            </Select>
          </div>

          {config?.nasEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">NAS-Host</Label><Input value={config?.nasHost || ''} onChange={(e) => setConfig({ ...config, nasHost: e.target.value })} placeholder="192.168.1.100" className="mt-1" /></div>
                <div><Label className="text-xs">Port</Label><Input type="number" value={config?.nasPort || 445} onChange={(e) => setConfig({ ...config, nasPort: Number(e.target.value) })} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Freigabe-Pfad</Label><Input value={config?.nasShare || ''} onChange={(e) => setConfig({ ...config, nasShare: e.target.value })} placeholder="/SchulOS-Backup" className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Benutzername</Label><Input value={config?.nasUsername || ''} onChange={(e) => setConfig({ ...config, nasUsername: e.target.value })} className="mt-1" /></div>
                <div><Label className="text-xs">Passwort</Label><Input type="password" value={config?.nasPasswordEnc || ''} onChange={(e) => setConfig({ ...config, nasPasswordEnc: e.target.value })} className="mt-1" /></div>
              </div>
              <div><Label className="text-xs">Protokoll</Label><Select value={config?.nasProtocol || 'SMB'} onValueChange={(v) => setConfig({ ...config, nasProtocol: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SMB">SMB</SelectItem><SelectItem value="NFS">NFS</SelectItem><SelectItem value="WebDAV">WebDAV</SelectItem><SelectItem value="S3">S3</SelectItem></SelectContent></Select></div>
              <div><Label className="text-xs">Backup-Häufigkeit</Label><Select value={config?.backupFrequency || 'daily'} onValueChange={(v) => setConfig({ ...config, backupFrequency: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hourly">Stündlich</SelectItem><SelectItem value="daily">Täglich</SelectItem><SelectItem value="weekly">Wöchentlich</SelectItem></SelectContent></Select></div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cloud className="h-4 w-4 text-sky-500" />
            Cloud-Speicher (optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div>
              <Label className="text-sm font-medium">Cloud-Backup aktivieren</Label>
              <p className="text-xs text-muted-foreground">Zusätzliche Sicherigung in der Cloud</p>
            </div>
            <Select value={config?.cloudEnabled ? 'true' : 'false'} onValueChange={(v) => setConfig({ ...config, cloudEnabled: v === 'true' })}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">Aktiv</SelectItem><SelectItem value="false">Inaktiv</SelectItem></SelectContent>
            </Select>
          </div>
          {config?.cloudEnabled && (
            <div><Label className="text-xs">Cloud-Anbieter</Label><Select value={config?.cloudProvider || ''} onValueChange={(v) => setConfig({ ...config, cloudProvider: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Wählen..." /></SelectTrigger><SelectContent><SelectItem value="nextcloud">Nextcloud</SelectItem><SelectItem value="owncloud">ownCloud</SelectItem><SelectItem value="s3">S3-kompatibel</SelectItem></SelectContent></Select></div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
        Speichereinstellungen sichern
      </Button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function EcoArchiveView() {
  const [tab, setTab] = useState('eco');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="h-6 w-6 text-emerald-500" />
          Umwelt & Archiv
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Papierlose Verwaltung, digitale Archivierung und Behördenberichterstattung
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="eco"><Leaf className="h-4 w-4 mr-1.5" />Umwelt</TabsTrigger>
          <TabsTrigger value="archive"><Archive className="h-4 w-4 mr-1.5" />Archiv</TabsTrigger>
          <TabsTrigger value="government"><Building2 className="h-4 w-4 mr-1.5" />Behörden</TabsTrigger>
          <TabsTrigger value="storage"><HardDrive className="h-4 w-4 mr-1.5" />Speicher</TabsTrigger>
        </TabsList>
        <TabsContent value="eco" className="mt-4"><EcoDashboard /></TabsContent>
        <TabsContent value="archive" className="mt-4"><DigitalArchive /></TabsContent>
        <TabsContent value="government" className="mt-4"><GovernmentPortal /></TabsContent>
        <TabsContent value="storage" className="mt-4"><StorageSettings /></TabsContent>
      </Tabs>
    </div>
  );
}
