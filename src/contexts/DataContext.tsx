import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EntryRecord, SaleRecord, DashboardStats } from '@/types';
import { mockEntries, mockSales, materials } from '@/data/mockData';

interface DataContextType {
  entries: EntryRecord[];
  sales: SaleRecord[];
  addEntry: (entry: Omit<EntryRecord, 'id' | 'createdAt'>) => void;
  addSale: (sale: Omit<SaleRecord, 'id' | 'createdAt'>) => void;
  getStats: () => DashboardStats;
  getStockByMaterial: () => { name: string; weight: number; color: string }[];
  getMonthlyRevenue: () => { month: string; revenue: number }[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<EntryRecord[]>(mockEntries);
  const [sales, setSales] = useState<SaleRecord[]>(mockSales);

  const addEntry = (entry: Omit<EntryRecord, 'id' | 'createdAt'>) => {
    const newEntry: EntryRecord = {
      ...entry,
      id: `e${Date.now()}`,
      createdAt: new Date(),
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const addSale = (sale: Omit<SaleRecord, 'id' | 'createdAt'>) => {
    const newSale: SaleRecord = {
      ...sale,
      id: `s${Date.now()}`,
      createdAt: new Date(),
    };
    setSales(prev => [...prev, newSale]);
  };

  const getStats = (): DashboardStats => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthEntries = entries.filter(e => {
      const date = new Date(e.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthSales = sales.filter(s => {
      const date = new Date(s.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalEntry = monthEntries.reduce((sum, e) => sum + e.weight, 0);
    const totalExit = monthSales.reduce((sum, s) => sum + s.weight, 0);
    const revenue = monthSales.reduce((sum, s) => sum + s.totalValue, 0);

    // Calculate stock (all time entries minus all time sales per material)
    const entryByMaterial: Record<string, number> = {};
    const saleByMaterial: Record<string, number> = {};

    entries.forEach(e => {
      entryByMaterial[e.materialId] = (entryByMaterial[e.materialId] || 0) + e.weight;
    });

    sales.forEach(s => {
      saleByMaterial[s.materialId] = (saleByMaterial[s.materialId] || 0) + s.weight;
    });

    let currentStock = 0;
    Object.keys(entryByMaterial).forEach(materialId => {
      currentStock += (entryByMaterial[materialId] || 0) - (saleByMaterial[materialId] || 0);
    });

    return {
      totalEntryMonth: totalEntry,
      totalExitMonth: totalExit,
      currentStock: Math.max(0, currentStock),
      revenueMonth: revenue,
    };
  };

  const getStockByMaterial = () => {
    const entryByMaterial: Record<string, number> = {};
    const saleByMaterial: Record<string, number> = {};

    entries.forEach(e => {
      entryByMaterial[e.materialId] = (entryByMaterial[e.materialId] || 0) + e.weight;
    });

    sales.forEach(s => {
      saleByMaterial[s.materialId] = (saleByMaterial[s.materialId] || 0) + s.weight;
    });

    return materials.map(m => ({
      name: m.name,
      weight: Math.max(0, (entryByMaterial[m.id] || 0) - (saleByMaterial[m.id] || 0)),
      color: m.color,
    })).filter(m => m.weight > 0);
  };

  const getMonthlyRevenue = () => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const result: { month: string; revenue: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthRevenue = sales
        .filter(s => {
          const saleDate = new Date(s.createdAt);
          return saleDate.getMonth() === month && saleDate.getFullYear() === year;
        })
        .reduce((sum, s) => sum + s.totalValue, 0);

      result.push({
        month: monthNames[month],
        revenue: monthRevenue,
      });
    }

    return result;
  };

  return (
    <DataContext.Provider value={{ entries, sales, addEntry, addSale, getStats, getStockByMaterial, getMonthlyRevenue }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
