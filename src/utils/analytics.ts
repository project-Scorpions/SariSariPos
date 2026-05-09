import type { Sale } from '../types';

const isSameCalendarDay = (isoDate: string, today = new Date()): boolean => {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

const getCashBasisDate = (sale: Sale): string => sale.settledAt ?? sale.timestamp;

export const getCategorySalesToday = (sales: Sale[]): Record<string, number> => {
  const summary: Record<string, number> = {};
  sales
    .filter((s) => !s.isUtang)
    .filter((s) => isSameCalendarDay(getCashBasisDate(s)))
    .forEach((sale) => {
      sale.items.forEach((item) => {
        const amount = item.price * item.quantity;
        summary[item.category] = (summary[item.category] ?? 0) + amount;
      });
    });

  return summary;
};

export const getMonthlyCashSales = (sales: Sale[]): Record<string, number> => {
  const monthly: Record<string, number> = {};
  sales
    .filter((s) => !s.isUtang)
    .forEach((sale) => {
      const d = new Date(getCashBasisDate(sale));
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      monthly[key] = (monthly[key] ?? 0) + sale.total;
    });
  return monthly;
};
