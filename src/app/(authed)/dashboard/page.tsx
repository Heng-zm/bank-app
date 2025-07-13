
"use client";

import { useMemo, useState } from "react";
import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { TransactionHistory } from "@/components/transaction-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, User, QrCode, History, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';

import { useTranslation } from "@/hooks/use-translation";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { 
    account, 
    transactions, 
    isLoading: isAccountLoading,
  } = useAccount(user?.uid);
  
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(account?.balance || 0);

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

  if (isAuthLoading || isAccountLoading) {
    return (
       <div className="space-y-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-[125px] w-full" />
          <div className="dashboard-grid">
              <Skeleton className="h-[150px] w-full" />
              <Skeleton className="h-[150px] w-full" />
              <Skeleton className="h-[150px] w-full" />
              <Skeleton className="h-[150px] w-full" />
          </div>
          <Skeleton className="h-[300px] w-full" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold">{t('dashboard.greeting', { name: account.holderName.split(' ')[0] })}</h1>
            <p className="text-muted-foreground">{t('dashboard.welcomeMessage')}</p>
        </div>

        <Card className="bg-primary/90 text-primary-foreground shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardDescription className="text-primary-foreground/80">{t('account.checkingBalance')}</CardDescription>
                        <CardTitle className="text-4xl font-bold">{formattedBalance}</CardTitle>
                    </div>
                     <div className="text-right">
                        <div className="text-xs text-primary-foreground/80">{t('account.accountNumber')}</div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="font-mono text-sm font-semibold h-auto p-1 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20" 
                            onClick={handleCopyAccountNumber}
                        >
                            {formatAccountNumber(account.accountNumber)}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-primary-foreground/80">{t('account.availableBalance')}</div>
            </CardContent>
        </Card>

        <div className="dashboard-grid">
             <Link href="/transfer" className="dashboard-card-link">
                <Card className="bg-blue-500/10 border-blue-500/20 h-full">
                    <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                            {t('transfer.title')}
                            <ArrowRightLeft className="h-6 w-6 text-blue-500"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{t('transfer.description')}</p>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/my-qr" className="dashboard-card-link">
                <Card className="bg-purple-500/10 border-purple-500/20 h-full">
                    <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                            {t('dashboard.myQr.title')}
                            <User className="h-6 w-6 text-purple-500"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{t('dashboard.myQr.description')}</p>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/qr-pay" className="dashboard-card-link">
                <Card className="bg-green-500/10 border-green-500/20 h-full">
                    <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                            {t('dashboard.scanQr.title')}
                            <QrCode className="h-6 w-6 text-green-500"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{t('dashboard.scanQr.description')}</p>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/transactions" className="dashboard-card-link">
                <Card className="bg-orange-500/10 border-orange-500/20 h-full">
                    <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                            {t('dashboard.historyCard.title')}
                            <History className="h-6 w-6 text-orange-500"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{t('dashboard.historyCard.description')}</p>
                    </CardContent>
                </Card>
            </Link>
        </div>

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
