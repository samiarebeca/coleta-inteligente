import { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaterialIcon } from '@/components/MaterialIcon';
import { materials, buyers, materialPrices } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SaleFormProps {
  onBack: () => void;
}

type MaterialCategory = 'papel' | 'plastico' | 'metal' | 'vidro';

const categories: { id: MaterialCategory; label: string }[] = [
  { id: 'papel', label: 'Papel' },
  { id: 'plastico', label: 'Plástico' },
  { id: 'metal', label: 'Metal' },
  { id: 'vidro', label: 'Vidro' },
];

export default function SaleForm({ onBack }: SaleFormProps) {
  const { user } = useAuth();
  const { addSale } = useData();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [totalValue, setTotalValue] = useState(0);

  const filteredMaterials = selectedCategory 
    ? materials.filter(m => m.category === selectedCategory)
    : [];

  // Auto-calculate total value
  useEffect(() => {
    const weightNum = parseFloat(weight) || 0;
    const priceNum = parseFloat(pricePerKg) || 0;
    setTotalValue(weightNum * priceNum);
  }, [weight, pricePerKg]);

  // Auto-fill price when material is selected
  useEffect(() => {
    if (selectedMaterial && materialPrices[selectedMaterial]) {
      setPricePerKg(materialPrices[selectedMaterial].toFixed(2));
    }
  }, [selectedMaterial]);

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

    if (!selectedBuyer) {
      toast.error('Selecione o comprador');
      return;
    }

    if (!pricePerKg || parseFloat(pricePerKg) <= 0) {
      toast.error('Digite o preço por kg');
      return;
    }

    addSale({
      materialId: selectedMaterial,
      weight: parseFloat(weight),
      buyerId: selectedBuyer,
      pricePerKg: parseFloat(pricePerKg),
      totalValue,
      userId: user?.id || '',
    });

    toast.success('Venda registrada com sucesso!');
    
    // Reset form
    setSelectedMaterial(null);
    setSelectedCategory(null);
    setWeight('');
    setSelectedBuyer('');
    setPricePerKg('');
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-warning text-white p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">Registrar Venda</h1>
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

        {/* Buyer Selection */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Comprador</Label>
          <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
            <SelectTrigger className="h-14 text-lg rounded-xl">
              <SelectValue placeholder="Selecione o comprador" />
            </SelectTrigger>
            <SelectContent>
              {buyers.map((buyer) => (
                <SelectItem key={buyer.id} value={buyer.id}>
                  {buyer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Per Kg */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-base font-semibold">Preço por Kg (R$)</Label>
          <Input
            id="price"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
            className="h-14 text-xl font-bold text-center rounded-xl"
          />
        </div>

        {/* Total Value Display */}
        <div className="bg-primary/10 rounded-2xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(totalValue)}</p>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit"
          className="w-full h-16 text-xl font-bold rounded-xl shadow-lg bg-warning hover:bg-warning/90"
        >
          <DollarSign className="w-6 h-6 mr-2" />
          REGISTRAR VENDA
        </Button>
      </form>
    </div>
  );
}
