import { Home, PlusCircle, TrendingDown, MapPin, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { user } = useAuth();
  
  const getTabs = () => {
    const baseTabs = [
      { id: 'home', icon: Home, label: 'Início' },
    ];

    if (user?.role === 'motorista' || user?.role === 'operador') {
      baseTabs.push({ id: 'entry', icon: PlusCircle, label: 'Entrada' });
    }

    if (user?.role === 'vendedor') {
      baseTabs.push({ id: 'sale', icon: TrendingDown, label: 'Venda' });
    }

    if (user?.role === 'motorista') {
      baseTabs.push({ id: 'routes', icon: MapPin, label: 'Rotas' });
    }

    if (user?.role === 'administrador') {
      baseTabs.push(
        { id: 'entry', icon: PlusCircle, label: 'Entrada' },
        { id: 'sale', icon: TrendingDown, label: 'Venda' },
        { id: 'dashboard', icon: BarChart3, label: 'Dashboard' }
      );
    }

    baseTabs.push({ id: 'settings', icon: Settings, label: 'Config' });

    return baseTabs;
  };

  const tabs = getTabs();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1',
                'transition-all duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
