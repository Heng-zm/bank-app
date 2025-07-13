
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Zap } from "lucide-react";
import type { FrequentRecipient, TransactionFormData } from "@/lib/types";
import { QuickPayDialog } from "./quick-pay-dialog";
import { useTranslation } from "@/hooks/use-translation";

interface QuickPayWidgetProps {
  recipients: FrequentRecipient[];
  onPay: (data: TransactionFormData) => Promise<void>;
  isProcessing: boolean;
}

export function QuickPayWidget({ recipients, onPay, isProcessing }: QuickPayWidgetProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<FrequentRecipient | null>(null);
  const { t } = useTranslation();

  const handlePayClick = (recipient: FrequentRecipient) => {
    setSelectedRecipient(recipient);
  };
  
  return (
    <>
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t('quickpay.title')}
          </CardTitle>
          <CardDescription>{t('quickpay.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {recipients.map((recipient) => (
                <Button
                  key={recipient.accountNumber}
                  variant="outline"
                  className="justify-start h-12"
                  onClick={() => handlePayClick(recipient)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  <span className="truncate">{recipient.name}</span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('quickpay.noRecipients')}</p>
          )}
        </CardContent>
      </Card>
      {selectedRecipient && (
        <QuickPayDialog
          isOpen={!!selectedRecipient}
          onOpenChange={(isOpen) => !isOpen && setSelectedRecipient(null)}
          recipient={selectedRecipient}
          onPay={onPay}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
}
