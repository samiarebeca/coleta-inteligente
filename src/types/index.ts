export type UserRole = 'motorista' | 'operador' | 'vendedor' | 'administrador';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type MaterialCategory = 'papel' | 'plastico' | 'metal' | 'vidro';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  icon: string;
  color: string;
}

export interface Route {
  id: string;
  name: string;
  dayOfWeek: string;
  points: CollectionPoint[];
  active: boolean;
}

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  phone?: string;
  routeId: string;
  type: 'comercial' | 'residencial' | 'industrial';
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  materials: string[];
}

export interface EntryRecord {
  id: string;
  materialId: string;
  weight: number;
  origin: string;
  originType: 'cliente' | 'catador_avulso';
  routeId?: string;
  collectionPointId?: string;
  userId: string;
  createdAt: Date;
}

export interface SaleRecord {
  id: string;
  materialId: string;
  weight: number;
  buyerId: string;
  pricePerKg: number;
  totalValue: number;
  userId: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalEntryMonth: number;
  totalExitMonth: number;
  currentStock: number;
  revenueMonth: number;
}
