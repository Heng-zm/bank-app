
"use client";

import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { TransactionForm } from "@/components/transaction-form";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft } from "lucide-react";


export default function TransferPage() {
    const { user } = useAuth();
    const { handleAddTransaction, isProcessing } = useAccount(user?.uid);
    const { t } = useTranslation();

    return (
        <div className="grid place-items-center h-full">
             <div className="w-full max-w-md">
                <TransactionForm onSubmit={handleAddTransaction} isProcessing={isProcessing} />
             </div>
        </div>
    )
}
