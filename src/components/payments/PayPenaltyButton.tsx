import React, { useState } from "react";
import { IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentApi } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PayPenaltyButtonProps {
  memberId: string;
  outstanding: number;
  challengeName?: string;
  onSuccess?: () => void;
  size?: "default" | "sm";
}

/**
 * Renders nothing if there's no outstanding balance - callers don't need
 * to guard on `outstanding > 0` themselves.
 */
type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
};

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string };
  theme: { color: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => Promise<void>;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const PayPenaltyButton: React.FC<PayPenaltyButtonProps> = ({
  memberId,
  outstanding,
  challengeName,
  onSuccess,
  size = "default",
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  if (outstanding <= 0) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({
          title: "Couldn't load payment form",
          description: "Check your connection and try again.",
          variant: "destructive",
        });
        return;
      }

      const orderResponse = await paymentApi.createOrder(memberId, outstanding);
      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.message || "Failed to create payment order");
      }
      const { orderId, amount, currency, keyId } = orderResponse.data;

      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        throw new Error("Razorpay SDK failed to initialize.");
      }

      const razorpay = new RazorpayCtor({
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: "CodeDuel",
        description: challengeName ? `Penalty payment - ${challengeName}` : "Penalty payment",
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#6366f1" },
        handler: async (response) => {
          try {
            const verifyResponse = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyResponse.success) {
              toast({
                title: "Payment received",
                description: "Your payment was verified and credited to your balance.",
              });
              onSuccess?.();
            } else {
              throw new Error(verifyResponse.message || "Verification failed");
            }
          } catch (error: unknown) {
            const responseMessage =
              typeof error === "object" && error !== null && "response" in error
                ? (error as { response?: { data?: { message?: string } } }).response
                    ?.data?.message
                : undefined;
            const message =
              error instanceof Error ? error.message : "Please contact support.";
            toast({
              title: "Payment verification failed",
              description: responseMessage || message || "Please contact support.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      });

      razorpay.on("payment.failed", (response) => {
        toast({
          title: "Payment failed",
          description: response.error?.description || "The payment could not be completed.",
          variant: "destructive",
        });
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (error: unknown) {
      const responseMessage =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({
        title: "Couldn't start payment",
        description: responseMessage || message || "Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Button size={size} className="gap-2" onClick={handlePay} disabled={isProcessing}>
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <IndianRupee className="h-4 w-4" />
      )}
      Pay Rs. {outstanding} Now
    </Button>
  );
};

export default PayPenaltyButton;
