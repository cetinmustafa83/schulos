'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Cookie, Shield, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
  })

  useEffect(() => {
    const generateSessionId = () => {
      return 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    }
    const sessionId = sessionStorage.getItem('sessionId') || generateSessionId()
    sessionStorage.setItem('sessionId', sessionId)

    // Check if consent already given
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setTimeout(() => setVisible(true), 1500)
    }
  }, [])

  const handleAcceptAll = async () => {
    const allAccepted = { necessary: true, preferences: true, statistics: true, marketing: true }
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted))
    await saveConsent(allAccepted)
    setVisible(false)
    toast.success('Cookie preferences saved')
  }

  const handleAcceptSelected = async () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences))
    await saveConsent(preferences)
    setVisible(false)
    toast.success('Cookie preferences saved')
  }

  const handleReject = async () => {
    const minimal = { necessary: true, preferences: false, statistics: false, marketing: false }
    localStorage.setItem('cookieConsent', JSON.stringify(minimal))
    await saveConsent(minimal)
    setVisible(false)
    toast.success('Only necessary cookies will be used')
  }

  const saveConsent = async (prefs: any) => {
    const sessionId = sessionStorage.getItem('sessionId') || 'unknown'
    try {
      await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...prefs }),
      })
    } catch (e) {
      // Silent fail - consent stored locally
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:max-w-md"
        >
          <Card className="shadow-2xl border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">Cookie Preferences</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    We use cookies to ensure the proper functioning of our website and to enhance your experience.
                    In accordance with EU GDPR and German DSGVO, we need your consent.
                  </p>
                </div>
                <button onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-2 mb-3"
                >
                  {[
                    { key: 'necessary', label: 'Necessary', desc: 'Essential for site functionality', required: true },
                    { key: 'preferences', label: 'Preferences', desc: 'Remember your settings', required: false },
                    { key: 'statistics', label: 'Statistics', desc: 'Anonymous usage data', required: false },
                    { key: 'marketing', label: 'Marketing', desc: 'Relevant advertisements', required: false },
                  ].map((c) => (
                    <div key={c.key} className="flex items-center justify-between rounded-lg border p-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium">{c.label}</span>
                          {c.required && <span className="text-[10px] text-muted-foreground">(required)</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                      </div>
                      <Switch
                        checked={preferences[c.key as keyof typeof preferences]}
                        onCheckedChange={(v) => setPreferences({ ...preferences, [c.key]: v })}
                        disabled={c.required}
                      />
                    </div>
                  ))}
                </motion.div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" onClick={handleAcceptAll} className="flex-1 min-w-[100px]">
                  Accept All
                </Button>
                <Button size="sm" variant="outline" onClick={handleAcceptSelected} className="flex-1 min-w-[100px]">
                  Accept Selected
                </Button>
                <Button size="sm" variant="ghost" onClick={handleReject}>
                  Reject
                </Button>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
