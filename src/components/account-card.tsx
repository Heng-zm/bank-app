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
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span>{account.holderName}</span>
        </CardTitle>
        <CardDescription>Account Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Wallet className="h-8 w-8 text-accent" />
        <div>
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-2xl font-bold">{formattedBalance}</p>
        </div>
      </CardContent>
    </Card>
  );
}
