import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Loader2, Target, Users } from "lucide-react";
import { isAxiosError } from "axios";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { challengeApi } from "@/lib/api";

interface InviteChallengeDetails {
  id: string;
  name: string;
  description: string | null;
  owner: { username: string };
  minSubmissionsPerDay: number;
  status: string;
  startDate: string;
  endDate: string;
  isMember: boolean;
  joinRequestStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
}

const InviteChallenge = () => {
  const { inviteCode } = useParams();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<InviteChallengeDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!inviteCode) return;
    let active = true;
    setIsLoading(true);
    setErrorMessage("");

    challengeApi
      .getInviteDetails(inviteCode)
      .then((response) => {
        if (!active) return;
        if (!response.success || !response.data) {
          throw new Error(response.message || "Invitation could not be loaded.");
        }
        setChallenge(response.data);
      })
      .catch((error) => {
        if (!active) return;
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "This invitation could not be loaded."
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [inviteCode]);

  const handleRequestToJoin = async () => {
    if (!inviteCode) return;
    setIsRequesting(true);
    try {
      const response = await challengeApi.requestToJoinByInvite(inviteCode);
      if (!response.success) {
        throw new Error(response.message || "Could not submit your request.");
      }
      setChallenge((current) =>
        current ? { ...current, joinRequestStatus: "PENDING" } : current
      );
      toast({
        title: "Join request sent",
        description: "The challenge owner will review your request.",
      });
    } catch (error: unknown) {
      toast({
        title: "Could not request to join",
        description: getRequestErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl py-10">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : errorMessage ? (
          <Card>
            <CardHeader>
              <CardTitle>Invitation unavailable</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/">Back to dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : challenge ? (
          <Card>
            <CardHeader>
              <CardDescription>
                You have been invited to join
              </CardDescription>
              <CardTitle className="text-2xl">{challenge.name}</CardTitle>
              <CardDescription>
                Hosted by {challenge.owner?.username}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {challenge.description && (
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
              )}
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>
                    {challenge.minSubmissionsPerDay} problem
                    {challenge.minSubmissionsPerDay === 1 ? "" : "s"} per day
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{challenge.status} challenge</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>
                    {new Date(challenge.startDate).toLocaleDateString()} –{" "}
                    {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {challenge.isMember ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-green-600">
                    You are already a member of this challenge.
                  </p>
                  <Button asChild>
                    <Link to={`/challenge/${challenge.id}`}>
                      Open challenge
                    </Link>
                  </Button>
                </div>
              ) : challenge.joinRequestStatus === "PENDING" ? (
                <p className="rounded-md bg-muted p-3 text-sm">
                  Your request is pending owner approval.
                </p>
              ) : (
                <Button
                  onClick={handleRequestToJoin}
                  disabled={isRequesting}
                >
                  {isRequesting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {challenge.joinRequestStatus === "REJECTED"
                    ? "Request to join again"
                    : "Request to join"}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </Layout>
  );
};

export default InviteChallenge;

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
