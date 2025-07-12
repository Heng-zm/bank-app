
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
  limit,
  updateDoc
} from "firebase/firestore";
import { 
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from 'firebase/storage';
import type { Account, Transaction, TransactionFormData, Notification, NotificationPreferences } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const LOW_BALANCE_THRESHOLD = 100;

export function useAccount(userId?: string) {
  const { toast } = useToast();
  const [account, setAccount] = useState<Account>({ 
    id: "", 
    holderName: "Guest", 
    balance: 0,
    notificationPreferences: { deposits: true, alerts: true, info: true }
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    if (!userId || !db) {
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);

    const accountRef = doc(db, "accounts", userId);
    const unsubscribeAccount = onSnapshot(accountRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Account;
        // Ensure notificationPreferences has defaults
        if (!data.notificationPreferences) {
          data.notificationPreferences = { deposits: true, alerts: true, info: true };
        }
        setAccount(data);
      } else {
        const user = auth?.currentUser;
        const newAccount: Account = {
            id: userId,
            holderName: user?.email || "New User",
            balance: 5432.1,
            notificationPreferences: { deposits: true, alerts: true, info: true }
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


  const handleAddTransaction = async (data: TransactionFormData, onProgress?: (progress: number) => void): Promise<void> => {
    if (!userId || !db || !storage) {
      toast({ variant: 'destructive', title: "Error", description: "Not connected to the database." });
      return;
    }

    setIsProcessing(true);
    
    let receiptUrl: string | null = null;

    try {
        // Step 1: Upload receipt if it exists
        if (data.receiptFile) {
            const filePath = `receipts/${userId}/${Date.now()}_${data.receiptFile.name}`;
            const storageRef = ref(storage, filePath);
            const uploadTask = uploadBytesResumable(storageRef, data.receiptFile);

            await new Promise<void>((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress?.(progress);
                    },
                    (error) => {
                        console.error("Upload failed:", error);
                        reject(new Error("Receipt upload failed. Please try again."));
                    },
                    async () => {
                        receiptUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve();
                    }
                );
            });
        }
        
        // Step 2: Run the Firestore transaction
        await runTransaction(db, async (transaction) => {
            const senderAccountRef = doc(db, "accounts", userId);
            const senderAccountDoc = await transaction.get(senderAccountRef);

            if (!senderAccountDoc.exists()) throw new Error("Your account does not exist!");
            
            const senderData = senderAccountDoc.data() as Account;
            const senderBalance = senderData.balance;
            const newSenderBalance = senderBalance - data.amount;

            if (newSenderBalance < 0) throw new Error("Insufficient funds.");

            // Handle recipient if it's a transfer
            if (data.recipient) {
                if (data.recipient === senderData.holderName) {
                    throw new Error("You cannot send money to yourself.");
                }

                const recipientQuery = query(collection(db, "accounts"), where("holderName", "==", data.recipient), limit(1));
                const recipientSnapshot = await getDocs(recipientQuery);

                if (recipientSnapshot.empty) {
                    throw new Error(`Recipient with email ${data.recipient} not found.`);
                }
                
                const recipientDoc = recipientSnapshot.docs[0];
                const recipientData = recipientDoc.data() as Account;
                const recipientAccountRef = recipientDoc.ref;
                const recipientBalance = recipientData.balance;
                const newRecipientBalance = recipientBalance + data.amount;

                transaction.update(recipientAccountRef, { balance: newRecipientBalance });

                const recipientTransactionRef = doc(collection(db, "transactions"));
                transaction.set(recipientTransactionRef, {
                    accountId: recipientDoc.id,
                    amount: data.amount,
                    description: `Received from ${senderData.holderName}`,
                    type: 'deposit',
                    timestamp: serverTimestamp(),
                    sender: senderData.holderName
                });
                
                if (recipientData.notificationPreferences?.deposits) {
                    const recipientNotificationRef = doc(collection(db, "notifications"));
                    transaction.set(recipientNotificationRef, {
                        userId: recipientDoc.id,
                        message: `You received $${data.amount.toFixed(2)} from ${senderData.holderName}.`,
                        type: 'deposit',
                        isRead: false,
                        timestamp: serverTimestamp(),
                    });
                }
            }

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
                receiptUrl: receiptUrl,
            });


            if (newSenderBalance < LOW_BALANCE_THRESHOLD && senderData.notificationPreferences?.alerts) {
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

  const updateAccountDetails = async (details: Partial<Account>) => {
    if (!userId || !db) {
        throw new Error("User is not authenticated or database is not available.");
    }
    const accountRef = doc(db, "accounts", userId);
    await updateDoc(accountRef, details);
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
    markNotificationsAsRead,
    updateAccountDetails
  };
}
