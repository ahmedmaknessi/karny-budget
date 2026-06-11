import type { Category } from '@/drizzle/schema';

export const DEFAULT_CATEGORIES: Omit<Category, 'userId'>[] = [
  { id: 'cat_food',          name: 'Food & Drink',     icon: 'UtensilsCrossed', color: '#F59E0B', type: 'EXPENSE' },
  { id: 'cat_transport',     name: 'Transport',        icon: 'Car',             color: '#3B82F6', type: 'EXPENSE' },
  { id: 'cat_shopping',      name: 'Shopping',         icon: 'ShoppingBag',     color: '#F97316', type: 'EXPENSE' },
  { id: 'cat_bills',         name: 'Housing',          icon: 'Home',            color: '#8B5CF6', type: 'EXPENSE' },
  { id: 'cat_health',        name: 'Health',           icon: 'HeartPulse',      color: '#EF4444', type: 'EXPENSE' },
  { id: 'cat_entertainment', name: 'Entertainment',    icon: 'Tv2',             color: '#EC4899', type: 'EXPENSE' },
  { id: 'cat_education',     name: 'Education',        icon: 'GraduationCap',   color: '#06B6D4', type: 'EXPENSE' },
  { id: 'cat_savings',       name: 'Savings',          icon: 'PiggyBank',       color: '#10B981', type: 'BOTH'    },
  { id: 'cat_salary',        name: 'Salary',           icon: 'Banknote',        color: '#10B981', type: 'INCOME'  },
  { id: 'cat_other',         name: 'Other',            icon: 'LayoutGrid',      color: '#6B7280', type: 'BOTH'    },
];
