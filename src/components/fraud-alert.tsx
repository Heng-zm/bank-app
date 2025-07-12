"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface FraudAlertProps {
  explanation: string;
}

export function FraudAlert({ explanation }: FraudAlertProps) {
  return (
    <Alert variant="destructive" className="mb-6 shadow-md">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>AI Fraud Detection Report</AlertTitle>
      <AlertDescription>{explanation}</AlertDescription>
    </Alert>
  );
}
