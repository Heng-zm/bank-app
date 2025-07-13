
"use client";

import { useMemo, useState } from "react";
import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { TransactionHistory } from "@/components/transaction-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Megaphone, ArrowRightLeft, User, QrCode } from "lucide-react";
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

  const handleAnnounceFeature = async () => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        message: "New feature available! You can now categorize your spending.",
        type: 'info',
        isRead: false,
        timestamp: serverTimestamp(),
      });
      toast({ title: t('dashboard.admin.toastSuccessTitle'), description: t('dashboard.admin.toastSuccessDescription') });
    } catch (error) {
      console.error("Error announcing feature:", error);
      toast({ variant: "destructive", title: t('error'), description: t('dashboard.admin.toastErrorDescription')});
    }
  }

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
            <h1 className="text-2xl font-bold">Hi, {account.holderName.split(' ')[0]}</h1>
            <p className="text-muted-foreground">What do you want to do today?</p>
        </div>

        <Card className="bg-primary/90 text-primary-foreground shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardDescription className="text-primary-foreground/80">Checking Account Balance</CardDescription>
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
             <Link href="/transfer" className="hover:scale-[1.02] transition-transform duration-200">
                <Card className="bg-blue-500/10 border-blue-500/20 h-full">
                    <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                            {t('nav.transfer')}
                            <ArrowRightLeft className="h-6 w-6 text-blue-500"/>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{t('transfer.description')}</p>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/my-qr" className="hover:scale-[1.02] transition-transform duration-200">
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
             <Link href="/qr-pay" className="hover:scale-[1.02] transition-transform duration-200">
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
        </div>

        <TransactionHistory title={t('dashboard.history.title')} transactions={transactions.slice(0, 5)} />
      
        <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm space-y-2">
            <h3 className="font-semibold text-sm">{t('dashboard.admin.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('dashboard.admin.description')}</p>
            <Button onClick={handleAnnounceFeature} size="sm" className="w-full" variant="secondary">
            <Megaphone className="mr-2 h-4 w-4"/> {t('dashboard.admin.button')}
            </Button>
        </div>
    </div>
  );
}
