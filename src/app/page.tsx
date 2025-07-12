"use client";

import { useState, useEffect } from "react";
import { Landmark, AlertTriangle } from "lucide-react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Account, Transaction, TransactionFormData } from "@/lib/types";
import { flagFraudulentTransactions } from "@/ai/flows/flag-fraudulent-transactions";
import { useToast } from "@/hooks/use-toast";

import { AccountCard } from "@/components/account-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionHistory } from "@/components/transaction-history";
import { FraudAlert } from "@/components/fraud-alert";
import { Skeleton } from "@/components/ui/skeleton";

const initialAccount: Account = {
  id: "acc_12345",
  holderName: "Alex Johnson",
  balance: 5432.1,
};

const initialTransactions: Transaction[] = [
  {
    id: 'txn_1',
    accountId: 'acc_12345',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    amount: 1200.00,
    description: 'Paycheck Deposit',
    type: 'deposit',
  },
  {
    id: 'txn_2',
    accountId: 'acc_12345',
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    amount: 75.50,
    description: 'Grocery Store',
    type: 'withdrawal',
  },
  {
    id: 'txn_3',
    accountId: 'acc_12345',
    timestamp: new Date().toISOString(),
    amount: 25.00,
    description: 'Coffee Shop',
    type: 'withdrawal',
  },
];


export default function Home() {
  const { toast } = useToast();
  const [account, setAccount] = useLocalStorage<Account>("finsim-account", initialAccount);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("finsim-transactions", initialTransactions);
  const [fraudExplanation, setFraudExplanation] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddTransaction = async (data: TransactionFormData) => {
    setIsProcessing(true);
    setFraudExplanation(null);

    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      accountId: account.id,
      timestamp: new Date().toISOString(),
      amount: data.amount,
      description: data.description,
      type: "withdrawal",
      isFraudulent: false,
    };
    
    const updatedBalance = account.balance - newTransaction.amount;
    
    if (updatedBalance < 0) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "Insufficient funds.",
      });
      setIsProcessing(false);
      return;
    }
    
    setAccount({ ...account, balance: updatedBalance });
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);

    try {
      const aiInput = {
        transactions: updatedTransactions.map(t => ({
          transactionId: t.id,
          accountId: t.accountId,
          timestamp: t.timestamp,
          amount: t.amount,
          description: t.description,
        })),
      };

      const result = await flagFraudulentTransactions(aiInput);

      if (result.flaggedTransactions.length > 0) {
        setFraudExplanation(result.explanation);
        setTransactions(prev =>
          prev.map(t =>
            result.flaggedTransactions.includes(t.id)
              ? { ...t, isFraudulent: true }
              : t
          )
        );
        toast({
            variant: "destructive",
            title: "Fraud Alert!",
            description: "Potentially fraudulent activity detected on your account.",
        });
      } else {
        toast({
            title: "Transaction Successful",
            description: "Your transaction has been processed.",
        });
      }
    } catch (error) {
      console.error("Error calling fraud detection AI:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not analyze transaction for fraud.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
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
          {fraudExplanation && <FraudAlert explanation={fraudExplanation} />}
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </main>
  );
}
