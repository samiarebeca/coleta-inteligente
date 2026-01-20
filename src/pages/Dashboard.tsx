import { ArrowLeft, Package, TrendingDown, Warehouse, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { useData } from '@/contexts/DataContext';
import { materials, collectionPoints, mockEntries } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from 'recharts';

interface DashboardProps {
  onBack: () => void;
}

const COLORS = ['hsl(145, 63%, 32%)', 'hsl(30, 90%, 55%)', 'hsl(270, 60%, 55%)', 'hsl(220, 10%, 50%)', 'hsl(199, 89%, 48%)'];

export default function Dashboard({ onBack }: DashboardProps) {
  const { getStats, getStockByMaterial, getMonthlyRevenue, entries, sales } = useData();
  const stats = getStats();
  const stockByMaterial = getStockByMaterial();
  const monthlyRevenue = getMonthlyRevenue();

  const formatWeight = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} ton`;
    }
    return `${kg.toFixed(0)} kg`;
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Get material volume data for bar chart
  const getMaterialVolumeData = () => {
    const entryByMaterial: Record<string, number> = {};
    const saleByMaterial: Record<string, number> = {};

    entries.forEach(e => {
      entryByMaterial[e.materialId] = (entryByMaterial[e.materialId] || 0) + e.weight;
    });

    sales.forEach(s => {
      saleByMaterial[s.materialId] = (saleByMaterial[s.materialId] || 0) + s.weight;
    });

    return materials.slice(0, 6).map(m => ({
      name: m.name.length > 8 ? m.name.substring(0, 8) + '...' : m.name,
      entrada: entryByMaterial[m.id] || 0,
      saida: saleByMaterial[m.id] || 0,
    }));
  };

  // Get top clients by volume
  const getTopClients = () => {
    const volumeByClient: Record<string, number> = {};

    entries.forEach(e => {
      if (e.collectionPointId) {
        volumeByClient[e.collectionPointId] = (volumeByClient[e.collectionPointId] || 0) + e.weight;
      }
    });

    return Object.entries(volumeByClient)
      .map(([pointId, volume]) => {
        const point = collectionPoints.find(cp => cp.id === pointId);
        return { name: point?.name || 'Desconhecido', volume };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  };

  const materialVolumeData = getMaterialVolumeData();
  const topClients = getTopClients();

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
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title="Entrada (mês)"
            value={formatWeight(stats.totalEntryMonth)}
            icon={Package}
          />
          <StatsCard
            title="Saída (mês)"
            value={formatWeight(stats.totalExitMonth)}
            icon={TrendingDown}
          />
          <StatsCard
            title="Estoque Atual"
            value={formatWeight(stats.currentStock)}
            icon={Warehouse}
          />
          <StatsCard
            title="Receita (mês)"
            value={formatCurrency(stats.revenueMonth)}
            icon={DollarSign}
          />
        </div>

        {/* Bar Chart - Material Volume */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-semibold mb-4">Volume por Material (kg)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="entrada" fill="hsl(145, 63%, 32%)" name="Entrada" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saida" fill="hsl(38, 92%, 50%)" name="Saída" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-xs text-muted-foreground">Entrada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-warning" />
              <span className="text-xs text-muted-foreground">Saída</span>
            </div>
          </div>
        </div>

        {/* Pie Chart - Stock Composition */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-semibold mb-4">Composição do Estoque</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockByMaterial}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="weight"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stockByMaterial.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} kg`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Revenue Evolution */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-semibold mb-4">Evolução da Receita</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(145, 63%, 32%)" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(145, 63%, 32%)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients Table */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-semibold mb-4">Top Clientes por Volume</h3>
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{client.name}</p>
                </div>
                <span className="font-semibold text-primary">{client.volume} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
