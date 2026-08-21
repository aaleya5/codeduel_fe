import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Key,
  User,
  Bell,
  Shield,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { leetcodeApi, authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<any>(null);

  // LeetCode Session State
  const [leetcodeSession, setLeetcodeSession] = useState({
    cookie: "",
    csrfToken: "",
    expiresAt: "",
  });

  // Profile State
  const [leetcodeUsername, setLeetcodeUsername] = useState(
    user?.leetcodeUsername || ""
  );

  useEffect(() => {
    checkSessionStatus();
  }, []);

  const checkSessionStatus = async () => {
    try {
      const response = await leetcodeApi.getSessionStatus();
      if (response.success) {
        setSessionStatus(response.data);
      }
    } catch (error) {
      console.error("Failed to check session status:", error);
    }
  };

  const handleSaveLeetCodeSession = async () => {
    setIsLoading(true);
    try {
      const response = await leetcodeApi.storeSession(
        leetcodeSession.cookie,
        leetcodeSession.csrfToken,
        leetcodeSession.expiresAt
      );

      if (response.success) {
        toast({
          title: "LeetCode Session Saved",
          description: "Your LeetCode session has been stored successfully.",
        });
        setLeetcodeSession({ cookie: "", csrfToken: "", expiresAt: "" });
        checkSessionStatus();
      }
    } catch (error: any) {
      toast({
        title: "Failed to save session",
        description:
          error.response?.data?.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvalidateSession = async () => {
    setIsLoading(true);
    try {
      const response = await leetcodeApi.invalidateSession();
      if (response.success) {
        toast({
          title: "Session Invalidated",
          description: "Your LeetCode session has been removed.",
        });
        setSessionStatus(null);
      }
    } catch (error: any) {
      toast({
        title: "Failed to invalidate session",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.updateProfile({ leetcodeUsername });
      if (response.success) {
        toast({
          title: "Profile Updated",
          description: "Your LeetCode username has been updated.",
        });
        if (updateUser) {
          updateUser({ ...user!, leetcodeUsername });
        }
      }
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and LeetCode integration settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="leetcode">LeetCode</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your LeetCode username to track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.name || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leetcode-username">LeetCode Username</Label>
                  <Input
                    id="leetcode-username"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    placeholder="Enter your LeetCode username"
                  />
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading || !leetcodeUsername}
                  className="w-full"
                >
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leetcode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  LeetCode Session
                </CardTitle>
                <CardDescription>
                  Configure your LeetCode session for automatic tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionStatus && sessionStatus.isValid ? (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          Session Active
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Expires:{" "}
                          {new Date(
                            sessionStatus.expiresAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleInvalidateSession}
                        disabled={isLoading}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">
                      No Active Session
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add your LeetCode session to enable automatic tracking
                    </p>
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cookie">LEETCODE_SESSION Cookie</Label>
                    <Input
                      id="cookie"
                      type="password"
                      value={leetcodeSession.cookie}
                      onChange={(e) =>
                        setLeetcodeSession({
                          ...leetcodeSession,
                          cookie: e.target.value,
                        })
                      }
                      placeholder="Enter your LEETCODE_SESSION cookie"
                    />
                    <p className="text-xs text-muted-foreground">
                      Found in browser DevTools → Application → Cookies
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="csrf">CSRF Token</Label>
                    <Input
                      id="csrf"
                      type="password"
                      value={leetcodeSession.csrfToken}
                      onChange={(e) =>
                        setLeetcodeSession({
                          ...leetcodeSession,
                          csrfToken: e.target.value,
                        })
                      }
                      placeholder="Enter your csrftoken"
                    />
                    <p className="text-xs text-muted-foreground">
                      Found in the same location as the session cookie
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires">Expiry Date</Label>
                    <Input
                      id="expires"
                      type="date"
                      value={leetcodeSession.expiresAt}
                      onChange={(e) =>
                        setLeetcodeSession({
                          ...leetcodeSession,
                          expiresAt: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Cookie expiration date (usually 1 year from creation)
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveLeetCodeSession}
                    disabled={
                      isLoading ||
                      !leetcodeSession.cookie ||
                      !leetcodeSession.csrfToken ||
                      !leetcodeSession.expiresAt
                    }
                    className="w-full gradient-primary"
                  >
                    Save LeetCode Session
                  </Button>
                </div>

                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 mt-4">
                  <p className="font-medium text-blue-600 dark:text-blue-400 text-sm">
                    How to get your LeetCode session:
                  </p>
                  <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                    <li>Login to LeetCode in your browser</li>
                    <li>Open Developer Tools (F12)</li>
                    <li>Go to Application → Cookies → https://leetcode.com</li>
                    <li>Copy the values for LEETCODE_SESSION and csrftoken</li>
                    <li>Paste them here and set an expiry date</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
