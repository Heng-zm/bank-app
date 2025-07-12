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
import { History, AlertCircle } from "lucide-react";

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
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className={cn(tx.isFraudulent && "bg-destructive/10 hover:bg-destructive/20")}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.description}
                      {tx.isFraudulent && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Flagged
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(tx.timestamp), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    tx.type === 'deposit' ? 'text-green-600' : 'text-gray-800 dark:text-gray-200'
                  )}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
