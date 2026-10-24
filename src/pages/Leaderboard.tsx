import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import EmptyState from '@/components/common/EmptyState';
import { TableSkeleton, Skeleton } from '@/components/common/Skeleton';
import { dashboardApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LeaderboardEntry } from '@/types';
import { getSocket } from '@/lib/socket';

const avatarFor = (userName: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // A nightly (or manually triggered) evaluation run can change anyone's
  // rank, so refresh quietly - no loading skeleton - whenever the server
  // says the global leaderboard just went stale.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStale = async () => {
      try {
        const response = await dashboardApi.getGlobalLeaderboard();
        if (response.success && response.data) {
          setLeaderboard(
            response.data.map((entry: any) => ({
              ...entry,
              avatar: avatarFor(entry.userName),
            }))
          );
        }
      } catch (error) {
        console.error('Failed to refresh leaderboard:', error);
      }
    };

    socket.on('leaderboard:global:stale', handleStale);
    return () => {
      socket.off('leaderboard:global:stale', handleStale);
    };
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.getGlobalLeaderboard();
      if (response.success && response.data) {
        setLeaderboard(
          response.data.map((entry: any) => ({
            ...entry,
            avatar: avatarFor(entry.userName),
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast({
        title: 'Failed to load leaderboard',
        description: 'Please refresh the page to try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">
            See who's leading the pack across all challenges
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Skeleton className="h-40" />
              <Skeleton className="h-48" />
              <Skeleton className="h-36" />
            </div>
            <TableSkeleton rows={6} />
          </div>
        ) : leaderboard.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leaderboard data yet"
            description="Join a challenge and start solving problems to appear on the leaderboard."
            action={{ label: 'Browse Challenges', onClick: () => (window.location.href = '/') }}
          />
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* 2nd Place */}
              <div className="order-1 pt-8">
                {topThree[1] && (
                  <Card className="text-center p-4 bg-muted border-border">
                    <div className="relative mb-3">
                      <Avatar className="h-16 w-16 mx-auto border-4 border-gray-400">
                        <AvatarImage src={topThree[1]?.avatar} />
                        <AvatarFallback>{topThree[1]?.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 rounded-full p-1">
                        <Medal className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="font-semibold truncate">{topThree[1]?.userName}</p>
                    <p className="text-sm text-muted-foreground">{topThree[1]?.totalSolved} solved</p>
                    <p className="text-xs text-muted-foreground">🔥 {topThree[1]?.currentStreak} streak</p>
                  </Card>
                )}
              </div>

              {/* 1st Place */}
              <div className="order-2">
                {topThree[0] && (
                  <Card className="text-center p-4 bg-warning/10 border-warning/20">
                    <div className="relative mb-3">
                      <Avatar className="h-20 w-20 mx-auto border-4 border-warning">
                        <AvatarImage src={topThree[0]?.avatar} />
                        <AvatarFallback>{topThree[0]?.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-warning rounded-full p-1">
                        <Trophy className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="font-semibold truncate text-lg">{topThree[0]?.userName}</p>
                    <p className="text-sm text-muted-foreground">{topThree[0]?.totalSolved} solved</p>
                    <p className="text-xs text-muted-foreground">🔥 {topThree[0]?.currentStreak} streak</p>
                  </Card>
                )}
              </div>

              {/* 3rd Place */}
              <div className="order-3 pt-12">
                {topThree[2] && (
                  <Card className="text-center p-4 bg-secondary border-border">
                    <div className="relative mb-3">
                      <Avatar className="h-14 w-14 mx-auto border-4 border-amber-600">
                        <AvatarImage src={topThree[2]?.avatar} />
                        <AvatarFallback>{topThree[2]?.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 rounded-full p-1">
                        <Award className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="font-semibold truncate">{topThree[2]?.userName}</p>
                    <p className="text-sm text-muted-foreground">{topThree[2]?.totalSolved} solved</p>
                    <p className="text-xs text-muted-foreground">🔥 {topThree[2]?.currentStreak} streak</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">
                    {leaderboard.reduce((acc, e) => acc + e.totalSolved, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Solved</p>
                </CardContent>
              </Card>
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <p className="text-2xl font-bold">{leaderboard.length}</p>
                  <p className="text-sm text-muted-foreground">Participants</p>
                </CardContent>
              </Card>
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl">🔥</span>
                  <p className="text-2xl font-bold">
                    {Math.max(...leaderboard.map((e) => e.currentStreak), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                </CardContent>
              </Card>
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl">💸</span>
                  <p className="text-2xl font-bold">
                    Rs. {leaderboard.reduce((acc, e) => acc + e.penaltyAmount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Penalties</p>
                </CardContent>
              </Card>
            </div>

            {/* Full Leaderboard */}
            <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
