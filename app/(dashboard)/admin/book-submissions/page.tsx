'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { BookOpen, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/format-date'
import type { BookSubmission } from '@/types/index.types'

export default function BookSubmissionsPage() {
  const [submissions, setSubmissions] = useState<(BookSubmission & { submitter?: any })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    try {
      const { data, error } = await (supabase as any)
        .from('book_submissions')
        .select(`
          *,
          submitter:profiles!book_submissions_submitted_by_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error loading submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApprove(submissionId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await (supabase as any)
        .from('book_submissions')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes[submissionId] || null
        })
        .eq('id', submissionId)

      if (error) throw error

      toast.success('Submission approved! You can now add this book to the library.')
      loadSubmissions()
    } catch (error) {
      console.error('Error approving submission:', error)
      toast.error('Failed to approve submission')
    }
  }

  async function handleReject(submissionId: string) {
    if (!reviewNotes[submissionId]?.trim()) {
      toast.error('Please add a note explaining why this submission was rejected')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await (supabase as any)
        .from('book_submissions')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes[submissionId]
        })
        .eq('id', submissionId)

      if (error) throw error

      toast.success('Submission rejected')
      loadSubmissions()
    } catch (error) {
      console.error('Error rejecting submission:', error)
      toast.error('Failed to reject submission')
    }
  }

  if (isLoading) return <PageLoader />

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-rogue-cream via-white to-rogue-sage/5">
      <PageHeader
        heading="Book Submissions"
        description="Review book recommendations from cohort members"
      />

      <Container>
        <div className="py-8 space-y-8">
          {/* Pending Submissions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-rogue-forest">Pending Review</h2>
                <p className="text-sm text-rogue-slate/70 mt-1">{pendingSubmissions.length} awaiting review</p>
              </div>
            </div>

            {pendingSubmissions.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<Clock size={48} />}
                    title="No Pending Submissions"
                    description="All book recommendations have been reviewed"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => (
                  <Card key={submission.id} className="border-rogue-sage/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-rogue-forest">{submission.title}</h3>
                            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                              Pending
                            </Badge>
                          </div>
                          <p className="text-rogue-slate mb-2">by {submission.author}</p>
                          <p className="text-sm text-rogue-slate/70">
                            Submitted by <span className="font-medium">{submission.submitter?.full_name}</span> on {formatDate(submission.created_at)}
                          </p>
                        </div>
                      </div>

                      {expandedId === submission.id && (
                        <div className="space-y-4 pt-4 border-t border-rogue-sage/20">
                          {submission.category && (
                            <div>
                              <span className="text-sm font-medium text-rogue-forest">Category: </span>
                              <Badge variant="outline">{submission.category}</Badge>
                            </div>
                          )}

                          {submission.description && (
                            <div>
                              <h4 className="text-sm font-semibold text-rogue-forest mb-2">Description</h4>
                              <p className="text-sm text-rogue-slate">{submission.description}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-semibold text-rogue-forest mb-2">Why They Recommend It</h4>
                            <p className="text-sm text-rogue-slate bg-rogue-cream/30 p-4 rounded-lg">
                              {submission.reason_for_recommendation}
                            </p>
                          </div>

                          {(submission.isbn || submission.amazon_link) && (
                            <div className="flex gap-4">
                              {submission.isbn && (
                                <p className="text-sm text-rogue-slate/70">ISBN: {submission.isbn}</p>
                              )}
                              {submission.amazon_link && (
                                <a
                                  href={submission.amazon_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-rogue-forest hover:text-rogue-pine font-medium inline-flex items-center gap-1"
                                >
                                  View on Amazon <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Review Notes */}
                          <div className="pt-4 border-t border-rogue-sage/20">
                            <h4 className="text-sm font-semibold text-rogue-forest mb-2">Review Notes (Optional)</h4>
                            <Textarea
                              value={reviewNotes[submission.id] || ''}
                              onChange={(e) => setReviewNotes(prev => ({ ...prev, [submission.id]: e.target.value }))}
                              placeholder="Add notes about why you approved/rejected this..."
                              rows={2}
                              className="mb-3"
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleApprove(submission.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(submission.id)}
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Toggle Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                        className="mt-4"
                      >
                        {expandedId === submission.id ? 'Hide Details' : 'Review Submission'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reviewed Submissions */}
          {reviewedSubmissions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-rogue-forest mb-6">Recently Reviewed</h2>
              <div className="space-y-3">
                {reviewedSubmissions.slice(0, 10).map((submission) => (
                  <Card key={submission.id} className="border-rogue-sage/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-rogue-forest">{submission.title}</h4>
                          <p className="text-sm text-rogue-slate/70">by {submission.author}</p>
                        </div>
                        <Badge 
                          variant={submission.status === 'approved' ? 'default' : 'outline'}
                          className={submission.status === 'approved' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-red-100 text-red-700 border-red-200'
                          }
                        >
                          {submission.status === 'approved' ? 'Approved' : 'Rejected'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

