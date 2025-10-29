import { useState } from "react";
import { VerificationForm } from "@/components/VerificationForm";
import { VerificationResults } from "@/components/VerificationResults";

interface VerificationData {
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

const Index = () => {
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
            Avante Business
            <span className="block bg-gradient-to-r from-primary via-primary to-destructive bg-clip-text text-transparent">
              Verifier
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify Pi Network wallet activity for registered businesses in real-time
          </p>
        </div>

        {/* Verification Form */}
        <div className="flex justify-center">
          <VerificationForm onVerificationComplete={setVerificationData} />
        </div>

        {/* Results */}
        {verificationData && (
          <div className="flex justify-center">
            <VerificationResults {...verificationData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
