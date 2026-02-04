import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';

interface BuyerRegistrationProps {
  navigate: (screen: Screen) => void;
}

const BuyerRegistration: React.FC<BuyerRegistrationProps> = ({ navigate }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company: '',
    contact: '',
    phone: '',
    isActive: true
  });

  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').order('name');
    if (data) {
      setAvailableMaterials(data);
    }
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev =>
      prev.includes(id)
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!form.company || !form.contact) {
      alert("Por favor, preencha o Nome da Empresa e o Contato.");
      return;
    }

    setLoading(true);
    try {
      // 1. Insert Buyer
      const { data: buyer, error: buyerError } = await supabase
        .from('buyers')
        .insert({
          name: form.company,
          contact: form.contact,
          phone: form.phone,
          active: form.isActive
        })
        .select()
        .single();

      if (buyerError) throw buyerError;

      if (buyer && selectedMaterials.length > 0) {
        // 2. Insert Buyer Materials (Preço removido conforme solicitado)
        const materialsToInsert = selectedMaterials.map(matName => ({
          buyer_id: buyer.id,
          material_name: matName,
          price: 0, // No specific price for now
          active: true
        }));

        const { error: materialsError } = await supabase
          .from('buyer_materials')
          .insert(materialsToInsert);

        if (materialsError) throw materialsError;
      }

      alert("Comprador cadastrado com sucesso!");
      navigate('ADMIN_DASHBOARD');
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar comprador: " + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7] pb-32">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b border-gray-100 flex items-center z-20">
        <button onClick={() => navigate('ADMIN_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center pr-10 text-lg font-bold">Cadastrar Comprador</h1>
      </header>

      <main className="p-4 space-y-8 overflow-y-auto no-scrollbar">
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Dados do Comprador</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Nome da Empresa/Comprador</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#10c65c]"
                  placeholder="Ex: Recicla Mais Ltda"
                  disabled={loading}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#10c65c]">business</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Pessoa de Contato</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#10c65c]"
                  placeholder="Nome do responsável"
                  disabled={loading}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#10c65c]">person</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Telefone / WhatsApp</label>
              <div className="relative">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#10c65c]"
                  placeholder="(00) 00000-0000"
                  disabled={loading}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#10c65c]">call</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Materiais de Interesse</h2>
            <p className="text-xs text-gray-400 font-medium">Selecione os materiais que este comprador aceita.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {availableMaterials.map((m) => {
              const isSelected = selectedMaterials.includes(m.name);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMaterial(m.name)}
                  disabled={loading}
                  className={`h-14 rounded-2xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${isSelected ? 'border-[#10c65c] bg-[#10c65c]/10 text-[#10c65c]' : 'border-gray-100 bg-white text-gray-400'}`}
                >
                  {isSelected && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                  {m.name}
                </button>
              );
            })}
          </div>
        </section>

        <section onClick={() => !loading && setForm(f => ({ ...f, isActive: !f.isActive }))} className="bg-white p-5 rounded-3xl border border-gray-50 flex items-center justify-center gap-4 shadow-sm cursor-pointer active:bg-gray-50 transition-colors">
          <div className={`w-14 h-8 rounded-full relative p-1 transition-colors ${form.isActive ? 'bg-[#10c65c]' : 'bg-gray-200'}`}>
            <div className={`size-6 bg-white rounded-full absolute top-1 shadow-md transition-all ${form.isActive ? 'right-1' : 'left-1'}`}></div>
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold">Comprador Ativo</h3>
          </div>
        </section>

        <div className="flex flex-col gap-3 pt-4 pb-10">
          <button onClick={handleSave} disabled={loading} className="h-16 w-full bg-[#10c65c] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#10c65c]/30 active:scale-95 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined">save</span>
            {loading ? 'SALVANDO...' : 'SALVAR COMPRADOR'}
          </button>

          <button onClick={() => navigate('BUYERS_LIST')} className="h-14 w-full bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-50">
            <span className="material-symbols-outlined">list_alt</span>
            VER COMPRADORES
          </button>
        </div>
      </main>
    </div>
  );
};

export default BuyerRegistration;
