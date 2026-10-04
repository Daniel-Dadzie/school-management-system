"use client";

import { useState } from "react";
import PageShell from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatMoneyMinor } from "@/lib/format";
import { useFinanceWallet, useFundWallet } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wallet, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function FamilyWalletPage() {
  const { data, isLoading, refetch } = useFinanceWallet();
  const fundWallet = useFundWallet();
  
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"CARD" | "MOBILE_MONEY">("MOBILE_MONEY");
  const [isFunding, setIsFunding] = useState(false);

  if (isLoading) {
    return <PageShell title="Family Wallet" description="Manage your family wallet"><div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></PageShell>;
  }

  if (!data) return null;

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount", { description: "Please enter a valid amount." });
      return;
    }
    
    setIsFunding(true);
    try {
      await fundWallet.mutateAsync({ amountMinor: Math.round(amountNum * 100), method });
      toast.success("Wallet Funded", { description: "Successfully added funds and distributed to outstanding invoices." });
      setAmount("");
      refetch();
    } catch {
      toast.error("Wallet funding failed. Please try again.");
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <PageShell title="Family Wallet" description="Add funds to automatically pay off outstanding fees for all your children">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{formatMoneyMinor(data.wallet.balanceMinor)}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Funds are automatically distributed to the oldest outstanding invoices for your children.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Up Wallet</CardTitle>
              <CardDescription>Add funds via Mobile Money or Card</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFund} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (GHS)</label>
                  <Input type="number" step="0.01" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={method} onValueChange={(value) => {
                    if (value === "CARD" || value === "MOBILE_MONEY") setMethod(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                      <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isFunding || !amount}>
                  {isFunding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isFunding ? "Processing..." : "Fund Wallet"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet.</p>
            ) : (
              <div className="space-y-4">
                {data.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tx.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.type === 'DEPOSIT' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()} &middot; Ref: {tx.reference}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{formatMoneyMinor(tx.amountMinor)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
