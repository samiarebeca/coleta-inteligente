import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaterialIcon } from '@/components/MaterialIcon';
import { materials, collectionPoints, routes } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EntryFormProps {
  onBack: () => void;
}

type MaterialCategory = 'papel' | 'plastico' | 'metal' | 'vidro';

const categories: { id: MaterialCategory; label: string }[] = [
  { id: 'papel', label: 'Papel' },
  { id: 'plastico', label: 'Plástico' },
  { id: 'metal', label: 'Metal' },
  { id: 'vidro', label: 'Vidro' },
];

export default function EntryForm({ onBack }: EntryFormProps) {
  const { user } = useAuth();
  const { addEntry } = useData();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [originType, setOriginType] = useState<'cliente' | 'catador_avulso'>('cliente');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  const isDriver = user?.role === 'motorista';

  const filteredMaterials = selectedCategory 
    ? materials.filter(m => m.category === selectedCategory)
    : [];

  const routePoints = selectedRoute 
    ? collectionPoints.filter(cp => cp.routeId === selectedRoute)
    : collectionPoints;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMaterial) {
      toast.error('Selecione um material');
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      toast.error('Digite o peso');
      return;
    }

    if (originType === 'cliente' && !selectedClient) {
      toast.error('Selecione o cliente');
      return;
    }

    addEntry({
      materialId: selectedMaterial,
      weight: parseFloat(weight),
      origin: originType === 'catador_avulso' ? 'Catador Avulso' : selectedClient,
      originType,
      routeId: isDriver ? selectedRoute : undefined,
      collectionPointId: originType === 'cliente' ? selectedClient : undefined,
      userId: user?.id || '',
    });

    toast.success('Entrada registrada com sucesso!');
    
    // Reset form
    setSelectedMaterial(null);
    setWeight('');
    setSelectedClient('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">Registrar Entrada</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Tipo de Material</Label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedMaterial(null);
                }}
                className={cn(
                  'py-3 px-2 rounded-xl text-sm font-medium transition-all',
                  selectedCategory === cat.id
                    ? `bg-material-${cat.id} text-white`
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Material Icons */}
        {selectedCategory && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Selecione o Material</Label>
            <div className="grid grid-cols-3 gap-2">
              {filteredMaterials.map((material) => (
                <MaterialIcon
                  key={material.id}
                  icon={material.icon}
                  category={material.category}
                  label={material.name}
                  selected={selectedMaterial === material.id}
                  onClick={() => setSelectedMaterial(material.id)}
                  size="lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Weight Input */}
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-base font-semibold">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-16 text-2xl font-bold text-center rounded-xl"
          />
        </div>

        {/* Driver: Route Selection */}
        {isDriver && (
          <div className="space-y-2">
            <Label className="text-base font-semibold">Rota</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger className="h-14 text-lg rounded-xl">
                <SelectValue placeholder="Selecione a rota" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name} - {route.dayOfWeek}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Origin Type */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Origem</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOriginType('cliente')}
              className={cn(
                'py-4 rounded-xl font-medium transition-all',
                originType === 'cliente'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground'
              )}
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => setOriginType('catador_avulso')}
              className={cn(
                'py-4 rounded-xl font-medium transition-all',
                originType === 'catador_avulso'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground'
              )}
            >
              Catador Avulso
            </button>
          </div>
        </div>

        {/* Client Selection */}
        {originType === 'cliente' && (
          <div className="space-y-2">
            <Label className="text-base font-semibold">Cliente / Ponto de Coleta</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="h-14 text-lg rounded-xl">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {routePoints.map((point) => (
                  <SelectItem key={point.id} value={point.id}>
                    {point.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit"
          className="w-full h-16 text-xl font-bold rounded-xl shadow-lg"
        >
          <Save className="w-6 h-6 mr-2" />
          SALVAR ENTRADA
        </Button>
      </form>
    </div>
  );
}
