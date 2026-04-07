import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase, resolveActiveAssociationId } from '../lib/supabaseClient';

interface RoutesScreenProps {
  navigate: (screen: Screen) => void;
  userRole?: 'admin' | 'associate' | 'driver';
}

const RoutesScreen: React.FC<RoutesScreenProps> = ({ navigate, userRole = 'admin' }) => {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRoute, setNewRoute] = useState({ name: '', vehicle_plate: '', description: '' });

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: routeData } = await supabase.from('routes').select('*').order('name');
    const { data: partnerData } = await supabase
      .from('partners')
      .select('*, partner_materials(materials(name))')
      .order('name');
    
    if (routeData) {
      setRoutes(routeData);
      if (routeData.length > 0 && !selectedRouteId) {
        setSelectedRouteId(routeData[0].id);
      }
    }
    if (partnerData) setPartners(partnerData);
    setLoading(false);
  };

  const handleUpdateRating = async (partnerId: string, field: 'residue_quality' | 'residue_volume', value: number) => {
    // Optimistic update
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, [field]: value } : p));
    
    const { error } = await supabase.from('partners').update({ [field]: value }).eq('id', partnerId);
    if (error) {
      alert("Erro ao atualizar: " + error.message);
      fetchData(); // Rollback
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.name || !newRoute.vehicle_plate) return;

    try {
      const assocId = await resolveActiveAssociationId();
      const { data, error } = await supabase.from('routes').insert({
        association_id: assocId,
        ...newRoute
      }).select().single();
      if (error) throw error;
      setNewRoute({ name: '', vehicle_plate: '', description: '' });
      setIsAddingRoute(false);
      if (data) setSelectedRouteId(data.id);
      fetchData();
    } catch (err: any) {
      alert("Erro ao cadastrar rota: " + err.message);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm("Excluir esta rota removerá o vínculo de todos os parceiros nela. Continuar?")) return;
    const { error } = await supabase.from('routes').delete().eq('id', id);
    if (!error) {
        if (selectedRouteId === id) setSelectedRouteId('');
        fetchData();
    }
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const filteredPartners = partners.filter(p => p.route_id === selectedRouteId);
  
  const neighborDistribution: { [key: string]: number } = {};
  filteredPartners.forEach(p => {
    const neighborhood = p.neighborhood || 'Não Informal';
    neighborDistribution[neighborhood] = (neighborDistribution[neighborhood] || 0) + 1;
  });

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white p-4 shadow-sm z-20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('ADMIN_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">Agenda de Coletas</h1>
          </div>
          {userRole === 'admin' && (
            <button onClick={() => setIsAddingRoute(true)} className="size-10 bg-[#10c65c] text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-[#10c65c]/30">
              <span className="material-symbols-outlined">add</span>
            </button>
          )}
        </div>

        <div className="relative">
          <select 
            value={selectedRouteId} 
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full h-14 bg-gray-50 border-2 border-gray-100 rounded-2xl px-12 font-black text-[#10c65c] appearance-none outline-none focus:border-[#10c65c]"
          >
            <option value="" disabled>Selecione uma rota para visualizar</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.name} - {r.vehicle_plate}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#10c65c]">local_shipping</span>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">expand_more</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-8 animate-page pb-32">
        {isAddingRoute && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleAddRoute} className="bg-white w-full max-w-md p-8 rounded-3xl space-y-6 shadow-2xl">
              <h2 className="text-2xl font-black text-gray-800">Cadastrar Nova Rota</h2>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Nome da Rota</label>
                    <input type="text" value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 font-bold focus:border-[#10c65c] outline-none" required placeholder="Ex: Rota 1 - Norte" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Placa do Veículo</label>
                    <input type="text" value={newRoute.vehicle_plate} onChange={e => setNewRoute({...newRoute, vehicle_plate: e.target.value})} className="w-full h-14 bg-gray-50 rounded-2xl px-4 border border-gray-100 font-bold focus:border-[#10c65c] outline-none" required placeholder="ABC-1234" />
                 </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAddingRoute(false)} className="flex-1 h-14 font-black text-gray-400">CANCELAR</button>
                <button type="submit" className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-black shadow-lg shadow-[#10c65c]/30 active:scale-95 transition-all">SALVAR ROTA</button>
              </div>
            </form>
          </div>
        )}

        {!selectedRouteId ? (
          <div className="text-center py-20 opacity-30">
             <span className="material-symbols-outlined text-[120px]">directions_bus</span>
             <p className="font-black text-xl uppercase mt-4">Selecione uma rota para carregar a agenda</p>
          </div>
        ) : (
          <>
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-[#10c65c] text-[28px]">event_note</span>
                 <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Agenda Semanal</h2>
              </div>
              
              <div className="space-y-4">
                {daysOfWeek.map(day => {
                  const dayPartners = filteredPartners.filter(p => p.collection_days?.includes(day));
                  
                  return (
                    <div key={day} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4 transition-all hover:shadow-md">
                      <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                         <h3 className="text-lg font-black text-gray-800">{day}</h3>
                         <span className="text-[10px] font-black bg-[#10c65c]/10 text-[#10c65c] px-3 py-1 rounded-full">{dayPartners.length} PONTOS</span>
                      </div>
                      
                      <div className="space-y-4">
                        {dayPartners.map(p => (
                          <div key={p.id} className="p-3 border border-gray-50 rounded-2xl space-y-3 bg-gray-50/30">
                             <div className="flex justify-between items-start">
                                <span className="font-black text-gray-800">{p.name}</span>
                                <span className="text-[10px] text-gray-400 uppercase font-black">{p.neighborhood}</span>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-1">
                                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Qualidade</span>
                                   </div>
                                   <div className="flex bg-white/50 p-1.5 rounded-xl border border-gray-100 justify-between">
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                          key={star} 
                                          onClick={() => handleUpdateRating(p.id, 'residue_quality', star)}
                                          className={`transition-all hover:scale-125 active:scale-90 ${star <= (p.residue_quality || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                                        >
                                          <span className="material-symbols-outlined text-[18px] font-variation-fill">star</span>
                                        </button>
                                      ))}
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <div className="flex items-center gap-1">
                                      <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">Volume</span>
                                   </div>
                                   <div className="flex bg-white/50 p-1.5 rounded-xl border border-gray-100 justify-between">
                                      {[1, 2, 3, 4, 5].map(level => (
                                        <button 
                                          key={level} 
                                          onClick={() => handleUpdateRating(p.id, 'residue_volume', level)}
                                          className={`transition-all hover:scale-125 active:scale-90 ${level <= (p.residue_volume || 0) ? 'text-green-500' : 'text-gray-200'}`}
                                        >
                                          <span className="material-symbols-outlined text-[18px] font-variation-fill">recycling</span>
                                        </button>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                        ))}
                        {dayPartners.length === 0 && (
                          <p className="text-center py-4 text-xs font-bold text-gray-300 uppercase italic tracking-widest">Sem coletas</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
               <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 pointer-events-none">groups</span>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumo da Rota</p>
                     <h2 className="text-4xl font-black mt-1">{filteredPartners.length}</h2>
                     <p className="text-sm font-bold text-gray-400">Parceiros vinculados</p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                     <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                        <p className="text-[8px] font-black text-amber-400 uppercase">Qualidade Média</p>
                        <div className="flex items-center gap-1 mt-1">
                           <span className="text-lg font-black">{(filteredPartners.reduce((acc, p) => acc + (p.residue_quality || 0), 0) / (filteredPartners.length || 1)).toFixed(1)}</span>
                           <span className="material-symbols-outlined text-amber-400 text-[16px]">star</span>
                        </div>
                     </div>
                     <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                        <p className="text-[8px] font-black text-green-400 uppercase">Volume Total Est.</p>
                        <div className="flex items-center gap-1 mt-1">
                           <span className="text-lg font-black">{filteredPartners.reduce((acc, p) => acc + (p.residue_volume || 0), 0)}</span>
                           <span className="material-symbols-outlined text-green-400 text-[16px]">recycling</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Concentração por Bairro</h3>
                  <div className="flex-1 flex flex-col gap-4">
                     {Object.entries(neighborDistribution).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([bairro, count]) => {
                        const maxCount = Math.max(...Object.values(neighborDistribution));
                        const percentage = (count / maxCount) * 100;
                        return (
                          <div key={bairro} className="space-y-1">
                             <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                                <span>{bairro}</span>
                                <span>{count}</span>
                             </div>
                             <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-[#10c65c] rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </div>
            </section>
            
            {userRole === 'admin' && (
              <div className="flex items-center justify-center pt-8 opacity-20 hover:opacity-100 transition-opacity">
                 <button onClick={() => handleDeleteRoute(selectedRouteId)} className="text-red-500 font-black text-xs uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    EXCLUIR ROTA
                 </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default RoutesScreen;
