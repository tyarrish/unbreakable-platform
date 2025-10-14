'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import Image from 'next/image'
import { CheckCircle, XCircle } from 'lucide-react'
import { validateInvite, acceptInvite } from '@/lib/supabase/queries/users'
import type { Invite } from '@/lib/supabase/queries/users'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [invite, setInvite] = useState<Invite | null>(null)
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Add a small delay to ensure component is mounted
    const timer = setTimeout(() => {
      validateInviteToken()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [searchParams])

  async function validateInviteToken() {
    setIsValidating(true)
    
    try {
      // Get full URL for debugging
      const fullUrl = window.location.href
      console.log('Full invite URL:', fullUrl)
      
      // Log all URL parameters for debugging
      const allParams: { [key: string]: string } = {}
      searchParams.forEach((value, key) => {
        allParams[key] = value
      })
      console.log('All URL parameters:', allParams)
      console.log('Number of parameters:', Object.keys(allParams).length)
      
      // Check if we have a session (user clicked invite link and was redirected here)
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Has session after redirect:', !!session)
      console.log('Session user ID:', session?.user?.id)
      console.log('Session user email:', session?.user?.email)
      console.log('User metadata:', session?.user?.user_metadata)
      
      // If we have a session but no URL params, user arrived via Supabase redirect
      // This is the expected flow for inviteUserByEmail
      if (session && session.user) {
        console.log('User has session - checking for invite via email')
        
        // Get invite ID from user metadata
        const inviteId = session.user.user_metadata?.invite_id
        console.log('Invite ID from session metadata:', inviteId)
        
        // Try to find invite by email as fallback
        const { data: invites } = await (supabase as any)
          .from('invites')
          .select('*')
          .eq('email', session.user.email)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
        
        console.log('Invites found for email:', invites?.length || 0)
        if (invites && invites.length > 0) {
          console.log('Using invite:', invites[0])
        }
        
        if (inviteId) {
          // Use the invite ID from metadata
          const inviteData = await validateInvite(inviteId)
          if (inviteData) {
            setInvite(inviteData)
            setIsValid(true)
            setIsValidating(false)
            return
          }
        } else if (invites && invites.length > 0) {
          // Fallback to email-matched invite
          const inviteData = invites[0]
          // Check if expired
          const expiresAt = new Date(inviteData.expires_at)
          if (expiresAt > new Date()) {
            setInvite(inviteData)
            setIsValid(true)
            setIsValidating(false)
            return
          }
        }
        
        // If we get here, session exists but no valid invite found
        console.error('Session exists but no valid invite found')
        setIsValid(false)
        toast.error('No valid invite found for your account')
        setIsValidating(false)
        return
      }
      
      // If there are no URL parameters and no session, the link is incomplete
      if (Object.keys(allParams).length === 0 && !session) {
        console.error('No URL parameters and no session - invite flow failed')
        setIsValid(false)
        setIsValidating(false)
        toast.error('Invite link error. Please request a new invite or contact support.')
        return
      }
      
      // Legacy flow: If we have URL parameters (token_hash/type), try to verify
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      
      if (tokenHash && type === 'invite') {
        console.log('Attempting verifyOtp with token_hash and type=invite')
        
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'invite',
        })

        console.log('Verify OTP result:', { 
          hasData: !!data, 
          hasUser: !!data?.user,
          userId: data?.user?.id,
          metadata: data?.user?.user_metadata,
          error: verifyError?.message 
        })

        if (verifyError) {
          console.error('Token verification error:', verifyError)
          setIsValid(false)
          setIsValidating(false)
          toast.error(`Verification failed: ${verifyError.message}`)
          return
        }

        if (!data?.user) {
          console.error('No user data after verification')
          setIsValid(false)
          setIsValidating(false)
          toast.error('Invalid or expired invite link')
          return
        }

        // Get invite ID from user metadata
        const inviteId = data.user.user_metadata?.invite_id
        console.log('Invite ID from metadata:', inviteId)
        console.log('Full user metadata:', data.user.user_metadata)
        
        if (!inviteId) {
          console.error('No invite_id in user metadata')
          // Still try to get invite from email match as fallback
          const { data: invites } = await (supabase as any)
            .from('invites')
            .select('*')
            .eq('email', data.user.email)
            .eq('status', 'pending')
            .limit(1)
          
          if (invites && invites.length > 0) {
            console.log('Found invite by email match:', invites[0])
            setInvite(invites[0])
            setIsValid(true)
            setIsValidating(false)
            return
          }
          
          setIsValid(false)
          toast.error('Invalid invite data - missing invite_id')
          setIsValidating(false)
          return
        }

        // Validate the invite in our database
        const inviteData = await validateInvite(inviteId)
        console.log('Invite validation result:', inviteData ? 'valid' : 'invalid')
        
        if (!inviteData) {
          setIsValid(false)
          toast.error('This invite has expired or already been used')
          setIsValidating(false)
          return
        }

        setInvite(inviteData)
        setIsValid(true)
        return
      }
      
      // If we get here, something went wrong
      console.error('No valid invite flow detected')
      setIsValid(false)
      toast.error('Unable to validate invite')
    } catch (error: any) {
      console.error('Error validating invite:', error)
      setIsValid(false)
      toast.error(`Failed to validate invite: ${error.message}`)
    } finally {
      setIsValidating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (!invite) return

    setIsLoading(true)

    try {
      // Get current session
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: invite.full_name,
          role: invite.role,
        }
      })

      if (updateError) throw updateError

      // Update profile in database (profile should already exist from auth trigger)
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: invite.full_name,
          role: invite.role,
          profile_completed: false,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Mark invite as accepted
      await acceptInvite(invite.id, user.id)

      toast.success('Account created successfully! Welcome aboard.')
      
      // Small delay to ensure everything is saved
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating account:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return <PageLoader />
  }

  if (!isValid || !invite) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <div className="relative z-10 w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl">Invalid Invite</CardTitle>
              <CardDescription className="text-base">
                This invite link is invalid or has expired
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-rogue-slate text-center">
              Invite links expire after 7 days. Please contact your administrator to request a new invite.
            </p>
            <Button 
              className="w-full" 
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-rogue-gold/20 blur-2xl rounded-full"></div>
            <Image
              src="/RLTE-logo.png"
              alt="Rogue Leadership Training Experience"
              width={160}
              height={160}
              className="relative z-10"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome, {invite.full_name}!</CardTitle>
            <CardDescription className="text-base">
              Create your password to complete your account setup
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={invite.email}
                disabled
                className="bg-rogue-sage/5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                disabled
                className="bg-rogue-sage/5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
              <p className="text-xs text-rogue-slate">
                Must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account & Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AcceptInviteContent />
    </Suspense>
  )
}

