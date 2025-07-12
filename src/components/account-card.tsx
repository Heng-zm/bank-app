
"use client";

import type { Account } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Wallet } from "lucide-react";

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(account.balance);

  const formatAccountNumber = (number: string) => {
    if (!number) return "";
    return number.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
  }

  return (
    <Card className="shadow-lg animate-fade-in-up">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <div className="grid gap-1">
                <CardDescription className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{account.holderName}</span>
                </CardDescription>
                <CardTitle className="text-4xl font-bold">{formattedBalance}</CardTitle>
            </div>
            <div className="text-right">
                <div className="text-xs text-muted-foreground">Account Number</div>
                <div className="font-mono text-sm font-semibold">{formatAccountNumber(account.accountNumber)}</div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">Available Balance</div>
      </CardContent>
    </Card>
  );
}
