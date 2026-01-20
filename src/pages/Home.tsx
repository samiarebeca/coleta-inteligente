import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatsCard } from '@/components/StatsCard';
import { Package, TrendingDown, Warehouse, DollarSign, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockEntries, mockSales, materials, collectionPoints } from '@/data/mockData';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { user, logout } = useAuth();
  const { getStats } = useData();
  const stats = getStats();

  const formatWeight = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} ton`;
    }
    return `${kg.toFixed(0)} kg`;
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'motorista': return 'Motorista';
      case 'operador': return 'Operador de Balança';
      case 'vendedor': return 'Gestor de Vendas';
      case 'administrador': return 'Administrador';
      default: return '';
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'motorista':
        return [
          { label: 'Registrar Coleta', action: () => onNavigate('entry'), icon: Package },
          { label: 'Minhas Rotas', action: () => onNavigate('routes'), icon: TrendingDown },
        ];
      case 'operador':
        return [
          { label: 'Pesar Material', action: () => onNavigate('entry'), icon: Package },
        ];
      case 'vendedor':
        return [
          { label: 'Registrar Venda', action: () => onNavigate('sale'), icon: DollarSign },
        ];
      case 'administrador':
        return [
          { label: 'Ver Dashboard', action: () => onNavigate('dashboard'), icon: Warehouse },
          { label: 'Nova Entrada', action: () => onNavigate('entry'), icon: Package },
        ];
      default:
        return [];
    }
  };

  const recentActivity = [...mockEntries, ...mockSales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Olá, {user?.name}!</h1>
            <p className="text-primary-foreground/80 text-sm">{getRoleLabel()}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title="Entrada (mês)"
            value={formatWeight(stats.totalEntryMonth)}
            icon={Package}
            className="bg-card/95 backdrop-blur"
          />
          <StatsCard
            title="Saída (mês)"
            value={formatWeight(stats.totalExitMonth)}
            icon={TrendingDown}
            className="bg-card/95 backdrop-blur"
          />
          <StatsCard
            title="Estoque Atual"
            value={formatWeight(stats.currentStock)}
            icon={Warehouse}
            className="bg-card/95 backdrop-blur"
          />
          <StatsCard
            title="Receita (mês)"
            value={formatCurrency(stats.revenueMonth)}
            icon={DollarSign}
            className="bg-card/95 backdrop-blur"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {getQuickActions().map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  className="h-16 rounded-2xl flex flex-col gap-1 text-base font-medium"
                >
                  <Icon className="w-6 h-6" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Atividade Recente</h2>
          <div className="space-y-2">
            {recentActivity.map((activity) => {
              const material = materials.find(m => m.id === activity.materialId);
              const isEntry = 'origin' in activity;
              
              return (
                <div 
                  key={activity.id}
                  className="bg-card rounded-xl p-4 border border-border flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isEntry ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                  }`}>
                    {isEntry ? <Package className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {material?.name || 'Material'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isEntry ? 'Entrada' : 'Venda'} • {activity.weight} kg
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
