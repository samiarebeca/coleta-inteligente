import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';

interface EntryRegistrationProps {
  navigate: (screen: Screen) => void;
  onSuccess: () => void;
  userRole: 'admin' | 'associate' | 'driver';
}

const EntryRegistration: React.FC<EntryRegistrationProps> = ({ navigate, onSuccess, userRole }) => {
  const [type, setType] = useState<'ASSOCIADO' | 'AVULSO'>('ASSOCIADO');
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [selectedSubclass, setSelectedSubclass] = useState('');
  const [weight, setWeight] = useState('0');
  const [loading, setLoading] = useState(false);

  // States for Avulso or Associate lookup
  const [searchQuery, setSearchQuery] = useState('');

  const subclassesMap: Record<string, string[]> = {
    'PET': ['Cristal', 'Verde', 'Colorido'],
    'Papelão': ['Ondulado', 'Kraft', 'Misto'],
    'Alumínio': ['Lata', 'Perfil'],
    'Plástico': ['PVC', 'PEAD', 'PP', 'PS'],
    'Vidro': ['Incolor', 'Ambar', 'Verde']
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').order('name');
    if (data) setMaterials(data);
  };

  const handleBack = () => {
    if (userRole === 'associate') {
      navigate('ASSOCIATE_DASHBOARD');
    } else {
      navigate('ADMIN_DASHBOARD');
    }
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

  const handleSave = async () => {
    if (!selectedMaterial) {
      alert("Selecione um material!");
      return;
    }
    if (parseFloat(weight) <= 0) {
      alert("Informe um peso válido!");
      return;
    }

    setLoading(true);

    const entryData = {
      source_type: type === 'ASSOCIADO' ? 'associate' : 'avulso',
      material_id: selectedMaterial.id,
      material_name: selectedMaterial.name,
      subclass: selectedSubclass || selectedMaterial.subclass,
      weight: parseFloat(weight),
      avulso_name: type === 'AVULSO' ? (searchQuery || 'Anônimo') : null
    };

    const { error } = await supabase.from('entries').insert(entryData);

    setLoading(false);

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Entrada registrada com sucesso!");
      setWeight('0');
      setSelectedMaterial(null);
      setSelectedSubclass('');
      // Optional: onSuccess(); if we want to navigate back immediately
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

      <main className="flex-1 p-4 flex flex-col gap-6 pb-10 overflow-y-auto no-scrollbar">

        {/* Admin Features: Toggle Type and Search User */}
        {userRole === 'admin' && (
          <>
            <div className="flex bg-[#e7f3ec] p-1 rounded-2xl h-14">
              <button onClick={() => setType('ASSOCIADO')} className={`flex-1 rounded-xl text-sm font-bold transition-all ${type === 'ASSOCIADO' ? 'bg-[#10c65c] text-white shadow-md' : 'text-[#4c9a6c]'}`}>ASSOCIADO</button>
              <button onClick={() => setType('AVULSO')} className={`flex-1 rounded-xl text-sm font-bold transition-all ${type === 'AVULSO' ? 'bg-[#10c65c] text-white shadow-md' : 'text-[#4c9a6c]'}`}>AVULSO</button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 ml-1">Catador / Entregador</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-4 text-base focus:border-[#10c65c] outline-none"
                  placeholder="Buscar nome ou ID..."
                />
              </div>
            </div>
            <hr className="border-gray-200" />
          </>
        )}

        <section>
          <h3 className="text-xl font-bold mb-4">Selecione o Material</h3>
          <div className="grid grid-cols-3 gap-3">
            {materials.map((m) => (
              <button key={m.id} onClick={() => { setSelectedMaterial(m); setSelectedSubclass(''); }} className={`relative flex flex-col items-center justify-center h-24 rounded-2xl border-2 transition-all ${selectedMaterial?.id === m.id ? 'border-[#10c65c] bg-[#10c65c]/5' : 'border-transparent bg-white shadow-sm'}`}>
                <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center mb-1 text-[#10c65c]">
                  <span className="material-symbols-outlined">recycling</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-center leading-tight px-1">{m.name}</span>
                {m.subclass && <span className="text-[8px] text-gray-400">{m.subclass}</span>}
              </button>
            ))}
          </div>

          {selectedMaterial && subclassesMap[selectedMaterial.name] && (
            <div className="mt-4 animate-page">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-2 block">Selecione a Subclasse</label>
              <div className="flex flex-wrap gap-2">
                {subclassesMap[selectedMaterial.name].map(sub => (
                  <button key={sub} onClick={() => setSelectedSubclass(sub)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selectedSubclass === sub ? 'border-[#10c65c] bg-[#10c65c] text-white' : 'border-gray-200 bg-white text-gray-500'}`}>{sub}</button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <label className="text-xs font-bold text-gray-500 ml-1">Peso (kg)</label>
          <div className="h-20 bg-white rounded-3xl border-2 border-[#10c65c]/20 flex items-center justify-center px-8 text-5xl font-black text-gray-800">
            {weight}<span className="text-xl text-gray-300 ml-2 mt-2">kg</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'delete'].map(k => (
              <button key={k} onClick={() => handleKeypad(k)} className="h-14 bg-white rounded-xl flex items-center justify-center text-xl font-bold shadow-sm active:bg-gray-100">
                {k === 'delete' ? <span className="material-symbols-outlined">backspace</span> : k}
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 pt-4">
          <button onClick={handleSave} disabled={loading} className="h-16 w-full bg-[#10c65c] text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#10c65c]/20 active:scale-95 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined">check</span>
            {loading ? 'SALVANDO...' : (userRole === 'associate' ? 'CONFIRMAR ENTREGA' : 'SALVAR CADASTRO')}
          </button>

          <button onClick={() => navigate('ENTRIES_HISTORY')} className="h-14 w-full bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-50">
            <span className="material-symbols-outlined">history</span>
            VER ENTRADAS
          </button>
        </div>
      </main>
    </div>
  );
};

export default EntryRegistration;
