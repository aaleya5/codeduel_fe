import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Target,
  DollarSign,
  Users,
  Clock,
  Settings,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import MembersList from "@/components/challenge/MembersList";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { mockChartData } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { challengeApi, dashboardApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const difficultyColors = {
  easy: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  hard: "bg-destructive/10 text-destructive border-destructive/20",
  any: "bg-primary/10 text-primary border-primary/20",
};

const ChallengePage: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (id) {
      loadChallengeData();
    }
  }, [id]);

  const loadChallengeData = async () => {
    setIsLoading(true);
    try {
      const challengeResponse = await challengeApi.getById(id!);
      const leaderboardResponse = await dashboardApi.getChallengeLeaderboard(
        id!
      );

      if (challengeResponse.success && challengeResponse.data) {
        setChallenge(challengeResponse.data);
      }

      if (leaderboardResponse.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data);
      }
    } catch (error: any) {
      console.error("Failed to load challenge:", error);
      toast({
        title: "Failed to load challenge",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!id) return;

    setIsJoining(true);
    try {
      const response = await challengeApi.join(id);

      if (response.success) {
        toast({
          title: "Joined challenge!",
          description: "You have successfully joined the challenge.",
        });
        loadChallengeData(); // Reload data
      } else {
        throw new Error(response.message || "Failed to join challenge");
      }
    } catch (error: any) {
      toast({
        title: "Failed to join challenge",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleActivateChallenge = async () => {
    setIsActivating(true);
    try {
      const response = await challengeApi.updateStatus(id!, "ACTIVE");

      if (response.success) {
        toast({
          title: "Challenge activated!",
          description:
            "Your challenge is now active and visible to all members.",
        });
        loadChallengeData(); // Reload data
      } else {
        throw new Error(response.message || "Failed to activate challenge");
      }
    } catch (error: any) {
      toast({
        title: "Failed to activate challenge",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Challenge not found</h2>
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

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
  const difficultyDisplay =
    challenge.difficultyFilter && challenge.difficultyFilter.length > 0
      ? challenge.difficultyFilter.join(", ")
      : "Any";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{challenge.name}</h1>
              <Badge variant="outline" className={cn(difficultyColors.any)}>
                {difficultyDisplay}
              </Badge>
              <Badge
                variant="outline"
                className={
                  challenge.status === "ACTIVE"
                    ? "bg-success/10 text-success"
                    : ""
                }
              >
                {challenge.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{challenge.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(challenge.startDate).toLocaleDateString()} -{" "}
                  {new Date(challenge.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{daysRemaining} days left</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {challenge.status === "PENDING" &&
              challenge.ownerId === user?.id && (
                <Button
                  className="gap-2 gradient-primary"
                  onClick={handleActivateChallenge}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  Activate Challenge
                </Button>
              )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleJoinChallenge}
              disabled={isJoining}
            >
              {isJoining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              Join Challenge
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Target</p>
                  <p className="text-xl font-semibold">
                    {challenge.minSubmissionsPerDay}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <DollarSign className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Penalty</p>
                  <p className="text-xl font-semibold">
                    ${challenge.penaltyAmount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="text-xl font-semibold">{leaderboard.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-xl font-semibold">{progress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Challenge Progress</span>
              <span className="text-sm text-muted-foreground">
                {totalDays - daysRemaining} of {totalDays} days
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenge Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((member, index) => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-medium">
                              {member.userName || member.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Penalties: ${member.totalPenalty || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No members yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressChart data={mockChartData} title="Team Progress" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ChallengePage;
