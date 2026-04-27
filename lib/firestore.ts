import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { Client, Payment } from './types'

// ─── Helpers ────────────────────────────────────────────────────────────────

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return new Date(value as string)
}

// ─── Clients ─────────────────────────────────────────────────────────────────

const clientsRef = collection(db, 'clients')

function clientFromDoc(id: string, data: Record<string, unknown>): Client {
  return {
    id,
    studentId: data.studentId as string,
    name: data.name as string,
    email: data.email as string,
    phone: (data.phone as string) ?? '',
    department: data.department as string,
    monthlyAmount: (data.monthlyAmount as number) ?? 0,
    startDate: toDate(data.startDate),
    renewalDate: toDate(data.renewalDate),
    status: data.status as Client['status'],
    notes: data.notes as string | undefined,
  }
}

function clientToFirestore(client: Omit<Client, 'id'>) {
  return {
    studentId: client.studentId,
    name: client.name,
    email: client.email,
    phone: client.phone ?? '',
    department: client.department,
    monthlyAmount: client.monthlyAmount ?? 0,
    startDate: Timestamp.fromDate(client.startDate),
    renewalDate: Timestamp.fromDate(client.renewalDate),
    status: client.status,
    notes: client.notes ?? '',
  }
}

export async function fetchClients(): Promise<Client[]> {
  const q = query(clientsRef, orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => clientFromDoc(d.id, d.data() as Record<string, unknown>))
}

export async function addClientToFirestore(client: Omit<Client, 'id'>): Promise<Client> {
  const docRef = await addDoc(clientsRef, clientToFirestore(client))
  return { ...client, id: docRef.id }
}

export async function updateClientInFirestore(id: string, updates: Partial<Client>): Promise<void> {
  const ref = doc(db, 'clients', id)
  const data: Record<string, unknown> = { ...updates }
  delete data.id
  if (updates.startDate) data.startDate = Timestamp.fromDate(updates.startDate)
  if (updates.renewalDate) data.renewalDate = Timestamp.fromDate(updates.renewalDate)
  await updateDoc(ref, data)
}

export async function deleteClientFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'clients', id))
}

export async function bulkImportClientsToFirestore(clients: Omit<Client, 'id'>[]): Promise<Client[]> {
  const batch = writeBatch(db)
  const result: Client[] = []
  for (const client of clients) {
    const newRef = doc(clientsRef)
    batch.set(newRef, clientToFirestore(client))
    result.push({ ...client, id: newRef.id })
  }
  await batch.commit()
  return result
}

// ─── Payments ─────────────────────────────────────────────────────────────────

const paymentsRef = collection(db, 'payments')

function paymentFromDoc(id: string, data: Record<string, unknown>): Payment {
  const v = data.verification as Record<string, unknown> | null | undefined
  return {
    id,
    clientId: data.clientId as string,
    amount: data.amount as number,
    date: toDate(data.date),
    paymentMethod: data.paymentMethod as Payment['paymentMethod'],
    notes: data.notes as string | undefined,
    verification: v
      ? {
          status: v.status as Payment['verification']['status'],
          method: v.method as Payment['verification']['method'],
          verifiedAt: v.verifiedAt ? toDate(v.verifiedAt) : undefined,
          verifiedBy: v.verifiedBy as string | undefined,
          evidence: v.evidence as string | undefined,
          notes: v.notes as string | undefined,
        }
      : undefined,
  }
}

function verificationToFirestore(v: Payment['verification']) {
  if (!v) return null
  return {
    status: v.status,
    method: v.method,
    verifiedAt: v.verifiedAt ? Timestamp.fromDate(v.verifiedAt) : null,
    verifiedBy: v.verifiedBy ?? null,
    evidence: v.evidence ?? null,
    notes: v.notes ?? null,
  }
}

export async function fetchPayments(): Promise<Payment[]> {
  const q = query(paymentsRef, orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => paymentFromDoc(d.id, d.data() as Record<string, unknown>))
}

export async function addPaymentToFirestore(payment: Omit<Payment, 'id'>): Promise<Payment> {
  const docRef = await addDoc(paymentsRef, {
    clientId: payment.clientId,
    amount: payment.amount,
    date: Timestamp.fromDate(payment.date),
    paymentMethod: payment.paymentMethod,
    notes: payment.notes ?? '',
    verification: verificationToFirestore(payment.verification),
  })
  return { ...payment, id: docRef.id }
}

export async function updatePaymentInFirestore(id: string, updates: Partial<Payment>): Promise<void> {
  const ref = doc(db, 'payments', id)
  const data: Record<string, unknown> = { ...updates }
  delete data.id
  if (updates.date) data.date = Timestamp.fromDate(updates.date)
  if (updates.verification !== undefined) {
    data.verification = verificationToFirestore(updates.verification)
  }
  await updateDoc(ref, data)
}

export async function deletePaymentFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'payments', id))
}
