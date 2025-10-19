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
  UserPlus,
  UserMinus,
  Linkedin,
  Trophy,
  Target,
  Briefcase
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
  getAllAchievements,
  getTotalPoints,
  type UserAchievement,
  type Achievement
} from '@/lib/supabase/queries/achievements'
import { getUserReadingList } from '@/lib/supabase/queries/books'
import { BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function MemberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string
  const supabase = createClient()

  const [member, setMember] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowingUser, setIsFollowingUser] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [readingList, setReadingList] = useState<any[]>([])

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
        allAchievementsData,
        points,
        followers,
        following,
        followStatus,
        readingData
      ] = await Promise.all([
        getMemberProfile(memberId),
        getUserActivity(memberId, 10),
        getUserAchievements(memberId),
        getAllAchievements(),
        getTotalPoints(memberId),
        getFollowerCount(memberId),
        getFollowingCount(memberId),
        user ? isFollowing(user.id, memberId) : Promise.resolve(false),
        getUserReadingList(memberId)
      ])

      // Debug: Log the role data
      console.log('Member Profile Data:', {
        id: memberData?.id,
        email: memberData?.email,
        roles: memberData?.roles,
        fullName: memberData?.full_name
      })

      setMember(memberData)
      setActivities(activitiesData)
      setAchievements(achievementsData)
      setAllAchievements(allAchievementsData)
      setTotalPoints(points)
      setFollowerCount(followers)
      setFollowingCount(following)
      setIsFollowingUser(followStatus)
      setReadingList(readingData || [])
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
                  <RoleBadge roles={member.roles as any} role={member.role as any} />
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

            {(member.employer || member.current_role) && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase size={16} className="text-rogue-gold" />
                  <h3 className="font-medium text-rogue-forest">Professional</h3>
                </div>
                <div className="text-sm text-rogue-slate space-y-1">
                  {member.current_role && (
                    <p><span className="font-medium">Role:</span> {member.current_role}</p>
                  )}
                  {member.employer && (
                    <p><span className="font-medium">Organization:</span> {member.employer}</p>
                  )}
                </div>
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

            {member.linkedin_url && (
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin size={16} className="mr-2" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            )}

            {/* Reading List - Compact Display */}
            {readingList.length > 0 && (
              <div className="mt-6 pt-6 border-t border-rogue-sage/10">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-rogue-gold" />
                  <h3 className="font-medium text-rogue-forest">Reading Journey</h3>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {readingList
                    .filter(item => item.status === 'reading')
                    .map((item) => (
                      <div key={item.id} className="flex-shrink-0 relative group">
                        <div className="relative w-20 h-28 rounded-lg overflow-hidden shadow-md border-2 border-rogue-gold">
                          {item.book?.cover_image_url ? (
                            <Image
                              src={item.book.cover_image_url}
                              alt={item.book.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-rogue-forest to-rogue-sage flex items-center justify-center">
                              <BookOpen size={24} className="text-white/50" />
                            </div>
                          )}
                        </div>
                        <Badge className="absolute -top-2 -right-2 bg-rogue-gold text-white text-xs px-1.5 py-0.5 shadow-sm">
                          Reading
                        </Badge>
                        <p className="text-xs text-rogue-forest font-medium mt-1 w-20 truncate">
                          {item.book?.title}
                        </p>
                      </div>
                    ))}
                  {readingList
                    .filter(item => item.status === 'finished')
                    .slice(0, 6)
                    .map((item) => (
                      <div key={item.id} className="flex-shrink-0 relative group">
                        <div className="relative w-20 h-28 rounded-lg overflow-hidden shadow-sm border border-rogue-sage/20 hover:border-rogue-gold/40 transition-all">
                          {item.book?.cover_image_url ? (
                            <Image
                              src={item.book.cover_image_url}
                              alt={item.book.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-rogue-sage/20 to-rogue-forest/10 flex items-center justify-center">
                              <BookOpen size={20} className="text-rogue-forest/40" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-rogue-slate mt-1 w-20 truncate">
                          {item.book?.title}
                        </p>
                      </div>
                    ))}
                </div>
                <p className="text-xs text-rogue-slate/60 mt-2">
                  {readingList.filter(item => item.status === 'finished').length} books completed
                  {readingList.filter(item => item.status === 'reading').length > 0 && 
                    ` • Currently reading ${readingList.filter(item => item.status === 'reading').length}`
                  }
                </p>
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
                Achievements ({achievements.length}/{allAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {allAchievements.map((achievement) => {
                  const userAchievement = achievements.find(
                    ua => ua.achievement_id === achievement.id
                  )
                  const isEarned = !!userAchievement

                  return (
                    <div
                      key={achievement.id}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all group cursor-default ${
                        isEarned
                          ? 'bg-gradient-to-br from-rogue-gold/20 via-rogue-gold/10 to-transparent border-2 border-rogue-gold/40 shadow-md hover:shadow-lg'
                          : 'bg-rogue-sage/5 border-2 border-dashed border-rogue-slate/20'
                      }`}
                      title={achievement.description}
                    >
                      {/* Badge Circle */}
                      <div className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all ${
                        isEarned
                          ? 'bg-gradient-to-br from-rogue-gold to-rogue-gold-light shadow-lg shadow-rogue-gold/30 group-hover:scale-110'
                          : 'bg-rogue-slate/10 opacity-40 grayscale'
                      }`}>
                        {/* Decorative ring for earned */}
                        {isEarned && (
                          <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                        )}
                        <div className={`text-3xl ${isEarned ? 'drop-shadow-sm' : 'opacity-50'}`}>
                          {achievement.icon}
                        </div>
                      </div>
                      
                      {/* Badge Info */}
                      <div className="text-center space-y-0.5">
                        <p className={`text-xs font-semibold leading-tight line-clamp-2 ${
                          isEarned ? 'text-rogue-forest' : 'text-rogue-slate/60'
                        }`}>
                          {achievement.name}
                        </p>
                        <p className={`text-xs font-medium ${
                          isEarned ? 'text-rogue-gold' : 'text-rogue-slate/50'
                        }`}>
                          {achievement.points} pts
                        </p>
                      </div>
                      
                      {/* Earned indicator */}
                      {isEarned && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
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






