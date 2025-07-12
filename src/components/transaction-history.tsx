
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
import { History, ArrowUpRight, ArrowDownLeft, Receipt, CalendarIcon, FilterX } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "withdrawal">("all");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const filteredTransactions = useMemo(() => {
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
  }, [transactions, dateRange, typeFilter]);
  
  const resetFilters = () => {
      setDateRange(undefined);
      setTypeFilter("all");
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary"/>
                    Transaction History
                </CardTitle>
                <CardDescription>A record of your recent account activity.</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={(value: "all" | "deposit" | "withdrawal") => setTypeFilter(value)}>
                    <SelectTrigger className="w-[180px]">
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
                        "w-[280px] justify-start text-left font-normal",
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[60vh] relative">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex flex-col">
                        <span>{tx.description}</span>
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
                       tx.type === 'deposit' && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    )}>
                       {tx.type === 'deposit' ? <ArrowDownLeft className="mr-1 h-3 w-3" /> : <ArrowUpRight className="mr-1 h-3 w-3" />}
                       {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    tx.type === 'deposit' ? 'text-green-600' : 'text-gray-800 dark:text-gray-200'
                  )}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    No transactions match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
