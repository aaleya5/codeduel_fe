import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'primary';
  className?: string;
}

const variantStyles = {
  default: 'bg-card',
  success: 'bg-success/20 border-success/40',
  warning: 'bg-warning/20 border-warning/40',
  destructive: 'bg-destructive/20 border-destructive/40',
  primary: 'bg-secondary border-border'
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/30 text-success',
  warning: 'bg-warning/30 text-warning',
  destructive: 'bg-destructive/30 text-destructive',
  primary: 'bg-muted text-foreground'
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className
}) => {
  return (
    <Card className={cn(
      'hover-lift border transition-all duration-300',
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trendValue && (
                <span className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-destructive',
                  trend === 'neutral' && 'text-muted-foreground'
                )}>
                  {trendValue}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            iconVariantStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
