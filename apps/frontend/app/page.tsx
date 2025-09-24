"use client"
import React from 'react';
import { Activity, Bell, Clock, Server, ArrowRight, Check, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function App() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="w-fit mx-auto">
            <Activity className="h-3 w-3 mr-1" />
            Real-time Monitoring
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Monitor Your Websites with Confidence
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get instant alerts when your websites go down. Monitor uptime, performance, and ensure your business never misses a beat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="h-14 px-8 text-lg" onClick={() => router.push('/dashboard')}>
              Start Monitoring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything you need for reliable monitoring
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional website monitoring tools to keep your business online
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Bell className="h-10 w-10 text-primary" />}
              title="Instant Alerts"
              description="Get notified immediately when your services experience downtime through multiple channels."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-primary" />}
              title="24/7 Monitoring"
              description="Round-the-clock monitoring from multiple locations worldwide."
            />
            <FeatureCard
              icon={<Server className="h-10 w-10 text-primary" />}
              title="Detailed Reports"
              description="Comprehensive reports and analytics to track your service performance."
            />
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your monitoring needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="Starter"
              price="29"
              features={[
                "10 monitors",
                "1-minute checks",
                "Email notifications",
                "5 team members",
                "24h data retention"
              ]}
            />
            <PricingCard
              title="Professional"
              price="79"
              featured={true}
              features={[
                "50 monitors",
                "30-second checks",
                "All notification channels",
                "Unlimited team members",
                "30-day data retention",
                "API access"
              ]}
            />
            <PricingCard
              title="Enterprise"
              price="199"
              features={[
                "Unlimited monitors",
                "15-second checks",
                "Priority support",
                "Custom solutions",
                "90-day data retention",
                "SLA guarantee"
              ]}
            />
          </div>
        </div>
      </section>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold">SolUp Monitor</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Keeping your websites online, always.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-6">Product</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6">Company</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6">Legal</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2025 SolUp Monitor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg hover:scale-105 border-0 bg-card/50 backdrop-blur-sm p-6">
      <CardHeader className="pb-4">
        <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">{icon}</div>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  featured?: boolean;
}

function PricingCard({ title, price, features, featured = false }: PricingCardProps) {
  return (
    <Card className={`relative transition-all hover:shadow-xl p-6 ${
      featured ? 'ring-2 ring-primary shadow-xl scale-105 bg-primary/5' : 'hover:scale-105'
    }`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl mb-4">{title}</CardTitle>
        <div className="space-y-2">
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold">${price}</span>
            <span className="text-muted-foreground ml-2 text-lg">/month</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <ul className="space-y-4">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-base">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full h-12 text-lg" variant={featured ? 'default' : 'outline'}>
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}

export default App;