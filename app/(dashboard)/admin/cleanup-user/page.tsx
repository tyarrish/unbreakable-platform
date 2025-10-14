'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cleanupOrphanedAuthUser } from '@/app/actions/users'
import { toast } from 'sonner'
import { Trash2, AlertCircle } from 'lucide-react'

export default function CleanupUserPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleCleanup(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await cleanupOrphanedAuthUser(email)
      
      if (response.error) {
        setResult(`Error: ${response.error}`)
        toast.error(response.error)
      } else if (response.message) {
        setResult(`Success: ${response.message}`)
        toast.success(response.message)
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to cleanup user'
      setResult(`Error: ${msg}`)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Cleanup Orphaned User"
          description="Manually remove orphaned users from Supabase Auth to fix invite issues"
        />

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Manual User Cleanup</CardTitle>
            <CardDescription>
              Use this tool when you get "User not allowed" or "Email link is invalid" errors when sending invites.
              This will delete the orphaned user from Supabase Auth so you can send a fresh invite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <strong>Warning:</strong> This will permanently delete the user from authentication. 
                  Only use this for users who have not successfully set up their account.
                </div>
              </div>

              <form onSubmit={handleCleanup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">User Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-rogue-slate">
                    Enter the email address of the user you want to remove from auth.users
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isLoading ? 'Cleaning up...' : 'Cleanup Orphaned User'}
                </Button>
              </form>

              {result && (
                <div className={`p-4 rounded-lg border ${
                  result.startsWith('Success') 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <p className="text-sm font-mono">{result}</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-rogue-sage/5 rounded-lg border border-rogue-sage/20">
                <h3 className="font-semibold text-rogue-forest mb-2">Steps to Fix Invite Issues:</h3>
                <ol className="text-sm text-rogue-slate space-y-1 list-decimal list-inside">
                  <li>Enter the user's email above and click "Cleanup Orphaned User"</li>
                  <li>Wait for success confirmation</li>
                  <li>Go to Admin Users page and send a new invite</li>
                  <li>User should receive working invite email</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

