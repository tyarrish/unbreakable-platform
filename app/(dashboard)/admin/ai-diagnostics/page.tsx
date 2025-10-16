'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export default function AIDiagnosticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiagnostics()
  }, [])

  async function fetchDiagnostics() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/test-generation')
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching diagnostics:', error)
      setData({ error: 'Failed to fetch diagnostics' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rogue-forest mx-auto"></div>
          <p className="mt-4 text-rogue-slate">Loading diagnostics...</p>
        </div>
      </Container>
    )
  }

  if (data?.error) {
    return (
      <Container>
        <PageHeader heading="AI Diagnostics" description="System health check" />
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <div className="flex items-center gap-3 text-red-700">
              <XCircle className="h-6 w-6" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{data.error}</p>
                {data.details && <p className="text-xs mt-1">{data.details}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    )
  }

  const diagnostics = data?.diagnostics

  return (
    <Container>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-rogue-forest">AI System Diagnostics</h1>
          <p className="text-lg text-rogue-slate mt-2">
            Check what data is available for AI generation
          </p>
        </div>
        <Button onClick={fetchDiagnostics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Program State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Program State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-rogue-slate">Current Week:</dt>
                <dd className="font-semibold text-rogue-forest">
                  Week {diagnostics?.context?.programState?.currentWeek}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-rogue-slate">Current Module:</dt>
                <dd className="font-semibold text-rogue-forest">
                  {diagnostics?.context?.programState?.currentModule}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Community Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {diagnostics?.context?.discussionsCount > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              Community Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-rogue-slate">Discussions (48h):</dt>
                <dd>
                  <Badge variant={diagnostics?.context?.discussionsCount > 0 ? 'default' : 'outline'}>
                    {diagnostics?.context?.discussionsCount || 0}
                  </Badge>
                </dd>
              </div>
              {diagnostics?.context?.discussionSample?.length > 0 && (
                <div className="mt-3 p-3 bg-rogue-sage/5 rounded-lg">
                  <p className="font-medium text-rogue-forest mb-2">Sample Discussions:</p>
                  {diagnostics.context.discussionSample.map((d: any, i: number) => (
                    <p key={i} className="text-xs text-rogue-slate">
                      • {d.title} (by {d.author})
                    </p>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <dt className="text-rogue-slate">Active Users (7d):</dt>
                <dd className="font-semibold text-rogue-forest">
                  {diagnostics?.context?.activeUsers} / {diagnostics?.context?.totalUsers}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-rogue-slate">Upcoming Events:</dt>
                <dd>
                  <Badge variant={diagnostics?.context?.upcomingEvents > 0 ? 'default' : 'outline'}>
                    {diagnostics?.context?.upcomingEvents || 0}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Users for Personalization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {diagnostics?.users?.totalUsers > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Users for Personalization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-rogue-slate">Total Active Members:</dt>
                <dd className="font-semibold text-rogue-forest">
                  {diagnostics?.users?.totalUsers || 0}
                </dd>
              </div>
              {diagnostics?.users?.sampleUser && (
                <div className="mt-3 p-3 bg-rogue-sage/5 rounded-lg">
                  <p className="font-medium text-rogue-forest mb-2">Sample User Metrics:</p>
                  <pre className="text-xs text-rogue-slate">
                    {JSON.stringify(diagnostics.users.sampleUser, null, 2)}
                  </pre>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Existing Generated Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {diagnostics?.existingContent?.totalRecords > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              Generated Content History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-rogue-slate mb-3">
              Total records: {diagnostics?.existingContent?.totalRecords || 0}
            </p>
            {diagnostics?.existingContent?.latestRecords?.length > 0 && (
              <div className="space-y-2">
                {diagnostics.existingContent.latestRecords.map((record: any) => (
                  <div
                    key={record.id}
                    className="p-3 bg-rogue-sage/5 rounded-lg text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-rogue-forest">{record.type}</span>
                      <div className="flex gap-2">
                        {record.approved && (
                          <Badge variant="outline" className="text-xs">
                            Approved
                          </Badge>
                        )}
                        {record.active && (
                          <Badge className="text-xs bg-rogue-gold text-white">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-rogue-slate/70 mt-1">
                      Generated: {new Date(record.generated_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}

