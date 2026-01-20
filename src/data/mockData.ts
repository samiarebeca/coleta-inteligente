import { Material, Route, CollectionPoint, Buyer, User, EntryRecord, SaleRecord } from '@/types';

export const materials: Material[] = [
  // Papel
  { id: 'papel', name: 'Papel', category: 'papel', icon: 'FileText', color: 'material-paper' },
  { id: 'papelao', name: 'Papelão', category: 'papel', icon: 'Package', color: 'material-paper' },
  // Plástico
  { id: 'pet-cristal', name: 'PET Cristal', category: 'plastico', icon: 'Wine', color: 'material-plastic' },
  { id: 'pet-colorido', name: 'PET Colorido', category: 'plastico', icon: 'Wine', color: 'material-plastic' },
  { id: 'pead', name: 'PEAD', category: 'plastico', icon: 'Droplets', color: 'material-plastic' },
  { id: 'pp', name: 'PP', category: 'plastico', icon: 'Container', color: 'material-plastic' },
  { id: 'filme', name: 'Filme', category: 'plastico', icon: 'Film', color: 'material-plastic' },
  // Metal
  { id: 'aluminio', name: 'Alumínio', category: 'metal', icon: 'CircleDot', color: 'material-metal' },
  { id: 'ferro', name: 'Ferro', category: 'metal', icon: 'Wrench', color: 'material-metal' },
  { id: 'cobre', name: 'Cobre', category: 'metal', icon: 'Cable', color: 'material-metal' },
  // Vidro
  { id: 'vidro-transp', name: 'Vidro Transparente', category: 'vidro', icon: 'GlassWater', color: 'material-glass' },
  { id: 'vidro-verde', name: 'Vidro Verde', category: 'vidro', icon: 'GlassWater', color: 'material-glass' },
  { id: 'vidro-ambar', name: 'Vidro Âmbar', category: 'vidro', icon: 'GlassWater', color: 'material-glass' },
];

export const routes: Route[] = [
  { id: 'rota-a', name: 'Rota A', dayOfWeek: 'Segunda e Quinta', points: [], active: true },
  { id: 'rota-b', name: 'Rota B', dayOfWeek: 'Terça e Sexta', points: [], active: true },
  { id: 'rota-c', name: 'Rota C', dayOfWeek: 'Quarta e Sábado', points: [], active: true },
  { id: 'rota-d', name: 'Rota D', dayOfWeek: 'Segunda a Sexta', points: [], active: true },
];

export const collectionPoints: CollectionPoint[] = [
  { id: 'cp-1', name: 'Supermercado Central', address: 'Av. Principal, 100', phone: '(11) 99999-1111', routeId: 'rota-a', type: 'comercial' },
  { id: 'cp-2', name: 'Restaurante Sabor', address: 'Rua das Flores, 50', phone: '(11) 99999-2222', routeId: 'rota-a', type: 'comercial' },
  { id: 'cp-3', name: 'Condomínio Verde', address: 'Av. Brasil, 200', phone: '(11) 99999-3333', routeId: 'rota-a', type: 'residencial' },
  { id: 'cp-4', name: 'Loja de Eletrônicos', address: 'Rua do Comércio, 75', phone: '(11) 99999-4444', routeId: 'rota-b', type: 'comercial' },
  { id: 'cp-5', name: 'Padaria Pão Quente', address: 'Rua São Paulo, 30', phone: '(11) 99999-5555', routeId: 'rota-b', type: 'comercial' },
  { id: 'cp-6', name: 'Fábrica Metalúrgica', address: 'Distrito Industrial, 500', phone: '(11) 99999-6666', routeId: 'rota-b', type: 'industrial' },
  { id: 'cp-7', name: 'Shopping Center', address: 'Av. das Nações, 1000', phone: '(11) 99999-7777', routeId: 'rota-c', type: 'comercial' },
  { id: 'cp-8', name: 'Hospital Municipal', address: 'Rua da Saúde, 150', phone: '(11) 99999-8888', routeId: 'rota-c', type: 'comercial' },
  { id: 'cp-9', name: 'Escola Estadual', address: 'Rua da Educação, 80', phone: '(11) 99999-9999', routeId: 'rota-c', type: 'comercial' },
  { id: 'cp-10', name: 'Mercado do Bairro', address: 'Rua Local, 25', phone: '(11) 98888-1111', routeId: 'rota-d', type: 'comercial' },
  { id: 'cp-11', name: 'Oficina Mecânica', address: 'Av. Industrial, 300', phone: '(11) 98888-2222', routeId: 'rota-d', type: 'industrial' },
  { id: 'cp-12', name: 'Farmácia Saúde', address: 'Rua Centro, 45', phone: '(11) 98888-3333', routeId: 'rota-d', type: 'comercial' },
  { id: 'cp-13', name: 'Bar e Restaurante', address: 'Praça Central, 10', phone: '(11) 98888-4444', routeId: 'rota-a', type: 'comercial' },
  { id: 'cp-14', name: 'Gráfica Express', address: 'Rua dos Impressos, 60', phone: '(11) 98888-5555', routeId: 'rota-b', type: 'comercial' },
  { id: 'cp-15', name: 'Condomínio Solar', address: 'Rua das Palmeiras, 400', phone: '(11) 98888-6666', routeId: 'rota-c', type: 'residencial' },
  { id: 'cp-16', name: 'Posto de Gasolina', address: 'Av. Principal, 800', phone: '(11) 98888-7777', routeId: 'rota-d', type: 'comercial' },
  { id: 'cp-17', name: 'Escritório Advocacia', address: 'Rua Jurídica, 120', phone: '(11) 98888-8888', routeId: 'rota-a', type: 'comercial' },
  { id: 'cp-18', name: 'Clínica Veterinária', address: 'Rua dos Animais, 35', phone: '(11) 98888-9999', routeId: 'rota-b', type: 'comercial' },
  { id: 'cp-19', name: 'Academia Fitness', address: 'Av. Esportes, 200', phone: '(11) 97777-1111', routeId: 'rota-c', type: 'comercial' },
  { id: 'cp-20', name: 'Papelaria Escolar', address: 'Rua Estudante, 55', phone: '(11) 97777-2222', routeId: 'rota-d', type: 'comercial' },
];

