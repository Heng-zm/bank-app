
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  runTransaction,
  serverTimestamp,
  getDoc,
  setDoc,
  Timestamp,
  where,
  collectionGroup,
  addDoc
} from "firebase/firestore";
import type { Account, Transaction, TransactionFormData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const initialAccount: Account = {
  id: "acc_12345",
  holderName: "Alex Johnson",
  balance: 5432.1,
};

export function useAccount(userId?: string) {
  const { toast } = useToast();
  const [account, setAccount] = useState<Account>(initialAccount);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    if (!userId || !db) {
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);

    const accountRef = doc(db, "accounts", userId);

    const unsubscribeAccount = onSnapshot(accountRef, async (docSnap) => {
      if (docSnap.exists()) {
        setAccount(docSnap.data() as Account);
      } else {
        // If account doesn't exist, create it
        const user = auth?.currentUser;
        const newAccount: Account = {
            id: userId,
            holderName: user?.email || "New User",
            balance: 5432.1,
        };
        await setDoc(accountRef, newAccount);
        setAccount(newAccount);
      }
    }, (error) => {
        console.error("Error listening to account:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load account data."});
    });

    const transactionsQuery = query(
        collection(db, "transactions"), 
        where("accountId", "==", userId),
        orderBy("timestamp", "desc")
    );
    
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (querySnapshot) => {
        const txs: Transaction[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            txs.push({
                ...data,
                id: doc.id,
                timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
            } as Transaction);
        });
        setTransactions(txs);
        setIsLoading(false);
    }, (error) => {
        console.error("Error listening to transactions:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load transaction history."});
        setIsLoading(false);
    });

    return () => {
        unsubscribeAccount();
        unsubscribeTransactions();
    }
  }, [userId, db, toast]);


  const handleAddTransaction = async (data: TransactionFormData): Promise<void> => {
    if (!userId || !db) {
      toast({ variant: 'destructive', title: "Error", description: "Not connected to the database." });
      return;
    }

    setIsProcessing(true);
    
    try {
        await runTransaction(db, async (transaction) => {
            const accountRef = doc(db, "accounts", userId);
            const accountDoc = await transaction.get(accountRef);

            if (!accountDoc.exists()) {
                throw new Error("Account does not exist!");
            }

            const currentBalance = accountDoc.data().balance;
            const newBalance = currentBalance - data.amount;

            if (newBalance < 0) {
                throw new Error("Insufficient funds.");
            }
            
            // Update account balance
            transaction.update(accountRef, { balance: newBalance });

            // Create new transaction record
            const newTransactionRef = doc(collection(db, "transactions"));
            const isTransfer = !!data.recipient;
            const description = isTransfer 
              ? `Transfer to ${data.recipient}: ${data.description}` 
              : data.description;
              
            transaction.set(newTransactionRef, {
                accountId: userId,
                amount: data.amount,
                description: description,
                type: 'withdrawal',
                timestamp: serverTimestamp()
            });
        });

        toast({
            title: "Transaction Successful",
            description: "Your transaction has been processed.",
        });

    } catch (e: any) {
        console.error("Transaction failed: ", e);
        toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: e.message || "An unexpected error occurred.",
        });
        // Rethrow to satisfy Promise rejection for callers
        throw e;
    } finally {
        setIsProcessing(false);
    }
  };

  return {
    account,
    transactions,
    isProcessing,
    isLoading, // Expose loading state
    handleAddTransaction,
  };
}
