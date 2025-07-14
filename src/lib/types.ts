
export interface NotificationPreferences {
  deposits: boolean;
  alerts: boolean;
  info: boolean;
}

export interface Account {
  id: string;
  holderName: string;
  accountNumber: string;
  balance: number;
  photoURL?: string;
  notificationPreferences?: NotificationPreferences;
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
}

export interface TransactionFormData {
    recipient?: string;
    description: string;
    amount: number;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'deposit' | 'alert' | 'info';
    isRead: boolean;
    timestamp: string;
}

export interface FrequentRecipient {
    accountNumber: string;
    name: string;
}
