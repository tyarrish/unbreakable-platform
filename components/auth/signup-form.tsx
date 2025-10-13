'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { TreePine } from 'lucide-react'
import type { UserRole } from '@/types/index.types'

interface SignupFormProps {
  isAdmin?: boolean
}

export function SignupForm({ isAdmin = false }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('participant')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: isAdmin ? role : 'participant',
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email to confirm.')
        if (isAdmin) {
          router.push('/admin/users')
        } else {
          router.push('/login')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={isAdmin ? '' : 'border-0 shadow-2xl'}>
      <CardHeader className={isAdmin ? '' : 'space-y-4 text-center'}>
        {!isAdmin && (
          <div className="mx-auto w-16 h-16 bg-rogue-forest rounded-full flex items-center justify-center">
            <TreePine className="h-8 w-8 text-rogue-gold" />
          </div>
        )}
        <div>
          <CardTitle className={isAdmin ? 'text-xl' : 'text-2xl'}>
            {isAdmin ? 'Create New User' : 'Join the Journey'}
          </CardTitle>
          <CardDescription className={isAdmin ? '' : 'text-base'}>
            {isAdmin ? 'Add a new user to the platform' : 'Create your RLTE account'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
              At least 6 characters
            </p>
          </div>
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        {!isAdmin && (
          <p className="text-center text-sm text-rogue-slate mt-4">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="text-rogue-forest hover:text-rogue-pine font-medium transition-colors"
            >
              Sign in
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

