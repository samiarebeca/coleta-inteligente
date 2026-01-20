import { useState } from 'react';
import { ArrowLeft, MapPin, Play, Square, ChevronRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routes, collectionPoints, mockEntries, materials } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface RoutesProps {
  onBack: () => void;
}

export default function Routes({ onBack }: RoutesProps) {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const route = routes.find(r => r.id === selectedRoute);
  const routePoints = collectionPoints.filter(cp => cp.routeId === selectedRoute);

  const getPointStats = (pointId: string) => {
    const entries = mockEntries.filter(e => e.collectionPointId === pointId);
    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    const lastCollection = entries.length > 0 
      ? new Date(Math.max(...entries.map(e => new Date(e.createdAt).getTime())))
      : null;
    
    return { totalWeight, lastCollection, count: entries.length };
  };

  const handleStartCollection = (routeId: string) => {
    setActiveCollection(routeId);
  };

  const handleEndCollection = () => {
    setActiveCollection(null);
  };

  if (selectedRoute && route) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-info text-white p-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedRoute(null)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{route.name}</h1>
            <p className="text-sm text-white/80">{route.dayOfWeek}</p>
          </div>
          {activeCollection === route.id ? (
            <Button 
              onClick={handleEndCollection}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Square className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          ) : (
            <Button 
              onClick={() => handleStartCollection(route.id)}
              className="bg-success hover:bg-success/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          )}
        </div>

        {/* Collection Points */}
        <div className="p-4 space-y-3">
          <h2 className="text-lg font-semibold">Pontos de Coleta ({routePoints.length})</h2>
          
          {routePoints.map((point) => {
            const stats = getPointStats(point.id);
            
            return (
              <div 
                key={point.id}
                className="bg-card rounded-2xl p-4 border border-border space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-info" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{point.name}</h3>
                    <p className="text-sm text-muted-foreground">{point.address}</p>
                    <span className={cn(
                      'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      point.type === 'comercial' && 'bg-primary/10 text-primary',
                      point.type === 'residencial' && 'bg-success/10 text-success',
                      point.type === 'industrial' && 'bg-warning/10 text-warning'
                    )}>
                      {point.type.charAt(0).toUpperCase() + point.type.slice(1)}
                    </span>
                  </div>
                  {point.phone && (
                    <a href={`tel:${point.phone}`} className="p-2 text-muted-foreground hover:text-primary">
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{stats.count}</p>
                    <p className="text-xs text-muted-foreground">Coletas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{stats.totalWeight} kg</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">
                      {stats.lastCollection 
                        ? stats.lastCollection.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                        : '-'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">Última</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-info text-white p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">Controle de Rotas</h1>
      </div>

      {/* Routes List */}
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Rotas Ativas</h2>
        
        {routes.map((route) => {
          const points = collectionPoints.filter(cp => cp.routeId === route.id);
          const isActive = activeCollection === route.id;
          
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route.id)}
              className={cn(
                'w-full bg-card rounded-2xl p-4 border transition-all text-left',
                isActive 
                  ? 'border-success shadow-lg' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold',
                  isActive ? 'bg-success text-white' : 'bg-info/10 text-info'
                )}>
                  {route.name.split(' ')[1]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-foreground">{route.name}</h3>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-success text-white text-xs rounded-full animate-pulse">
                        Em andamento
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{route.dayOfWeek}</p>
                  <p className="text-sm text-primary font-medium">{points.length} pontos de coleta</p>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
