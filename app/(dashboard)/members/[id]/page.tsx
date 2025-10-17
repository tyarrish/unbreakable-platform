'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoleBadge } from '@/components/ui/role-badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import {
  ArrowLeft,
  MapPin,
  UserPlus,
  UserMinus,
  Linkedin,
  Twitter,
  Trophy,
  Target
} from 'lucide-react'
import {
  getMemberProfile,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowerCount,
  getFollowingCount,
  type UserProfile
} from '@/lib/supabase/queries/social'
import {
  getUserActivity,
  type ActivityItem
} from '@/lib/supabase/queries/activity'
import {
  getUserAchievements,
  getTotalPoints,
  type UserAchievement
} from '@/lib/supabase/queries/achievements'
import { toast } from 'sonner'

export default function MemberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string
  const supabase = createClient()

  const [member, setMember] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowingUser, setIsFollowingUser] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMemberProfile()
  }, [memberId])

  async function loadMemberProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }

      const [
        memberData,
        activitiesData,
        achievementsData,
        points,
        followers,
        following,
        followStatus
      ] = await Promise.all([
        getMemberProfile(memberId),
        getUserActivity(memberId, 10),
        getUserAchievements(memberId),
        getTotalPoints(memberId),
        getFollowerCount(memberId),
        getFollowingCount(memberId),
        user ? isFollowing(user.id, memberId) : Promise.resolve(false)
      ])

      setMember(memberData)
      setActivities(activitiesData)
      setAchievements(achievementsData)
      setTotalPoints(points)
      setFollowerCount(followers)
      setFollowingCount(following)
      setIsFollowingUser(followStatus)
    } catch (error) {
      console.error('Error loading member profile:', error)
      toast.error('Failed to load profile')
      router.push('/members')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFollowToggle() {
    if (!userId) {
      toast.error('Please sign in to follow members')
      return
    }

    try {
      if (isFollowingUser) {
        await unfollowUser(userId, memberId)
        setIsFollowingUser(false)
        setFollowerCount(prev => prev - 1)
        toast.success('Unfollowed successfully')
      } else {
        await followUser(userId, memberId)
        setIsFollowingUser(true)
        setFollowerCount(prev => prev + 1)
        toast.success('Following successfully!')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (!member) {
    return null
  }

  const isOwnProfile = userId === memberId

  return (
    <div className="py-8">
      <Container>
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/members')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-rogue-forest text-white text-4xl">
                  {member.full_name?.[0] || member.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-semibold text-rogue-forest">
                    {member.full_name || 'Member'}
                  </h1>
                  <p className="text-rogue-slate">{member.email}</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <RoleBadge role={member.role as any} />
                  {(member.city || member.state) && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin size={14} />
                      {[member.city, member.state].filter(Boolean).join(', ')}
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Trophy size={14} />
                    {totalPoints} points
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="font-semibold text-rogue-forest">{followerCount}</span>
                    <span className="text-rogue-slate ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold text-rogue-forest">{followingCount}</span>
                    <span className="text-rogue-slate ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-semibold text-rogue-forest">{achievements.length}</span>
                    <span className="text-rogue-slate ml-1">Achievements</span>
                  </div>
                </div>

                {!isOwnProfile && userId && (
                  <Button onClick={handleFollowToggle} className="gap-2">
                    {isFollowingUser ? (
                      <>
                        <UserMinus size={16} />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {member.bio && (
              <div className="mt-6">
                <p className="text-rogue-slate leading-relaxed">{member.bio}</p>
              </div>
            )}

            {member.goals && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-rogue-gold" />
                  <h3 className="font-medium text-rogue-forest">Goals</h3>
                </div>
                <p className="text-sm text-rogue-slate leading-relaxed">{member.goals}</p>
              </div>
            )}

            {member.interests && member.interests.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-rogue-forest mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {member.interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(member.linkedin_url || member.twitter_url) && (
              <div className="mt-4 flex gap-3">
                {member.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin size={16} className="mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {member.twitter_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={member.twitter_url} target="_blank" rel="noopener noreferrer">
                      <Twitter size={16} className="mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements and Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-rogue-gold" />
                Achievements ({achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <p className="text-sm text-rogue-slate py-8 text-center">
                  No achievements yet
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-center gap-2 p-3 rounded-lg bg-rogue-sage/5 border border-rogue-sage/20"
                    >
                      <div className="text-2xl">{userAchievement.achievement?.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-rogue-forest truncate">
                          {userAchievement.achievement?.name}
                        </p>
                        <p className="text-xs text-rogue-slate">
                          {userAchievement.achievement?.points} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-rogue-slate py-8 text-center">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="text-sm">
                      <p className="font-medium text-rogue-forest">{activity.title}</p>
                      <p className="text-xs text-rogue-slate">{activity.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}






