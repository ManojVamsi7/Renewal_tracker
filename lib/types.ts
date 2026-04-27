export type ClientStatus = 'active' | 'inactive';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'other';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';
export type VerificationMethod = 'manual' | 'invoice' | 'receipt' | 'statement' | 'other';
export type NotificationType = 'dueIn3Days' | 'dueToday' | 'overdue' | 'paymentReceived';

export interface Client {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  monthlyAmount: number;
  startDate: Date;
  renewalDate: Date;
  status: ClientStatus;
  notes?: string;
}

export interface PaymentVerification {
  status: PaymentStatus;
  method: VerificationMethod;
  verifiedAt?: Date;
  verifiedBy?: string;
  evidence?: string; // URL or description of verification evidence
  notes?: string;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  date: Date;
  paymentMethod: PaymentMethod;
  verification?: PaymentVerification;
  notes?: string;
}

export interface Notification {
  id: string;
  clientId: string;
  type: NotificationType;
  date: Date;
  read: boolean;
}

export interface KPIMetrics {
  totalClients: number;
  activeClients: number;
  renewalsDueToday: number;
  renewalsDueIn3Days: number;
  overdueRenewals: number;
  collectedThisMonth: number;
  pendingPayments: number;
}
