
"use client";

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
import { History, ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";
import Link from "next/link";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary"/>
            Transaction History
        </CardTitle>
        <CardDescription>A record of your recent account activity.</CardDescription>
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
              {transactions.map((tx) => (
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
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No transactions yet.
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
