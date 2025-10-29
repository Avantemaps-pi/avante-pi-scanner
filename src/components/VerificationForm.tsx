import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VerificationResult {
  verificationId: string;
  walletAddress: string;
  businessName: string;
  totalTransactions: number;
  uniqueWallets: number;
  meetsRequirements: boolean;
  failureReason: string | null;
  verificationStatus: string;
  verifiedAt: string;
}

interface VerificationFormProps {
  onVerificationComplete: (result: VerificationResult | null) => void;
}

export const VerificationForm = ({ onVerificationComplete }: VerificationFormProps) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!walletAddress.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    setIsVerifying(true);
    onVerificationComplete(null);

    try {
      // For demo purposes, use a test external user ID
      const testExternalUserId = `demo_user_${Date.now()}`;
      
      const { data, error } = await supabase.functions.invoke('verify-business', {
        body: { 
          walletAddress: walletAddress.trim(),
          businessName: businessName.trim(),
          externalUserId: testExternalUserId
        }
      });

      if (error) throw error;

      if (data.success && data.data) {
        if (data.data.meetsRequirements) {
          toast.success("Business verified successfully - Approved");
        } else {
          toast.error(`Verification failed: ${data.data.failureReason}`);
        }
        onVerificationComplete(data.data);
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error("Failed to verify business. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl p-8 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Verify Business</h2>
          <p className="text-sm text-muted-foreground">Enter Pi Network wallet address</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="businessName" className="text-sm font-medium text-foreground">
            Business Name
          </label>
          <Input
            id="businessName"
            type="text"
            placeholder="Acme Corporation"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
            disabled={isVerifying}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="wallet" className="text-sm font-medium text-foreground">
            Pi Wallet Address
          </label>
          <Input
            id="wallet"
            type="text"
            placeholder="GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
            disabled={isVerifying}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Business"
          )}
        </Button>
      </div>
    </Card>
  );
};
