import React, { useState, useEffect } from "react";
import { Flame, Target, DollarSign, Zap, Trophy, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import StatsCard from "@/components/common/StatsCard";
import TodayStatus from "@/components/dashboard/TodayStatus";
import ProgressChart from "@/components/dashboard/ProgressChart";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import ChallengeCard from "@/components/dashboard/ChallengeCard";
import EmptyState from "@/components/common/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, challengeApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Stats } from "@/types";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    todayStatus: "pending",
    todaySolved: 0,
    todayTarget: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPenalties: 0,
    activeChallenges: 0,
    totalSolved: 0,
  });
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all dashboard data in parallel
      const [
        dashboardResponse,
        todayResponse,
        challengesResponse,
        statsResponse,
        activityResponse,
        chartResponse,
      ] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getTodayStatus(),
        challengeApi.getAll(), // Load all challenges, not just active
        dashboardApi.getStats(),
        dashboardApi.getActivityHeatmap(),
        dashboardApi.getSubmissionChart(),
      ]);

      // Update stats with real data
      if (statsResponse.success && statsResponse.data) {
        const statsData = statsResponse.data;
        const todaySummary = todayResponse?.data?.summary;
        const dashboardSummary = dashboardResponse?.data?.summary;

        setStats({
          todayStatus:
            todaySummary?.completed === todaySummary?.totalChallenges
              ? ("completed" as const)
              : ("pending" as const),
          todaySolved: todaySummary?.completed || 0,
          todayTarget: todaySummary?.totalChallenges || 0,
          currentStreak: statsData.currentStreak || 0,
          longestStreak: statsData.longestStreak || 0,
          totalPenalties: statsData.totalPenalties || 0,
          activeChallenges: dashboardSummary?.activeChallenges || 0,
          totalSolved: statsData.totalSubmissions || 0,
        });
      }

      // Update activity heatmap
      if (activityResponse.success && activityResponse.data) {
        setActivityData(activityResponse.data);
      }

      // Update chart data
      if (chartResponse.success && chartResponse.data) {
        setChartData(chartResponse.data);
      }

      // Update challenges list
      if (challengesResponse.success && challengesResponse.data) {
        setChallenges(challengesResponse.data);
      }
    } catch (error: unknown) {
      console.error("Failed to load dashboard:", error);
      toast({
        title: "Failed to load dashboard",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back,{" "}
              <span className="gradient-text">{user?.name || "Developer"}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your daily coding progress and stay consistent
            </p>
          </div>
          <Button asChild className="gradient-primary sm:w-auto w-full">
            <Link to="/create-challenge" className="gap-2">
              <Plus className="h-4 w-4" />
              New Challenge
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Current Streak"
            value={stats.currentStreak}
            subtitle={`Best: ${stats.longestStreak} days`}
            icon={Flame}
            variant="warning"
            trend="up"
            trendValue="+3 from last week"
          />
          <StatsCard
            title="Total Solved"
            value={stats.totalSolved}
            subtitle="Lifetime problems"
            icon={Target}
            variant="primary"
          />
          <StatsCard
            title="Active Challenges"
            value={stats.activeChallenges}
            subtitle="Ongoing competitions"
            icon={Trophy}
            variant="success"
          />
          <StatsCard
            title="Total Penalties"
            value={`$${stats.totalPenalties}`}
            subtitle="Avoid missing days!"
            icon={DollarSign}
            variant="destructive"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Today's Status */}
          <div className="lg:col-span-1">
            <TodayStatus stats={stats} />
          </div>

          {/* Right Column - Chart */}
          <div className="lg:col-span-2">
            <ProgressChart
              data={chartData}
              title="Daily Submissions (Last 30 Days)"
            />
          </div>
        </div>

        {/* Activity Heatmap */}
        <ActivityHeatmap data={activityData} title="Contribution Graph" />

        {/* Active Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Challenges</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/challenges">View all</Link>
            </Button>
          </div>

          {challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.slice(0, 3).map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Zap}
              title="No active challenges"
              description="Create or join a challenge to start competing with others and stay motivated!"
              action={{
                label: "Create Challenge",
                onClick: () => {},
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
