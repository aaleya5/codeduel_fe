import React from 'react';
import { Trophy, Medal, Award, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry } from '@/types';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, currentUserId }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-medium">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/20';
    if (rank === 2) return 'bg-gray-400/10 border-gray-400/20';
    if (rank === 3) return 'bg-amber-600/10 border-amber-600/20';
    return '';
  };

  return (
    <Card className="hover-lift">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg transition-all duration-200',
                'hover:bg-muted/50',
                getRankBg(entry.rank),
                entry.userId === currentUserId && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatar} alt={entry.userName} />
                <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{entry.userName}</p>
                  {entry.userId === currentUserId && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{entry.totalSolved} solved</span>
                  <span>🔥 {entry.currentStreak} streak</span>
                </div>
              </div>

              <div className="text-right">
                {entry.missedDays > 0 ? (
                  <div className="flex items-center gap-1 text-destructive">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">${entry.penaltyAmount}</span>
                  </div>
                ) : (
                  <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
                    No penalty!
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.missedDays} missed
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;
