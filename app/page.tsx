import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TreePine, Mountain, Compass, Users, BookOpen, Calendar, Sparkles, ArrowRight, CheckCircle, Target, Award, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full Impact */}
      <section className="relative bg-gradient-to-br from-rogue-forest via-rogue-pine to-rogue-forest text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
            backgroundSize: '40px 40px' 
          }} />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rogue-gold/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rogue-sage/20 rounded-full blur-3xl"></div>
        
        <Container className="relative z-10">
          <div className="py-20 md:py-32">
            <div className="max-w-5xl mx-auto">
              {/* Logo with glow effect */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-rogue-gold/30 blur-2xl rounded-full"></div>
                  <img 
                    src="/RLTE-logo.png" 
                    alt="Rogue Leadership Training Experience" 
                    className="h-48 w-auto drop-shadow-2xl relative z-10"
                  />
                </div>
              </div>
              
              {/* Main headline */}
              <div className="text-center space-y-6 mb-12">
                <Badge className="bg-rogue-gold text-white border-0 shadow-xl text-base px-6 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  8-Month Leadership Journey
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Lead from Within.
                  <span className="block text-rogue-gold mt-2">Grow with Others.</span>
                  <span className="block mt-2">Impact Your Community.</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Transform into the leader your community needs through our cohort-based training experience powered by nature, accountability, and proven frameworks.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button 
                  size="lg" 
                  className="bg-rogue-gold hover:bg-rogue-gold/90 text-white shadow-2xl text-lg px-8 py-6 h-auto"
                  asChild
                >
                  <a href="/signup">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-rogue-forest transition-all text-lg px-8 py-6 h-auto backdrop-blur-sm"
                  asChild
                >
                  <a href="#features">Learn More</a>
                </Button>
              </div>

              {/* Social proof stats */}
              <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-4xl font-bold text-rogue-gold mb-1">8</div>
                  <div className="text-sm text-white/80">Months</div>
                </div>
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-4xl font-bold text-rogue-gold mb-1">30+</div>
                  <div className="text-sm text-white/80">Sessions</div>
                </div>
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-4xl font-bold text-rogue-gold mb-1">100+</div>
                  <div className="text-sm text-white/80">Leaders</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* What You'll Experience */}
      <section className="py-20 bg-gradient-to-b from-white to-rogue-cream" id="features">
        <Container>
          <div className="text-center mb-16">
            <Badge className="bg-rogue-forest/10 text-rogue-forest border-0 mb-4 text-sm px-4 py-2">
              Your Journey
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-rogue-forest mb-4">
              What You'll Experience
            </h2>
            <p className="text-xl text-rogue-slate max-w-2xl mx-auto">
              A comprehensive learning ecosystem designed to develop authentic, effective leaders
            </p>
          </div>

          {/* Features Grid - Premium cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-rogue-forest/5">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-rogue-forest/10 rounded-xl flex items-center justify-center mb-4">
                  <TreePine className="h-8 w-8 text-rogue-forest" />
                </div>
                <CardTitle className="text-2xl">8-Month Curriculum</CardTitle>
                <CardDescription className="text-base">
                  Structured modules that progressively build your leadership capabilities through nature-inspired metaphors and practical frameworks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-rogue-gold/5">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-rogue-gold/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-rogue-gold" />
                </div>
                <CardTitle className="text-2xl">Accountability Partners</CardTitle>
                <CardDescription className="text-base">
                  Paired with a fellow leader for weekly check-ins, mutual support, and shared growth throughout your journey.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-rogue-copper/5">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-rogue-copper/10 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-rogue-copper" />
                </div>
                <CardTitle className="text-2xl">Curated Library</CardTitle>
                <CardDescription className="text-base">
                  Carefully selected leadership books aligned with each module, complete with guided discussions and reflections.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-rogue-sage/10">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-rogue-sage/20 rounded-xl flex items-center justify-center mb-4">
                  <Compass className="h-8 w-8 text-rogue-forest" />
                </div>
                <CardTitle className="text-2xl">Community Forums</CardTitle>
                <CardDescription className="text-base">
                  Engage in meaningful discussions with your cohort, share insights, and learn from diverse perspectives.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-rogue-steel/10">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-rogue-steel/20 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-rogue-steel" />
                </div>
                <CardTitle className="text-2xl">Live Events</CardTitle>
                <CardDescription className="text-base">
                  Weekly cohort calls, workshops, and book clubs with expert facilitators and guest speakers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-gradient-to-br from-white to-rogue-forest/5">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-rogue-forest/10 rounded-xl flex items-center justify-center mb-4">
                  <Mountain className="h-8 w-8 text-rogue-forest" />
                </div>
                <CardTitle className="text-2xl">Capstone Project</CardTitle>
                <CardDescription className="text-base">
                  Apply your learning through a meaningful project that creates real impact in your community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Container>
      </section>

      {/* Journey Visualization */}
      <section className="py-20 bg-gradient-to-br from-rogue-forest via-rogue-pine to-rogue-sage text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} />
        </div>

        <Container className="relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-rogue-gold text-white border-0 mb-4 text-sm px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Your Path
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The 8-Month Journey
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Progressive development through carefully designed modules
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { month: "Months 1-2", title: "Foundation", desc: "Self-awareness & values", icon: Target },
              { month: "Months 3-4", title: "Growth", desc: "Skills & capabilities", icon: TrendingUp },
              { month: "Months 5-6", title: "Integration", desc: "Practice & feedback", icon: Users },
              { month: "Months 7-8", title: "Impact", desc: "Application & legacy", icon: Award },
            ].map((phase, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="w-12 h-12 bg-rogue-gold rounded-full flex items-center justify-center mb-4">
                  <phase.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-rogue-gold font-semibold mb-1">{phase.month}</div>
                <h3 className="text-2xl font-bold mb-2">{phase.title}</h3>
                <p className="text-white/80">{phase.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits/Outcomes */}
      <section className="py-20 bg-rogue-cream">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-rogue-gold/10 text-rogue-gold border-0 mb-4 text-sm px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Outcomes
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-rogue-forest mb-4">
                What You'll Walk Away With
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Deep self-awareness and clarity on your values",
                "Practical leadership frameworks you can apply immediately",
                "A supportive network of fellow leaders",
                "Confidence to lead authentically in any context",
                "Tools for continuous growth and development",
                "A completed capstone project demonstrating your impact",
                "Lifelong access to the alumni community",
                "Certificate of completion",
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-md">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-rogue-forest font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rogue-gold via-rogue-copper to-rogue-gold text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }} />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Lead with Courage and Purpose?
            </h2>
            <p className="text-2xl text-white/90">
              Join the next cohort starting October 23, 2025
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="bg-white text-rogue-gold hover:bg-white/90 shadow-2xl text-lg px-8 py-6 h-auto"
                asChild
              >
                <a href="/signup">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-rogue-gold transition-all text-lg px-8 py-6 h-auto"
                asChild
              >
                <a href="/login">Member Login</a>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-rogue-forest text-white py-16">
        <Container>
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <img 
                src="/RLTE-logo.png" 
                alt="RLTE" 
                className="h-20 w-auto mb-4"
              />
              <p className="text-rogue-cream/80 leading-relaxed">
                Developing authentic leaders through nature-inspired training and community support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-rogue-gold">Quick Links</h3>
              <ul className="space-y-2 text-rogue-cream/80">
                <li><a href="/signup" className="hover:text-white transition-colors">Apply Now</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Member Login</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-rogue-gold">Connect</h3>
              <p className="text-rogue-cream/80">
                Questions about the program?
                <br />
                <a href="mailto:info@rogueleadership.org" className="text-rogue-gold hover:text-rogue-gold/80 transition-colors">
                  info@rogueleadership.org
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-rogue-cream/60 text-sm">
            <p>© 2025 Rogue Leadership Training Experience. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}
