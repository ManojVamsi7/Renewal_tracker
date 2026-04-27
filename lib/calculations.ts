import { Client, Payment, KPIMetrics } from './types';
import { differenceInDays, startOfMonth, endOfMonth, isWithinInterval, addMonths, setDate } from 'date-fns';

export function calculateNextRenewalDate(startDate: Date): Date {
  const today = new Date();
  const dayOfMonth = startDate.getDate();
  
  // Find the next occurrence of the same day of month
  let nextRenewal = setDate(today, dayOfMonth);
  
  // If that date is in the past, move to next month
  if (nextRenewal < today) {
    nextRenewal = setDate(addMonths(today, 1), dayOfMonth);
  }
  
  return nextRenewal;
}

export function getDaysUntilRenewal(renewalDate: Date): number {
  return differenceInDays(renewalDate, new Date());
}

export function getRenewalStatus(renewalDate: Date): 'overdue' | 'due-today' | 'due-soon' | 'due-in-5days' | 'upcoming' {
  const daysUntil = getDaysUntilRenewal(renewalDate);
  
  if (daysUntil < 0) return 'overdue';
  if (daysUntil === 0) return 'due-today';
  if (daysUntil <= 3) return 'due-soon';
  if (daysUntil <= 5) return 'due-in-5days';
  return 'upcoming';
}

export function calculateKPIs(clients: Client[], payments: Payment[]): KPIMetrics {
  const today = new Date();
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);

  const activeClients = clients.filter(c => c.status === 'active').length;
  const renewalsDueToday = clients.filter(c => getRenewalStatus(c.renewalDate) === 'due-today').length;
  const renewalsDueIn3Days = clients.filter(c => {
    const status = getRenewalStatus(c.renewalDate);
    return status === 'due-today' || status === 'due-soon';
  }).length;
  const renewalsDueIn5Days = clients.filter(c => {
    const status = getRenewalStatus(c.renewalDate);
    return status === 'due-today' || status === 'due-soon' || status === 'due-in-5days';
  }).length;
  const overdueRenewals = clients.filter(c => getRenewalStatus(c.renewalDate) === 'overdue').length;

  const thisMonthPayments = payments.filter(p => 
    isWithinInterval(p.date, { start: thisMonthStart, end: thisMonthEnd })
  );
  const collectedThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalClients: clients.length,
    activeClients,
    renewalsDueToday,
    renewalsDueIn3Days: renewalsDueIn5Days, // Show 5-day warning on dashboard
    overdueRenewals,
    collectedThisMonth,
    pendingPayments: 0, // Will be calculated based on specific payment logic
  };
}

export function getUrgentRenewals(clients: Client[]): Client[] {
  return clients.filter(c => {
    const status = getRenewalStatus(c.renewalDate);
    return status === 'overdue' || status === 'due-today' || status === 'due-soon';
  }).sort((a, b) => getDaysUntilRenewal(a.renewalDate) - getDaysUntilRenewal(b.renewalDate));
}

export function getClientRenewalDaysUntil(client: Client): number {
  return getDaysUntilRenewal(client.renewalDate);
}

export function getMonthlyCollections(payments: Payment[], monthsBack: number = 6): Record<string, number> {
  const result: Record<string, number> = {};
  const today = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const monthlyPayments = payments.filter(p => 
      isWithinInterval(p.date, { start: monthStart, end: monthEnd })
    );
    result[monthKey] = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  }

  return result;
}

export function getRenewalsTrend(clients: Client[], monthsAhead: number = 6): Record<string, number> {
  const result: Record<string, number> = {};
  const today = new Date();

  for (let i = 0; i < monthsAhead; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const monthlyRenewals = clients.filter(c => 
      isWithinInterval(c.renewalDate, { start: monthStart, end: monthEnd })
    ).length;
    result[monthKey] = monthlyRenewals;
  }

  return result;
}

export function getClientsIn5DayWarning(clients: Client[]): Client[] {
  return clients.filter(c => {
    const daysUntil = getDaysUntilRenewal(c.renewalDate);
    return daysUntil >= 0 && daysUntil <= 5;
  }).sort((a, b) => getDaysUntilRenewal(a.renewalDate) - getDaysUntilRenewal(b.renewalDate));
}

export function hasClientPaidThisMonth(clientId: string, payments: Payment[]): boolean {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  return payments.some(p => 
    p.clientId === clientId && 
    isWithinInterval(p.date, { start: monthStart, end: monthEnd }) &&
    (!p.verification || p.verification.status === 'verified')
  );
}

export function getClientsNeedingRenewal(clients: Client[], payments: Payment[]): Client[] {
  return clients.filter(client => {
    const status = getRenewalStatus(client.renewalDate);
    // Only show in renewals if overdue or due soon AND hasn't paid this month
    const needsRenewal = status === 'overdue' || status === 'due-today' || status === 'due-soon' || status === 'due-in-5days';
    const hasPaidThisMonth = hasClientPaidThisMonth(client.id, payments);
    return needsRenewal && !hasPaidThisMonth;
  }).sort((a, b) => getDaysUntilRenewal(a.renewalDate) - getDaysUntilRenewal(b.renewalDate));
}
