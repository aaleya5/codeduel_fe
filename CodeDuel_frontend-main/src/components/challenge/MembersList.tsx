import React from 'react';
import { CheckCircle2, XCircle, Clock, Flame } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChallengeMember } from '@/types';
import { cn } from '@/lib/utils';

interface MembersListProps {
  members: ChallengeMember[];
  currentUserId?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10 border-success/20',
    label: 'Completed'
  },
  failed: {
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/20',
    label: 'Failed'
  },
  pending: {
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10 border-warning/20',
    label: 'Pending'
  }
};

const MembersList: React.FC<MembersListProps> = ({ members, currentUserId }) => {
  return (
    <div className="space-y-3">
      {members.map((member) => {
        const config = statusConfig[member.status];
        const StatusIcon = config.icon;

        return (
          <div
            key={member.userId}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
              'hover:shadow-md',
              member.userId === currentUserId && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} alt={member.userName} />
              <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{member.userName}</p>
                {member.userId === currentUserId && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-warning" />
                  <span>{member.streak} day streak</span>
                </div>
                {member.totalPenalty > 0 && (
                  <span className="text-destructive">${member.totalPenalty} penalty</span>
                )}
              </div>
            </div>

            <Badge variant="outline" className={cn('gap-1.5', config.bg, config.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {config.label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
};

export default MembersList;
