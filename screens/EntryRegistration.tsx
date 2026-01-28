
import React, { useState } from 'react';
import { Screen } from '../App';

interface EntryRegistrationProps {
  navigate: (screen: Screen) => void;
  onSuccess: () => void;
  userRole: 'admin' | 'associate' | 'driver';
}

const EntryRegistration: React.FC<EntryRegistrationProps> = ({ navigate, onSuccess, userRole }) => {
  const [type, setType] = useState<'ASSOCIADO' | 'AVULSO'>('ASSOCIADO');
  const [selectedMaterial, setSelectedMaterial] = useState('Pet');
  const [selectedSubclass, setSelectedSubclass] = useState('');
  const [otherMaterialName, setOtherMaterialName] = useState('');
  const [weight, setWeight] = useState('0');

  // Logic to determine back destination
  const handleBack = () => {
    if (userRole === 'associate') {
      navigate('ASSOCIATE_DASHBOARD');
    } else {
      navigate('ADMIN_DASHBOARD');
    }
  };

  const subclasses: Record<string, string[]> = {
    'Pet': ['Cristal', 'Verde', 'Óleo', 'Colorido'],
    'Papelão': ['Ondulado', 'Kraft', 'Misto'],
    'Alumínio': ['Lata', 'Perfil', 'Panela', 'Cabo'],
    'Vidro': ['Garrafa', 'Pote', 'Caco Limpo'],
    'Ferro': ['Miúdo', 'Pesado'],
    'Outros': []
  };

  const handleKeypad = (k: string) => {
    if (k === 'delete') {
      setWeight(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (k === '.') {
      if (!weight.includes('.')) {
        setWeight(prev => prev + '.');
      }
    } else {
      setWeight(prev => prev === '0' ? k : prev + k);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white p-4 shadow-sm z-20 flex items-center">
        <button onClick={handleBack} className="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center pr-10 text-xl font-bold">
            {userRole === 'associate' ? 'Entregar Material' : 'Registrar Entrada'}
        </h2>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6 pb-40 overflow-y-auto no-scrollbar">
        
        {/* Admin Features: Toggle Type and Search User */}
        {userRole === 'admin' && (
            <>
                <div className="flex bg-[#e7f3ec] p-1 rounded-2xl h-12">
                <button onClick={() => setType('ASSOCIADO')} className={`flex-1 rounded-xl text-xs font-bold transition-all ${type === 'ASSOCIADO' ? 'bg-[#10c65c] text-white' : 'text-[#4c9a6c]'}`}>ASSOCIADO</button>
                <button onClick={() => setType('AVULSO')} className={`flex-1 rounded-xl text-xs font-bold transition-all ${type === 'AVULSO' ? 'bg-[#10c65c] text-white' : 'text-[#4c9a6c]'}`}>AVULSO</button>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Catador / Entregador</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input type="text" className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-4 text-base focus:border-[#10c65c] outline-none" placeholder="Buscar nome ou ID..." />
                    </div>
                </div>
                <hr className="border-gray-200" />
            </>
        )}

        <section>
          <h3 className="text-xl font-bold mb-4">Selecione o Material</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Pet', icon: 'water_bottle', color: 'bg-green-100 text-[#10c65c]' },
              { id: 'Papelão', icon: 'inventory_2', color: 'bg-orange-100 text-orange-600' },
              { id: 'Alumínio', icon: 'view_in_ar', color: 'bg-gray-100 text-gray-500' },
              { id: 'Vidro', icon: 'wine_bar', color: 'bg-emerald-100 text-emerald-600' },
              { id: 'Ferro', icon: 'build', color: 'bg-red-100 text-red-600' },
              { id: 'Outros', icon: 'category', color: 'bg-blue-100 text-blue-600' },
            ].map((m) => (
              <button key={m.id} onClick={() => { setSelectedMaterial(m.id); setSelectedSubclass(''); }} className={`relative flex flex-col items-center justify-center h-24 rounded-2xl border-2 transition-all ${selectedMaterial === m.id ? 'border-[#10c65c] bg-[#10c65c]/5' : 'border-transparent bg-white shadow-sm'}`}>
                <div className={`size-10 rounded-full flex items-center justify-center mb-1 ${m.color}`}><span className="material-symbols-outlined">{m.icon}</span></div>
                <span className="text-[10px] font-bold uppercase">{m.id}</span>
              </button>
            ))}
          </div>
        </section>

        {selectedMaterial === 'Outros' && (
          <div className="animate-page">
            <label className="text-xs font-bold text-gray-500 ml-1">Qual material?</label>
            <input type="text" value={otherMaterialName} onChange={(e) => setOtherMaterialName(e.target.value)} className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 mt-1 font-bold outline-none focus:border-[#10c65c]" placeholder="Descreva aqui..." />
          </div>
        )}

        {subclasses[selectedMaterial]?.length > 0 && (
          <div className="animate-page">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Subclassificação</h3>
            <div className="flex flex-wrap gap-2">
              {subclasses[selectedMaterial].map(sub => (
                <button key={sub} onClick={() => setSelectedSubclass(sub)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selectedSubclass === sub ? 'border-[#10c65c] bg-[#10c65c] text-white' : 'border-gray-200 bg-white text-gray-500'}`}>{sub}</button>
              ))}
            </div>
          </div>
        )}

        <section className="flex flex-col gap-4">
          <label className="text-xs font-bold text-gray-500 ml-1">Peso (kg)</label>
          <div className="h-20 bg-white rounded-3xl border-2 border-[#10c65c]/20 flex items-center justify-center px-8 text-5xl font-black text-gray-800">
            {weight}<span className="text-xl text-gray-300 ml-2 mt-2">kg</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9','.', '0', 'delete'].map(k => (
              <button key={k} onClick={() => handleKeypad(k)} className="h-14 bg-white rounded-xl flex items-center justify-center text-xl font-bold shadow-sm active:bg-gray-100">
                {k === 'delete' ? <span className="material-symbols-outlined">backspace</span> : k}
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 pb-8 shadow-2xl z-30">
        <button onClick={onSuccess} className="h-16 w-full bg-[#10c65c] text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#10c65c]/20">
          <span className="material-symbols-outlined">check</span>
          {userRole === 'associate' ? 'CONFIRMAR ENTREGA' : 'SALVAR E VOLTAR'}
        </button>
      </footer>
    </div>
  );
};

export default EntryRegistration;
