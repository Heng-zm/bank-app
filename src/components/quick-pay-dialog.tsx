
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { FrequentRecipient, TransactionFormData } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface QuickPayDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recipient: FrequentRecipient;
  onPay: (data: TransactionFormData) => Promise<void>;
  isProcessing: boolean;
}

const formSchema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
});

export function QuickPayDialog({
  isOpen,
  onOpenChange,
  recipient,
  onPay,
  isProcessing,
}: QuickPayDialogProps) {
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "" as any,
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData: TransactionFormData = {
      ...values,
      recipient: recipient.accountNumber,
      amount: values.amount || 0,
    };
    await onPay(formData);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('quickpay.dialog.title', { name: recipient.name })}</DialogTitle>
          <DialogDescription>
            {t('quickpay.dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="p-3 bg-muted rounded-md text-sm">
                <div className="flex justify-between">
                    <span>{t('recipient')}</span>
                    <span className="font-mono">{recipient.accountNumber}</span>
                </div>
            </div>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('amount')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" autoFocus/>
                  </FormControl>
                  <FormMessage />
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
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t('cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('quickpay.dialog.sendButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
