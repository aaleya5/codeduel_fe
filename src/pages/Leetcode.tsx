import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, leetcodeApi } from "@/lib/api";
import { useEffect, useState } from "react";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Leetcode = () => {
  const { user } = useAuth();
  const [leetcodeProfile, setLeetcodeProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [recentSubmissionsError, setRecentSubmissionsError] = useState("");
  const [selectedActivityDate, setSelectedActivityDate] = useState<string | null>(null);
  const [daySubmissions, setDaySubmissions] = useState<any[]>([]);
  const [isLoadingDaySubmissions, setIsLoadingDaySubmissions] = useState(false);
  const [daySubmissionsError, setDaySubmissionsError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!selectedActivityDate || !user?.leetcodeUsername) return;

    let isCurrentRequest = true;
    setIsLoadingDaySubmissions(true);
    setDaySubmissions([]);
    setDaySubmissionsError("");

    leetcodeApi
      .getSubmissionsForDate(user.leetcodeUsername, selectedActivityDate)
      .then((response) => {
        if (!isCurrentRequest) return;
        if (response.success && response.data) {
          setDaySubmissions(response.data);
        } else {
          setDaySubmissionsError(response.message || "Could not load submissions for this day.");
        }
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        console.error("Failed to load submissions for selected day:", error);
        setDaySubmissionsError(
          error.response?.data?.message || "Could not load submissions for this day."
        );
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingDaySubmissions(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedActivityDate, user?.leetcodeUsername]);

  const loadProfile = async () => {
    setIsLoading(true);
    setRecentSubmissionsError("");
    try {
      const profileResponse = await authApi.getProfile();
      if (profileResponse.success) {
        setUserProfile(profileResponse.data);
      }

      if (user?.leetcodeUsername) {
        try {
          const leetcodeResponse = await leetcodeApi.getProfile(
            user.leetcodeUsername
          );
          if (leetcodeResponse.success) {
            setLeetcodeProfile(leetcodeResponse.data);
          }
        } catch (err) {
          console.error("Failed to load Leetcode profile", err);
        }
        try {
          const testResp = await leetcodeApi.testConnection(user.leetcodeUsername);
          if (testResp.success && testResp.data) {
            setRecentSubmissions(testResp.data.submissions || []);
          } else {
            setRecentSubmissionsError(
              testResp.message || "Could not load recent submissions."
            );
          }
        } catch (error: any) {
          console.error("Failed to fetch recent submissions", error);
          setRecentSubmissionsError(
            error.response?.data?.message ||
              "Could not load recent submissions. Please try again."
          );
        }
      }
    } catch (err) {
      console.error("Failed to load Leetcode profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Profile updated:", leetcodeProfile);
  }, [leetcodeProfile]);
  const activityData = formatSubmissionCalendar(
    leetcodeProfile?.submissionCalendar
  );
  const streakStats = calculateCalendarStreaks(activityData);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">LeetCode Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View your LeetCode contribution stats and profile details
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={loadProfile} disabled={isLoading}>
              Refresh
            </Button>
            <Button asChild>
              <Link to="/settings">Settings</Link>
            </Button>
          </div>
        </div>

        {!user?.leetcodeUsername && (
          <EmptyState
            title="No LeetCode username"
            description="Set your LeetCode username in settings to fetch profile data."
            action={{
              label: "Go to Settings",
              onClick: () => {},
            }}
          />
        )}

        {user?.leetcodeUsername && !leetcodeProfile && !isLoading && (
          <EmptyState
            title="No profile data"
            description="Make sure you've stored a LeetCode session in the backend."
            action={{ label: "Go to Settings", onClick: () => {navigate('/settings')} }}
          />
        )}

        {leetcodeProfile && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="p-4 bg-card rounded-md">
                  <h2 className="text-xl font-semibold">{leetcodeProfile.username}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current streak: <span className="font-medium">{streakStats.currentStreak} days</span>
                    {' • '}Best streak (all-time): <span className="font-medium">{streakStats.longestStreak} days</span>
                    {' • '}Total active days: <span className="font-medium">{leetcodeProfile.totalActiveDays}</span>
                  </p>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Active Years</h3>
                    <div className="flex gap-2 mt-2">
                      {(leetcodeProfile.activeYears || []).map((y: number) => (
                        <span key={y} className="px-2 py-1 bg-muted rounded text-sm">{y}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="p-4 bg-card rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground">Actions</h3>
                  <div className="flex flex-col gap-2 mt-3">
                    <TestConnectionButton username={leetcodeProfile.username} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ActivityHeatmap
                data={activityData}
                title="Contribution Graph"
                onDayClick={setSelectedActivityDate}
              />
            </div>
            <div>
              <div className="p-4 bg-card rounded-md">
                <h3 className="text-lg font-semibold">Recent Submissions</h3>
                <p className="text-sm text-muted-foreground mt-1">Latest accepted submissions</p>

                {recentSubmissionsError ? (
                  <div className="mt-4 text-sm text-destructive">
                    {recentSubmissionsError}
                  </div>
                ) : recentSubmissions.length === 0 ? (
                  <div className="mt-4 text-sm text-muted-foreground">No recent submissions available.</div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {recentSubmissions.map((s: any) => (
                      <li key={s.id} className="flex items-center justify-between">
                        <div>
                          <a
                            href={`https://leetcode.com/problems/${s.titleSlug}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium hover:underline"
                          >
                            {s.title}
                          </a>
                          <div className="text-xs text-muted-foreground">
                            {s.lang} • {new Date(Number(s.timestamp) * 1000).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{s.statusDisplay || s.status}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={selectedActivityDate !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedActivityDate(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Accepted submissions
              {selectedActivityDate &&
                ` · ${new Date(`${selectedActivityDate}T00:00:00`).toLocaleDateString()}`}
            </DialogTitle>
            <DialogDescription>
              Accepted LeetCode submissions found for this day.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDaySubmissions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : daySubmissionsError ? (
            <p className="py-4 text-sm text-destructive">{daySubmissionsError}</p>
          ) : daySubmissions.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No accepted submissions for this day were found in LeetCode&apos;s recent submission data.
            </p>
          ) : (
            <ul className="max-h-80 space-y-3 overflow-y-auto">
              {daySubmissions.map((submission) => (
                <li
                  key={submission.id}
                  className="flex items-center justify-between gap-4 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <a
                      href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline"
                    >
                      {submission.title}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {submission.lang} ·{" "}
                      {new Date(Number(submission.timestamp) * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-green-600">
                    {submission.statusDisplay}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Leetcode;

function formatSubmissionCalendar(
  calendar: any
): { date: string; count: number }[] {
  if (!calendar) return [];

  try {
    const cal = typeof calendar === "string" ? JSON.parse(calendar) : calendar;
    if (!cal || typeof cal !== "object" || Array.isArray(cal)) return [];

    const countsByDate = new Map<string, number>();

    Object.entries(cal).forEach(([dateKey, rawCount]) => {
      const count = Number(rawCount);
      if (!Number.isFinite(count) || count <= 0) return;

      const timestamp = Number(dateKey);
      const date = /^\d{9,13}$/.test(dateKey)
        ? new Date(timestamp * (dateKey.length <= 10 ? 1000 : 1))
        : new Date(dateKey);

      if (Number.isNaN(date.getTime())) return;

      const isoDate = date.toISOString().slice(0, 10);
      countsByDate.set(isoDate, (countsByDate.get(isoDate) ?? 0) + count);
    });

    return Array.from(countsByDate, ([date, count]) => ({ date, count })).sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  } catch (err) {
    console.error("Failed to parse submission calendar", err);
    return [];
  }
}

function calculateCalendarStreaks(activity: { date: string; count: number }[]) {
  const activeDates = activity
    .filter((entry) => entry.count > 0)
    .map((entry) => entry.date)
    .sort();

  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < activeDates.length; index += 1) {
    const previous = new Date(`${activeDates[index - 1]}T00:00:00Z`);
    const current = new Date(`${activeDates[index]}T00:00:00Z`);
    const isConsecutive =
      current.getTime() - previous.getTime() === 24 * 60 * 60 * 1000;

    runningStreak = isConsecutive ? runningStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  today.setUTCDate(today.getUTCDate() - 1);
  const yesterdayKey = today.toISOString().slice(0, 10);
  const latestActiveDate = activeDates[activeDates.length - 1];

  if (latestActiveDate !== todayKey && latestActiveDate !== yesterdayKey) {
    return { currentStreak: 0, longestStreak };
  }

  let currentStreak = 1;
  for (let index = activeDates.length - 1; index > 0; index -= 1) {
    const current = new Date(`${activeDates[index]}T00:00:00Z`);
    const previous = new Date(`${activeDates[index - 1]}T00:00:00Z`);
    if (current.getTime() - previous.getTime() !== 24 * 60 * 60 * 1000) {
      break;
    }
    currentStreak += 1;
  }

  return { currentStreak, longestStreak };
}

function TestConnectionButton({ username }: { username: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await leetcodeApi.testConnection(username);
      if (res.success) {
        toast({ title: "Connection OK", description: res.message || "LeetCode connection successful" });
      } else {
        toast({ title: "Connection failed", description: res.message || res.error || "Failed to connect" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleTest} disabled={loading} variant="outline">
      {loading ? "Testing..." : "Test Connection"}
    </Button>
  );
}
