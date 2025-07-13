
"use client";

import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { CreditCard, Zap } from "lucide-react";
import { useState } from "react";

const bills = [
    { id: '1', name: 'Netflix Subscription', amount: 15.99, dueDate: '2024-07-25', icon: Zap },
    { id: '2', name: 'Internet Service', amount: 79.99, dueDate: '2024-07-28', icon: Zap },
    { id: '3', name: 'Credit Card Payment', amount: 250.00, dueDate: '2024-08-01', icon: CreditCard },
    { id: '4', name: 'Electricity Bill', amount: 65.50, dueDate: '2024-08-05', icon: Zap },
];


export default function BillPayPage() {
    const { user } = useAuth();
    const { handleAddTransaction, isProcessing } = useAccount(user?.uid);
    const { toast } = useToast();
    const { t } = useTranslation();
    const [paidBills, setPaidBills] = useState<string[]>([]);

    const handlePayBill = async (bill: typeof bills[0]) => {
        try {
            await handleAddTransaction({
                recipient: 'Utility Company', // This would be dynamic in a real app
                description: `Bill Payment: ${bill.name}`,
                amount: bill.amount,
            });
            toast({
                title: "Bill Paid",
                description: `Successfully paid ${bill.name} for $${bill.amount.toFixed(2)}.`,
            });
            setPaidBills(prev => [...prev, bill.id]);
        } catch (error) {
            // Error toast is handled in useAccount hook
        }
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('billPay.title')}</CardTitle>
                    <CardDescription>{t('billPay.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('billPay.table.bill')}</TableHead>
                                <TableHead>{t('billPay.table.dueDate')}</TableHead>
                                <TableHead className="text-right">{t('amount')}</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.map((bill) => (
                                <TableRow key={bill.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <bill.icon className="h-5 w-5 text-muted-foreground" />
                                        {bill.name}
                                    </TableCell>
                                    <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">${bill.amount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            onClick={() => handlePayBill(bill)}
                                            disabled={isProcessing || paidBills.includes(bill.id)}
                                        >
                                            {paidBills.includes(bill.id) ? t('billPay.paid') : t('billPay.payNow')}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
