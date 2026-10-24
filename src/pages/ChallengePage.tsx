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
  Pencil,
  UserMinus,
  ReceiptText,
  Copy,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import MembersList from "@/components/challenge/MembersList";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { cn } from "@/lib/utils";
import { challengeApi, dashboardApi, paymentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getSocket } from "@/lib/socket";
import PayPenaltyButton from "@/components/payments/PayPenaltyButton";
import DuelView from "@/components/challenge/DuelView";
import LedgerDialog from "@/components/challenge/LedgerDialog";
import DisputesPanel from "@/components/challenge/DisputesPanel";
import { AlertTriangle, Receipt, Check } from "lucide-react";
import { isAxiosError } from "axios";

interface JoinRequestEntry {
  id: string;
  user: {
    username: string;
    email: string;
  };
}

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
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isJoinRequestsOpen, setIsJoinRequestsOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequestEntry[]>([]);
  const [isLoadingJoinRequests, setIsLoadingJoinRequests] = useState(false);
  const [resolvingRequestId, setResolvingRequestId] = useState<string | null>(null);

  // Owner controls
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    minSubmissionsPerDay: "1",
    penaltyAmount: "0",
    endDate: "",
  });

  const [penaltyDialogMember, setPenaltyDialogMember] = useState<{
    memberId: string;
    username: string;
  } | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [isAdjustingPenalty, setIsAdjustingPenalty] = useState(false);

  const [removeDialogMember, setRemoveDialogMember] = useState<{
    memberId: string;
    username: string;
  } | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // Manual "mark as paid" (owner recording an offline payment)
  const [markPaidMember, setMarkPaidMember] = useState<{
    memberId: string;
    username: string;
    outstanding: number;
  } | null>(null);
  const [markPaidAmount, setMarkPaidAmount] = useState("");
  const [markPaidNote, setMarkPaidNote] = useState("");
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // Ledger / dispute UI
  const [ledgerFor, setLedgerFor] = useState<{ memberId: string; isOwn: boolean } | null>(null);
  const [disputesOpen, setDisputesOpen] = useState(false);
  const [hasPendingDisputes, setHasPendingDisputes] = useState(false);

  useEffect(() => {
    if (id) {
      loadChallengeData();
    }
  }, [id]);

  // Live updates: join this challenge's room so evaluation results, rule
  // edits, and member removals refresh the page instantly for anyone
  // looking at it, instead of only on manual reload.
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("challenge:join", id);

    const refetch = () => loadChallengeData();
    const refreshJoinRequests = () => {
      if (challenge?.ownerId === user?.id) {
        loadJoinRequests();
      }
    };
    socket.on("challenge:evaluated", refetch);
    socket.on("challenge:rules-updated", refetch);
    socket.on("challenge:member-removed", refetch);
    socket.on("challenge:member-joined", refetch);
    socket.on("challenge:join-requested", refreshJoinRequests);

    return () => {
      socket.emit("challenge:leave", id);
      socket.off("challenge:evaluated", refetch);
      socket.off("challenge:rules-updated", refetch);
      socket.off("challenge:member-removed", refetch);
      socket.off("challenge:member-joined", refetch);
      socket.off("challenge:join-requested", refreshJoinRequests);
    };
  }, [id, challenge?.ownerId, user?.id]);

  // Let the owner know at a glance if any disputes need attention.
  useEffect(() => {
    if (!id || !challenge || challenge.ownerId !== user?.id) return;

    const checkDisputes = async () => {
      try {
        const response = await challengeApi.getDisputes(id);
        if (response.success && response.data) {
          setHasPendingDisputes(response.data.length > 0);
        }
      } catch (error) {
        console.error("Failed to check disputes:", error);
      }
    };
    checkDisputes();

    const socket = getSocket();
    if (!socket) return;
    socket.on("challenge:dispute-raised", checkDisputes);
    return () => {
      socket.off("challenge:dispute-raised", checkDisputes);
    };
  }, [id, challenge?.ownerId, user?.id]);

  const loadChallengeData = async () => {
    setIsLoading(true);
    try {
      const challengeResponse = await challengeApi.getById(id!);
      const leaderboardResponse = await dashboardApi.getChallengeLeaderboard(
        id!
      );
      const chartResponse = await dashboardApi.getChallengeChart(id!);

      if (challengeResponse.success && challengeResponse.data) {
        setChallenge(challengeResponse.data);
      }

      if (leaderboardResponse.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data);
      }

      if (chartResponse.success && chartResponse.data) {
        setChartData(chartResponse.data);
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

  const loadJoinRequests = async () => {
    if (!id) return;
    setIsLoadingJoinRequests(true);
    try {
      const response = await challengeApi.getJoinRequests(id);
      if (response.success && response.data) {
        setJoinRequests(response.data);
      }
    } catch (error: unknown) {
      console.error("Failed to load join requests:", error);
      toast({
        title: "Failed to load join requests",
        description: getRequestErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoadingJoinRequests(false);
    }
  };

  const handleResolveJoinRequest = async (
    requestId: string,
    decision: "APPROVED" | "REJECTED"
  ) => {
    setResolvingRequestId(requestId);
    try {
      const response = await challengeApi.resolveJoinRequest(
        id!,
        requestId,
        decision
      );
      if (!response.success) {
        throw new Error(response.message || "Could not review this request.");
      }
      toast({
        title: decision === "APPROVED" ? "Request approved" : "Request declined",
        description:
          decision === "APPROVED"
            ? "The member has been added to the challenge."
            : "The join request was declined.",
      });
      setJoinRequests((requests) =>
        requests.filter((request) => request.id !== requestId)
      );
      loadChallengeData();
    } catch (error: unknown) {
      toast({
        title: "Could not review request",
        description: getRequestErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setResolvingRequestId(null);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!challenge?.inviteCode) return;
    const inviteUrl = `${window.location.origin}/invite/${challenge.inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Invite link copied",
        description: "Share it with people you want to invite.",
      });
    } catch (error) {
      console.error("Failed to copy challenge invite link:", error);
      toast({
        title: "Could not copy invite link",
        description: "Copy this link manually: " + inviteUrl,
        variant: "destructive",
      });
    }
  };

  const handleJoinChallenge = async () => {
    if (!id) return;

    setIsJoining(true);
    try {
      const response = await challengeApi.join(id);

      if (response.success) {
        toast({
          title: "Join request sent",
          description: "The challenge owner must approve your request.",
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

  const openEditDialog = () => {
    if (!challenge) return;
    setEditForm({
      name: challenge.name || "",
      description: challenge.description || "",
      minSubmissionsPerDay: String(challenge.minSubmissionsPerDay ?? 1),
      penaltyAmount: String(challenge.penaltyAmount ?? 0),
      endDate: challenge.endDate
        ? new Date(challenge.endDate).toISOString().slice(0, 10)
        : "",
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      const response = await challengeApi.updateRules(id!, {
        name: editForm.name,
        description: editForm.description,
        minSubmissionsPerDay: parseInt(editForm.minSubmissionsPerDay, 10),
        penaltyAmount: parseFloat(editForm.penaltyAmount),
        endDate: editForm.endDate
          ? new Date(editForm.endDate).toISOString()
          : undefined,
      });

      if (response.success) {
        toast({
          title: "Challenge updated",
          description: "The challenge rules have been saved.",
        });
        setIsEditOpen(false);
        loadChallengeData();
      } else {
        throw new Error(response.message || "Failed to update challenge");
      }
    } catch (error: any) {
      toast({
        title: "Failed to update challenge",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAdjustPenalty = async () => {
    if (!penaltyDialogMember) return;
    const amount = parseFloat(penaltyAmount);
    if (isNaN(amount) || amount === 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a non-zero number (negative to reduce).",
        variant: "destructive",
      });
      return;
    }
    if (!penaltyReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please explain why you're adjusting this penalty.",
        variant: "destructive",
      });
      return;
    }

    setIsAdjustingPenalty(true);
    try {
      const response = await challengeApi.adjustMemberPenalty(
        id!,
        penaltyDialogMember.memberId,
        amount,
        penaltyReason.trim()
      );

      if (response.success) {
        toast({
          title: "Penalty adjusted",
          description: `${penaltyDialogMember.username}'s balance was adjusted by ${amount}.`,
        });
        setPenaltyDialogMember(null);
        setPenaltyAmount("");
        setPenaltyReason("");
        loadChallengeData();
      } else {
        throw new Error(response.message || "Failed to adjust penalty");
      }
    } catch (error: any) {
      toast({
        title: "Failed to adjust penalty",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdjustingPenalty(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeDialogMember) return;
    setIsRemovingMember(true);
    try {
      const response = await challengeApi.removeMember(
        id!,
        removeDialogMember.memberId
      );

      if (response.success) {
        toast({
          title: "Member removed",
          description: `${removeDialogMember.username} was removed from the challenge.`,
        });
        setRemoveDialogMember(null);
        loadChallengeData();
      } else {
        throw new Error(response.message || "Failed to remove member");
      }
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!markPaidMember) return;
    const amount = parseFloat(markPaidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive amount.",
        variant: "destructive",
      });
      return;
    }

    setIsMarkingPaid(true);
    try {
      const response = await paymentApi.recordManualPayment(
        id!,
        markPaidMember.memberId,
        amount,
        markPaidNote.trim() || undefined
      );
      if (response.success) {
        toast({
          title: "Payment recorded",
          description: `${markPaidMember.username}'s balance was reduced by Rs. ${amount}.`,
        });
        setMarkPaidMember(null);
        setMarkPaidAmount("");
        setMarkPaidNote("");
        loadChallengeData();
      } else {
        throw new Error(response.message || "Failed to record payment");
      }
    } catch (error: any) {
      toast({
        title: "Failed to record payment",
        description:
          error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingPaid(false);
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
          <div className="flex flex-wrap gap-2">
            {challenge.ownerId === user?.id && (
              <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleCopyInviteLink}
              >
                <Copy className="h-4 w-4" />
                Copy Invite
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setIsJoinRequestsOpen(true);
                  loadJoinRequests();
                }}
              >
                <UserPlus className="h-4 w-4" />
                Join Requests
              </Button>
              </>
            )}
            {challenge.ownerId === user?.id && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 relative"
                onClick={() => setDisputesOpen(true)}
              >
                <AlertTriangle className="h-4 w-4" />
                Disputes
                {hasPendingDisputes && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive" />
                )}
              </Button>
            )}
            {(() => {
              const ownMember = leaderboard.find((m) => m.userId === user?.id);
              if (!ownMember?.memberId) return null;
              return (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setLedgerFor({ memberId: ownMember.memberId, isOwn: true })}
                >
                  <Receipt className="h-4 w-4" />
                  My Ledger
                </Button>
              );
            })()}
            {challenge.ownerId === user?.id && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={openEditDialog}
              >
                <Pencil className="h-4 w-4" />
                Edit Challenge
              </Button>
            )}
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
            {challenge.ownerId !== user?.id &&
              !challenge.members?.some(
                (member: { userId: string; isActive: boolean }) =>
                  member.userId === user?.id && member.isActive
              ) &&
              challenge.joinRequests?.[0]?.status !== "APPROVED" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleJoinChallenge}
                  disabled={
                    isJoining ||
                    challenge.joinRequests?.[0]?.status === "PENDING"
                  }
                >
                  {isJoining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  {challenge.joinRequests?.[0]?.status === "PENDING"
                    ? "Request Pending"
                    : "Request to Join"}
                </Button>
              )}
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
                    Rs. {challenge.penaltyAmount}
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
            <div className="space-y-4">
              <DuelView members={leaderboard} />

              <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenge Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((member, index) => (
                      <div
                        key={member.memberId || member.userId || index}
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
                              Penalties: Rs. {member.totalPenalties ?? member.totalPenalty ?? 0}
                              {(member.totalPaid ?? 0) > 0 &&
                                ` \u00b7 Paid: Rs. ${member.totalPaid}`}
                            </p>
                          </div>
                        </div>
                        {challenge.ownerId === user?.id &&
                          member.userId !== challenge.ownerId &&
                          member.memberId && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => setLedgerFor({ memberId: member.memberId, isOwn: false })}
                              >
                                <Receipt className="h-4 w-4" />
                                Ledger
                              </Button>
                              {Math.max(0, (member.totalPenalties ?? 0) - (member.totalPaid ?? 0)) > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() =>
                                    setMarkPaidMember({
                                      memberId: member.memberId,
                                      username: member.userName || member.username,
                                      outstanding: Math.max(
                                        0,
                                        (member.totalPenalties ?? 0) - (member.totalPaid ?? 0)
                                      ),
                                    })
                                  }
                                >
                                  <Check className="h-4 w-4" />
                                  Mark Paid
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() =>
                                  setPenaltyDialogMember({
                                    memberId: member.memberId,
                                    username: member.userName || member.username,
                                  })
                                }
                              >
                                <ReceiptText className="h-4 w-4" />
                                Adjust
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive"
                                onClick={() =>
                                  setRemoveDialogMember({
                                    memberId: member.memberId,
                                    username: member.userName || member.username,
                                  })
                                }
                              >
                                <UserMinus className="h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                          )}
                        {member.userId === user?.id && member.memberId && (
                          <PayPenaltyButton
                            size="sm"
                            memberId={member.memberId}
                            outstanding={Math.max(
                              0,
                              (member.totalPenalties ?? 0) - (member.totalPaid ?? 0)
                            )}
                            challengeName={challenge.name}
                            onSuccess={loadChallengeData}
                          />
                        )}
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
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressChart data={chartData} title="Team Progress" />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={isJoinRequestsOpen}
        onOpenChange={setIsJoinRequestsOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Requests</DialogTitle>
            <DialogDescription>
              Approve or decline people who want to join this challenge.
            </DialogDescription>
          </DialogHeader>
          {isLoadingJoinRequests ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : joinRequests.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No pending join requests.
            </p>
          ) : (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto">
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {request.user.username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {request.user.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleResolveJoinRequest(request.id, "APPROVED")
                      }
                      disabled={resolvingRequestId !== null}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleResolveJoinRequest(request.id, "REJECTED")
                      }
                      disabled={resolvingRequestId !== null}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Challenge Dialog (owner only) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>
              Update the challenge's rules. Changes apply immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-target">Daily Target</Label>
                <Input
                  id="edit-target"
                  type="number"
                  min={1}
                  value={editForm.minSubmissionsPerDay}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      minSubmissionsPerDay: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-penalty">Penalty Amount (Rs.)</Label>
                <Input
                  id="edit-penalty"
                  type="number"
                  min={0}
                  value={editForm.penaltyAmount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, penaltyAmount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end-date">End Date</Label>
              <Input
                id="edit-end-date"
                type="date"
                value={editForm.endDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, endDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
              {isSavingEdit ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Penalty Dialog (owner only) */}
      <Dialog
        open={!!penaltyDialogMember}
        onOpenChange={(open) => !open && setPenaltyDialogMember(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Penalty</DialogTitle>
            <DialogDescription>
              {penaltyDialogMember &&
                `Adjust ${penaltyDialogMember.username}'s penalty balance. Use a negative number to reduce it.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="penalty-amount">Amount</Label>
              <Input
                id="penalty-amount"
                type="number"
                placeholder="e.g. 5 or -5"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="penalty-reason">Reason</Label>
              <Textarea
                id="penalty-reason"
                placeholder="Why are you adjusting this penalty?"
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPenaltyDialogMember(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleAdjustPenalty} disabled={isAdjustingPenalty}>
              {isAdjustingPenalty ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply Adjustment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation (owner only) */}
      <AlertDialog
        open={!!removeDialogMember}
        onOpenChange={(open) => !open && setRemoveDialogMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeDialogMember &&
                `${removeDialogMember.username} will be removed from this challenge. Their history is kept, but they'll no longer be evaluated.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemovingMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemovingMember ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Paid Dialog (owner only, manual/offline payment) */}
      <Dialog
        open={!!markPaidMember}
        onOpenChange={(open) => !open && setMarkPaidMember(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>
              {markPaidMember &&
                `Record a payment from ${markPaidMember.username} received outside the app (cash, UPI, etc). Outstanding: Rs. ${markPaidMember.outstanding}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mark-paid-amount">Amount</Label>
              <Input
                id="mark-paid-amount"
                type="number"
                min={0}
                max={markPaidMember?.outstanding}
                placeholder="e.g. 10"
                value={markPaidAmount}
                onChange={(e) => setMarkPaidAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mark-paid-note">Note (optional)</Label>
              <Textarea
                id="mark-paid-note"
                placeholder="e.g. Paid via UPI on Sept 20"
                value={markPaidNote}
                onChange={(e) => setMarkPaidNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid} disabled={isMarkingPaid}>
              {isMarkingPaid ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Record Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {ledgerFor && (
        <LedgerDialog
          open={!!ledgerFor}
          onOpenChange={(open) => !open && setLedgerFor(null)}
          challengeId={id!}
          memberId={ledgerFor.memberId}
          isOwnLedger={ledgerFor.isOwn}
          onChanged={loadChallengeData}
        />
      )}

      {challenge && (
        <DisputesPanel
          open={disputesOpen}
          onOpenChange={setDisputesOpen}
          challengeId={id!}
          onResolved={() => {
            loadChallengeData();
            setHasPendingDisputes(false);
          }}
        />
      )}
    </Layout>
  );
};

export default ChallengePage;

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
