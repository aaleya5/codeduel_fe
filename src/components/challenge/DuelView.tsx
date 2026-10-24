import React from "react";
import { Flame, Trophy, Target, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DuelMember {
  memberId: string;
  userId: string;
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalPenalties: number;
  totalPaid: number;
  completedDays: number;
  totalDays: number;
  completionRate: string;
}

interface DuelViewProps {
  members: DuelMember[];
}

const avatarFor = (username: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

/**
 * Only renders anything meaningful for exactly 2 members - the generic
 * leaderboard list handles 1 or 3+ members fine, this is purely the
 * "friends holding each other accountable" view.
 */
const DuelView: React.FC<DuelViewProps> = ({ members }) => {
  if (members.length !== 2) return null;

  const [a, b] = members;
  const rate = (m: DuelMember) => parseFloat(m.completionRate);
  const leader = rate(a) === rate(b) ? null : rate(a) > rate(b) ? a : b;

  const Stat: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactNode }> = ({
    label,
    value,
    icon,
  }) => (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );

  const Side: React.FC<{ member: DuelMember }> = ({ member }) => {
    const outstanding = Math.max(0, member.totalPenalties - member.totalPaid);
    const isLeader = leader?.memberId === member.memberId;

    return (
      <div className="flex-1 space-y-4 text-center">
        <div className="relative inline-block">
          <Avatar className="h-16 w-16 mx-auto border-2 border-border">
            <AvatarImage src={avatarFor(member.username)} />
            <AvatarFallback>{member.username.charAt(0)}</AvatarFallback>
          </Avatar>
          {isLeader && (
            <Trophy className="h-5 w-5 text-yellow-500 absolute -top-1 -right-1" />
          )}
        </div>
        <p className="font-semibold text-lg">{member.username}</p>
        <div className="grid grid-cols-2 gap-3 text-left">
          <Stat
            label="Streak"
            value={`${member.currentStreak}d`}
            icon={<Flame className="h-4 w-4 text-orange-500" />}
          />
          <Stat
            label="Completion"
            value={`${member.completionRate}%`}
            icon={<Target className="h-4 w-4 text-primary" />}
          />
          <Stat
            label="Best Streak"
            value={`${member.longestStreak}d`}
            icon={<Flame className="h-4 w-4 text-muted-foreground" />}
          />
          <Stat
            label="Owes"
            value={`Rs. ${outstanding}`}
            icon={<Wallet className="h-4 w-4 text-destructive" />}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="text-lg text-center">Head-to-Head</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Side member={a} />
          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-2xl font-bold text-muted-foreground">VS</span>
            {leader && (
              <Badge variant="secondary" className="whitespace-nowrap">
                {leader.username} ahead
              </Badge>
            )}
          </div>
          <Side member={b} />
        </div>
      </CardContent>
    </Card>
  );
};

export default DuelView;
