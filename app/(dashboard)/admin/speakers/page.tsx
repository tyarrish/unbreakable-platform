'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mic, Plus, Edit, Trash2, Users } from 'lucide-react'
import { 
  getAllGuestSpeakers, 
  createGuestSpeaker, 
  updateGuestSpeaker, 
  deleteGuestSpeaker,
  type GuestSpeaker 
} from '@/lib/supabase/queries/speakers'
import { toast } from 'sonner'

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState<GuestSpeaker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<GuestSpeaker | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<GuestSpeaker | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    loadSpeakers()
  }, [])

  async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single<{ roles: string[] }>()

    const hasAccess = profile?.roles?.some(r => ['admin', 'facilitator'].includes(r))
    if (!hasAccess) {
      router.push('/admin')
    }
  }

  async function loadSpeakers() {
    try {
      const data = await getAllGuestSpeakers()
      setSpeakers(data)
    } catch (error) {
      console.error('Error loading speakers:', error)
      toast.error('Failed to load speakers')
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setEditingSpeaker(null)
    resetForm()
    setModalOpen(true)
  }

  function openEditModal(speaker: GuestSpeaker) {
    setEditingSpeaker(speaker)
    setFullName(speaker.full_name)
    setBio(speaker.bio || '')
    setTitle(speaker.title || '')
    setOrganization(speaker.organization || '')
    setLinkedinUrl(speaker.linkedin_url || '')
    setWebsiteUrl(speaker.website_url || '')
    setAvatarUrl(speaker.avatar_url || '')
    setModalOpen(true)
  }

  function resetForm() {
    setFullName('')
    setBio('')
    setTitle('')
    setOrganization('')
    setLinkedinUrl('')
    setWebsiteUrl('')
    setAvatarUrl('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const speakerData = {
        full_name: fullName,
        bio: bio || null,
        title: title || null,
        organization: organization || null,
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,
        avatar_url: avatarUrl || null,
      }

      if (editingSpeaker) {
        await updateGuestSpeaker(editingSpeaker.id, speakerData)
        toast.success('Speaker updated successfully')
      } else {
        await createGuestSpeaker(speakerData)
        toast.success('Speaker created successfully')
      }

      setModalOpen(false)
      resetForm()
      loadSpeakers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save speaker')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return

    try {
      await deleteGuestSpeaker(deleteConfirm.id)
      toast.success('Speaker deleted successfully')
      setDeleteConfirm(null)
      loadSpeakers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete speaker')
    }
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Guest Speakers"
          description="Manage guest speakers for events"
        />

        <div className="mb-6">
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Guest Speaker
          </Button>
        </div>

        {speakers.length === 0 ? (
          <EmptyState
            icon={<Mic size={64} />}
            title="No Guest Speakers"
            description="Add guest speakers to feature them in your events"
            action={
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Speaker
              </Button>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <Card key={speaker.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={speaker.avatar_url || undefined} />
                      <AvatarFallback className="bg-rogue-gold text-white text-2xl">
                        {getInitials(speaker.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold text-rogue-forest">
                        {speaker.full_name}
                      </h3>
                      {speaker.title && (
                        <p className="text-sm text-rogue-slate">{speaker.title}</p>
                      )}
                      {speaker.organization && (
                        <p className="text-xs text-rogue-slate/70">{speaker.organization}</p>
                      )}
                    </div>

                    {speaker.bio && (
                      <p className="text-sm text-rogue-slate line-clamp-3 leading-relaxed">
                        {speaker.bio}
                      </p>
                    )}

                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditModal(speaker)}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(speaker)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSpeaker ? 'Edit Guest Speaker' : 'Add Guest Speaker'}
            </DialogTitle>
            <DialogDescription>
              Add speaker information to feature them in events
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="CEO, Author, etc."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Company or organization"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Speaker background and expertise..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
              <p className="text-xs text-rogue-slate">
                Direct link to profile photo (optional)
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingSpeaker ? 'Update Speaker' : 'Create Speaker'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Speaker</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirm?.full_name}? 
              This will remove them from all events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Speaker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

