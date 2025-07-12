
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRightLeft, Loader2, Send, Paperclip, UserCheck, Search } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import type { TransactionFormData } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  recipient: z.string().min(1, { message: "Recipient is required." }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  receiptFile: z
    .any()
    .refine((file) => !file || (file[0] && file[0].size <= MAX_FILE_SIZE), `Max file size is 5MB.`)
    .refine(
      (file) => !file || (file[0] && ACCEPTED_IMAGE_TYPES.includes(file[0].type)),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ).optional(),
});

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData, onProgress?: (progress: number) => void) => Promise<void>;
  isProcessing: boolean;
}

export function TransactionForm({ onSubmit, isProcessing }: TransactionFormProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [isRecipientLoading, setIsRecipientLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      description: "",
      amount: '' as any,
      receiptFile: undefined,
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
            setRecipientName("Account not found");
          }
        } catch (error) {
          console.error("Error fetching recipient:", error);
          setRecipientName("Error finding account");
        } finally {
          setIsRecipientLoading(false);
        }
      } else {
         setRecipientName(null);
      }
    };

    findRecipient();
  }, [debouncedRecipient]);


  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setUploadProgress(null);
    const formData: TransactionFormData = {
        ...values,
        amount: values.amount || 0,
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
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary"/>
            New Transaction
        </CardTitle>
        <CardDescription>Send money using a 9-digit account number.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
             <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Account #</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input placeholder="e.g., 001-002-003" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {isRecipientLoading && (
                    <div className="flex items-center text-sm text-muted-foreground pt-1">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
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
                         className="pl-10 pt-[5px] file:text-foreground"
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
