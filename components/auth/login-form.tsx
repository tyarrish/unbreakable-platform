'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { TreePine } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      if (data.session && data.user) {
        console.log('Login: Session established', { userId: data.user.id })
        
        // Verify session is stored
        const { data: { session: verifySession } } = await supabase.auth.getSession()
        console.log('Login: Session verified', verifySession ? 'Yes' : 'No')
        
        toast.success('Welcome back!')
        
        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Force a full page reload to ensure session is picked up
        window.location.href = '/dashboard'
      } else {
        toast.error('Failed to establish session')
        setIsLoading(false)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-rogue-forest rounded-full flex items-center justify-center">
          <TreePine className="h-8 w-8 text-rogue-gold" />
        </div>
        <div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to continue your leadership journey
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
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="focus:ring-rogue-gold"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a 
                href="/forgot-password" 
                className="text-sm text-rogue-forest hover:text-rogue-pine transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="focus:ring-rogue-gold"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

