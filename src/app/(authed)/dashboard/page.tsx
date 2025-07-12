
"use client";

import { useMemo } from "react";
import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { AccountCard } from "@/components/account-card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionHistory } from "@/components/transaction-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Megaphone, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Pie, Cell, PieChart as RechartsPieChart } from "recharts"


export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const { 
    account, 
    transactions, 
    isProcessing, 
    isLoading: isAccountLoading,
    handleAddTransaction,
  } = useAccount(user?.uid);

  const chartData = useMemo(() => {
    const spending = transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((acc, t) => {
        // Simple categorization for example purposes
        let category = "General";
        if (/payment to/i.test(t.description)) category = "Transfers";
        else if (/dinner|food|restaurant/i.test(t.description)) category = "Dining";
        else if (/groceries|market/i.test(t.description)) category = "Groceries";
        else if (/transport|gas/i.test(t.description)) category = "Transport";
        
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += t.amount;
        return acc;
      }, {} as {[key: string]: number});
    
    return Object.entries(spending).map(([name, value]) => ({ name, value, fill: `hsl(var(--chart-${Object.keys(spending).indexOf(name) + 1}))` }));
  }, [transactions]);
  
  const chartConfig = useMemo(() => {
    return chartData.reduce((acc, item, index) => {
      acc[item.name] = {
        label: item.name,
        color: `hsl(var(--chart-${index + 1}))`,
      };
      return acc;
    }, {} as any);
  }, [chartData]);


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

  if (isAuthLoading || isAccountLoading) {
    return (
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-[125px] w-full" />
            <Skeleton className="h-[450px] w-full" />
        </div>
        <div className="lg:col-span-3">
             <Skeleton className="h-[585px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-4 lg:gap-8">
            <AccountCard account={account} />
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5"/>
                        Spending Summary
                    </CardTitle>
                    <CardDescription>A breakdown of your spending by category.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                      <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="value" />} />
                        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60}>
                           {chartData.map((entry) => (
                              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </RechartsPieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No spending data to display.
                    </div>
                  )}
                </CardContent>
            </Card>
            <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm space-y-2">
              <h3 className="font-semibold text-sm">Admin Action</h3>
              <p className="text-xs text-muted-foreground">Simulate a new feature announcement for the current user.</p>
              <Button onClick={handleAnnounceFeature} size="sm" className="w-full" variant="secondary">
                <Megaphone className="mr-2 h-4 w-4"/> Announce New Feature
              </Button>
            </div>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-3 lg:gap-8">
             <TransactionHistory title="Recent Transactions" transactions={transactions.slice(0, 10)} />
          </div>
      </div>
    </>
  );
}
