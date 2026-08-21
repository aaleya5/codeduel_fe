import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, leetcodeApi } from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

const Leetcode = () => {
  const { user } = useAuth();
  const [leetcodeProfile, setLeetcodeProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
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
        // Also fetch recent submissions (use test endpoint which returns a small sample)
        try {
          const testResp = await leetcodeApi.testConnection(user.leetcodeUsername);
          console.log("Test response for recent submissions:", testResp);
          if (testResp.success && testResp.data && testResp.data.submissions) {
            setRecentSubmissions(testResp.data.submissions);
          }
        } catch (err) {
          console.debug("Failed to fetch recent submissions", err);
        }
      }
    } catch (err) {
      console.error("Failed to load Leetcode profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const profile = userProfile || user;
  useEffect(() => {
    console.log("Profile updated:", leetcodeProfile);
  }, [leetcodeProfile]);
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
                    Current streak: <span className="font-medium">{leetcodeProfile.streak}</span>
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
              <ActivityHeatmap data={formatSubmissionCalendar(leetcodeProfile.submissionCalendar)} title="Contribution Graph" />
            </div>
            <div>
              <div className="p-4 bg-card rounded-md">
                <h3 className="text-lg font-semibold">Recent Submissions</h3>
                <p className="text-sm text-muted-foreground mt-1">Latest accepted submissions (sample)</p>

                {recentSubmissions.length === 0 ? (
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
    </Layout>
  );
};

export default Leetcode;

function formatSubmissionCalendar(calendar: any) {
  if (!calendar) return [];

  // The backend returns an object mapping dateStr -> count (or nested structure)
  // Normalize to ActivityData[] expected by ActivityHeatmap
  try {
    // If calendar is a stringified JSON, try to parse
    const cal = typeof calendar === "string" ? JSON.parse(calendar) : calendar;

    const entries = Object.keys(cal).map((date) => ({ date, count: cal[date] || 0 }));
    // Sort by date ascending
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return entries;
  } catch (err) {
    console.error("Failed to parse submission calendar", err);
    return [];
  }
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
