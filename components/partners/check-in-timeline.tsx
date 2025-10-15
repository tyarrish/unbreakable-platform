'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  Circle, 
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react'
import { type CheckIn } from '@/lib/supabase/queries/partner-checkins'
import { formatDate } from '@/lib/utils/format-date'

interface CheckInTimelineProps {
  userCheckIns: CheckIn[]
  partnerCheckIns: CheckIn[]
  userName: string
  partnerName: string
  currentWeek: number
}

export function CheckInTimeline({ 
  userCheckIns, 
  partnerCheckIns, 
  userName, 
  partnerName,
  currentWeek 
}: CheckInTimelineProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

  // Merge and organize by week
  const weeklyData: { [key: number]: { user?: CheckIn, partner?: CheckIn } } = {}
  
  userCheckIns.forEach(checkIn => {
    if (!weeklyData[checkIn.week_number]) {
      weeklyData[checkIn.week_number] = {}
    }
    weeklyData[checkIn.week_number].user = checkIn
  })

  partnerCheckIns.forEach(checkIn => {
    if (!weeklyData[checkIn.week_number]) {
      weeklyData[checkIn.week_number] = {}
    }
    weeklyData[checkIn.week_number].partner = checkIn
  })

  const weeks = Object.keys(weeklyData).map(Number).sort((a, b) => b - a)

  const totalWeeks = 32
  const completedByUser = userCheckIns.length
  const completedByPartner = partnerCheckIns.length

  function getStatusColor(status: string | null) {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'partial':
        return 'text-yellow-600 bg-yellow-50'
      case 'missed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-400 bg-gray-50'
    }
  }

  function getStatusIcon(status: string | null) {
    switch (status) {
      case 'completed':
        return CheckCircle
      case 'partial':
        return Circle
      case 'missed':
        return XCircle
      default:
        return Circle
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-rogue-forest">Check-in History</h3>
            <p className="text-sm text-rogue-slate mt-1">
              Track your accountability journey together
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-rogue-forest">{completedByUser}/{totalWeeks}</div>
              <div className="text-xs text-rogue-slate">You</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-rogue-forest">{completedByPartner}/{totalWeeks}</div>
              <div className="text-xs text-rogue-slate">Partner</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {weeks.length === 0 ? (
            <p className="text-center text-rogue-slate py-8">
              No check-ins yet. Complete your first one above!
            </p>
          ) : (
            weeks.map((week) => {
              const data = weeklyData[week]
              const isExpanded = expandedWeek === week
              const isCurrent = week === currentWeek

              return (
                <div key={week} className={`border rounded-lg ${isCurrent ? 'border-rogue-gold bg-rogue-gold/5' : 'border-rogue-sage/20'}`}>
                  <button
                    onClick={() => setExpandedWeek(isExpanded ? null : week)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-rogue-sage/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono">
                        Week {week}
                      </Badge>
                      
                      {/* User status */}
                      <div className="flex items-center gap-2">
                        {data.user ? (
                          <>
                            {(() => {
                              const StatusIcon = getStatusIcon(data.user.commitment_status)
                              return <StatusIcon className={`h-4 w-4 ${getStatusColor(data.user.commitment_status)}`} />
                            })()}
                            <span className="text-sm text-rogue-slate">{userName}</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4 text-gray-300" />
                            <span className="text-sm text-rogue-slate/50">{userName}</span>
                          </>
                        )}
                      </div>

                      {/* Partner status */}
                      <div className="flex items-center gap-2">
                        {data.partner ? (
                          <>
                            {(() => {
                              const StatusIcon = getStatusIcon(data.partner.commitment_status)
                              return <StatusIcon className={`h-4 w-4 ${getStatusColor(data.partner.commitment_status)}`} />
                            })()}
                            <span className="text-sm text-rogue-slate">{partnerName}</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4 text-gray-300" />
                            <span className="text-sm text-rogue-slate/50">{partnerName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-rogue-slate" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-rogue-slate" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-rogue-sage/20 space-y-4">
                      {/* Your check-in */}
                      {data.user && (
                        <div className="bg-rogue-forest/5 p-3 rounded-lg">
                          <h4 className="font-semibold text-rogue-forest mb-2 text-sm">Your Check-in</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-rogue-slate">Commitment:</span>
                              <p className="text-rogue-forest">{data.user.commitment}</p>
                            </div>
                            {data.user.wins && (
                              <div>
                                <span className="font-medium text-rogue-slate">Wins:</span>
                                <p className="text-rogue-forest">{data.user.wins}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Partner's check-in */}
                      {data.partner && (
                        <div className="bg-rogue-sage/5 p-3 rounded-lg">
                          <h4 className="font-semibold text-rogue-forest mb-2 text-sm">{partnerName}'s Check-in</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-rogue-slate">Commitment:</span>
                              <p className="text-rogue-forest">{data.partner.commitment}</p>
                            </div>
                            {data.partner.wins && (
                              <div>
                                <span className="font-medium text-rogue-slate">Wins:</span>
                                <p className="text-rogue-forest">{data.partner.wins}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

