
"use client";

import { useMemo, useState } from "react";
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
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DndItem } from "@/components/dnd-item";
import { useTranslation } from "@/hooks/use-translation";
import { QuickPayWidget } from "@/components/quick-pay-widget";

const DEFAULT_WIDGET_ORDER = ["account", "quickPay", "spending", "transactionForm", "history", "admin"];

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { 
    account, 
    transactions, 
    isProcessing, 
    isLoading: isAccountLoading,
    frequentRecipients,
    handleAddTransaction,
  } = useAccount(user?.uid);
  
  const [widgetOrder, setWidgetOrder] = useLocalStorage<string[]>("dashboard-widget-order", DEFAULT_WIDGET_ORDER);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const chartData = useMemo(() => {
    if (!transactions) return [];
    const spending = transactions
      .filter(tx => tx.type === 'withdrawal')
      .reduce((acc, tx) => {
        // Simple categorization for example purposes
        let category = t('dashboard.spending.general');
        if (/payment to/i.test(tx.description)) category = t('dashboard.spending.transfers');
        else if (/dinner|food|restaurant/i.test(tx.description)) category = t('dashboard.spending.dining');
        else if (/groceries|market/i.test(tx.description)) category = t('dashboard.spending.groceries');
        else if (/transport|gas/i.test(tx.description)) category = t('dashboard.spending.transport');
        
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += tx.amount;
        return acc;
      }, {} as {[key: string]: number});
    
    return Object.entries(spending).map(([name, value]) => ({ name, value, fill: `hsl(var(--chart-${Object.keys(spending).indexOf(name) + 1}))` }));
  }, [transactions, t]);
  
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
      toast({ title: t('dashboard.admin.toastSuccessTitle'), description: t('dashboard.admin.toastSuccessDescription') });
    } catch (error) {
      console.error("Error announcing feature:", error);
      toast({ variant: "destructive", title: t('error'), description: t('dashboard.admin.toastErrorDescription')});
    }
  }

  if (isAuthLoading || isAccountLoading) {
    return (
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-[125px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[450px] w-full" />
        </div>
        <div className="lg:col-span-3">
             <Skeleton className="h-[585px] w-full" />
        </div>
      </div>
    );
  }

  const widgets: { [key: string]: React.ReactNode } = {
    account: <AccountCard account={account} />,
    quickPay: (
      <QuickPayWidget 
        recipients={frequentRecipients} 
        onPay={handleAddTransaction}
        isProcessing={isProcessing}
      />
    ),
    spending: (
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5"/>
                {t('dashboard.spending.title')}
            </CardTitle>
            <CardDescription>{t('dashboard.spending.description')}</CardDescription>
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
              {t('dashboard.spending.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    ),
    transactionForm: <TransactionForm onSubmit={handleAddTransaction} isProcessing={isProcessing} />,
    history: <TransactionHistory title={t('dashboard.history.title')} transactions={transactions.slice(0, 10)} />,
    admin: (
      <div className="p-4 border rounded-xl bg-card text-card-foreground shadow-sm space-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h3 className="font-semibold text-sm">{t('dashboard.admin.title')}</h3>
        <p className="text-xs text-muted-foreground">{t('dashboard.admin.description')}</p>
        <Button onClick={handleAnnounceFeature} size="sm" className="w-full" variant="secondary">
          <Megaphone className="mr-2 h-4 w-4"/> {t('dashboard.admin.button')}
        </Button>
      </div>
    ),
  };

  const mainWidgets = {
    account: widgets.account,
    quickPay: widgets.quickPay,
    spending: widgets.spending,
    transactionForm: widgets.transactionForm,
    admin: widgets.admin,
  };

  const sidebarWidgets = {
    history: widgets.history,
  };
  
  const orderedMainWidgets = widgetOrder.filter(id => mainWidgets[id]).map(id => (
    <DndItem key={id} id={id}>{mainWidgets[id]}</DndItem>
  ));

  const orderedSidebarWidgets = widgetOrder.filter(id => sidebarWidgets[id]).map(id => (
     <DndItem key={id} id={id}>{sidebarWidgets[id]}</DndItem>
  ));

  return (
    <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <SortableContext 
            items={widgetOrder.filter(id => mainWidgets[id])}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-4 lg:gap-8">
              {orderedMainWidgets}
            </div>
          </SortableContext>

          <SortableContext 
            items={widgetOrder.filter(id => sidebarWidgets[id])}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-3 lg:gap-8">
              {orderedSidebarWidgets}
            </div>
          </SortableContext>
      </div>
    </DndContext>
  );
}
