import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Phone,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Spero AI</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            <Button onClick={() => navigate("/dashboard")} size="sm">
              Dashboard <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4 space-y-3">
            <a href="#features" className="block text-sm py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="block text-sm py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#contact" className="block text-sm py-2" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <Button className="w-full" onClick={() => navigate("/dashboard")}>
              Open Dashboard
            </Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Zap className="h-3 w-3" />
            AI-Powered Revenue Recovery
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Recover Lost Revenue
            <br />
            <span className="gradient-text">with AI Calling</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Upload your leads, and let our AI receptionist call them back automatically.
            Smart scoring, real conversations, real conversions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" onClick={() => navigate("/dashboard")} className="gradient-primary border-0 text-white hover:opacity-90">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="xl" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              See How It Works
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              50 free calls/month
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Setup in 5 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-card/50">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Leads Recovered" },
            { value: "94%", label: "Connection Rate" },
            { value: "$2.4M", label: "Revenue Recovered" },
            { value: "3.2x", label: "ROI Average" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold md:text-4xl">
              Everything you need to
              <br />
              <span className="gradient-text">reactivate leads</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From CSV upload to closed deals — our AI handles the entire outbound calling process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Phone,
                title: "AI Voice Calling",
                description: "Natural-sounding AI agents make outbound calls to your leads. They handle objections, qualify interest, and book appointments.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: TrendingUp,
                title: "Smart Lead Scoring",
                description: "AI analyzes each lead and assigns a conversion probability score. Focus your time on the hottest opportunities.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: BarChart3,
                title: "Real-Time Dashboard",
                description: "Track every call, conversion, and revenue metric in a beautiful dashboard. Know exactly what's working.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                icon: Users,
                title: "Bulk CSV Upload",
                description: "Upload thousands of leads via CSV. Our system processes them instantly and queues AI calls automatically.",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                icon: Clock,
                title: "Smart Scheduling",
                description: "AI calls at optimal times based on timezone and historical answer patterns. Maximize connection rates.",
                color: "text-pink-400",
                bg: "bg-pink-500/10",
              },
              {
                icon: Shield,
                title: "Compliance Built-In",
                description: "DNC list checking, call recording consent, and TCPA compliance handled automatically.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-border/50 bg-card/80 hover:border-border transition-colors group">
                  <CardContent className="p-6">
                    <div className={`inline-flex rounded-lg p-2.5 ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 bg-card/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold md:text-4xl">
              Simple, transparent <span className="gradient-text">pricing</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free. Scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "",
                description: "Perfect for testing the waters",
                features: ["50 AI calls/month", "100 lead uploads", "Basic dashboard", "Email support"],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Growth",
                price: "$99",
                period: "/month",
                description: "For growing businesses",
                features: ["1,000 AI calls/month", "Unlimited leads", "Advanced analytics", "Priority support", "Custom AI scripts", "CRM integrations"],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large-scale operations",
                features: ["Unlimited AI calls", "Unlimited leads", "White-label option", "Dedicated account manager", "Custom integrations", "SLA guarantee"],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`relative border-border/50 ${plan.popular ? "border-primary/50 shadow-lg shadow-primary/5" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <Button
                    className={`w-full ${plan.popular ? "gradient-primary border-0 text-white hover:opacity-90" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate("/dashboard")}
                  >
                    {plan.cta}
                  </Button>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold md:text-4xl">
              Trusted by <span className="gradient-text">growing teams</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "We recovered $45K in the first month alone. The AI calls sound so natural, our leads don't even know it's not a human.",
                name: "Sarah Chen",
                title: "VP of Sales, TechCorp",
              },
              {
                quote: "Setup took literally 5 minutes. Uploaded our dead leads CSV and the AI started calling within the hour. Game changer.",
                name: "Marcus Johnson",
                title: "Founder, ScaleUp Agency",
              },
              {
                quote: "Our conversion rate jumped from 2% to 12% after switching to Spero AI. The lead scoring alone is worth the price.",
                name: "Emily Rodriguez",
                title: "Head of Growth, RetailPro",
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="border-border/50 bg-card/80">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 md:py-32 bg-card/30">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">
              Get in <span className="gradient-text">touch</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6 md:p-8">
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-semibold">Message Sent!</h3>
                  <p className="text-muted-foreground mt-2">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Name</label>
                      <Input
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        className="bg-secondary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Company</label>
                    <Input
                      placeholder="Your company"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Message</label>
                    <textarea
                      placeholder="How can we help?"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary border-0 text-white hover:opacity-90" size="lg">
                    Send Message <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">Spero AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Spero AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
