import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Receipt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { paymentApi, challengeApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface LedgerEvent {
  type: "PENALTY" | "PAYMENT";
  id: string;
  amount: number;
  date: string;
  runningBalance: number;
  reason?: string;
  disputed?: boolean;
  disputeStatus?: string;
  disputeReason?: string;
  resolutionNote?: string;
  method?: string;
  note?: string;
}

interface LedgerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  memberId: string;
  /** Only the member this ledger belongs to can dispute a penalty in it. */
  isOwnLedger: boolean;
  onChanged?: () => void;
}

const statusBadge = (status?: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">Dispute pending</Badge>;
    case "RESOLVED_WAIVED":
      return <Badge className="bg-green-600 hover:bg-green-600">Waived</Badge>;
    case "RESOLVED_UPHELD":
      return <Badge variant="secondary">Upheld</Badge>;
    default:
      return null;
  }
};

const LedgerDialog: React.FC<LedgerDialogProps> = ({
  open,
  onOpenChange,
  challengeId,
  memberId,
  isOwnLedger,
  onChanged,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [ledger, setLedger] = useState<{
    challengeName: string;
    totalPenalties: number;
    totalPaid: number;
    outstanding: number;
    events: LedgerEvent[];
  } | null>(null);
  const [disputingId, setDisputingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  useEffect(() => {
    if (open) loadLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, memberId]);

  const loadLedger = async () => {
    setIsLoading(true);
    try {
      const response = await paymentApi.getFullLedger(memberId);
      if (response.success && response.data) {
        setLedger(response.data);
      }
    } catch (error) {
      console.error("Failed to load ledger:", error);
      toast({
        title: "Failed to load ledger",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDispute = async () => {
    if (!disputingId) return;
    if (!disputeReason.trim()) {
      toast({
        title: "Reason required",
        description: "Explain why you think this penalty is wrong.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingDispute(true);
    try {
      const response = await challengeApi.disputePenalty(
        challengeId,
        disputingId,
        disputeReason.trim()
      );
      if (response.success) {
        toast({ title: "Dispute submitted", description: "The challenge owner will review it." });
        setDisputingId(null);
        setDisputeReason("");
        loadLedger();
        onChanged?.();
      } else {
        throw new Error(response.message || "Failed to submit dispute");
      }
    } catch (error: any) {
      toast({
        title: "Failed to submit dispute",
        description: error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Penalty & Payment History
          </DialogTitle>
          <DialogDescription>
            {ledger
              ? `${ledger.challengeName} · Outstanding: Rs. ${ledger.outstanding}`
              : "Review penalties and payments for this challenge member."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !ledger || ledger.events.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No activity yet</p>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-2 pr-3">
              {ledger.events.map((event) => (
                <div key={event.id} className="rounded-lg border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {event.type === "PENALTY" ? event.reason : `Payment (${event.method})`}
                    </span>
                    <span className={event.amount >= 0 ? "text-destructive" : "text-green-600"}>
                      {event.amount >= 0 ? "+" : ""}
                      {event.amount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>Balance: Rs. {event.runningBalance}</span>
                  </div>

                  {event.type === "PENALTY" && event.disputeStatus !== "NONE" && (
                    <div className="pt-1 flex items-center gap-2">
                      {statusBadge(event.disputeStatus)}
                      {event.disputeReason && (
                        <span className="text-xs text-muted-foreground truncate">
                          "{event.disputeReason}"
                        </span>
                      )}
                    </div>
                  )}

                  {event.type === "PENALTY" &&
                    isOwnLedger &&
                    (!event.disputeStatus || event.disputeStatus === "NONE") && (
                      <div className="pt-1">
                        {disputingId === event.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Why do you think this penalty is wrong?"
                              value={disputeReason}
                              onChange={(e) => setDisputeReason(e.target.value)}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSubmitDispute}
                                disabled={isSubmittingDispute}
                              >
                                {isSubmittingDispute ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Submit Dispute"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setDisputingId(null);
                                  setDisputeReason("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1 text-xs"
                            onClick={() => setDisputingId(event.id)}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Dispute this
                          </Button>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LedgerDialog;
