
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import type { Account, Transaction, TransactionFormData, Notification, FrequentRecipient } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

const LOW_BALANCE_THRESHOLD = 100;

export async function generateUniqueAccountNumber(db: any): Promise<string> {
    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
        accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
        const q = query(collection(db, "accounts"), where("accountNumber", "==", accountNumber));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            isUnique = true;
        }
    }
    return accountNumber!;
}

export function useAccount(userId?: string) {
  const { toast } = useToast();
  const [account, setAccount] = useState<Account>({ 
    id: "", 
    holderName: "Guest", 
    accountNumber: "000000000",
    balance: 0,
    notificationPreferences: { deposits: true, alerts: true, info: true }
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [frequentRecipients, setFrequentRecipients] = useState<FrequentRecipient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const notificationsRef = useRef<Notification[]>([]);
  const isInitialLoad = useRef(true);


  const db = getFirestore();

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

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
        if (!data.accountNumber) {
            const newAccountNumber = await generateUniqueAccountNumber(db);
            await updateDoc(accountRef, { accountNumber: newAccountNumber });
            data.accountNumber = newAccountNumber;
        }
        setAccount(data);
      } else {
        // Fallback: If account doesn't exist (e.g., failed during signup), create one.
        // This is now a secondary measure, as account creation should happen at signup.
        const user = auth?.currentUser;
        console.log("Account not found for user, creating a fallback account.");
        const newAccountNumber = await generateUniqueAccountNumber(db);
        const newAccount: Account = {
            id: userId,
            holderName: user?.email || "New User",
            accountNumber: newAccountNumber,
            balance: 1000,
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
    const unsubscribeTransactions = onSnapshot(transactionsQuery, async (querySnapshot) => {
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
        
        // Analyze for frequent recipients
        const recipientCounts = txs
            .filter(tx => tx.type === 'withdrawal' && tx.recipient)
            .reduce((acc, tx) => {
                const recipient = tx.recipient!;
                acc[recipient] = (acc[recipient] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const sortedRecipients = Object.entries(recipientCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([accountNumber]) => accountNumber);
        
        if (sortedRecipients.length > 0) {
            const q = query(collection(db, "accounts"), where("accountNumber", "in", sortedRecipients));
            const recipientDocs = await getDocs(q);
            const recipientData: Record<string, string> = {};
            recipientDocs.forEach(doc => {
                const data = doc.data();
                recipientData[data.accountNumber] = data.holderName;
            });

            const frequentWithNames = sortedRecipients.map(accountNumber => ({
                accountNumber,
                name: recipientData[accountNumber] || "Unknown User"
            }));
            
            setFrequentRecipients(frequentWithNames);
        } else {
            setFrequentRecipients([]);
        }


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

      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }
      
      const previousNotifications = notificationsRef.current;
      const newNotifications = notifs.filter(n => !previousNotifications.some(pn => pn.id === n.id));

      if (newNotifications.length > 0) {
        const latestNotification = newNotifications[0]; // Assuming newest is first
        if (latestNotification.type !== 'info') { // Don't toast admin announcements
             toast({
                title: latestNotification.type.charAt(0).toUpperCase() + latestNotification.type.slice(1),
                description: latestNotification.message
            });
        }
      }

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
            
            const senderData = senderAccountDoc.data() as Account;
            const senderBalance = senderData.balance;
            const newSenderBalance = senderBalance - data.amount;

            if (newSenderBalance < 0) throw new Error("Insufficient funds.");

            // Handle recipient if it's a transfer
            if (data.recipient) {
                // Sanitize recipient input to handle formatted account numbers
                const sanitizedRecipient = data.recipient.replace(/[-\s]/g, '');
                
                if (sanitizedRecipient === senderData.accountNumber) {
                    throw new Error("You cannot send money to yourself.");
                }
                
                const isAccountNumber = /^\d{9}$/.test(sanitizedRecipient);

                if (!isAccountNumber) {
                    throw new Error(`Invalid account number format: "${data.recipient}". Please enter a 9-digit number.`);
                }

                const recipientQuery = query(collection(db, "accounts"), where("accountNumber", "==", sanitizedRecipient), limit(1));
                const recipientSnapshot = await getDocs(recipientQuery);

                if (recipientSnapshot.empty) {
                    throw new Error(`Recipient account "${data.recipient}" not found.`);
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
    frequentRecipients,
    isProcessing,
    isLoading,
    handleAddTransaction,
    markNotificationsAsRead,
    updateAccountDetails
  };
}
