
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import QRCode from 'qrcode.react';
import { useAuth } from '@/hooks/use-auth';
import { useAccount } from '@/hooks/use-account';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  amount: z.coerce.number().min(0, { message: "Amount cannot be negative." }).optional(),
});

export default function MyQrPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { account, isLoading: isAccountLoading } = useAccount(user?.uid);
  const { toast } = useToast();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user || !account?.accountNumber) {
        toast({ variant: 'destructive', title: "Authentication Error", description: "Could not generate QR code. Account details are missing." });
        return;
    }
    const data: {recipient: string; amount?: number} = {
      recipient: account.accountNumber,
    };
    if (values.amount && values.amount > 0) {
        data.amount = values.amount;
    }
    setQrCodeData(JSON.stringify(data));
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      const amount = form.getValues('amount');
      const shareText = amount && amount > 0 
        ? `Here is my payment QR code to receive $${Number(amount).toFixed(2)}.`
        : 'Here is my payment QR code.';

      try {
        await navigator.share({
          title: 'FinSim Payment Request',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
            variant: "destructive",
            title: "Share Failed",
            description: "Could not share the QR code. Permission may have been denied."
        });
      }
    } else {
        toast({ title: "Share Not Supported", description: "Your browser does not support the Web Share API."})
    }
  }

  const generatedAmount = form.getValues('amount');

  if (isAuthLoading || isAccountLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>My QR Code</CardTitle>
          <CardDescription>
            {qrCodeData 
                ? "Share this code to receive money."
                : "Enter an amount or leave it blank for a generic request."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
            {!qrCodeData ? (
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Amount (Optional)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0.00" {...field} step="0.01"/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full">
                            Generate QR Code
                        </Button>
                    </form>
                 </Form>
            ) : (
                <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                        <QRCode value={qrCodeData} size={256} />
                    </div>
                    {generatedAmount && generatedAmount > 0 ? (
                        <p className="text-center">Scan this code to pay <span className='font-bold'>${Number(generatedAmount).toFixed(2)}</span> to <span className="font-mono text-sm">{account?.holderName}</span></p>
                    ) : (
                        <p className="text-center">Scan this code to pay <span className="font-mono text-sm">{account?.holderName}</span></p>
                    )}
                    <div className="flex w-full gap-2">
                        <Button variant="outline" onClick={() => { setQrCodeData(null); form.reset(); }} className="flex-1">
                            New Code
                        </Button>
                        <Button onClick={handleShare} className="flex-1">
                            <Share2 className="mr-2 h-4 w-4"/>
                            Share
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
