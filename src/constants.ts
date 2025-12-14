import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from './types';
import type { FinancialItem, AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  inflationRate: 2.5,
  projectionYears: 20,
  currencySymbol: '$',
};

export const INITIAL_ITEMS: FinancialItem[] = [
  {
    id: '1',
    name: 'Primary Residence',
    amount: 850000,
    type: 'asset',
    category: ASSET_CATEGORIES.RealEstate,
    interestRate: 4.0,
  },
  {
    id: '2',
    name: 'Brokerage Account',
    amount: 320000,
    type: 'asset',
    category: ASSET_CATEGORIES.Stocks,
    interestRate: 8.0,
  },
  {
    id: '3',
    name: 'Emergency Fund',
    amount: 50000,
    type: 'asset',
    category: ASSET_CATEGORIES.Cash,
    interestRate: 4.5,
  },
  {
    id: '4',
    name: 'Home Mortgage',
    amount: 500000,
    type: 'liability',
    category: LIABILITY_CATEGORIES.Mortgage,
    interestRate: 3.5,
  },
  {
    id: '5',
    name: 'Car Loan',
    amount: 25000,
    type: 'liability',
    category: LIABILITY_CATEGORIES.Loan,
    interestRate: 6.0,
  },
];