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
      description: 'Build consistency with daily streak tracking and never break your coding momentum.'
    },
    {
      icon: Trophy,
      title: 'Compete with Friends',
      description: 'Create challenges and compete with friends to stay motivated and accountable.'
    },
    {
      icon: Users,
      title: 'Team Challenges',
      description: 'Join group challenges and climb the leaderboard together.'
    },
    {
      icon: Zap,
      title: 'Penalty System',
      description: 'Stay accountable with penalty-based challenges. Miss a day, pay the price!'
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
            <span className="hidden text-lg sm:inline-block">LeetCode Tracker</span>
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
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>
        
        <div className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-1.5 text-sm backdrop-blur">
              <Zap className="h-4 w-4 text-primary" />
              <span>Track. Compete. Improve.</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Master LeetCode with
              <span className="block gradient-text">Daily Consistency</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your daily coding progress, compete with friends, and stay accountable with our penalty-based challenge system. Build the habit of consistent problem-solving.
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

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>GitHub heatmap</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need to stay consistent</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for developers who want to improve their problem-solving skills through daily practice and friendly competition.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover-lift border-2 group">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
            Ready to level up your coding skills?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of developers who are building consistent coding habits and crushing their LeetCode goals.
          </p>
          <Button size="lg" variant="secondary" asChild className="gap-2">
            <Link to="/register">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2 className="h-5 w-5" />
            <span>LeetCode Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for developers who grind
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
