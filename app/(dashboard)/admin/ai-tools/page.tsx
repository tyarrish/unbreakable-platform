'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Sparkles, MessageSquare, BarChart, Loader2, Mail, CheckCircle } from 'lucide-react'

export default function AIToolsPage() {
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isCreatingWelcome, setIsCreatingWelcome] = useState(false)
  const [discussionPrompt, setDiscussionPrompt] = useState<any>(null)
  const [healthReport, setHealthReport] = useState<string>('')

  async function createWelcomeDiscussion() {
    setIsCreatingWelcome(true)
    try {
      const res = await fetch('/api/ai/create-welcome-discussion', {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Welcome discussion created: "${data.discussion.title}"`)
      } else {
        toast.error('Failed to create discussion')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create discussion')
    } finally {
      setIsCreatingWelcome(false)
    }
  }

  async function generatePrompt() {
    setIsGeneratingPrompt(true)
    try {
      const res = await fetch('/api/ai/generate-discussion-prompt', {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        setDiscussionPrompt(data.prompt)
        toast.success('Discussion prompt generated!')
      } else {
        toast.error('Failed to generate prompt')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to generate prompt')
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  async function generateReport(sendEmail = false) {
    setIsGeneratingReport(true)
    try {
      const res = await fetch('/api/ai/generate-health-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendEmail }),
      })
      const data = await res.json()

      if (data.success) {
        setHealthReport(data.report)
        toast.success(sendEmail ? 'Report generated and emailed!' : 'Report generated!')
      } else {
        toast.error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to generate report')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <Container>
      <PageHeader
        heading="AI Tools"
        description="Next-level AI capabilities for cohort management"
      />

      <div className="space-y-8">
        {/* Quick Actions */}
        <Card className="border-2 border-rogue-gold/30 bg-gradient-to-br from-rogue-gold/10 to-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>One-click AI utilities</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={createWelcomeDiscussion}
              disabled={isCreatingWelcome}
              variant="outline"
              className="border-rogue-forest/30 hover:bg-rogue-forest/10"
            >
              {isCreatingWelcome ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 text-rogue-gold" />
                  Create Week 1 Welcome Discussion
                </>
              )}
            </Button>
            <p className="text-xs text-rogue-slate/70 mt-2">
              Generates and posts an AI-written welcome thread to kick off community engagement
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Discussion Prompt Generator */}
          <Card className="border-2 border-rogue-copper/20 bg-gradient-to-br from-rogue-copper/5 to-white">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rogue-copper rounded-lg text-white">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>AI Discussion Prompts</CardTitle>
                <CardDescription>Generate weekly discussion starters</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-rogue-slate leading-relaxed">
              AI analyzes current module, recent discussion themes, and cohort engagement to generate
              thought-provoking prompts that push toward vulnerability and real work.
            </p>

            <Button
              onClick={generatePrompt}
              disabled={isGeneratingPrompt}
              className="w-full bg-rogue-copper hover:bg-rogue-copper/90"
            >
              {isGeneratingPrompt ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Discussion Prompt
                </>
              )}
            </Button>

            {discussionPrompt && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-rogue-sage/20 space-y-3">
                <div>
                  <Badge className="mb-2 bg-rogue-copper text-white">Generated Prompt</Badge>
                  <h4 className="text-lg font-bold text-rogue-forest">{discussionPrompt.title}</h4>
                </div>
                <p className="text-sm text-rogue-slate leading-relaxed">{discussionPrompt.prompt}</p>
                <p className="text-xs text-rogue-slate/70 italic border-l-2 border-rogue-gold pl-3">
                  Why now: {discussionPrompt.why}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${discussionPrompt.title}\n\n${discussionPrompt.prompt}`
                      )
                      toast.success('Copied to clipboard!')
                    }}
                  >
                    Copy Prompt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a href="/discussions?create=true">Post to Discussions</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Health Report */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <BarChart className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Community Health Report</CardTitle>
                <CardDescription>Weekly cohort insights and actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-rogue-slate leading-relaxed">
              Comprehensive AI-generated report analyzing engagement patterns, emerging themes,
              flag summaries, and recommended actions for the week.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => generateReport(false)}
                disabled={isGeneratingReport}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              <Button
                onClick={() => generateReport(true)}
                disabled={isGeneratingReport}
                variant="outline"
                className="border-blue-200"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Me
              </Button>
            </div>

            {healthReport && (
              <div className="mt-6 p-5 bg-white rounded-lg border border-rogue-sage/20 max-h-96 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Badge className="bg-blue-600 text-white">Generated Report</Badge>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: healthReport }}
                />
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </Container>
  )
}

