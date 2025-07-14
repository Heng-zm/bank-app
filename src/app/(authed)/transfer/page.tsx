
"use client";

import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { TransactionForm } from "@/components/transaction-form";
import { useTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountCard } from "@/components/account-card";
import { QuickPayWidget } from "@/components/quick-pay-widget";

export default function TransferPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const {
        account,
        frequentRecipients,
        handleAddTransaction,
        isProcessing,
        isLoading: isAccountLoading
    } = useAccount(user?.uid);
    const { t } = useTranslation();

    if (isAuthLoading || isAccountLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[125px] w-full" />
                <Skeleton className="h-[150px] w-full" />
                <Skeleton className="h-[250px] w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AccountCard account={account} />
            
            <QuickPayWidget 
                recipients={frequentRecipients}
                onPay={handleAddTransaction}
                isProcessing={isProcessing}
            />

            <TransactionForm 
                onSubmit={handleAddTransaction} 
                isProcessing={isProcessing} 
            />
        </div>
    )
}
