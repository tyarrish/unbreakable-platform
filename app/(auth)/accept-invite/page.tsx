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
import { validateInviteByToken, acceptInvite } from '@/lib/supabase/queries/users'
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
      // Get the simple token parameter from URL
      const token = searchParams.get('token')
      
      console.log('Invite token from URL:', token ? `present (${token.substring(0, 10)}...)` : 'missing')
      console.log('Full URL:', window.location.href)
      
      if (!token) {
        console.error('No invite token in URL')
        setIsValid(false)
        setIsValidating(false)
        toast.error('Invalid invite link - missing token')
        return
      }

      // Validate the invite using our custom token
      console.log('Validating invite with token...')
      const inviteData = await validateInviteByToken(token)
      
      console.log('Validation result:', inviteData ? 'found' : 'not found')
      
      if (!inviteData) {
        console.error('Invalid or expired invite token')
        console.error('This could mean:')
        console.error('1. The invite was created before the token system was deployed')
        console.error('2. The token has expired (>7 days old)')
        console.error('3. The invite was already accepted')
        setIsValid(false)
        setIsValidating(false)
        toast.error('This invite link is invalid or has expired. Please request a new invite.')
        return
      }

      console.log('Invite validated successfully for:', inviteData.email)
      setInvite(inviteData)
      setIsValid(true)
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
      console.log('Creating account for:', invite.email)

      // Create a new user account via normal signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password: password,
        options: {
          data: {
            full_name: invite.full_name,
            role: invite.role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (signUpError) {
        console.error('SignUp error:', signUpError)
        throw signUpError
      }

      if (!data.user) {
        throw new Error('No user created')
      }

      console.log('User account created:', data.user.id)

      // Update profile with correct role and mark as incomplete
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: invite.full_name,
          roles: [invite.role],
          profile_completed: false,
          invited_by: invite.invited_by,
        })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        // Don't fail - profile will be set up later
      }

      // Mark invite as accepted
      try {
        console.log('Marking invite as accepted:', invite.id)
        await acceptInvite(invite.id, data.user.id)
        console.log('✅ Invite marked as accepted successfully')
      } catch (inviteError) {
        console.error('❌ Failed to mark invite as accepted:', inviteError)
        // Don't fail the signup, but log the error
        toast.error('Account created but invite status update failed')
      }

      toast.success('Account created successfully! Welcome aboard.')
      
      // Small delay to ensure everything is saved
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force full page reload to ensure session is established
      window.location.href = '/dashboard'
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

