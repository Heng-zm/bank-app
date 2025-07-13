
"use client";

import type { Account } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(account.balance);

  const formatAccountNumber = (number: string) => {
    if (!number) return "";
    return number.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
  }
  
  const handleCopyAccountNumber = () => {
    if (!account.accountNumber) return;
    navigator.clipboard.writeText(account.accountNumber);
    toast({
      title: t('account.copied'),
      description: t('account.copiedDescription'),
    });
  };

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
                <div className="text-xs text-muted-foreground">{t('account.accountNumber')}</div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="font-mono text-sm font-semibold h-auto p-1" 
                    onClick={handleCopyAccountNumber}
                >
                    {formatAccountNumber(account.accountNumber)}
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">{t('account.availableBalance')}</div>
      </CardContent>
    </Card>
  );
}
