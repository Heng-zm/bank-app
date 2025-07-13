
"use client";

import { useState, useMemo } from "react";
import type { Transaction } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, CalendarIcon, FilterX } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { useTranslation } from "@/hooks/use-translation";

interface TransactionHistoryProps {
  transactions: Transaction[];
  title?: string;
  showFilters?: boolean;
}

export function TransactionHistory({ 
    transactions, 
    title = "Transaction History", 
    showFilters = false 
}: TransactionHistoryProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "withdrawal">("all");
  const { t } = useTranslation();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const filteredTransactions = useMemo(() => {
    if (!showFilters) return transactions;

    return transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      
      const isDateInRange = !dateRange || (
        (!dateRange.from || txDate >= dateRange.from) &&
        (!dateRange.to || txDate < new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000))
      );
      
      const isTypeMatch = typeFilter === 'all' || tx.type === typeFilter;
      
      return isDateInRange && isTypeMatch;
    });
  }, [transactions, dateRange, typeFilter, showFilters]);
  
  const resetFilters = () => {
      setDateRange(undefined);
      setTypeFilter("all");
  }

  const scrollAreaHeight = showFilters ? "h-[65vh]" : "h-auto";

  return (
    <Card className="shadow-lg h-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <CardHeader className="flex flex-col md:flex-row md:items-center">
        <div className="grid gap-2 flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>
                {showFilters ? t('transactions.description') : t('transactions.recentDescription', { count: transactions.length })}
            </CardDescription>
        </div>
         {showFilters && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 md:mt-0">
                <Select value={typeFilter} onValueChange={(value: "all" | "deposit" | "withdrawal") => setTypeFilter(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('transactions.filter.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('transactions.filter.allTypes')}</SelectItem>
                        <SelectItem value="deposit">{t('transactions.filter.deposit')}</SelectItem>
                        <SelectItem value="withdrawal">{t('transactions.filter.withdrawal')}</SelectItem>
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full md:w-[280px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>{t('transactions.filter.datePlaceholder')}</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        initialFocus
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                 <Button variant="ghost" size="icon" onClick={resetFilters} title={t('transactions.filter.resetTitle')}>
                    <FilterX className="h-4 w-4" />
                 </Button>
            </div>
         )}
      </CardHeader>
      <CardContent>
        {/* Mobile View - Card List */}
        <div className="md:hidden">
            {filteredTransactions.length > 0 ? (
                 <ScrollArea className={scrollAreaHeight}>
                    <div className="space-y-4">
                    {filteredTransactions.map((tx) => (
                        <div key={tx.id} className="p-4 border rounded-lg flex justify-between items-start">
                           <div className="flex items-center gap-4">
                                <div className={cn(
                                    "flex items-center justify-center rounded-full h-10 w-10",
                                     tx.type === 'deposit' ? 'bg-emerald-100' : 'bg-gray-100'
                                )}>
                                    {tx.type === 'deposit' ? 
                                        <ArrowDownLeft className="h-5 w-5 text-emerald-600" /> : 
                                        <ArrowUpRight className="h-5 w-5 text-gray-600" />
                                    }
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">{tx.description}</p>
                                    <p className="text-sm text-muted-foreground">{tx.timestamp ? format(new Date(tx.timestamp), "MMM d, yyyy") : t('pending')}</p>
                                </div>
                           </div>
                           <div className={cn(
                                "font-semibold",
                                tx.type === 'deposit' ? 'text-emerald-600' : 'text-gray-800'
                           )}>
                             {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                           </div>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            ) : (
                 <div className="text-center h-24 flex items-center justify-center">
                    {t('transactions.noTransactions')}
                </div>
            )}
        </div>
        
        {/* Desktop View - Table */}
        <div className="hidden md:block">
            <ScrollArea className={scrollAreaHeight}>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>{t('transactions.table.description')}</TableHead>
                    <TableHead>{t('transactions.table.date')}</TableHead>
                    <TableHead>{t('transactions.table.type')}</TableHead>
                    <TableHead className="text-right">{t('transactions.table.amount')}</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                        <TableCell>
                            <span className="font-medium">{tx.description}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                        {tx.timestamp ? format(new Date(tx.timestamp), "MMM d, yyyy") : t('pending')}
                        </TableCell>
                        <TableCell>
                        <Badge variant={tx.type === 'deposit' ? 'secondary' : 'outline'} className={cn(
                            tx.type === 'deposit' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200"
                        )}>
                            {tx.type === 'deposit' ? <ArrowDownLeft className="mr-1 h-3 w-3" /> : <ArrowUpRight className="mr-1 h-3 w-3" />}
                            {t(`transactions.types.${tx.type}`)}
                        </Badge>
                        </TableCell>
                        <TableCell className={cn(
                        "text-right font-medium",
                        tx.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-800 dark:text-gray-200'
                        )}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        {t('transactions.noTransactions')}
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
