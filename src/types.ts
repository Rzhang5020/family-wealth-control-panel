export type ItemType = 'asset' | 'liability';

export enum AssetCategory {
  RealEstate = 'Real Estate',
  Stocks = 'Stocks & Bonds',
  Cash = 'Cash & Equivalents',
  Business = 'Business Interests',
  Crypto = 'Crypto Assets',
  Other = 'Other Assets'
}

export enum LiabilityCategory {
  Mortgage = 'Mortgage',
  Loan = 'Personal/Auto Loan',
  CreditCard = 'Credit Card Debt',
  StudentLoan = 'Student Loan',
  Other = 'Other Liabilities'
}

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