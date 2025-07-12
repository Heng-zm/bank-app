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
}

export interface TransactionFormData {
    description: string;
    amount: number;
}
