
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { Share2, User, RefreshCcw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  amount: z.coerce.number().min(0, { message: "Amount cannot be negative." }).optional(),
});

export default function MyQrPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { account, isLoading: isAccountLoading } = useAccount(user?.uid);
  const { toast } = useToast();
  
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number | undefined>(undefined);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
    },
  });
  
  const generateQrData = (amount?: number) => {
    if (!account?.accountNumber) return '';
    const data: { recipient: string; amount?: number } = {
      recipient: account.accountNumber,
    };
    if (amount && amount > 0) {
      data.amount = amount;
    }
    return JSON.stringify(data);
  }

  useEffect(() => {
    if (account?.accountNumber) {
      setQrCodeValue(generateQrData());
    }
  }, [account.accountNumber]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setRequestedAmount(values.amount);
    setQrCodeValue(generateQrData(values.amount));
  };
  
  const resetAmount = () => {
    form.reset({ amount: undefined });
    setRequestedAmount(undefined);
    setQrCodeValue(generateQrData());
  }

  const handleShare = async () => {
    if (navigator.share) {
      const shareText = requestedAmount && requestedAmount > 0 
        ? `Here is my payment QR code to receive $${Number(requestedAmount).toFixed(2)} from ${account.holderName}.`
        : `Here is my payment QR code to receive money from ${account.holderName}.`;

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
            description: "Could not share the QR code."
        });
      }
    } else {
        toast({ title: "Share Not Supported", description: "Your browser does not support the Web Share API."})
    }
  }

  const handleSaveQrCode = () => {
    if (qrCodeRef.current) {
        const canvas = qrCodeRef.current.querySelector("canvas");
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = "finsim-qr-code.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
             toast({ title: "QR Code Saved", description: "The QR code has been downloaded as a PNG file."});
        } else {
             toast({ variant: "destructive", title: "Save Failed", description: "Could not find the QR code canvas to save."});
        }
    }
  };


  if (isAuthLoading || isAccountLoading || !account.accountNumber) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        <Skeleton className="h-64 w-64" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }


  return (
    <div className="flex items-center justify-center h-full animate-fade-in-up">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User />
            Receive Payment
          </CardTitle>
          <CardDescription>
            Share this QR code to get paid. You can add an amount below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {qrCodeValue ? (
                <div className="flex flex-col items-center space-y-4">
                    <div ref={qrCodeRef} className="p-4 bg-white rounded-lg shadow-md">
                        <QRCode value={qrCodeValue} size={256} />
                    </div>
                    <div className="text-center">
                        {requestedAmount && requestedAmount > 0 ? (
                            <p className="text-lg">Requesting <span className='font-bold text-primary'>${Number(requestedAmount).toFixed(2)}</span></p>
                        ) : (
                            <p className="text-lg">Requesting payment</p>
                        )}
                         <p className="text-sm text-muted-foreground">To: {account?.holderName}</p>
                         <p className="text-xs text-muted-foreground font-mono">Acct: {account.accountNumber}</p>
                    </div>
                </div>
            ) : (
                 <div className="flex justify-center">
                    <Skeleton className="h-64 w-64" />
                </div>
            )}
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Specific Amount (Optional)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0.00" {...field} step="0.01"/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button type="submit" className="flex-1">
                            Set Amount
                        </Button>
                        <Button type="button" variant="secondary" onClick={resetAmount} className="flex-1">
                            <RefreshCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>
                </form>
            </Form>
            
            <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleShare} className="w-full flex-1" variant="outline">
                    <Share2 className="mr-2 h-4 w-4"/>
                    Share
                </Button>
                 <Button onClick={handleSaveQrCode} className="w-full flex-1" variant="outline">
                    <Download className="mr-2 h-4 w-4"/>
                    Save QR Code
                </Button>
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
