import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';

interface SaleRegistrationProps {
  navigate: (screen: Screen) => void;
  onSuccess: () => void;
}

const SaleRegistration: React.FC<SaleRegistrationProps> = ({ navigate, onSuccess }) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedSubclass, setSelectedSubclass] = useState('');
  const [weight, setWeight] = useState(100);
  const [unitPrice, setUnitPrice] = useState(3.50);

  const [buyers, setBuyers] = useState<any[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [loading, setLoading] = useState(false);

  const subclasses: Record<string, string[]> = {
    'PET': ['Cristal', 'Verde', 'Colorido'],
    'Papelão': ['Ondulado', 'Kraft', 'Misto'],
    'Alumínio': ['Lata', 'Perfil'],
    'Plástico': ['PVC', 'PEAD', 'PP', 'PS'],
    'Vidro': ['Incolor', 'Ambar', 'Verde']
  };

  useEffect(() => {
    // Fetch active buyers
    const fetchBuyers = async () => {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('active', true);

      if (data) {
        setBuyers(data);
      }
      if (error) {
        console.error('Error fetching buyers:', error);
      }
    };

    const fetchMaterials = async () => {
      const { data } = await supabase.from('materials').select('*').order('name');
      if (data) {
        setMaterials(data);
        if (data.length > 0) {
          setSelectedMaterial(data[0].name);
        }
      }
    };

    fetchBuyers();
    fetchMaterials();
  }, []);

  const handleFinalize = async () => {
    if (!selectedBuyerId) {
      alert("Selecione um comprador!");
      return;
    }
    if (weight <= 0 || unitPrice <= 0) {
      alert("Peso e Preço devem ser maiores que zero.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sales')
        .insert({
          buyer_id: selectedBuyerId,
          material: selectedMaterial,
          subclass: selectedSubclass,
          weight: weight,
          price_per_kg: unitPrice,
          total_value: weight * unitPrice
        });

      if (error) throw error;

      alert("Venda realizada com sucesso!");
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar venda:", error);
      alert("Erro ao registrar venda: " + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
        <button onClick={() => navigate('ADMIN_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center pr-10 text-xl font-bold">Registrar Venda</h2>
      </header>

      <main className="flex-1 p-4 pb-48 flex flex-col gap-6 overflow-y-auto no-scrollbar">

        {/* Buyer Selection */}
        <section>
          <h3 className="text-xl font-bold mb-2">Comprador</h3>
          <p className="text-xs text-gray-400 font-medium mb-3">Selecione para quem você está vendendo</p>
          <div className="relative">
            <select
              value={selectedBuyerId}
              onChange={(e) => setSelectedBuyerId(e.target.value)}
              className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#10c65c] appearance-none"
            >
              <option value="">Selecione um comprador...</option>
              {buyers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold mb-4">Material</h3>
          <div className="grid grid-cols-3 gap-3">
            {materials.map(m => (
              <button key={m.id} onClick={() => { setSelectedMaterial(m.name); setSelectedSubclass(''); }} className={`h-20 rounded-2xl border-2 font-bold flex flex-col items-center justify-center transition-all ${selectedMaterial === m.name ? 'border-[#10c65c] bg-[#10c65c]/5 text-[#10c65c]' : 'border-gray-100 bg-white text-gray-400'}`}>
                <span className="text-sm">{m.name}</span>
                {m.subclass && <span className="text-[9px] font-normal opacity-70">{m.subclass}</span>}
              </button>
            ))}
          </div>
        </section>

        {subclasses[selectedMaterial] && (
          <div className="animate-page">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Subclassificação ({selectedMaterial})</h3>
            <div className="flex flex-wrap gap-2">
              {subclasses[selectedMaterial].map(sub => (
                <button key={sub} onClick={() => setSelectedSubclass(sub)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selectedSubclass === sub ? 'border-[#10c65c] bg-[#10c65c] text-white' : 'border-gray-200 bg-white text-gray-500'}`}>{sub}</button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-400 block mb-2">Peso da Venda (kg)</label>
            <div className="flex items-center h-16 bg-gray-50 rounded-2xl border-2 border-gray-100 px-2 focus-within:border-[#10c65c]">
              <button onClick={() => setWeight(w => Math.max(0, w - 10))} className="size-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">remove</span></button>
              <input type="number" className="flex-1 bg-transparent text-center text-2xl font-black outline-none" value={weight} onChange={e => setWeight(Number(e.target.value))} />
              <button onClick={() => setWeight(w => w + 10)} className="size-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#10c65c]"><span className="material-symbols-outlined">add</span></button>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-400 block mb-2">Preço Unitário (R$/kg)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">R$</span>
              <input type="number" step="0.10" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 pl-12 pr-4 text-xl font-bold outline-none focus:border-[#10c65c]" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Estimado</span>
            <span className="text-3xl font-black text-[#10c65c]">R$ {(weight * unitPrice).toFixed(2)}</span>
          </div>

          <button onClick={handleFinalize} disabled={loading} className="h-14 w-full bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-black/20">
            <span className="material-symbols-outlined">payments</span>
            {loading ? 'FINALIZANDO...' : 'FINALIZAR VENDA'}
          </button>

          <button onClick={() => navigate('SALES_HISTORY')} className="h-14 w-full bg-white text-gray-800 border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-50">
            <span className="material-symbols-outlined">list_alt</span>
            VER REGISTROS
          </button>
        </div>
      </main>
    </div>
  );
};
export default SaleRegistration;
