
import React, { useState } from 'react';
import { Screen } from '../App';

interface BuyerRegistrationProps {
  navigate: (screen: Screen) => void;
}

const BuyerRegistration: React.FC<BuyerRegistrationProps> = ({ navigate }) => {
  const [form, setForm] = useState({
    company: '',
    contact: '',
    phone: '',
    isActive: true
  });

  const [materials, setMaterials] = useState([
    { id: 'Papelão', active: true, price: '' },
    { id: 'PET', active: false, price: '' },
    { id: 'Alumínio', active: true, price: '' },
    { id: 'Cobre', active: false, price: '' },
    { id: 'Vidro', active: false, price: '' },
    { id: 'Outros', active: false, price: '' },
  ]);

  const toggleMaterial = (id: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const updatePrice = (id: string, price: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, price } : m));
  };

  const handleSave = () => {
    if (!form.company || !form.contact) {
      alert("Por favor, preencha o Nome da Empresa e o Contato.");
      return;
    }
    // Simulação de salvamento
    console.log("Comprador Salvo:", { ...form, materials: materials.filter(m => m.active) });
    navigate('ADMIN_DASHBOARD');
  };

  const activeMaterials = materials.filter(m => m.active);

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
                  onChange={e => setForm({...form, company: e.target.value})}
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#10c65c]" 
                  placeholder="Ex: Recicla Mais Ltda" 
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
                  onChange={e => setForm({...form, contact: e.target.value})}
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#10c65c]" 
                  placeholder="Nome do responsável" 
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
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#10c65c]" 
                  placeholder="(00) 00000-0000" 
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
            {materials.map((m) => (
              <button 
                key={m.id} 
                onClick={() => toggleMaterial(m.id)}
                className={`h-14 rounded-2xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${m.active ? 'border-[#10c65c] bg-[#10c65c]/10 text-[#10c65c]' : 'border-gray-100 bg-white text-gray-400'}`}
              >
                {m.active && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                {m.id}
              </button>
            ))}
          </div>
        </section>

        {activeMaterials.length > 0 && (
          <section className="space-y-4 animate-page">
            <h2 className="text-xl font-bold">Tabela de Preços (Opcional)</h2>
            <div className="bg-white rounded-3xl border border-gray-50 overflow-hidden shadow-sm">
              {activeMaterials.map((m, i) => (
                <div key={m.id} className={`p-5 flex items-center justify-between ${i !== activeMaterials.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div>
                    <p className="font-bold">{m.id}</p>
                    <p className="text-[10px] font-bold text-gray-400">Preço por Kg</p>
                  </div>
                  <div className="w-32 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center px-3 gap-2 focus-within:border-[#10c65c] focus-within:bg-white transition-colors">
                    <span className="text-[10px] font-bold text-gray-400">R$</span>
                    <input 
                      type="number" 
                      value={m.price}
                      onChange={(e) => updatePrice(m.id, e.target.value)}
                      className="bg-transparent w-full text-right font-bold outline-none" 
                      placeholder="0,00" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section onClick={() => setForm(f => ({...f, isActive: !f.isActive}))} className="bg-white p-5 rounded-3xl border border-gray-50 flex items-center justify-between shadow-sm cursor-pointer active:bg-gray-50 transition-colors">
          <div>
            <h3 className="text-lg font-bold">Comprador Ativo</h3>
            <p className="text-xs text-gray-400 font-medium">Habilitar para compra imediata</p>
          </div>
          <div className={`w-14 h-8 rounded-full relative p-1 transition-colors ${form.isActive ? 'bg-[#10c65c]' : 'bg-gray-200'}`}>
            <div className={`size-6 bg-white rounded-full absolute top-1 shadow-md transition-all ${form.isActive ? 'right-1' : 'left-1'}`}></div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-30">
        <button onClick={handleSave} className="h-16 w-full bg-[#10c65c] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#10c65c]/30 active:scale-95 transition-all">
          <span className="material-symbols-outlined">save</span>
          SALVAR COMPRADOR
        </button>
      </footer>
    </div>
  );
};

export default BuyerRegistration;
