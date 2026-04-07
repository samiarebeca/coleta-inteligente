import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase, resolveActiveAssociationId } from '../lib/supabaseClient';

interface PartnerRegistrationProps {
  navigate: (screen: Screen) => void;
}

const PartnerRegistration: React.FC<PartnerRegistrationProps> = ({ navigate }) => {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    type: 'Empresa',
    phone: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    route_id: '',
    frequency: 'Semanal',
    residue_quality: 5,
    residue_volume: 3
  });

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const frequencies = ['Semanal', 'Quinzenal', 'Mensal'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: mats } = await supabase.from('materials').select('*').order('name');
    const { data: rts } = await supabase.from('routes').select('*').order('name');
    if (mats) setMaterials(mats);
    if (rts) setRoutes(rts);
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || selectedDays.length === 0) {
      alert("Nome e dias de coleta são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const assocId = await resolveActiveAssociationId();
      
      const { data: partner, error: pError } = await supabase
        .from('partners')
        .insert({
          association_id: assocId,
          name: form.name,
          type: form.type,
          phone: form.phone,
          street: form.street,
          number: form.number,
          neighborhood: form.neighborhood,
          city: form.city,
          route_id: form.route_id || null,
          collection_days: selectedDays,
          frequency: form.frequency,
          residue_quality: form.residue_quality,
          residue_volume: form.residue_volume
        })
        .select()
        .single();

      if (pError) throw pError;

      if (selectedMaterials.length > 0) {
        const matInserts = selectedMaterials.map(mId => ({
          partner_id: partner.id,
          material_id: mId
        }));
        const { error: mError } = await supabase.from('partner_materials').insert(matInserts);
        if (mError) throw mError;
      }

      alert("Parceiro cadastrado com sucesso!");
      navigate('ADMIN_DASHBOARD');
    } catch (err: any) {
      alert("Erro ao cadastrar: " + err.message);
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
        <h2 className="flex-1 text-center pr-10 text-xl font-bold text-gray-800">Novo Parceiro de Coleta</h2>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar pb-24">
        <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-[#10c65c] uppercase tracking-widest border-b border-gray-50 pb-2">Identificação do Parceiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">NOME DO PARCEIRO *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 font-bold outline-none focus:border-[#10c65c]" required placeholder="Ex: Mercado Silva" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">TIPO DE PESSOA</label>
                <div className="flex bg-gray-50 p-1 rounded-2xl h-14 border border-gray-100">
                  {['Empresa', 'Pessoa Física'].map(t => (
                    <button key={t} type="button" onClick={() => setForm({...form, type: t})} className={`flex-1 rounded-xl text-xs font-bold transition-all ${form.type === t ? 'bg-white text-[#10c65c] shadow-sm' : 'text-gray-400'}`}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">TELEFONE / WHATSAPP</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 outline-none focus:border-[#10c65c]" placeholder="(00) 00000-0000" />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-[#10c65c] uppercase tracking-widest border-b border-gray-50 pb-2">Endereço de Coleta</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-400">RUA / LOGRADOURO</label>
                <input type="text" value={form.street} onChange={e => setForm({...form, street: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 outline-none focus:border-[#10c65c]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">NÚMERO</label>
                <input type="text" value={form.number} onChange={e => setForm({...form, number: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 outline-none focus:border-[#10c65c]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">BAIRRO</label>
                <input type="text" value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 font-bold outline-none focus:border-[#10c65c]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">CIDADE</label>
                <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 outline-none focus:border-[#10c65c]" />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-[#10c65c] uppercase tracking-widest border-b border-gray-50 pb-2">Logística e Materiais</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">MATERIAIS COLETADOS (SELECIONE)</label>
              <div className="flex flex-wrap gap-2">
                {materials.map(m => (
                  <button key={m.id} type="button" onClick={() => toggleMaterial(m.id)} className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${selectedMaterials.includes(m.id) ? 'border-[#10c65c] bg-[#10c65c] text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">ROTA VINCULADA</label>
                <div className="relative">
                  <select value={form.route_id} onChange={e => setForm({...form, route_id: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 outline-none focus:border-[#10c65c] appearance-none font-bold">
                    <option value="">Selecione uma rota...</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.name} - {r.vehicle_plate}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400">FREQUÊNCIA</label>
                <div className="relative">
                  <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 outline-none focus:border-[#10c65c] appearance-none font-bold text-[#10c65c]">
                    {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#10c65c] pointer-events-none font-bold">repeat</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Dias de Coleta na Semana</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {daysOfWeek.map(d => (
                  <button key={d} type="button" onClick={() => toggleDay(d)} className={`h-12 rounded-xl text-[10px] font-black transition-all border-2 ${selectedDays.includes(d) ? 'border-[#10c65c] bg-[#10c65c] text-white shadow-md' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                    {d.slice(0,3).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-[#10c65c] uppercase tracking-widest border-b border-gray-50 pb-2">Classificação do Parceiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                   <label className="text-xs font-bold text-gray-400">⭐ QUALIDADE DO RESÍDUO</label>
                   <span className="text-sm font-black text-[#10c65c]">{form.residue_quality}/5</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setForm({...form, residue_quality: star})} className={`text-3xl transition-all ${star <= form.residue_quality ? 'text-amber-400 hover:scale-110 active:scale-90 scale-105' : 'text-gray-200'}`}>
                      <span className="material-symbols-outlined font-variation-fill text-[36px]">star</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                   <label className="text-xs font-bold text-gray-400">♻️ VOLUME GERADO</label>
                   <span className="text-sm font-black text-green-600">{form.residue_volume}/5</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button key={level} type="button" onClick={() => setForm({...form, residue_volume: level})} className={`text-3xl transition-all ${level <= form.residue_volume ? 'text-green-500 hover:scale-110 active:scale-90 scale-105' : 'text-gray-200'}`}>
                      <span className="material-symbols-outlined font-variation-fill text-[36px]">recycling</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <button disabled={loading} className="w-full h-18 bg-[#10c65c] text-white rounded-3xl font-black text-lg shadow-xl shadow-[#10c65c]/30 hover:bg-[#0da54b] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">save</span>
              {loading ? 'PROCESSANDO...' : 'SALVAR PARCEIRO'}
            </button>
            <button type="button" onClick={() => navigate('ADMIN_DASHBOARD')} className="w-full h-14 text-gray-400 font-bold hover:text-gray-600">
              CANCELAR
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PartnerRegistration;
