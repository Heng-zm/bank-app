
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
import { Share2, RefreshCcw, Download, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  amount: z.coerce.number().min(0, { message: "Amount cannot be negative." }).optional(),
});

// SVG icon for the QR code center, converted to a data URI
const landmarkIconDataUri = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTRmYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1sYW5kbWFyayI+PGxpbmUgeDE9IjMiIHgyPSIyMSIgeTE9IjIyIiB5Mj0iMjIiLz48bGluZSB4MT0iNiIgeDI9IjYiIHkxPSIxOCIgeTI9IjExIi8+PGxpbmUgeDE9IjEwIiB4Mj0iMTAiIHkxPSIxOCIgeTI9IjExIi8+PGxpbmUgeDE9IjE0IiB4Mj0iMTQiIHkxPSIxOCIgeTI9IjExIi8+PGxpbmUgeDE9IjE4IiB4Mj0iMTgiIHkxPSIxOCIgeTI9IjExIi8+PHBvbHlnb24gcG9pbnRzPSIxMiAyIDIwIDcgNCA3Ii8+PC9zdmc+";


export default function MyQrPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { account, isLoading: isAccountLoading } = useAccount(user?.uid);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number | undefined>(undefined);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();

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
        ? t('myqr.share.withAmount', { amount: Number(requestedAmount).toFixed(2), name: account.holderName })
        : t('myqr.share.withoutAmount', { name: account.holderName });

      try {
        await navigator.share({
          title: t('myqr.share.title'),
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
            variant: "destructive",
            title: t('myqr.share.errorTitle'),
            description: t('myqr.share.errorDescription')
        });
      }
    } else {
        toast({ title: t('myqr.share.notSupportedTitle'), description: t('myqr.share.notSupportedDescription')})
    }
  }

  const handleSaveQrCode = () => {
    if (!qrCodeRef.current || !account) {
        toast({ variant: "destructive", title: t('myqr.save.errorTitle'), description: t('myqr.save.errorNotReady')});
        return;
    }

    const qrCanvas = qrCodeRef.current.querySelector("canvas");
    if (!qrCanvas) {
        toast({ variant: "destructive", title: t('myqr.save.errorTitle'), description: t('myqr.save.errorNoCanvas')});
        return;
    }
    
    // Create a new canvas to draw the final image
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 400;
    finalCanvas.height = 550;
    const ctx = finalCanvas.getContext('2d');

    if (!ctx) {
         toast({ variant: "destructive", title: t('myqr.save.errorTitle'), description: t('myqr.save.errorCreateImage')});
        return;
    }

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    
    // Header with Logo
    ctx.fillStyle = '#1e40af'; // primary color
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('FinSim', 70, 50);

    // User Info
    ctx.fillStyle = '#334155'; // text-slate-700
    ctx.font = '600 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(account.holderName, finalCanvas.width / 2, 100);

    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#64748b'; // text-slate-500
    ctx.fillText(`${t('account.accountNumber')}: ${account.accountNumber}`, finalCanvas.width / 2, 130);

    // QR Code
    const qrSize = 250;
    const qrX = (finalCanvas.width - qrSize) / 2;
    const qrY = 160;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // Amount
    if (requestedAmount && requestedAmount > 0) {
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillStyle = '#1e40af';
      ctx.fillText(`${t('myqr.requesting')}: $${requestedAmount.toFixed(2)}`, finalCanvas.width / 2, 450);
    } else {
      ctx.font = '18px Inter, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(t('myqr.scanToPay', { name: account.holderName }), finalCanvas.width / 2, 450);
    }

    // Footer
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8'; // text-slate-400
    ctx.fillText('Powered by FinSim Bank', finalCanvas.width / 2, 520);

    // Trigger Download
    const pngUrl = finalCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `finsim-payment-qr-${account.accountNumber}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast({ title: t('myqr.save.successTitle'), description: t('myqr.save.successDescription')});
  };


  if (isAuthLoading || isAccountLoading || !account.accountNumber) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Skeleton className="h-64 w-64 rounded-xl mb-4" />
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
        <div className="flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
                 <div ref={qrCodeRef} className="p-6 bg-white rounded-2xl shadow-2xl mb-6">
                    <QRCode
                        value={qrCodeValue}
                        size={220}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="Q"
                        includeMargin={false}
                        imageSettings={{
                            src: landmarkIconDataUri,
                            x: undefined,
                            y: undefined,
                            height: 48,
                            width: 48,
                            excavate: true,
                        }}
                    />
                </div>
                <h2 className="text-2xl font-bold">{account.holderName}</h2>
                <p className="text-muted-foreground">{t('myqr.scanToPay', { name: account.holderName.split(' ')[0] })}</p>
                {requestedAmount && requestedAmount > 0 && (
                    <p className="text-lg mt-2">{t('myqr.requesting')} <span className='font-bold text-primary'>${Number(requestedAmount).toFixed(2)}</span></p>
                )}
            </div>
        </div>

        <div className="p-4 bg-card rounded-t-2xl shadow-upper">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('myqr.form.amountLabel')}</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0.00" {...field} step="0.01"/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                            {t('myqr.form.setAmountButton')}
                        </Button>
                        <Button type="button" variant="secondary" onClick={resetAmount}>
                            <RefreshCcw className="mr-2 h-4 w-4" /> {t('reset')}
                        </Button>
                    </div>
                </form>
            </Form>
            
            <div className="flex gap-2 mt-4">
                <Button onClick={handleShare} className="w-full flex-1" variant="outline">
                    <Share2 className="mr-2 h-4 w-4"/>
                    {t('share')}
                </Button>
                 <Button onClick={handleSaveQrCode} className="w-full flex-1" variant="outline">
                    <Download className="mr-2 h-4 w-4"/>
                    {t('myqr.save.button')}
                </Button>
            </div>
        </div>
    </div>
  );
}

