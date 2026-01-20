import { ArrowLeft, Users, Building2, ShoppingBag, MapPin, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { collectionPoints, buyers, routes, materials } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { 
      icon: Building2, 
      label: 'Clientes / Pontos', 
      count: collectionPoints.length,
      description: 'Gerenciar pontos de coleta'
    },
    { 
      icon: ShoppingBag, 
      label: 'Compradores', 
      count: buyers.length,
      description: 'Gerenciar compradores'
    },
    { 
      icon: MapPin, 
      label: 'Rotas', 
      count: routes.length,
      description: 'Gerenciar rotas de coleta'
    },
    { 
      icon: FileText, 
      label: 'Materiais', 
      count: materials.length,
      description: 'Ver tipos de materiais'
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-muted p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-foreground hover:bg-foreground/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">Configurações</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{user?.name}</h2>
              <p className="text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {user?.role === 'administrador' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-muted-foreground px-1">Cadastros</h3>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className="w-full bg-card rounded-2xl p-4 border border-border flex items-center gap-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.label}</h3>
                      <span className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Logout */}
        <Button 
          onClick={logout}
          variant="destructive"
          className="w-full h-14 text-lg font-semibold rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair do Sistema
        </Button>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>ReciclaPro v1.0</p>
          <p>Gestão de Materiais Recicláveis</p>
        </div>
      </div>
    </div>
  );
}
