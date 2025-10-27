import { Card } from "@/components/ui/card";
import { CheckCircle, Wallet, Network } from "lucide-react";

interface VerificationResultsProps {
  totalTransactions: number;
  uniqueWallets: number;
  walletAddress: string;
}

export const VerificationResults = ({ 
  totalTransactions, 
  uniqueWallets, 
  walletAddress 
}: VerificationResultsProps) => {
  return (
    <Card className="w-full max-w-2xl p-8 bg-gradient-to-br from-card to-card/50 border-primary/30 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
          <CheckCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Verification Complete</h2>
          <p className="text-sm text-muted-foreground">Business wallet verified</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="p-4 rounded-lg bg-background/50 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
          <p className="text-sm font-mono text-foreground break-all">{walletAddress}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </div>
          <p className="text-4xl font-bold text-primary">{totalTransactions.toLocaleString()}</p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Unique Wallets</p>
          </div>
          <p className="text-4xl font-bold text-primary">{uniqueWallets.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
};
