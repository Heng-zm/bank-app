
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Landmark, LogOut, QrCode, Megaphone } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { AccountCard } from "@/components/account-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionHistory } from "@/components/transaction-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { 
    account, 
    transactions, 
    notifications,
    isProcessing, 
    isLoading: isAccountLoading,
    handleAddTransaction,
    markNotificationsAsRead
  } = useAccount(user?.uid);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleAnnounceFeature = async () => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        message: "New feature available! You can now categorize your spending.",
        type: 'info',
        isRead: false,
        timestamp: serverTimestamp(),
      });
      toast({ title: "Announcement Sent!", description: "A new feature notification has been created." });
    } catch (error) {
      console.error("Error announcing feature:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not send announcement."});
    }
  }

  if (!isClient || isAuthLoading || isAccountLoading) {
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
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Landmark className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">FinSim</h1>
              <p className="text-muted-foreground">Your Personal Banking Simulator</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/qr-pay">
              <QrCode />
              Scan to Pay
            </Link>
          </Button>
           <Button variant="ghost" asChild>
            <Link href="/my-qr">
              <QrCode />
              My QR Code
            </Link>
          </Button>
          <NotificationBell notifications={notifications} onOpen={markNotificationsAsRead} />
          <Button variant="ghost" onClick={handleLogout}>
              <LogOut />
              Logout
          </Button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AccountCard account={account} />
          <TransactionForm onSubmit={handleAddTransaction} isProcessing={isProcessing}/>
           <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm space-y-2">
              <h3 className="font-semibold text-sm">Admin Action</h3>
              <p className="text-xs text-muted-foreground">Simulate a new feature announcement for the current user.</p>
              <Button onClick={handleAnnounceFeature} size="sm" className="w-full">
                <Megaphone className="mr-2 h-4 w-4"/> Announce New Feature
              </Button>
            </div>
        </div>
        <div className="lg:col-span-2">
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </main>
  );
}
