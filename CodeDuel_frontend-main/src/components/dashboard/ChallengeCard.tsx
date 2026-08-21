import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Target,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Challenge } from "@/types";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
}

const difficultyColors = {
  easy: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  hard: "bg-destructive/10 text-destructive border-destructive/20",
  mixed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  any: "bg-primary/10 text-primary border-primary/20",
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const daysRemaining = Math.ceil(
    (new Date(challenge.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const totalDays = Math.ceil(
    (new Date(challenge.endDate).getTime() -
      new Date(challenge.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const progress = Math.round(((totalDays - daysRemaining) / totalDays) * 100);
  const completedMembers =
    challenge.members?.filter((m) => m.status === "completed").length || 0;

  // Determine difficulty display from difficultyFilter array
  const getDifficultyDisplay = () => {
    if (
      !challenge.difficultyFilter ||
      challenge.difficultyFilter.length === 0
    ) {
      return "any";
    }
    if (challenge.difficultyFilter.length === 3) {
      return "any";
    }
    if (challenge.difficultyFilter.length === 1) {
      return challenge.difficultyFilter[0].toLowerCase();
    }
    return "mixed";
  };

  const difficulty = getDifficultyDisplay();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <Link to={`/challenge/${challenge.id}`}>
      <Card className="hover-lift cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {challenge.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={cn("text-xs", getStatusColor(challenge.status))}
                >
                  {challenge.status}
                </Badge>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  difficultyColors[difficulty as keyof typeof difficultyColors]
                )}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{challenge.minSubmissionsPerDay || 1}/day</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>${challenge.penaltyAmount} penalty</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{daysRemaining} days left</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {completedMembers}/{challenge.members?.length || 0} done
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center -space-x-2">
            {challenge.members?.slice(0, 5).map((member, index) => (
              <Avatar
                key={member.userId}
                className="h-8 w-8 border-2 border-card"
              >
                <AvatarImage src={member.avatar} alt={member.userName} />
                <AvatarFallback className="text-xs">
                  {member.userName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {(challenge.members?.length || 0) > 5 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                +{(challenge.members?.length || 0) - 5}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ChallengeCard;
