
export interface Account {
  id: string;
  holderName: string;
  balance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  timestamp: string;
  amount: number;
  description: string;
  type: 'deposit' | 'withdrawal';
  recipient?: string | null;
  sender?: string | null;
  receiptUrl?: string | null;
}

export interface TransactionFormData {
    recipient?: string;
    description: string;
    amount: number;
    receiptFile?: File | null;
    receiptUrl?: string | null;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'deposit' | 'alert' | 'info';
    isRead: boolean;
    timestamp: string;
}
