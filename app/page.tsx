import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressTree } from '@/components/ui/progress-tree'
import { RoleBadge } from '@/components/ui/role-badge'
import { TreePine, Mountain, Compass, Users, BookOpen, Calendar } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-rogue-forest to-rogue-pine py-24 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/RLTE-logo.png" 
                alt="Rogue Leadership Training Experience" 
                className="h-40 w-auto drop-shadow-2xl"
              />
            </div>
            
            {/* Heading with better contrast */}
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              Rogue Leadership Training Experience
            </h1>
            
            {/* Tagline with background for readability */}
            <div className="inline-block">
              <p className="text-xl md:text-2xl text-rogue-cream leading-relaxed px-8 py-4 bg-rogue-forest/50 rounded-lg backdrop-blur-sm border border-rogue-gold/20">
                Lead from Within. Grow with Others. Impact Your Community.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button variant="gold" size="lg" asChild>
                <a href="/signup">Get Started</a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-rogue-cream text-rogue-cream hover:bg-rogue-cream hover:text-rogue-forest transition-all"
                asChild
              >
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Design System Showcase */}
      <section className="py-16" id="features">
        <Container>
          <PageHeader
            heading="Platform Features"
            description="A cohesive, nature-inspired learning community that reflects the Rogue Leadership Training Experience brand."
          />

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TreePine className="h-8 w-8 text-rogue-forest mb-2" />
                <CardTitle>8-Month Journey</CardTitle>
                <CardDescription>
                  Structured curriculum designed to develop leadership skills through nature-inspired metaphors.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-rogue-gold mb-2" />
                <CardTitle>Accountability Partners</CardTitle>
                <CardDescription>
                  Matched with a partner for weekly check-ins and mutual support throughout your journey.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-rogue-copper mb-2" />
                <CardTitle>Curated Library</CardTitle>
                <CardDescription>
                  Access to carefully selected leadership books with guided discussions and reflections.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Compass className="h-8 w-8 text-rogue-sage mb-2" />
                <CardTitle>Discussion Forums</CardTitle>
                <CardDescription>
                  Engage with your cohort in real-time discussions about leadership challenges and insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 text-rogue-steel mb-2" />
                <CardTitle>Live Events</CardTitle>
                <CardDescription>
                  Join cohort calls, workshops, and book clubs with integrated Zoom and calendar features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mountain className="h-8 w-8 text-rogue-forest mb-2" />
                <CardTitle>Capstone Project</CardTitle>
                <CardDescription>
                  Apply your learning through a meaningful capstone project that impacts your community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Progress Demo */}
          <Card glass className="mb-12">
            <CardHeader>
              <CardTitle>Your Leadership Journey</CardTitle>
              <CardDescription>
                Track your progress through nature-inspired metaphors as you grow from seedling to summit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressTree progress={12} />
              <ProgressTree progress={35} />
              <ProgressTree progress={67} />
              <ProgressTree progress={95} />
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Roles</CardTitle>
              <CardDescription>
                Three distinct roles with tailored experiences and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <RoleBadge role="admin" />
                <RoleBadge role="facilitator" />
                <RoleBadge role="participant" />
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Button Variants Showcase */}
      <section className="py-16 bg-rogue-cream">
        <Container>
          <PageHeader heading="Design System" description="Consistent UI components with nature-inspired theming." />
          
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default (Forest)</Button>
                <Button variant="gold">Gold Accent</Button>
                <Button variant="sage">Sage</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-rogue-forest text-white py-12">
        <Container>
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold">Ready to Lead with Courage and Purpose?</h3>
            <p className="text-rogue-cream">Join the next cohort starting October 23, 2025</p>
            <Button variant="gold" size="lg" asChild>
              <a href="/signup">Apply Now</a>
            </Button>
          </div>
        </Container>
      </footer>
    </div>
  )
}
