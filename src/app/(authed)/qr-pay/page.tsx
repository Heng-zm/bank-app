
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { QrCode, ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
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
  const { handleAddTransaction, isProcessing } = useAccount(user?.uid);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<QrCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);

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
                  try {
                      const data = JSON.parse(code.data) as QrCodeData;
                      if (data.recipient && typeof data.recipient === 'string') {
                          setScannedData(data);
                          setError(null);
                          if (data.amount && typeof data.amount === 'number' && data.amount > 0) {
                             setFinalAmount(data.amount);
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
    }
    if (!isPaymentSuccessful) {
        requestAnimationFrame(tick);
    }
  }, [scannedData, isPaymentSuccessful]);

  useEffect(() => {
    if (hasCameraPermission) {
      const animationFrameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [hasCameraPermission, tick]);

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
      paymentForm.reset();
  }
  
  const onPaymentFormSubmit = (values: z.infer<typeof paymentFormSchema>) => {
    setFinalAmount(values.amount);
  }
  
  const renderConfirmation = () => (
     <div className="space-y-4">
         <div className="flex justify-between items-center">
             <span className="text-muted-foreground">Amount</span>
             <span className="font-bold text-2xl text-primary">${finalAmount?.toFixed(2)}</span>
         </div>
         <Button onClick={handleConfirmPayment} className="w-full" disabled={isProcessing}>
             {isProcessing ? <Loader2 className="animate-spin" /> : `Confirm Payment`}
         </Button>
          <Button variant="outline" onClick={handleScanAgain} className="w-full">
             Cancel
           </Button>
     </div>
  );

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
          </Description>
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
                        <Button type="submit" className="w-full">
                           Set Amount
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
