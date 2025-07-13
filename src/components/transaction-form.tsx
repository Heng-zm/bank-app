
"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRightLeft, Loader2, Send, UserCheck } from "lucide-react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TransactionFormData } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslation } from "@/hooks/use-translation";

const formSchema = z.object({
  recipient: z.string().min(1, { message: "Recipient is required." }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isProcessing: boolean;
}

export function TransactionForm({ onSubmit, isProcessing }: TransactionFormProps) {
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [isRecipientLoading, setIsRecipientLoading] = useState(false);
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      description: "",
      amount: '' as any,
    },
  });

  const recipientValue = useWatch({
    control: form.control,
    name: "recipient",
  });

  const debouncedRecipient = useDebounce(recipientValue, 500);

  useEffect(() => {
    const findRecipient = async () => {
      if (!debouncedRecipient) {
        setRecipientName(null);
        return;
      }
      
      const sanitizedRecipient = debouncedRecipient.replace(/[-\s]/g, '');
      const isAccountNumber = /^\d{9}$/.test(sanitizedRecipient);
      
      if (isAccountNumber) {
        setIsRecipientLoading(true);
        setRecipientName(null);
        try {
          const q = query(collection(db, "accounts"), where("accountNumber", "==", sanitizedRecipient), limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const recipientData = querySnapshot.docs[0].data();
            setRecipientName(recipientData.holderName);
          } else {
            setRecipientName(t('transactionForm.recipientNotFound'));
          }
        } catch (error) {
          console.error("Error fetching recipient:", error);
          setRecipientName(t('transactionForm.errorFindingAccount'));
        } finally {
          setIsRecipientLoading(false);
        }
      } else {
         setRecipientName(null);
      }
    };

    findRecipient();
  }, [debouncedRecipient, t]);


  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData: TransactionFormData = {
        ...values,
        amount: values.amount || 0,
    };
    
    await onSubmit(formData);

    form.reset();
  };


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary"/>
            {t('transactionForm.title')}
        </CardTitle>
        <CardDescription>{t('transactionForm.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
             <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transactionForm.recipientLabel')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input placeholder={t('transactionForm.recipientPlaceholder')} {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {isRecipientLoading && (
                    <div className="flex items-center text-sm text-muted-foreground pt-1">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('searching')}...
                    </div>
                  )}
                  {recipientName && !isRecipientLoading && (
                     <div className="flex items-center text-sm text-muted-foreground pt-1">
                      <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                      <span>{recipientName}</span>
                    </div>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transactionForm.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('transactionForm.descriptionPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('amount')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('transactionForm.submitButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
