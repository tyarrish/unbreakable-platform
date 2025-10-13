import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ProgressTree } from '@/components/ui/progress-tree'
import { RoleBadge } from '@/components/ui/role-badge'
import { LoadingSpinner, PageLoader } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge, LessonStatusBadge, EventStatusBadge } from '@/components/ui/status-badge'
import { ModuleIcon, ProgressIcon, JourneyIcon, GoalIcon } from '@/components/ui/nature-icon'
import { Separator } from '@/components/ui/separator'
import { TreePine } from 'lucide-react'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen py-12">
      <Container>
        <PageHeader
          heading="Design System"
          description="A comprehensive showcase of the Rogue Leadership Training Experience UI components and design tokens."
        />

        {/* Colors */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Forest" color="bg-rogue-forest" hex="#2c3e2d" />
            <ColorSwatch name="Pine" color="bg-rogue-pine" hex="#1a2e1d" />
            <ColorSwatch name="Sage" color="bg-rogue-sage" hex="#7a8471" />
            <ColorSwatch name="Gold" color="bg-rogue-gold" hex="#d4af37" />
            <ColorSwatch name="Gold Light" color="bg-rogue-gold-light" hex="#e6c555" />
            <ColorSwatch name="Cream" color="bg-rogue-cream" hex="#f4f1e8" border />
            <ColorSwatch name="Slate" color="bg-rogue-slate" hex="#4a5568" />
            <ColorSwatch name="Steel" color="bg-rogue-steel" hex="#5a6c7d" />
            <ColorSwatch name="Terracotta" color="bg-rogue-terracotta" hex="#c65d07" />
            <ColorSwatch name="Ochre" color="bg-rogue-ochre" hex="#cc8900" />
            <ColorSwatch name="Copper" color="bg-rogue-copper" hex="#b87333" />
          </div>
        </section>

        <Separator className="my-12" />

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Typography</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h1 className="text-4xl">Heading 1 - Leadership Journey</h1>
              <h2 className="text-3xl">Heading 2 - Module Overview</h2>
              <h3 className="text-2xl">Heading 3 - Lesson Title</h3>
              <h4 className="text-xl">Heading 4 - Section Header</h4>
              <p className="text-base leading-relaxed">
                Body text - This is how regular paragraph text appears throughout the platform. 
                It uses a comfortable line height for extended reading and maintains good contrast.
              </p>
              <p className="text-sm text-rogue-slate">
                Small text - Used for secondary information and metadata.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Buttons</h2>
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>All available button styles with hover states and focus rings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default (Forest)</Button>
                  <Button variant="forest">Forest</Button>
                  <Button variant="gold">Gold</Button>
                  <Button variant="sage">Sage</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <TreePine className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button States</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button className="opacity-75">Loading State</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Form Elements */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Form Elements</h2>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} />
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Cards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>A regular card with white background</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-rogue-slate">Content goes here with proper spacing and typography.</p>
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle>Glass-morphism Card</CardTitle>
                <CardDescription>A card with backdrop blur and transparency</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-rogue-slate">Used for overlays and featured content.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Progress Indicators */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Progress Indicators</h2>
          <Card>
            <CardHeader>
              <CardTitle>Nature-themed Progress</CardTitle>
              <CardDescription>Progress visualization using growth metaphors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressTree progress={5} />
              <ProgressTree progress={25} />
              <ProgressTree progress={50} />
              <ProgressTree progress={75} />
              <ProgressTree progress={100} />
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Badges */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Badges</h2>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <RoleBadge role="admin" />
                  <RoleBadge role="facilitator" />
                  <RoleBadge role="participant" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="success" label="Success" />
                    <StatusBadge status="warning" label="Warning" />
                    <StatusBadge status="error" label="Error" />
                    <StatusBadge status="info" label="Info" />
                    <StatusBadge status="default" label="Default" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <LessonStatusBadge status="not_started" />
                    <LessonStatusBadge status="in_progress" />
                    <LessonStatusBadge status="completed" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <EventStatusBadge status="registered" />
                    <EventStatusBadge status="attended" />
                    <EventStatusBadge status="missed" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Icons */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Nature Icons</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <ModuleIcon className="mx-auto mb-2" />
                  <p className="text-sm text-rogue-slate">Module</p>
                </div>
                <div className="text-center">
                  <ProgressIcon className="mx-auto mb-2" />
                  <p className="text-sm text-rogue-slate">Progress</p>
                </div>
                <div className="text-center">
                  <JourneyIcon className="mx-auto mb-2" />
                  <p className="text-sm text-rogue-slate">Journey</p>
                </div>
                <div className="text-center">
                  <GoalIcon className="mx-auto mb-2" />
                  <p className="text-sm text-rogue-slate">Goal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Loading States */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Loading States</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Small</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LoadingSpinner size="sm" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Medium</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LoadingSpinner size="md" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Large</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LoadingSpinner size="lg" />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Empty States */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-rogue-forest mb-6">Empty States</h2>
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={<TreePine size={64} />}
                title="No modules found"
                description="Get started by creating your first learning module."
                action={{
                  label: 'Create Module',
                  onClick: () => alert('Create module clicked'),
                }}
              />
            </CardContent>
          </Card>
        </section>
      </Container>
    </div>
  )
}

function ColorSwatch({ name, color, hex, border }: { name: string; color: string; hex: string; border?: boolean }) {
  return (
    <div className="space-y-2">
      <div className={`h-24 rounded-lg ${color} ${border ? 'border-2 border-rogue-sage/20' : ''}`} />
      <div className="text-sm">
        <p className="font-medium text-rogue-forest">{name}</p>
        <p className="text-rogue-slate text-xs">{hex}</p>
      </div>
    </div>
  )
}

