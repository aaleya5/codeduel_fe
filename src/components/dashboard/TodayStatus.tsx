import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Stats } from '@/types';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface TodayStatusProps {
  stats: Stats;
  onComplete?: () => void;
}

const TodayStatus: React.FC<TodayStatusProps> = ({ stats, onComplete }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const progress = (stats.todaySolved / stats.todayTarget) * 100;
  const isCompleted = stats.todayStatus === 'completed';
  const isFailed = stats.todayStatus === 'failed';

  // useEffect(() => {
  //   if (isCompleted && !hasAnimated) {
  //     setHasAnimated(true);
  //     confetti({
  //       particleCount: 100,
  //       spread: 70,
  //       origin: { y: 0.6 },
  //       colors: ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b']
  //     });
  //   }
  // }, [isCompleted, hasAnimated]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7c3aed', '#10b981', '#3b82f6', '#f59e0b']
    });
    onComplete?.();
  };

  return (
    <Card className={cn(
      'hover-lift transition-all duration-300',
      isCompleted && 'border-success/50 bg-success/5',
      isFailed && 'border-destructive/50 bg-destructive/5'
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Today's Progress</span>
          {isCompleted && (
            <div className="flex items-center gap-1 text-success text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Completed!
            </div>
          )}
          {isFailed && (
            <div className="flex items-center gap-1 text-destructive text-sm font-medium">
              <XCircle className="h-4 w-4" />
              Failed
            </div>
          )}
          {stats.todayStatus === 'pending' && (
            <div className="flex items-center gap-1 text-warning text-sm font-medium">
              <Clock className="h-4 w-4" />
              In Progress
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={isCompleted ? 'hsl(var(--success))' : isFailed ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${progress * 3.52} 352`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{stats.todaySolved}</span>
              <span className="text-sm text-muted-foreground">of {stats.todayTarget}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-muted-foreground">Current Streak</span>
          </div>
          <span className="font-semibold">{stats.currentStreak} days</span>
        </div>

        {!isCompleted && !isFailed && (
          <Button 
            onClick={triggerConfetti}
            className="w-full gradient-primary"
          >
            Mark as Complete
          </Button>
        )}

        {isCompleted && (
          <Button 
            onClick={triggerConfetti}
            variant="outline"
            className="w-full border-success/50 text-success hover:bg-success/10"
          >
            🎉 Celebrate Again!
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayStatus;
