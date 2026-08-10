'use client'

import { useState, useRef, useEffect } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Send, Paperclip, Phone, Video, MoreVertical } from 'lucide-react'
import { getAvatarColor, initials } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  name: string
  role: string
  online?: boolean
  lastMessage?: string
  time?: string
  unread?: number
}

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Ahmet Yılmaz', role: 'Teacher', online: true, lastMessage: 'Please check the homework', time: '2m', unread: 2 },
  { id: '2', name: 'Ayşe Kaya', role: 'Parent', online: true, lastMessage: 'Thank you for the update', time: '10m' },
  { id: '3', name: 'Math Teachers Group', role: 'Group', online: false, lastMessage: 'Meeting at 3 PM', time: '1h', unread: 5 },
  { id: '4', name: 'Mehmet Demir', role: 'Student', online: false, lastMessage: 'When is the exam?', time: '3h' },
  { id: '5', name: 'Fatma Şahin', role: 'Accountant', online: true, lastMessage: 'Fees received', time: '5h' },
  { id: '6', name: 'Parents Group - Class 10A', role: 'Group', online: false, lastMessage: 'PTM reminder', time: '1d' },
  { id: '7', name: 'Hasan Çelik', role: 'Teacher', online: false, lastMessage: 'Good morning!', time: '2d' },
  { id: '8', name: 'Zeynep Arslan', role: 'Student', online: true, lastMessage: 'Submitted assignment', time: '3d' },
]

const MOCK_MESSAGES = [
  { id: '1', sender: 'them', text: 'Hello! How are you?', time: '10:30 AM' },
  { id: '2', sender: 'me', text: 'I am doing great, thank you! How can I help you today?', time: '10:31 AM' },
  { id: '3', sender: 'them', text: 'I wanted to discuss about the upcoming parent-teacher meeting.', time: '10:32 AM' },
  { id: '4', sender: 'me', text: 'Sure, the meeting is scheduled for this Saturday at 9 AM.', time: '10:33 AM' },
  { id: '5', sender: 'them', text: 'Perfect, I will be there. Thank you for the information!', time: '10:34 AM' },
  { id: '6', sender: 'me', text: 'You are welcome. Is there anything else I can help with?', time: '10:35 AM' },
  { id: '7', sender: 'them', text: 'Not for now. Have a great day!', time: '10:36 AM' },
]

export function ChatModule() {
  const [activeContact, setActiveContact] = useState<Contact | null>(MOCK_CONTACTS[0])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages([...messages, { id: String(Date.now()), sender: 'me', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setMessage('')
    // simulate reply
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: String(Date.now() + 1), sender: 'them', text: 'Got it, thanks!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }, 1500)
  }

  const filteredContacts = MOCK_CONTACTS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader title="Messages" subtitle="Internal chat and communication" />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr] h-[600px]">
          {/* Contacts list */}
          <div className="border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredContacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveContact(c)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 text-left hover:bg-muted/40 transition-colors border-b',
                    activeContact?.id === c.id && 'bg-muted'
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar>
                      <AvatarFallback className={getAvatarColor(c.name)}>
                        {initials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    {c.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                  </div>
                  {c.unread && (
                    <span className="bg-primary text-primary-foreground text-[10px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Chat area */}
          {activeContact ? (
            <div className="flex flex-col">
              {/* Chat header */}
              <div className="border-b p-3 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className={getAvatarColor(activeContact.name)}>
                    {initials(activeContact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activeContact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeContact.online ? 'Online now' : 'Last seen recently'} • {activeContact.role}
                  </p>
                </div>
                <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={cn('flex', m.sender === 'me' ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[70%] rounded-2xl px-3 py-2',
                        m.sender === 'me'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      )}>
                        <p className="text-sm">{m.text}</p>
                        <p className={cn('text-[10px] mt-0.5', m.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{m.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-3 flex items-center gap-2">
                <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              Select a contact to start chatting
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
