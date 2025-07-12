
"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Account, Transaction, TransactionFormData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

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

export function useAccount(userId?: string) {
  const { toast } = useToast();
  const storageKeyAccount = userId ? `finsim-account-${userId}` : 'finsim-account-guest';
  const storageKeyTransactions = userId ? `finsim-transactions-${userId}` : 'finsim-transactions-guest';

  const [account, setAccount] = useLocalStorage<Account>(storageKeyAccount, {
      ...initialAccount,
      id: userId || 'acc_guest'
  });
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(storageKeyTransactions, initialTransactions.map(tx => ({...tx, accountId: userId || 'acc_guest' })));
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (userId) {
        // This effect ensures that when a user logs in, their data is loaded.
        // It's a simple way to handle user-specific data with local storage.
        const userAccount = localStorage.getItem(`finsim-account-${userId}`);
        if (!userAccount) {
            setAccount({
                ...initialAccount,
                id: userId,
                holderName: "New User"
            });
        }
        const userTransactions = localStorage.getItem(`finsim-transactions-${userId}`);
        if (!userTransactions) {
            setTransactions(initialTransactions.map(tx => ({...tx, accountId: userId })));
        }
    }
  }, [userId, setAccount, setTransactions]);


  const handleAddTransaction = async (data: TransactionFormData) => {
    setIsProcessing(true);

    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      accountId: account.id,
      timestamp: new Date().toISOString(),
      amount: data.amount,
      description: data.description,
      type: "withdrawal",
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

    toast({
        title: "Transaction Successful",
        description: "Your transaction has been processed.",
    });

    setIsProcessing(false);
  };

  return {
    account,
    transactions,
    isProcessing,
    handleAddTransaction,
  };
}
