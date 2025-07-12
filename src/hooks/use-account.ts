
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
  getDocs,
  writeBatch,
  setDoc,
  Timestamp,
  where,
  addDoc,
  limit
} from "firebase/firestore";
import type { Account, Transaction, TransactionFormData, Notification } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const LOW_BALANCE_THRESHOLD = 100;

export function useAccount(userId?: string) {
  const { toast } = useToast();
  const [account, setAccount] = useState<Account>({ id: "", holderName: "Guest", balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
                timestamp: (data.timestamp as Timestamp)?.toDate().toISOString(),
            } as Transaction);
        });
        setTransactions(txs);
        setIsLoading(false);
    }, (error) => {
        console.error("Error listening to transactions:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load transaction history."});
        setIsLoading(false);
    });

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (querySnapshot) => {
      const notifs: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate().toISOString(),
        } as Notification);
      });
      setNotifications(notifs);
    }, (error) => {
      console.error("Error listening to notifications:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load notifications."});
    });


    return () => {
        unsubscribeAccount();
        unsubscribeTransactions();
        unsubscribeNotifications();
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
            const senderAccountRef = doc(db, "accounts", userId);
            const senderAccountDoc = await transaction.get(senderAccountRef);

            if (!senderAccountDoc.exists()) throw new Error("Your account does not exist!");
            
            const senderBalance = senderAccountDoc.data().balance;
            const newSenderBalance = senderBalance - data.amount;

            if (newSenderBalance < 0) throw new Error("Insufficient funds.");

            // Update sender's account
            transaction.update(senderAccountRef, { balance: newSenderBalance });

            // Create withdrawal transaction for sender
            const newTransactionRef = doc(collection(db, "transactions"));
            transaction.set(newTransactionRef, {
                accountId: userId,
                amount: data.amount,
                description: data.description,
                type: 'withdrawal',
                timestamp: serverTimestamp(),
                recipient: data.recipient || null,
            });

            // Handle recipient if it's a transfer
            if (data.recipient) {
                const recipientQuery = query(collection(db, "accounts"), where("holderName", "==", data.recipient), limit(1));
                const recipientSnapshot = await getDocs(recipientQuery);
                if (recipientSnapshot.empty) throw new Error(`Recipient ${data.recipient} not found.`);
                
                const recipientDoc = recipientSnapshot.docs[0];
                const recipientAccountRef = recipientDoc.ref;
                const recipientBalance = recipientDoc.data().balance;
                const newRecipientBalance = recipientBalance + data.amount;

                // Update recipient's balance
                transaction.update(recipientAccountRef, { balance: newRecipientBalance });

                // Create deposit transaction for recipient
                const recipientTransactionRef = doc(collection(db, "transactions"));
                transaction.set(recipientTransactionRef, {
                    accountId: recipientDoc.id,
                    amount: data.amount,
                    description: `Received from ${senderAccountDoc.data().holderName}`,
                    type: 'deposit',
                    timestamp: serverTimestamp(),
                    sender: senderAccountDoc.data().holderName
                });

                // Create notification for recipient
                const recipientNotificationRef = doc(collection(db, "notifications"));
                transaction.set(recipientNotificationRef, {
                    userId: recipientDoc.id,
                    message: `You received $${data.amount.toFixed(2)} from ${senderAccountDoc.data().holderName}.`,
                    type: 'deposit',
                    isRead: false,
                    timestamp: serverTimestamp(),
                });
            }

            // Create low balance notification for sender if needed
            if (newSenderBalance < LOW_BALANCE_THRESHOLD) {
                const senderNotificationRef = doc(collection(db, "notifications"));
                transaction.set(senderNotificationRef, {
                    userId: userId,
                    message: `Your account balance is low: $${newSenderBalance.toFixed(2)}.`,
                    type: 'alert',
                    isRead: false,
                    timestamp: serverTimestamp(),
                });
            }
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
        throw e;
    } finally {
        setIsProcessing(false);
    }
  };

  const markNotificationsAsRead = useCallback(async () => {
    if (!userId || !db) return;
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    const batch = writeBatch(db);
    unreadNotifications.forEach(n => {
      const notifRef = doc(db, "notifications", n.id);
      batch.update(notifRef, { isRead: true });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, [userId, db, notifications]);

  return {
    account,
    transactions,
    notifications,
    isProcessing,
    isLoading,
    handleAddTransaction,
    markNotificationsAsRead
  };
}
