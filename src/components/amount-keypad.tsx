
"use client";

import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface AmountKeypadProps {
  onSubmit: (amount: number) => void;
  onCancel: () => void;
  commissionRate?: number;
}

export function AmountKeypad({ onSubmit, onCancel, commissionRate = 0 }: AmountKeypadProps) {
  const [amountValue, setAmountValue] = useState('0');
  const { t } = useTranslation();

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      if (amountValue.length > 1) {
        setAmountValue(amountValue.slice(0, -1));
      } else {
        setAmountValue('0');
      }
    } else if (key === '.') {
      if (!amountValue.includes('.')) {
        setAmountValue(amountValue + '.');
      }
    } else {
      if (amountValue === '0' && key !== '.') {
        setAmountValue(key);
      } else {
        // Prevent more than 2 decimal places
        const decimalIndex = amountValue.indexOf('.');
        if (decimalIndex !== -1 && amountValue.length - decimalIndex > 2) {
          return;
        }
        setAmountValue(amountValue + key);
      }
    }
  };

  const handleSendMoney = () => {
    const numericAmount = parseFloat(amountValue);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      onSubmit(numericAmount);
    }
  };

  const numericAmount = parseFloat(amountValue) || 0;
  const commission = numericAmount * commissionRate;
  const totalAmount = numericAmount + commission;
  const isAmountValid = numericAmount > 0;

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center space-y-2">
        <div className="relative inline-block">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl text-muted-foreground">$</span>
            <span className="text-5xl font-bold tracking-tight pl-6 pr-1">{amountValue}</span>
        </div>
        {commissionRate > 0 && isAmountValid && (
          <p className="text-sm text-muted-foreground">
            {commissionRate * 100}% commission. Total amount ${totalAmount.toFixed(2)}
          </p>
        )}
      </div>

      <div className="keypad-grid">
        {keypadKeys.map((key) => (
          <Button
            key={key}
            variant="ghost"
            className="h-16 text-2xl font-semibold"
            onClick={() => handleKeyPress(key)}
          >
            {key === 'backspace' ? <X className="h-6 w-6" /> : key}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2 mt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
            {t('cancel')}
        </Button>
        <Button 
            className="flex-1" 
            onClick={handleSendMoney} 
            disabled={!isAmountValid}
        >
            {t('qrpay.setAmountButton')} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
