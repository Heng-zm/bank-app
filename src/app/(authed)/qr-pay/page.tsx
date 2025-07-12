
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { QrCode, ArrowLeft, Loader2, CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { analyzeTransaction, AnalyzeTransactionOutput } from '@/ai/flows/analyze-transaction-flow';

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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<QrCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTransactionOutput | null>(null);

  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '' as any,
    },
  });

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasCameraPermission(false);
        setError("Camera access is required to scan QR codes. Please enable camera permissions in your browser settings.");
      }
    };
    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, []);

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && !scannedData && !isPaymentSuccessful) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                try {
                    const data = JSON.parse(code.data) as QrCodeData;
                    if (data.recipient && typeof data.recipient === 'string') {
                        setScannedData(data);
                        setError(null);
                        if (data.amount && typeof data.amount === 'number' && data.amount > 0) {
                           handleAmountSet(data.amount);
                        }
                    } else {
                        setError("Invalid QR code format. Expected a recipient.");
                    }
                } catch (e) {
                    setError("Failed to parse QR code data. Please use a valid payment QR code.");
                }
            }
        }
      }
    }
    requestAnimationFrame(tick);
  }, [scannedData, isPaymentSuccessful]);

  useEffect(() => {
    if (hasCameraPermission) {
      const animationFrameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [hasCameraPermission, tick]);

  const handleAmountSet = async (amount: number) => {
    if (!scannedData) return;
    setFinalAmount(amount);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const recentTransactions = transactions.slice(0, 10).map(t => ({
        amount: t.amount,
        description: t.description,
        type: t.type,
        timestamp: t.timestamp
      }));
      
      const result = await analyzeTransaction({
        amount,
        recipient: scannedData.recipient,
        recentTransactions: JSON.stringify(recentTransactions, null, 2),
      });

      setAnalysisResult(result);
    } catch (e) {
      console.error("Fraud analysis failed", e);
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze transaction risk.' });
      // Default to low risk on failure to not block user
      setAnalysisResult({ risk: 'low', reason: 'Analysis service failed.' });
    } finally {
      setIsAnalyzing(false);
    }
  }


  const handleConfirmPayment = async () => {
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
            title: "Payment Successful",
            description: `You paid ${finalAmount.toFixed(2)} to ${scannedData.recipient}.`
        });
    } catch (e: any) {
        setError(e.message || "An unexpected error occurred during payment.");
    }
  };
  
  const handleScanAgain = () => {
      setScannedData(null);
      setError(null);
      setIsPaymentSuccessful(false);
      setFinalAmount(null);
      setAnalysisResult(null);
      setIsAnalyzing(false);
      paymentForm.reset();
  }
  
  const onPaymentFormSubmit = (values: z.infer<typeof paymentFormSchema>) => {
    handleAmountSet(values.amount);
  }
  
  const renderConfirmation = () => {
    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center space-y-2 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing transaction...</p>
            </div>
        )
    }

    if (analysisResult) {
       const isHighRisk = analysisResult.risk !== 'low';
       return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-2xl text-primary">${finalAmount?.toFixed(2)}</span>
            </div>

            {isHighRisk ? (
                 <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Potential Risk Detected ({analysisResult.risk})</AlertTitle>
                    <AlertDescription>{analysisResult.reason}</AlertDescription>
                </Alert>
            ) : (
                <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Low Risk</AlertTitle>
                    <AlertDescription>{analysisResult.reason}</AlertDescription>
                </Alert>
            )}
           
            {isHighRisk ? (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button className="w-full" disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : `Proceed Anyway`}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Our system has flagged this transaction as potentially risky. Please confirm that you know and trust the recipient before proceeding.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmPayment}>Confirm Payment</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : (
                <Button onClick={handleConfirmPayment} className="w-full" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : `Confirm Payment`}
                </Button>
            )}

             <Button variant="outline" onClick={handleScanAgain} className="w-full">
                Cancel
              </Button>
        </div>
       )
    }

    return null;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode />
            Scan to Pay
          </CardTitle>
          <CardDescription>
            {scannedData ? 'Confirm your payment details.' : 'Scan a payment QR code.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
             <Alert variant="destructive" className="mb-4">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}

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
                    <p>Camera access denied. Please enable it in your browser settings.</p>
                </div>
            )}
             { !scannedData && !isPaymentSuccessful && hasCameraPermission && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white p-4">
                    <p className="font-semibold text-lg">Scanning for QR Code...</p>
                    <div className="absolute w-2/3 h-2/3 border-4 border-dashed border-white/50 rounded-lg"/>
                </div>
            )}
          </div>
        
          {isPaymentSuccessful ? (
            <div className="text-center space-y-4">
                 <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold">Payment Complete!</h3>
                <p>You successfully paid ${finalAmount?.toFixed(2)} to {scannedData?.recipient}.</p>
                <Button onClick={handleScanAgain} className="w-full">
                    Scan Another Code
                </Button>
            </div>
          ) : scannedData ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-bold">{scannedData.recipient}</span>
              </div>

              {finalAmount ? renderConfirmation() : (
                <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(onPaymentFormSubmit)} className="space-y-4">
                         <FormField
                            control={paymentForm.control}
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
                        <Button type="submit" className="w-full" disabled={isProcessing}>
                           {isAnalyzing ? <Loader2 className="animate-spin" /> : `Analyze Transaction`}
                        </Button>
                         <Button variant="outline" onClick={handleScanAgain} className="w-full">
                            Cancel
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
