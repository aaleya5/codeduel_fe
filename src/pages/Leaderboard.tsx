import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import { mockLeaderboard } from '@/data/mockData';

const Leaderboard: React.FC = () => {
  const topThree = mockLeaderboard.slice(0, 3);
  const restOfLeaderboard = mockLeaderboard.slice(3);

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
            See who's leading the pack in solving problems
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          {/* 2nd Place */}
          <div className="order-1 pt-8">
            <Card className="hover-lift text-center p-4 bg-gradient-to-b from-gray-400/10 to-gray-400/5 border-gray-400/20">
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
          </div>

          {/* 1st Place */}
          <div className="order-2">
            <Card className="hover-lift text-center p-4 bg-gradient-to-b from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 shadow-glow">
              <div className="relative mb-3">
                <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-500">
                  <AvatarImage src={topThree[0]?.avatar} />
                  <AvatarFallback>{topThree[0]?.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full p-1">
                  <Trophy className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <p className="font-semibold truncate text-lg">{topThree[0]?.userName}</p>
              <p className="text-sm text-muted-foreground">{topThree[0]?.totalSolved} solved</p>
              <p className="text-xs text-muted-foreground">🔥 {topThree[0]?.currentStreak} streak</p>
            </Card>
          </div>

          {/* 3rd Place */}
          <div className="order-3 pt-12">
            <Card className="hover-lift text-center p-4 bg-gradient-to-b from-amber-600/10 to-amber-600/5 border-amber-600/20">
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
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{mockLeaderboard.reduce((acc, e) => acc + e.totalSolved, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Solved</p>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{mockLeaderboard.length}</p>
              <p className="text-sm text-muted-foreground">Participants</p>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <span className="text-3xl">🔥</span>
              <p className="text-2xl font-bold">{Math.max(...mockLeaderboard.map(e => e.currentStreak))}</p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="p-4 text-center">
              <span className="text-3xl">💸</span>
              <p className="text-2xl font-bold">${mockLeaderboard.reduce((acc, e) => acc + e.penaltyAmount, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Penalties</p>
            </CardContent>
          </Card>
        </div>

        {/* Full Leaderboard */}
        <LeaderboardTable entries={mockLeaderboard} currentUserId="1" />
      </div>
    </Layout>
  );
};

export default Leaderboard;
