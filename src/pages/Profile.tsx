import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Award,
  Code,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  Loader2,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, leetcodeApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [leetcodeProfile, setLeetcodeProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // Load user profile
      const profileResponse = await authApi.getProfile();
      if (profileResponse.success) {
        setUserProfile(profileResponse.data);
      }

      // Load LeetCode profile if username exists
      if (user?.leetcodeUsername) {
        try {
          const leetcodeResponse = await leetcodeApi.getProfile(
            user.leetcodeUsername
          );
          if (leetcodeResponse.success) {
            setLeetcodeProfile(leetcodeResponse.data);
          }
        } catch (error) {
          console.error("Failed to load LeetCode profile:", error);
        }
      }
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      toast({
        title: "Failed to load profile",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const profile = userProfile || user;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-3xl">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold">
              {profile?.username || user?.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {profile?.email || user?.email}
            </p>
            {profile?.leetcodeUsername && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Code className="h-4 w-4" />
                LeetCode: @{profile.leetcodeUsername}
              </p>
            )}
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Joined{" "}
              {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/settings")}
          >
            Edit Profile
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leetcode">LeetCode Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Challenges
                      </p>
                      <p className="text-2xl font-bold">
                        {profile?.memberships?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Owned Challenges
                      </p>
                      <p className="text-2xl font-bold">
                        {profile?.ownedChallenges?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                      <Clock className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Member Since
                      </p>
                      <p className="text-xl font-bold">
                        {Math.floor(
                          (Date.now() -
                            new Date(
                              profile?.createdAt || Date.now()
                            ).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">
                      {profile?.username || user?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {profile?.email || user?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      LeetCode Username
                    </p>
                    <p className="font-medium">
                      {profile?.leetcodeUsername || "Not connected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Account Status
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success"
                    >
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leetcode" className="space-y-6">
            {!profile?.leetcodeUsername ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    No LeetCode Account Connected
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your LeetCode account in settings to view your stats
                  </p>
                  <Button onClick={() => (window.location.href = "/settings")}>
                    Go to Settings
                  </Button>
                </CardContent>
              </Card>
            ) : !leetcodeProfile ? (
              <Card>
                <CardContent className="p-12 text-center">
                  {/* <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" /> */}
                  <p className="text-muted-foreground">
                    No LeetCode data available. Please ensure your LeetCode session
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* LeetCode Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Current Streak
                        </p>
                        <p className="text-3xl font-bold">
                          {leetcodeProfile.streak || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          days in a row
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm text-success">
                          Total Active Days
                        </p>
                        <p className="text-3xl font-bold text-success">
                          {leetcodeProfile.totalActiveDays || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          days coded
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm text-warning">
                          Total Submissions
                        </p>
                        <p className="text-3xl font-bold text-warning">
                          {Object.values(
                            leetcodeProfile.submissionCalendar || {}
                          ).reduce((a: number, b: any) => a + (b as number), 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          This year
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm text-destructive">Active Years</p>
                        <p className="text-3xl font-bold text-destructive">
                          {leetcodeProfile.activeYears?.length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {leetcodeProfile.activeYears?.join(", ") || "N/A"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Streak Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Current Streak
                        </span>
                        <span className="text-xl font-bold">
                          {leetcodeProfile.streak || 0} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Total Active Days
                        </span>
                        <span className="text-xl font-bold">
                          {leetcodeProfile.totalActiveDays || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Username</span>
                        <span className="text-xl font-bold">
                          @{leetcodeProfile.username}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Submission Calendar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Total Submissions
                        </span>
                        <span className="text-xl font-bold">
                          {Object.values(
                            leetcodeProfile.submissionCalendar || {}
                          ).reduce((a: number, b: any) => a + (b as number), 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Days with Submissions
                        </span>
                        <span className="text-xl font-bold">
                          {
                            Object.keys(
                              leetcodeProfile.submissionCalendar || {}
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Active Years
                        </span>
                        <span className="text-xl font-bold">
                          {leetcodeProfile.activeYears?.join(", ") || "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                {leetcodeProfile.submissionCalendar &&
                  Object.keys(leetcodeProfile.submissionCalendar).length >
                    0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(leetcodeProfile.submissionCalendar)
                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                            .slice(0, 10)
                            .map(([timestamp, count]: [string, any]) => {
                              const date = new Date(parseInt(timestamp) * 1000);
                              return (
                                <div
                                  key={timestamp}
                                  className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      {date.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-success/10 text-success"
                                  >
                                    {count} submissions
                                  </Badge>
                                </div>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