export const buyers: Buyer[] = [
  { id: 'buyer-1', name: 'Reciclagem São Paulo', phone: '(11) 3333-1111', materials: ['papel', 'papelao', 'pet-cristal', 'pet-colorido'] },
  { id: 'buyer-2', name: 'MetalBrasil Ltda', phone: '(11) 3333-2222', materials: ['aluminio', 'ferro', 'cobre'] },
  { id: 'buyer-3', name: 'VidroRecicla', phone: '(11) 3333-3333', materials: ['vidro-transp', 'vidro-verde', 'vidro-ambar'] },
];

export const mockUsers: User[] = [
  { id: 'user-1', name: 'João Motorista', role: 'motorista' },
  { id: 'user-2', name: 'Maria Operadora', role: 'operador' },
  { id: 'user-3', name: 'Carlos Vendedor', role: 'vendedor' },
  { id: 'user-4', name: 'Ana Administradora', role: 'administrador' },
];

// Mock entries for the current month
export const mockEntries: EntryRecord[] = [
  { id: 'e1', materialId: 'papelao', weight: 150, origin: 'Supermercado Central', originType: 'cliente', routeId: 'rota-a', collectionPointId: 'cp-1', userId: 'user-1', createdAt: new Date(2025, 0, 5) },
  { id: 'e2', materialId: 'pet-cristal', weight: 80, origin: 'Restaurante Sabor', originType: 'cliente', routeId: 'rota-a', collectionPointId: 'cp-2', userId: 'user-1', createdAt: new Date(2025, 0, 5) },
  { id: 'e3', materialId: 'aluminio', weight: 45, origin: 'Catador Avulso', originType: 'catador_avulso', userId: 'user-2', createdAt: new Date(2025, 0, 6) },
  { id: 'e4', materialId: 'papel', weight: 200, origin: 'Gráfica Express', originType: 'cliente', routeId: 'rota-b', collectionPointId: 'cp-14', userId: 'user-1', createdAt: new Date(2025, 0, 8) },
  { id: 'e5', materialId: 'ferro', weight: 300, origin: 'Fábrica Metalúrgica', originType: 'cliente', routeId: 'rota-b', collectionPointId: 'cp-6', userId: 'user-1', createdAt: new Date(2025, 0, 10) },
  { id: 'e6', materialId: 'vidro-transp', weight: 120, origin: 'Bar e Restaurante', originType: 'cliente', routeId: 'rota-a', collectionPointId: 'cp-13', userId: 'user-2', createdAt: new Date(2025, 0, 12) },
  { id: 'e7', materialId: 'pead', weight: 60, origin: 'Catador Avulso', originType: 'catador_avulso', userId: 'user-2', createdAt: new Date(2025, 0, 14) },
  { id: 'e8', materialId: 'cobre', weight: 25, origin: 'Oficina Mecânica', originType: 'cliente', routeId: 'rota-d', collectionPointId: 'cp-11', userId: 'user-1', createdAt: new Date(2025, 0, 15) },
];

export const mockSales: SaleRecord[] = [
  { id: 's1', materialId: 'papelao', weight: 100, buyerId: 'buyer-1', pricePerKg: 0.50, totalValue: 50, userId: 'user-3', createdAt: new Date(2025, 0, 10) },
  { id: 's2', materialId: 'aluminio', weight: 30, buyerId: 'buyer-2', pricePerKg: 5.00, totalValue: 150, userId: 'user-3', createdAt: new Date(2025, 0, 12) },
  { id: 's3', materialId: 'pet-cristal', weight: 50, buyerId: 'buyer-1', pricePerKg: 1.20, totalValue: 60, userId: 'user-3', createdAt: new Date(2025, 0, 15) },
  { id: 's4', materialId: 'ferro', weight: 200, buyerId: 'buyer-2', pricePerKg: 0.80, totalValue: 160, userId: 'user-3', createdAt: new Date(2025, 0, 18) },
];

export const materialPrices: Record<string, number> = {
  'papel': 0.30,
  'papelao': 0.50,
  'pet-cristal': 1.20,
  'pet-colorido': 0.80,
  'pead': 1.00,
  'pp': 0.90,
  'filme': 0.60,
  'aluminio': 5.00,
  'ferro': 0.80,
  'cobre': 25.00,
  'vidro-transp': 0.15,
  'vidro-verde': 0.12,
  'vidro-ambar': 0.10,
};
