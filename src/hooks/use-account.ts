
"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Account, Transaction, TransactionFormData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { flagFraudulentTransactions } from "@/ai/flows/flag-fraudulent-transactions";

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

export function useAccount() {
  const { toast } = useToast();
  const [account, setAccount] = useLocalStorage<Account>("finsim-account", initialAccount);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("finsim-transactions", initialTransactions);
  const [fraudExplanation, setFraudExplanation] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  return {
    account,
    transactions,
    fraudExplanation,
    isProcessing,
    handleAddTransaction,
  };
}
