
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { QrCode, ArrowLeft, Loader2, CheckCircle, AlertTriangle, Zap, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAccount } from '@/hooks/use-account';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { analyzeTransaction, AnalyzeTransactionOutput } from '@/ai/flows/analyze-transaction-flow';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';


interface QrCodeData {
  recipient: string;
  amount?: number;
}

const paymentFormSchema = z.object({
    amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
});

export default function QrPayPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleAddTransaction, isProcessing, transactions } = useAccount(user?.uid);
  const { t } = useTranslation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<QrCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);

  const [riskAnalysis, setRiskAnalysis] = useState<AnalyzeTransactionOutput | null>(null);
  const [showRiskDialog, setShowRiskDialog] = useState(false);

  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashSupported, setIsFlashSupported] = useState(false);


  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '' as any,
    },
  });

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    setIsFlashOn(false);
    setIsFlashSupported(false);
  }, []);


  const startCamera = useCallback(async () => {
    stopCamera();
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
        }
        
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.torch) {
            setIsFlashSupported(true);
        }

        setHasCameraPermission(true);
    } catch (err) {
        console.error("Error accessing camera:", err);
        setHasCameraPermission(false);
        setError(t('qrpay.cameraError'));
    }
  }, [stopCamera, t]);


  const processQrCodeData = (codeData: string) => {
    try {
        const data = JSON.parse(codeData) as QrCodeData;
        if (data.recipient && typeof data.recipient === 'string') {
            stopCamera();
            setScannedData(data);
            setError(null);
            if (data.amount && typeof data.amount === 'number' && data.amount > 0) {
                setFinalAmount(data.amount);
            }
        } else {
            setError(t('qrpay.invalidQrFormat'));
        }
    } catch (e) {
        setError(t('qrpay.qrParseError'));
    }
  };


  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && !scannedData) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: "dontInvert",
              });

              if (code) {
                processQrCodeData(code.data);
              }
          }
        }
      }
    }
    if (!scannedData) {
        animationFrameId.current = requestAnimationFrame(tick);
    }
  }, [scannedData]);


  useEffect(() => {
    startCamera();

    return () => {
        stopCamera();
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }
  }, [startCamera, stopCamera]);


  useEffect(() => {
    if (hasCameraPermission && !scannedData) {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        animationFrameId.current = requestAnimationFrame(tick);
    }

    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }
  }, [hasCameraPermission, scannedData, tick]);


  const toggleFlashlight = async () => {
    if (!streamRef.current || !isFlashSupported) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    try {
        await videoTrack.applyConstraints({
            advanced: [{ torch: !isFlashOn }]
        });
        setIsFlashOn(!isFlashOn);
    } catch (err) {
        console.error('Error toggling flashlight:', err);
        toast({ variant: 'destructive', title: t('qrpay.flashError.title'), description: t('qrpay.flashError.description') });
    }
  };
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const image = new Image();
        image.onload = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0, image.width, image.height);
                    const imageData = context.getImageData(0, 0, image.width, image.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        processQrCodeData(code.data);
                    } else {
                        toast({ variant: 'destructive', title: t('qrpay.import.failTitle'), description: t('qrpay.import.failDescription') });
                    }
                }
            }
        };
        image.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input value to allow re-selection of the same file
    event.target.value = '';
  };


  const proceedWithPayment = async () => {
    if (!scannedData || !finalAmount || finalAmount <= 0) return;
    try {
        await handleAddTransaction({
            description: `Payment to ${scannedData.recipient}`,
            amount: finalAmount,
            recipient: scannedData.recipient
        });
        setIsPaymentSuccessful(true);
        setError(null);
        toast({
            title: t('qrpay.paymentSuccess.title'),
            description: t('qrpay.paymentSuccess.description', { amount: finalAmount.toFixed(2), recipient: scannedData.recipient })
        });
    } catch (e: any) {
        setError(e.message || t('qrpay.paymentError.unexpected'));
    }
  }

  const handleConfirmPayment = async () => {
    if (!scannedData || !finalAmount || finalAmount <= 0) return;

    try {
      const recentTransactions = transactions?.length > 0 ? transactions.slice(0, 10) : [];
      const analysis = await analyzeTransaction({
        amount: finalAmount,
        recipient: scannedData.recipient,
        recentTransactions: JSON.stringify(recentTransactions),
      });

      setRiskAnalysis(analysis);

      if (analysis.risk === 'medium' || analysis.risk === 'high') {
        setShowRiskDialog(true);
      } else {
        await proceedWithPayment();
      }

    } catch (e: any) {
      console.error("Fraud analysis failed:", e);
      toast({
        variant: "destructive",
        title: t('qrpay.analysisError.title'),
        description: t('qrpay.analysisError.description'),
      });
      await proceedWithPayment();
    }
  };
  
  const handleScanAgain = () => {
      setScannedData(null);
      setError(null);
      setIsPaymentSuccessful(false);
      setFinalAmount(null);
      paymentForm.reset();
      startCamera();
  }
  
  const onPaymentFormSubmit = (values: z.infer<typeof paymentFormSchema>) => {
    setFinalAmount(values.amount);
  }
  
  const renderConfirmation = () => (
     <div className="space-y-4">
         <div className="flex justify-between items-center">
             <span className="text-muted-foreground">{t('amount')}</span>
             <span className="font-bold text-2xl text-primary">${finalAmount?.toFixed(2)}</span>
         </div>
         <Button onClick={handleConfirmPayment} className="w-full" disabled={isProcessing}>
             {isProcessing ? <Loader2 className="animate-spin" /> : t('qrpay.confirmPaymentButton')}
         </Button>
          <Button variant="outline" onClick={handleScanAgain} className="w-full">
             {t('cancel')}
           </Button>
     </div>
  );

  return (
    <div className="flex items-center justify-center h-full animate-fade-in-up">
       <AlertDialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive"/>
                {t('qrpay.securityCheck.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {riskAnalysis?.reason || t('qrpay.securityCheck.defaultReason')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithPayment}>
                {t('qrpay.confirmPaymentButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode />
            {t('nav.qrPay')}
          </CardTitle>
          <CardDescription>
            {isPaymentSuccessful 
              ? t('qrpay.status.completed')
              : scannedData 
              ? t('qrpay.status.confirmDetails')
              : t('qrpay.status.positionQr')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
             <Alert variant="destructive" className="mb-4">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>{t('error')}</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}

          {!isPaymentSuccessful && !scannedData && (
             <div className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden mb-4">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                { hasCameraPermission === null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-8 w-8 animate-spin text-white"/>
                    </div>
                )}
                { hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4 text-center">
                        <p>{t('qrpay.cameraDenied')}</p>
                    </div>
                )}
                { hasCameraPermission && (
                    <>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white p-4">
                            <div className="absolute w-2/3 h-2/3 border-4 border-dashed border-white/50 rounded-lg"/>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button 
                                size="icon" 
                                variant="outline"
                                onClick={handleImportClick} 
                                className="rounded-full bg-black/50 border-white/50 text-white hover:bg-black/75"
                                title={t('qrpay.import.buttonTitle')}
                            >
                                <Upload className="h-5 w-5"/>
                            </Button>
                            {isFlashSupported && (
                                <Button 
                                    size="icon" 
                                    variant="outline"
                                    onClick={toggleFlashlight} 
                                    className={cn(
                                        "rounded-full bg-black/50 border-white/50 text-white hover:bg-black/75",
                                        isFlashOn && "bg-yellow-400/80 text-black hover:bg-yellow-400"
                                    )}
                                    title={t('qrpay.flashButtonTitle')}
                                >
                                    <Zap className="h-5 w-5"/>
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
          )}
        
          {isPaymentSuccessful ? (
            <div className="text-center space-y-4 py-8">
                 <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold">{t('qrpay.paymentComplete.title')}</h3>
                <p>{t('qrpay.paymentComplete.description', { amount: finalAmount?.toFixed(2), recipient: scannedData?.recipient })}</p>
                <Button onClick={handleScanAgain} className="w-full">
                    {t('qrpay.scanAnotherButton')}
                </Button>
            </div>
          ) : scannedData ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('qrpay.paymentDetails')}</h3>
              <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                <span className="text-muted-foreground">{t('recipient')}</span>
                <span className="font-mono font-bold">{scannedData.recipient}</span>
              </div>

              {finalAmount ? renderConfirmation() : (
                <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(onPaymentFormSubmit)} className="space-y-4">
                         <FormField
                            control={paymentForm.control}
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
                        <Button type="submit" className="w-full">
                           {t('qrpay.setAmountButton')}
                        </Button>
                         <Button variant="outline" onClick={handleScanAgain} className="w-full">
                            {t('cancel')}
                        </Button>
                    </form>
                </Form>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
