
"use client";

import { useMemo, useState } from "react";
import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { TransactionHistory } from "@/components/transaction-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { useTranslation } from "@/hooks/use-translation";
import { AccountCard } from "@/components/account-card";
import { QuickPayWidget } from "@/components/quick-pay-widget";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const { 
    account, 
    transactions, 
    frequentRecipients,
    isLoading: isAccountLoading,
    handleAddTransaction,
    isProcessing,
  } = useAccount(user?.uid);

  if (isAuthLoading || isAccountLoading) {
    return (
       <div className="space-y-6">
          <Skeleton className="h-[125px] w-full" />
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[300px] w-full" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold">{t('dashboard.greeting', { name: user?.email.split('@')[0] })}</h1>
            <p className="text-muted-foreground">{t('dashboard.welcomeMessage')}</p>
        </div>
        
        <AccountCard account={account} />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Link href="/transfer" className="action-card bg-blue-500/10">
                <h3 className="font-bold text-lg text-slate-800">{t('transfer.title')}</h3>
                <p className="text-sm text-slate-600">{t('transfer.description')}</p>
            </Link>
            <Link href="/my-qr" className="action-card bg-purple-500/10">
                <h3 className="font-bold text-lg text-slate-800">{t('dashboard.myQr.title')}</h3>
                <p className="text-sm text-slate-600">{t('dashboard.myQr.description')}</p>
            </Link>
            <Link href="/qr-pay" className="action-card bg-green-500/10">
                 <h3 className="font-bold text-lg text-slate-800">{t('dashboard.scanQr.title')}</h3>
                <p className="text-sm text-slate-600">{t('dashboard.scanQr.description')}</p>
            </Link>
            <Link href="/transactions" className="action-card bg-orange-500/10">
                <h3 className="font-bold text-lg text-slate-800">{t('dashboard.historyCard.title')}</h3>
                <p className="text-sm text-slate-600">{t('dashboard.historyCard.description')}</p>
            </Link>
        </div>

        <QuickPayWidget 
            recipients={frequentRecipients} 
            onPay={handleAddTransaction} 
            isProcessing={isProcessing} 
        />

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle>{t('dashboard.history.title')}</CardTitle>
                    <CardDescription>{t('transactions.recentDescription', { count: 5 })}</CardDescription>
                </div>
                 <Button asChild variant="outline" size="sm">
                    <Link href="/transactions">
                        {t('dashboard.history.viewAll')} <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <TransactionHistory transactions={transactions.slice(0, 5)} />
            </CardContent>
        </Card>
    </div>
  );
}
