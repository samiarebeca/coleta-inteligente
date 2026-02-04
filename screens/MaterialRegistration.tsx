import React, { useState } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';

interface MaterialRegistrationProps {
  navigate: (screen: Screen) => void;
}

const MaterialRegistration: React.FC<MaterialRegistrationProps> = ({ navigate }) => {
  const [name, setName] = useState('');
  const [currentSubclass, setCurrentSubclass] = useState('');
  const [subclasses, setSubclasses] = useState<string[]>([]);
  const [unit, setUnit] = useState('Quilograma (kg)');
  const [price, setPrice] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('recycling');
  const [loading, setLoading] = useState(false);

  const handleAddSubclass = () => {
    if (currentSubclass.trim()) {
      setSubclasses([...subclasses, currentSubclass.trim()]);
      setCurrentSubclass('');
    }
  };

  const handleRemoveSubclass = (index: number) => {
    setSubclasses(subclasses.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name) {
      alert("Por favor, informe o nome do material.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('materials').insert({
      name,
      subclasses: subclasses,
      price_per_kg: Number(price) || 0,
      // icon: selectedIcon // If we add icon column later
    });

    setLoading(false);

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Material cadastrado com sucesso!");
      setName('');
      setSubclasses([]);
      setPrice('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center z-20">
        <button onClick={() => navigate('ADMIN_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center pr-10 text-lg font-bold">Cadastrar Material</h1>
      </header>

      <main className="flex-1 p-4 space-y-6 overflow-y-auto no-scrollbar pb-10">
        <section className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 ml-1">Nome do Material</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 bg-gray-50 border-none rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-[#10c65c] transition-all"
              placeholder="Ex: Papelão"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 ml-1">Subclasses (Opcional)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentSubclass}
                onChange={(e) => setCurrentSubclass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubclass()}
                className="flex-1 h-14 bg-gray-50 border-none rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-[#10c65c] transition-all"
                placeholder="Ex: Cristal, Verde..."
              />
              <button onClick={handleAddSubclass} className="size-14 bg-[#10c65c] rounded-2xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            {subclasses.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-page">
                {subclasses.map((sub, idx) => (
                  <div key={idx} className="bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">{sub}</span>
                    <button onClick={() => handleRemoveSubclass(idx)} className="size-5 rounded-full bg-gray-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-gray-400 ml-1">Adicione várias subclasses se necessário (ex: Cristal, Verde, Misto)</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 ml-1">Unidade de Medida</label>
            <div className="flex gap-2">
              {['Quilograma (kg)', 'Unidade', 'Litro (L)'].map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`flex-1 h-12 rounded-xl border-2 text-xs font-bold transition-all ${unit === u ? 'border-[#10c65c] bg-[#10c65c]/10 text-[#10c65c]' : 'border-gray-100 bg-white text-gray-400'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 ml-1">Preço Sugerido (R$/kg)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">R$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-12 pr-4 font-bold outline-none focus:ring-2 focus:ring-[#10c65c] transition-all"
                placeholder="0,00"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold px-1">Ícone</h2>
          <div className="grid grid-cols-4 gap-3">
            {['recycling', 'inventory_2', 'water_bottle', 'wine_bar', 'category', 'build', 'settings', 'local_shipping'].map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`size-16 bg-white rounded-2xl border-2 flex items-center justify-center transition-all ${selectedIcon === icon ? 'border-[#10c65c] text-[#10c65c] shadow-md scale-105' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
              >
                <span className="material-symbols-outlined text-3xl">{icon}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 pt-4">
          <button onClick={handleSave} disabled={loading} className="h-14 w-full bg-[#10c65c] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#10c65c]/30 active:scale-95 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined">add_circle</span>
            {loading ? 'SALVANDO...' : 'CADASTRAR MATERIAL'}
          </button>

          <button onClick={() => navigate('MATERIALS_LIST')} className="h-14 w-full bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-50">
            <span className="material-symbols-outlined">list</span>
            VER MATERIAIS
          </button>
        </div>
      </main>
    </div>
  );
};

export default MaterialRegistration;
