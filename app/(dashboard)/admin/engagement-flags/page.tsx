'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { AlertCircle, AlertTriangle, CheckCircle2, User, Calendar, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format-date'

interface EngagementFlag {
  id: string
  user_id: string
  flag_type: 'red' | 'yellow' | 'green'
  flag_reason: string
  context: any
  resolved: boolean
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

export default function EngagementFlagsPage() {
  const [flags, setFlags] = useState<EngagementFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('red')
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchFlags()
  }, [])

  async function fetchFlags() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/engagement-flags?resolved=false')
      const data = await res.json()
      
      if (data.success) {
        setFlags(data.flags)
      }
    } catch (error) {
      console.error('Error fetching flags:', error)
      toast.error('Failed to fetch engagement flags')
    } finally {
      setLoading(false)
    }
  }

  async function resolveFlag(flagId: string, notes: string) {
    try {
      const res = await fetch('/api/admin/engagement-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId, notes }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Flag resolved!')
        setResolvingId(null)
        setNotes('')
        fetchFlags()
      } else {
        toast.error('Failed to resolve flag')
      }
    } catch (error) {
      console.error('Error resolving flag:', error)
      toast.error('Failed to resolve flag')
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rogue-forest mx-auto"></div>
          <p className="mt-4 text-rogue-slate">Loading engagement flags...</p>
        </div>
      </Container>
    )
  }

  const redFlags = flags.filter((f) => f.flag_type === 'red')
  const yellowFlags = flags.filter((f) => f.flag_type === 'yellow')
  const greenFlags = flags.filter((f) => f.flag_type === 'green')

  return (
    <Container>
      <PageHeader
        heading="Engagement Flags"
        description="Monitor user engagement patterns and take action where needed"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="red" className="data-[state=active]:bg-red-50">
            <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
            Red ({redFlags.length})
          </TabsTrigger>
          <TabsTrigger value="yellow" className="data-[state=active]:bg-yellow-50">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
            Yellow ({yellowFlags.length})
          </TabsTrigger>
          <TabsTrigger value="green" className="data-[state=active]:bg-green-50">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            Green ({greenFlags.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="red" className="space-y-4">
          {redFlags.length > 0 ? (
            redFlags.map((flag) => (
              <FlagCard
                key={flag.id}
                flag={flag}
                type="red"
                resolvingId={resolvingId}
                notes={notes}
                setResolvingId={setResolvingId}
                setNotes={setNotes}
                onResolve={resolveFlag}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-rogue-sage mx-auto mb-4" />
                <p className="text-lg text-rogue-slate">No red flags!</p>
                <p className="text-sm text-rogue-slate/70 mt-1">
                  All critical engagement issues have been addressed
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="yellow" className="space-y-4">
          {yellowFlags.length > 0 ? (
            yellowFlags.map((flag) => (
              <FlagCard
                key={flag.id}
                flag={flag}
                type="yellow"
                resolvingId={resolvingId}
                notes={notes}
                setResolvingId={setResolvingId}
                setNotes={setNotes}
                onResolve={resolveFlag}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-rogue-sage mx-auto mb-4" />
                <p className="text-lg text-rogue-slate">No yellow flags!</p>
                <p className="text-sm text-rogue-slate/70 mt-1">
                  No users currently need monitoring
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="green" className="space-y-4">
          {greenFlags.length > 0 ? (
            greenFlags.map((flag) => (
              <FlagCard
                key={flag.id}
                flag={flag}
                type="green"
                resolvingId={resolvingId}
                notes={notes}
                setResolvingId={setResolvingId}
                setNotes={setNotes}
                onResolve={resolveFlag}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-rogue-sage mx-auto mb-4" />
                <p className="text-lg text-rogue-slate">No recent breakthroughs</p>
                <p className="text-sm text-rogue-slate/70 mt-1">
                  Green flags will appear when users show positive engagement patterns
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Container>
  )
}

interface FlagCardProps {
  flag: EngagementFlag
  type: 'red' | 'yellow' | 'green'
  resolvingId: string | null
  notes: string
  setResolvingId: (id: string | null) => void
  setNotes: (notes: string) => void
  onResolve: (flagId: string, notes: string) => void
}

function FlagCard({
  flag,
  type,
  resolvingId,
  notes,
  setResolvingId,
  setNotes,
  onResolve,
}: FlagCardProps) {
  const isResolving = resolvingId === flag.id

  const colorClasses = {
    red: 'border-red-200 bg-gradient-to-br from-red-50 to-transparent',
    yellow: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-transparent',
    green: 'border-green-200 bg-gradient-to-br from-green-50 to-transparent',
  }

  const iconClasses = {
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
  }

  const Icon = type === 'red' ? AlertCircle : type === 'yellow' ? AlertTriangle : CheckCircle2

  return (
    <Card className={colorClasses[type]}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${iconClasses[type]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                {flag.profiles?.full_name || flag.profiles?.email || 'Unknown User'}
              </CardTitle>
              <CardDescription className="mt-1">{flag.flag_reason}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {formatRelativeTime(new Date(flag.created_at))}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Context */}
        {flag.context && (
          <div className="mb-4 p-3 bg-white/50 rounded-lg">
            <p className="text-sm font-medium text-rogue-forest mb-2">Context:</p>
            <div className="text-sm text-rogue-slate space-y-1">
              {Object.entries(flag.context).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        {isResolving ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Add notes about how you addressed this flag..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setResolvingId(null)
                  setNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rogue-forest hover:bg-rogue-pine"
                onClick={() => onResolve(flag.id, notes)}
              >
                Mark as Resolved
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setResolvingId(flag.id)}
          >
            Resolve Flag
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

