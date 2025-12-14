export type ItemType = 'asset' | 'liability';

export const ASSET_CATEGORIES = {
  RealEstate: 'Real Estate',
  Stocks: 'Stocks & Bonds',
  Cash: 'Cash & Equivalents',
  Business: 'Business Interests',
  Crypto: 'Crypto Assets',
  Other: 'Other Assets'
} as const;

export type AssetCategory = typeof ASSET_CATEGORIES[keyof typeof ASSET_CATEGORIES];

export const LIABILITY_CATEGORIES = {
  Mortgage: 'Mortgage',
  Loan: 'Personal/Auto Loan',
  CreditCard: 'Credit Card Debt',
  StudentLoan: 'Student Loan',
  Other: 'Other Liabilities'
} as const;

export type LiabilityCategory = typeof LIABILITY_CATEGORIES[keyof typeof LIABILITY_CATEGORIES];

export interface NetWorthItem {
  id: string;
  name: string;
  value: number;
  type: ItemType;
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  type: ItemType;
  category: string;
  interestRate: number;
}

export interface AppSettings {
  inflationRate: number;
  projectionYears: number;
  currencySymbol: string;
}

export interface ProjectionData {
  year: number;
  netWorth: number;
  assets: number;
  liabilities: number;
}

export interface ForecastSettings {
  startYear: number;
  phase1Monthly: number | '';
  phase2Monthly: number | '';
  phase3Monthly: number | '';
  annualReturn: number | '';
  customStages: Record<number, 1 | 2 | 3>; // yearIndex -> stage override
  customReturns: Record<number, number>; // yearIndex -> specific return rate
}

export interface ActualRecord {
  yearIndex: number; // 1, 2, 3...
  totalAnnual: number | ''; // User direct input
  eoyBalance: number | '';
  notes: string;
}