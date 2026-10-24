import React, { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { challengeApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Dispute {
  id: string;
  amount: number;
  reason: string;
  date: string;
  disputeReason: string;
  member: { user: { username: string } };
}

interface DisputesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  onResolved?: () => void;
}

const DisputesPanel: React.FC<DisputesPanelProps> = ({
  open,
  onOpenChange,
  challengeId,
  onResolved,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) loadDisputes();
  }, [open]);

  const loadDisputes = async () => {
    setIsLoading(true);
    try {
      const response = await challengeApi.getDisputes(challengeId);
      if (response.success && response.data) {
        setDisputes(response.data);
      }
    } catch (error) {
      console.error("Failed to load disputes:", error);
      toast({
        title: "Failed to load disputes",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (penaltyId: string, action: "UPHOLD" | "WAIVE") => {
    setResolvingId(penaltyId);
    try {
      const response = await challengeApi.resolveDispute(
        challengeId,
        penaltyId,
        action,
        notes[penaltyId]
      );
      if (response.success) {
        toast({
          title: action === "WAIVE" ? "Penalty waived" : "Penalty upheld",
          description:
            action === "WAIVE"
              ? "The penalty was offset and the member notified."
              : "The member has been notified.",
        });
        setDisputes((prev) => prev.filter((d) => d.id !== penaltyId));
        onResolved?.();
      } else {
        throw new Error(response.message || "Failed to resolve dispute");
      }
    } catch (error: any) {
      toast({
        title: "Failed to resolve dispute",
        description: error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pending Disputes
          </DialogTitle>
          <DialogDescription>
            Review and resolve penalties your members have flagged as wrong.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : disputes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending disputes</p>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-3 pr-3">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dispute.member.user.username}</span>
                    <span className="text-destructive">+{dispute.amount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Original reason: {dispute.reason} ({new Date(dispute.date).toLocaleDateString()})
                  </p>
                  <p className="text-sm italic">"{dispute.disputeReason}"</p>
                  <Textarea
                    placeholder="Optional note explaining your decision"
                    className="text-sm"
                    value={notes[dispute.id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [dispute.id]: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleResolve(dispute.id, "WAIVE")}
                      disabled={resolvingId === dispute.id}
                    >
                      {resolvingId === dispute.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Waive Penalty
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handleResolve(dispute.id, "UPHOLD")}
                      disabled={resolvingId === dispute.id}
                    >
                      <X className="h-3 w-3" />
                      Uphold Penalty
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DisputesPanel;
