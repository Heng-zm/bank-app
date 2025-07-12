
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import QRCode from 'qrcode.react';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
});

export default function MyQrPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: "Authentication Error", description: "You must be logged in to generate a QR code." });
        return;
    }
    const data = {
      recipient: user.email || user.uid, // Use email as recipient, fallback to UID
      amount: values.amount,
    };
    setQrCodeData(JSON.stringify(data));
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FinSim Payment Request',
          text: `Here is my payment QR code to receive ${Number(form.getValues('amount')).toFixed(2)}.`,
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>My QR Code</CardTitle>
          <CardDescription>Generate a QR code to receive money.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="ghost" onClick={() => router.push('/')} className="absolute top-4 right-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            
            {!qrCodeData ? (
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Amount</FormLabel>
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
                    <p className="text-center">Scan this code to pay <span className='font-bold'>${Number(form.getValues('amount')).toFixed(2)}</span> to <span className="font-mono text-sm">{user?.email}</span></p>
                    <div className="flex w-full gap-2">
                        <Button variant="outline" onClick={() => setQrCodeData(null)} className="flex-1">
                            New Amount
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
