import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Flame, Trophy, Users, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Index: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: Flame,
      title: 'Streak Tracking',
      description: 'Build consistency with daily streak tracking that turns habits into measurable momentum.'
    },
    {
      icon: Trophy,
      title: 'Challenge Rooms',
      description: 'Create competitive rooms with friends, teammates, or peers and keep everyone aligned.'
    },
    {
      icon: Users,
      title: 'Shared Accountability',
      description: 'Group challenges make consistency easier to maintain and harder to ignore.'
    },
    {
      icon: Zap,
      title: 'Penalty System',
      description: 'Use transparent stakes and real accountability to keep each challenge moving forward.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden text-lg sm:inline-block">CodeDuel</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" asChild className="gradient-primary">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 border border-border bg-background px-4 py-1.5 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Track. Compete. Improve.</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Turn daily practice into
              <span className="block gradient-text">a real coding duel</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create challenge rooms, track daily LeetCode progress, and keep your squad accountable with transparent penalties, streaks, and live leaderboards.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="gradient-primary w-full sm:w-auto gap-2">
                <Link to="/register">
                  Start Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Daily streaks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Challenge rooms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Live scoreboards</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-left">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Demo ready
                  </p>
                  <p className="mt-1 text-base font-medium">Use any demo account to walk through the product instantly</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/login">Open demo login</Link>
                  </Button>
                  <Button size="sm" className="gradient-primary" asChild>
                    <Link to="/register">Create account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything needed to keep the streak alive</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for developers and teams who want structured accountability, daily practice, and healthy competition without the chaos of ad hoc tracking.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <Card className="gradient-primary p-8 md:p-16 text-center border-0">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to turn your practice into a streak story?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Launch your next challenge room, keep your squad honest, and turn daily problem-solving into a real competitive habit.
          </p>
          <Button size="lg" variant="secondary" asChild className="gap-2">
            <Link to="/register">
              Start Your Duel <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2 className="h-5 w-5" />
            <span>CodeDuel</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for daily coding accountability and competition
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
