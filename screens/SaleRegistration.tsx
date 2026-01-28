
import React, { useState } from 'react';
import { Screen } from '../App';

interface SaleRegistrationProps {
  navigate: (screen: Screen) => void;
  onSuccess: () => void;
}

const SaleRegistration: React.FC<SaleRegistrationProps> = ({ navigate, onSuccess }) => {
  const [selectedMaterial, setSelectedMaterial] = useState('PET');
  const [selectedSubclass, setSelectedSubclass] = useState('');
  const [weight, setWeight] = useState(100);
  const [unitPrice, setUnitPrice] = useState(3.50);

  const subclasses: Record<string, string[]> = {
    'PET': ['Cristal', 'Verde', 'Colorido'],
    'Papelão': ['Ondulado', 'Kraft', 'Misto'],
    'Alumínio': ['Lata', 'Perfil'],
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
        <section>
          <h3 className="text-xl font-bold mb-4">Material</h3>
          <div className="grid grid-cols-3 gap-3">
            {['PET', 'Papelão', 'Alumínio'].map(m => (
              <button key={m} onClick={() => { setSelectedMaterial(m); setSelectedSubclass(''); }} className={`h-20 rounded-2xl border-2 font-bold transition-all ${selectedMaterial === m ? 'border-[#10c65c] bg-[#10c65c]/5 text-[#10c65c]' : 'border-gray-100 bg-white text-gray-400'}`}>
                {m}
              </button>
            ))}
          </div>
        </section>

        {subclasses[selectedMaterial] && (
            <div className="animate-page">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Subclassificação</h3>
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
              <button onClick={() => setWeight(w => Math.max(0, w-10))} className="size-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">remove</span></button>
              <input type="number" className="flex-1 bg-transparent text-center text-2xl font-black outline-none" value={weight} onChange={e => setWeight(Number(e.target.value))} />
              <button onClick={() => setWeight(w => w+10)} className="size-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#10c65c]"><span className="material-symbols-outlined">add</span></button>
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
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-100 z-30">
        <button onClick={onSuccess} className="h-16 w-full bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span className="material-symbols-outlined">payments</span> FINALIZAR VENDA
        </button>
      </footer>
    </div>
  );
};

export default SaleRegistration;
