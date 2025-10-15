'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  Trophy, 
  AlertCircle, 
  Heart, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Circle
} from 'lucide-react'
import { 
  commentOnPartnerCheckIn, 
  markCheckInViewed,
  type CheckIn 
} from '@/lib/supabase/queries/partner-checkins'
import { formatDate } from '@/lib/utils/format-date'
import { toast } from 'sonner'

interface CheckInResponseProps {
  checkIn: CheckIn
  partnerName: string
  onCommentAdded?: () => void
}

export function CheckInResponse({ checkIn, partnerName, onCommentAdded }: CheckInResponseProps) {
  const [comment, setComment] = useState(checkIn.partner_comment || '')
  const [isCommenting, setIsCommenting] = useState(false)
  const [showCommentBox, setShowCommentBox] = useState(false)

  useEffect(() => {
    // Mark as viewed when component mounts
    if (!checkIn.partner_viewed) {
      markCheckInViewed(checkIn.id)
    }
  }, [checkIn.id])

  async function handleAddComment() {
    if (!comment.trim()) return

    setIsCommenting(true)

    try {
      await commentOnPartnerCheckIn(checkIn.id, comment)
      toast.success('Comment added!')
      setShowCommentBox(false)
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (error: any) {
      console.error('Error adding comment:', error)
      toast.error(error.message || 'Failed to add comment')
    } finally {
      setIsCommenting(false)
    }
  }

  const statusIcons = {
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
    partial: { icon: Circle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Partially Completed' },
    missed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Missed' },
    pending: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'In Progress' },
  }

  const status = statusIcons[checkIn.commitment_status as keyof typeof statusIcons] || statusIcons.pending
  const StatusIcon = status.icon

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-rogue-sage/5">
      <CardHeader>
        <CardTitle className="text-xl">{partnerName}'s Week {checkIn.week_number} Check-in</CardTitle>
        <p className="text-sm text-rogue-slate">Completed {formatDate(checkIn.created_at)}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Main Response */}
        <div className="space-y-2">
          <h3 className="font-semibold text-rogue-forest">{checkIn.prompt}</h3>
          <p className="text-rogue-slate leading-relaxed whitespace-pre-wrap bg-rogue-sage/5 p-4 rounded-lg">
            {checkIn.response}
          </p>
        </div>

        {/* Commitment */}
        <div className={`p-4 rounded-lg border-l-4 ${status.bg} border-rogue-gold`}>
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-rogue-gold mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-rogue-forest">This Week's Commitment</h3>
                <Badge className={`${status.bg} ${status.color} border-0 text-xs`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-rogue-forest font-medium">{checkIn.commitment}</p>
            </div>
          </div>
        </div>

        {/* Wins */}
        {checkIn.wins && (
          <div className="space-y-2">
            <h3 className="font-semibold text-rogue-forest flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-600" />
              Wins from Last Week
            </h3>
            <p className="text-rogue-slate leading-relaxed whitespace-pre-wrap bg-green-50 p-3 rounded-lg">
              {checkIn.wins}
            </p>
          </div>
        )}

        {/* Challenges */}
        {checkIn.challenges && (
          <div className="space-y-2">
            <h3 className="font-semibold text-rogue-forest flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Challenges
            </h3>
            <p className="text-rogue-slate leading-relaxed whitespace-pre-wrap bg-orange-50 p-3 rounded-lg">
              {checkIn.challenges}
            </p>
          </div>
        )}

        {/* Support Needed */}
        {checkIn.support_needed && (
          <div className="space-y-2">
            <h3 className="font-semibold text-rogue-forest flex items-center gap-2">
              <Heart className="h-4 w-4 text-rogue-copper" />
              Support Needed
            </h3>
            <p className="text-rogue-slate leading-relaxed whitespace-pre-wrap bg-rogue-copper/5 p-3 rounded-lg border border-rogue-copper/20">
              {checkIn.support_needed}
            </p>
          </div>
        )}

        {/* Reflection */}
        {checkIn.reflection && (
          <div className="space-y-2">
            <h3 className="font-semibold text-rogue-forest">Module Reflection</h3>
            <p className="text-rogue-slate leading-relaxed whitespace-pre-wrap bg-rogue-sage/5 p-3 rounded-lg">
              {checkIn.reflection}
            </p>
          </div>
        )}

        {/* Partner Comment Section */}
        <div className="pt-4 border-t border-rogue-sage/20">
          {checkIn.partner_comment ? (
            <div className="space-y-3">
              <div className="bg-rogue-forest/5 p-4 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-rogue-forest mt-0.5" />
                  <h4 className="font-semibold text-rogue-forest">Your Comment</h4>
                </div>
                <p className="text-rogue-slate whitespace-pre-wrap">{checkIn.partner_comment}</p>
                {checkIn.partner_commented_at && (
                  <p className="text-xs text-rogue-slate/70 mt-2">
                    {formatDate(checkIn.partner_commented_at)}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCommentBox(true)
                  setComment('')
                }}
              >
                Update Comment
              </Button>
            </div>
          ) : !showCommentBox ? (
            <Button
              variant="outline"
              onClick={() => setShowCommentBox(true)}
              className="w-full"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Add Supportive Comment
            </Button>
          ) : null}

          {showCommentBox && (
            <div className="space-y-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share encouragement, insights, or questions..."
                rows={3}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddComment}
                  disabled={isCommenting || !comment.trim()}
                  size="sm"
                >
                  {isCommenting ? 'Adding...' : 'Add Comment'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCommentBox(false)
                    setComment(checkIn.partner_comment || '')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

