/**
 * SPENDWISER // MIGRATION EXPORT
 *
 * A one-time, one-direction JSON handoff into SpendState (the local-first
 * "Financial OS"). This module reads a user's full Firestore document tree
 * under spenders/{uid}/ and emits one comprehensive, schema-stable JSON document
 * that SpendState's importer can consume.
 *
 * It is intentionally lossless on the SpendWiser side: every collection is read
 * and normalized (Firestore Timestamps → ISO strings), so the mapping/decision
 * about what SpendState can represent lives on the SpendState side, not here.
 */
import { collection, getDocs, getDoc, doc, query, type Firestore, type DocumentData } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/** Symbolic currency → ISO code (mirrors SpendState's symbol→code table). */
const SYMBOL_TO_CODE: Record<string, string> = {
  '₹': 'INR',
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  'AED': 'AED',
  'S$': 'SGD',
  'A$': 'AUD',
  'C$': 'CAD',
  '¥': 'JPY',
};

export interface SpendWiserMigrationExport {
  app: 'spendwiser';
  version: 1;
  exportedAt: string;
  currency: string;
  themePreference?: string;
  baseCurrencyCode: string;
  entities: {
    transactions: Record<string, unknown>[];
    accounts: Record<string, unknown>[];
    budgets: Record<string, unknown>[];
    goals: Record<string, unknown>[];
    loans: Record<string, unknown>[];
    recurringTransactions: Record<string, unknown>[];
    shortcuts: Record<string, unknown>[];
    pendingTransactions: Record<string, unknown>[];
    billSplitting: {
      participants: Record<string, unknown>[];
      groups: Record<string, unknown>[];
      expenses: { groupId: string; docId: string; data: Record<string, unknown> }[];
    };
    totalBudget: Record<string, unknown>[];
  };
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

/** Recursively map any Firestore Timestamp (`.toDate()`) to an ISO string. */
function normalize(raw: unknown): unknown {
  if (raw === null || raw === undefined) return raw;
  if (Array.isArray(raw)) return raw.map(normalize);
  if (typeof raw === 'object') {
    const o = raw as { toDate?: () => Date; seconds?: number; nanoseconds?: number };
    if (typeof o.toDate === 'function') {
      const d = o.toDate();
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    if (typeof o.seconds === 'number') {
      const d = new Date(o.seconds * 1000);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(o)) {
      const v = (o as unknown as Record<string, unknown>)[key];
      out[key] = normalize(v);
    }
    return out;
  }
  return raw;
}

async function snapshotToArray(db: Firestore, pathSegments: string[]): Promise<Record<string, unknown>[]> {
  const q = query(collection(db, ...pathSegments));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(normalize(d.data()) as DocumentData),
  }));
}

/**
 * Build the comprehensive migration export for one user.
 *
 * Reads every user-owned collection (plus the spenders/{uid} settings doc and
 * the nested bill-splitting group expenses), normalizes Timestamps, resolves the
 * base currency code from the stored currency symbol, and returns a versioned,
 * schema-stable document. The App layer is responsible for downloading it.
 */
export async function buildMigrationExport(user: User, db: Firestore): Promise<SpendWiserMigrationExport> {
  const uid = user.uid;
  const base = ['spenders', uid];

  const [
    transactions,
    accounts,
    budgets,
    goals,
    loans,
    recurringTransactions,
    shortcuts,
    pendingTransactions,
    billSplittingParticipants,
    billSplittingGroups,
  ] = await Promise.all([
    snapshotToArray(db, [...base, 'transactions']),
    snapshotToArray(db, [...base, 'accounts']),
    snapshotToArray(db, [...base, 'budgets']),
    snapshotToArray(db, [...base, 'goals']),
    snapshotToArray(db, [...base, 'loans']),
    snapshotToArray(db, [...base, 'recurring_transactions']),
    snapshotToArray(db, [...base, 'shortcuts']),
    snapshotToArray(db, [...base, 'pending_transactions']),
    snapshotToArray(db, [...base, 'billSplittingParticipants']),
    snapshotToArray(db, [...base, 'billSplittingGroups']),
  ]);

  // Nested group expenses.
  const billSplittingExpenses: { groupId: string; docId: string; data: Record<string, unknown> }[] = [];
  await Promise.all(
    billSplittingGroups.map(async (group) => {
      const groupId = String(group.id);
      const snap = await getDocs(collection(db, ...base, 'billSplittingGroups', groupId, 'expenses'));
      for (const e of snap.docs) {
        billSplittingExpenses.push({ groupId, docId: e.id, data: normalize(e.data()) as Record<string, unknown> });
      }
    }),
  );

  // totalBudget/current is a single doc.
  let totalBudget: Record<string, unknown>[] = [];
  const totalBudgetSnap = await getDoc(doc(db, ...base, 'totalBudget', 'current'));
  if (totalBudgetSnap.exists()) {
    totalBudget = [{ id: totalBudgetSnap.id, ...(normalize(totalBudgetSnap.data()) as DocumentData) }];
  }

  // User settings doc.
  const userSnap = await getDoc(doc(db, ...base));
  const settingsRecord: Record<string, unknown> = {};
  if (userSnap.exists()) settingsRecord['userDoc'] = normalize(userSnap.data()) as Record<string, unknown>;

  const currencySymbol = (settingsRecord['userDoc'] as Record<string, unknown> | undefined)?.currency as
    | string
    | undefined;
  const themePreference = (settingsRecord['userDoc'] as Record<string, unknown> | undefined)?.themePreference as
    | string
    | undefined;
  const currency = typeof currencySymbol === 'string' ? currencySymbol : '₹';
  const baseCurrencyCode = SYMBOL_TO_CODE[currency] ?? (currency.length === 3 ? currency.toUpperCase() : 'INR');

  return {
    app: 'spendwiser',
    version: 1,
    exportedAt: new Date().toISOString(),
    currency,
    themePreference,
    baseCurrencyCode,
    entities: {
      transactions,
      accounts,
      budgets,
      goals,
      loans,
      recurringTransactions,
      shortcuts,
      pendingTransactions,
      billSplitting: {
        participants: billSplittingParticipants,
        groups: billSplittingGroups,
        expenses: billSplittingExpenses,
      },
      totalBudget,
    },
    settings: settingsRecord,
    metadata: {
      exportedBy: user.email ?? user.uid,
      uid: user.uid,
    },
  };
}

/** Trigger a JSON download for an already-built migration export. */
export function downloadMigrationExport(exportData: SpendWiserMigrationExport): void {
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spendwiser-spendstate-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
