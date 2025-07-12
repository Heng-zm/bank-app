
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
import { ArrowUpRight, ArrowDownLeft, Receipt, CalendarIcon, FilterX } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "./ui/scroll-area";

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const filteredTransactions = useMemo(() => {
    if (!showFilters) return transactions;

    return transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      
      const isDateInRange = !dateRange || (
        (!dateRange.from || txDate >= dateRange.from) &&
        // Add 24h to the 'to' date to include the whole day
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
                {showFilters ? 'A record of all your account activity.' : `Your ${transactions.length} most recent transactions.`}
            </CardDescription>
        </div>
         {showFilters && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 md:mt-0">
                <Select value={typeFilter} onValueChange={(value: "all" | "deposit" | "withdrawal") => setTypeFilter(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
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
                        <span>Pick a date range</span>
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
                 <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset filters">
                    <FilterX className="h-4 w-4" />
                 </Button>
            </div>
         )}
      </CardHeader>
      <CardContent>
        <ScrollArea className={scrollAreaHeight}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex flex-col">
                          <span className="font-medium">{tx.description}</span>
                          {tx.receiptUrl && (
                              <Link href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline mt-1">
                                  <Receipt className="h-3 w-3" />
                                  View Receipt
                              </Link>                          
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.timestamp ? format(new Date(tx.timestamp), "MMM d, yyyy") : 'Pending'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'deposit' ? 'secondary' : 'outline'} className={cn(
                        tx.type === 'deposit' && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200"
                      )}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="mr-1 h-3 w-3" /> : <ArrowUpRight className="mr-1 h-3 w-3" />}
                        {tx.type}
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
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
