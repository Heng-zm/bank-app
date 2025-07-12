
"use client";

import { useState, useEffect } from "react";
import { Landmark } from "lucide-react";

import { useAccount } from "@/hooks/use-account";
import { AccountCard } from "@/components/account-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionHistory } from "@/components/transaction-history";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { 
    account, 
    transactions, 
    isProcessing, 
    handleAddTransaction 
  } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-64" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
             <Skeleton className="h-40 w-full" />
             <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 font-body">
      <header className="mb-8 flex items-center gap-4">
        <Landmark className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">FinSim</h1>
          <p className="text-muted-foreground">Your Personal Banking Simulator</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AccountCard account={account} />
          <TransactionForm onSubmit={handleAddTransaction} isProcessing={isProcessing}/>
        </div>
        <div className="lg:col-span-2">
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </main>
  );
}
