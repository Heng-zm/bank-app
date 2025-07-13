
"use client";

import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { TransactionHistory } from "@/components/transaction-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { History } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function TransactionsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { transactions, isLoading: isAccountLoading } = useAccount(user?.uid);
    const { t } = useTranslation();

    if (isAuthLoading || isAccountLoading) {
        return <Skeleton className="w-full h-[70vh]" />
    }

    return (
        <Card>
            <TransactionHistory 
                transactions={transactions} 
                title={t('transactions.title')}
                description={t('transactions.description')}
                showFilters={true}
            />
        </Card>
    )
}
