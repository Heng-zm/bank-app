
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

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{account.holderName}</span>
        </CardDescription>
        <CardTitle className="text-4xl">{formattedBalance}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">Available Balance</div>
      </CardContent>
    </Card>
  );
}
