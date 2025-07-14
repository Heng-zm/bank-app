
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { QrCode, ArrowLeft, Loader2, CheckCircle, AlertTriangle, Zap, Upload, Wallet } from 'lucide-react';

import { useAccount } from '@/hooks/use-account';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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
import { AmountKeypad } from '@/components/amount-keypad';

interface QrCodeData {
  recipient: string;
  amount?: number;
}

type PaymentStep = "scanning" | "amount_entry" | "confirmation" | "success" | "error";

export default function QrPayPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleAddTransaction, isProcessing, transactions, account } = useAccount(user?.uid);
  const { t } = useTranslation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<PaymentStep>("scanning");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<QrCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<AnalyzeTransactionOutput | null>(null);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashSupported, setIsFlashSupported] = useState(false);
  
  const stopScanning = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    stopScanning();
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    setIsFlashOn(false);
  }, [stopScanning]);

  const processQrCodeData = useCallback((codeData: string) => {
    if (step !== 'scanning') return;
    try {
        const data = JSON.parse(codeData) as QrCodeData;
        if (data.recipient && typeof data.recipient === 'string') {
            stopCamera();
            setScannedData(data);
            setError(null);
            if (data.amount && typeof data.amount === 'number' && data.amount > 0) {
                setFinalAmount(data.amount);
                setStep('confirmation');
            } else {
                setStep('amount_entry');
            }
        } else {
            throw new Error(t('qrpay.invalidQrFormat'));
        }
    } catch (e: any) {
        stopCamera();
        setError(e.message || t('qrpay.qrParseError'));
        setStep('error');
    }
  }, [step, stopCamera, t]);

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current && videoRef.current) {
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
                return; // Stop ticking once a code is found
              }
          }
        }
      }
    }
    animationFrameId.current = requestAnimationFrame(tick);
  }, [processQrCodeData]);

  const startScanning = useCallback(() => {
    if (animationFrameId.current === null) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const startCamera = useCallback(async () => {
    setError(null);
    if (streamRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
      }
      
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      if (capabilities.torch) {
        setIsFlashSupported(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      setError(t('qrpay.cameraError'));
      setStep('error');
    }
  }, [t]);

  // Effect to manage camera stream lifecycle
  useEffect(() => {
    if (step === 'scanning' && !streamRef.current) {
        startCamera();
    }
    // Cleanup on unmount
    return () => {
        if (streamRef.current) {
            stopCamera();
        }
    }
  }, [step, startCamera, stopCamera]);


  // Effect to manage scanning loop
  useEffect(() => {
      if (step === 'scanning' && hasCameraPermission) {
        startScanning();
      } else {
        stopScanning();
      }
      return () => stopScanning();
  }, [step, hasCameraPermission, startScanning, stopScanning]);


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
                    const code = jsQR(imageData.data, imageData.width, image.height);
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
        setStep('success');
        setError(null);
    } catch (e: any) {
        setError(e.message || t('qrpay.paymentError.unexpected'));
        setStep('error');
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
      await proceedWithPayment(); // Proceed even if analysis fails
    }
  };
  
  const handleScanAgain = () => {
      setScannedData(null);
      setError(null);
      setFinalAmount(null);
      setRiskAnalysis(null);
      setStep('scanning');
      // The useEffect will handle restarting the camera
  }
  
  const handleAmountSubmit = (amount: number) => {
    setFinalAmount(amount);
    setStep('confirmation');
  }

  return (
    <div className="h-full w-full bg-slate-900 text-white flex flex-col items-center justify-center overflow-hidden">
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

        {/* --- Video Background --- */}
        <div className="absolute inset-0">
             <video 
                ref={videoRef} 
                className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    step !== 'scanning' && 'blur-md scale-110'
                )} 
                autoPlay 
                playsInline 
                muted 
            />
            <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* --- Scanning UI --- */}
        <div className={cn(
            "absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300",
            step === 'scanning' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
            {hasCameraPermission === null && (
                <div className="flex flex-col items-center gap-2 bg-black/50 p-4 rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-white"/>
                    <p>Starting Camera...</p>
                </div>
            )}
            
            {hasCameraPermission === false && step === 'error' && (
                <div className="flex flex-col items-center gap-2 bg-black/50 p-4 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <p className="text-center max-w-xs">{error}</p>
                </div>
            )}

            {hasCameraPermission && (
                <>
                   <p className="text-lg font-semibold bg-black/30 px-4 py-1 rounded-full mb-4">{t('qrpay.status.positionQr')}</p>
                   <div className="relative w-64 h-64">
                       <div className="absolute inset-0 border-4 border-dashed border-white/50 rounded-2xl"/>
                       <div className="absolute inset-0 animate-scan-line bg-gradient-to-b from-transparent via-primary/50 to-transparent"/>
                   </div>
                   <div className="mt-8 flex gap-4">
                       <input
                           type="file"
                           ref={fileInputRef}
                           onChange={handleFileChange}
                           className="hidden"
                           accept="image/*"
                       />
                       <Button 
                           variant="outline"
                           onClick={handleImportClick} 
                           className="rounded-full bg-black/50 border-white/50 text-white h-16 w-16 flex items-center justify-center"
                           title={t('qrpay.import.buttonTitle')}
                       >
                           <Upload className="h-7 w-7"/>
                       </Button>
                       {isFlashSupported && (
                           <Button 
                               variant="outline"
                               onClick={toggleFlashlight} 
                               className={cn(
                                   "rounded-full bg-black/50 border-white/50 text-white h-16 w-16 flex items-center justify-center",
                                   isFlashOn && "bg-yellow-400/80 text-black hover:bg-yellow-400"
                               )}
                               title={t('qrpay.flashButtonTitle')}
                           >
                               <Zap className="h-7 w-7"/>
                           </Button>
                       )}
                   </div>
                </>
            )}
        </div>


        {/* --- Panel for other steps --- */}
        <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 pt-6 bg-card text-card-foreground rounded-t-3xl shadow-upper transform transition-transform duration-500 ease-in-out",
            step === 'scanning' || (step === 'error' && hasCameraPermission === false) ? 'translate-y-full' : 'translate-y-0'
        )}>
            <div className="w-full max-w-md mx-auto">
                {step === 'amount_entry' && scannedData && (
                    <div className="animate-fade-in-up">
                         <h3 className="text-lg font-semibold text-center mb-1">{t('recipient')}</h3>
                         <p className="font-mono text-center text-muted-foreground mb-4">{scannedData.recipient}</p>
                        <AmountKeypad 
                            onSubmit={handleAmountSubmit} 
                            onCancel={handleScanAgain}
                        />
                    </div>
                )}
                
                {step === 'confirmation' && scannedData && finalAmount &&(
                    <div className="space-y-4 animate-fade-in-up">
                         <CardHeader className="text-center p-0 mb-4">
                            <CardTitle>{t('qrpay.paymentDetails')}</CardTitle>
                            <CardDescription>{t('qrpay.status.confirmDetails')}</CardDescription>
                         </CardHeader>
                         <div className="p-4 bg-muted rounded-xl space-y-3">
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-muted-foreground">{t('recipient')}</span>
                                 <span className="font-mono font-bold">{scannedData.recipient}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-muted-foreground">{t('amount')}</span>
                                 <span className="font-bold text-2xl text-primary">${finalAmount?.toFixed(2)}</span>
                             </div>
                         </div>
                         <Button onClick={handleConfirmPayment} className="w-full h-12 text-lg" disabled={isProcessing}>
                             {isProcessing ? <Loader2 className="animate-spin" /> : <> <Wallet className="mr-2"/> {t('qrpay.confirmPaymentButton')}</> }
                         </Button>
                          <Button variant="ghost" onClick={handleScanAgain} className="w-full">
                             {t('cancel')}
                           </Button>
                    </div>
                )}
            </div>
        </div>

        {/* --- Full Screen states --- */}
        {step === 'success' && (
            <div className="absolute inset-0 bg-primary/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in">
                <div className="relative">
                    <CheckCircle className="h-24 w-24 text-primary-foreground animate-zoom-in" />
                </div>
                <h3 className="text-3xl font-bold text-primary-foreground">{t('qrpay.paymentComplete.title')}</h3>
                <p className="text-lg text-primary-foreground/80">{t('qrpay.paymentComplete.description', { amount: finalAmount?.toFixed(2), recipient: scannedData?.recipient })}</p>
                <div className="flex gap-4">
                    <Button onClick={handleScanAgain} variant="secondary" size="lg">
                        {t('qrpay.scanAnotherButton')}
                    </Button>
                     <Button onClick={() => router.push('/dashboard')} variant="outline" size="lg">
                       Go Home
                    </Button>
                </div>
            </div>
        )}
        
        {step === 'error' && hasCameraPermission !== false && (
             <div className="absolute inset-0 bg-destructive/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
                 <AlertTriangle className="h-20 w-20 text-destructive-foreground animate-zoom-in" />
                 <h3 className="text-3xl font-bold text-destructive-foreground">{t('error')}</h3>
                 <p className="text-lg text-destructive-foreground/80">{error}</p>
                 <Button onClick={handleScanAgain} variant="secondary" size="lg">
                    Try Again
                 </Button>
             </div>
        )}

    </div>
  );
}
