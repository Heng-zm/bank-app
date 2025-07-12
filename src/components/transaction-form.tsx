
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRightLeft, Loader2, Send, Paperclip } from "lucide-react";

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
import { Progress } from "@/components/ui/progress";
import type { TransactionFormData } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  recipient: z.string().optional(),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  receiptFile: z
    .any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ).optional(),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData, onProgress?: (progress: number) => void) => Promise<void>;
  isProcessing: boolean;
}

export function TransactionForm({ onSubmit, isProcessing }: TransactionFormProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      description: "",
      amount: 0,
      receiptFile: undefined,
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setUploadProgress(null);
    const formData: TransactionFormData = {
        ...values,
        receiptFile: values.receiptFile?.[0]
    };
    
    await onSubmit(formData, (progress) => {
        setUploadProgress(progress);
    });

    form.reset();
    setUploadProgress(null);
  };

  const isUploading = uploadProgress !== null && uploadProgress < 100;
  const isSubmitDisabled = isProcessing || isUploading;


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary"/>
            New Transaction
        </CardTitle>
        <CardDescription>Send a payment or make a transfer.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
             <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input placeholder="Recipient User ID or Email" {...field} className="pl-10" />
                    </div>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dinner with friends" {...field} />
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="receiptFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input 
                         type="file" 
                         accept="image/*"
                         className="pl-10 pt-2 file:text-foreground"
                         onChange={(e) => field.onChange(e.target.files)}
                       />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress !== null && (
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Uploading receipt...</p>
                    <Progress value={uploadProgress} />
                </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading && "Uploading..."}
              {!isProcessing && !isUploading && "Submit Transaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
