import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';

interface SalesHistoryScreenProps {
    navigate: (screen: Screen) => void;
}

const SalesHistoryScreen: React.FC<SalesHistoryScreenProps> = ({ navigate }) => {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSale, setEditingSale] = useState<any | null>(null);
    const [buyers, setBuyers] = useState<any[]>([]);

    // Edit form states
    const [editMaterial, setEditMaterial] = useState('');
    const [editSubclass, setEditSubclass] = useState('');
    const [editWeight, setEditWeight] = useState(0);
    const [editPrice, setEditPrice] = useState(0);
    const [editBuyerId, setEditBuyerId] = useState('');

    const subclasses: Record<string, string[]> = {
        'PET': ['Cristal', 'Verde', 'Colorido'],
        'Papelão': ['Ondulado', 'Kraft', 'Misto'],
        'Alumínio': ['Lata', 'Perfil'],
    };

    useEffect(() => {
        fetchSales();
        fetchBuyers();
    }, []);

    const fetchSales = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sales')
            .select('*, buyers(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sales:', error);
        } else {
            setSales(data || []);
        }
        setLoading(false);
    };

    const fetchBuyers = async () => {
        const { data } = await supabase.from('buyers').select('*');
        if (data) setBuyers(data);
    };

    const handleEditClick = (sale: any) => {
        setEditingSale(sale);
        setEditMaterial(sale.material);
        setEditSubclass(sale.subclass || '');
        setEditWeight(sale.weight);
        setEditPrice(sale.price_per_kg);
        setEditBuyerId(sale.buyer_id || '');
    };

    const handleSaveEdit = async () => {
        if (!editingSale) return;

        const updatePayload: any = {
            material: editMaterial,
            subclass: editSubclass,
            weight: editWeight,
            price_per_kg: editPrice,
            total_value: editWeight * editPrice,
            buyer_id: editBuyerId === '' ? null : editBuyerId // Ensure valid UUID or null
        };

        const { error } = await supabase
            .from('sales')
            .update(updatePayload)
            .eq('id', editingSale.id);

        if (error) {
            alert('Erro ao atualizar venda: ' + error.message);
            console.error(error);
        } else {
            alert('Venda atualizada com sucesso!');
            setEditingSale(null);
            fetchSales();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta venda?')) return;

        const { error } = await supabase.from('sales').delete().eq('id', id);
        if (error) {
            alert('Erro ao excluir: ' + error.message);
        } else {
            fetchSales();
        }
    };

    const handleDeleteClick = async () => {
        if (editingSale) {
            await handleDelete(editingSale.id);
            setEditingSale(null);
        }
    };

    if (editingSale) {
        return (
            <div className="flex flex-col h-full bg-[#f6f8f7]">
                <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
                    <button onClick={() => setEditingSale(null)} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="flex-1 text-center pr-10 text-xl font-bold">Editar Venda</h2>
                </header>

                <main className="flex-1 p-4 overflow-y-auto no-scrollbar pb-24">
                    {/* Buyer Selection */}
                    <section className="mb-6">
                        <label className="block text-sm font-bold text-gray-400 mb-2">Comprador</label>
                        <div className="relative">
                            <select
                                value={editBuyerId}
                                onChange={(e) => setEditBuyerId(e.target.value)}
                                className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#10c65c] appearance-none"
                            >
                                <option value="">Selecione...</option>
                                {buyers.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                        </div>
                    </section>

                    <section className="mb-6">
                        <label className="block text-sm font-bold text-gray-400 mb-2">Material</label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {['PET', 'Papelão', 'Alumínio'].map(m => (
                                <button key={m} onClick={() => { setEditMaterial(m); setEditSubclass(''); }} className={`h-12 rounded-xl border-2 font-bold text-sm transition-all ${editMaterial === m ? 'border-[#10c65c] bg-[#10c65c]/5 text-[#10c65c]' : 'border-gray-100 bg-white text-gray-400'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>

                        {subclasses[editMaterial] && (
                            <div className="flex flex-wrap gap-2">
                                {subclasses[editMaterial].map(sub => (
                                    <button key={sub} onClick={() => setEditSubclass(sub)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${editSubclass === sub ? 'border-[#10c65c] bg-[#10c65c] text-white' : 'border-gray-200 bg-white text-gray-500'}`}>{sub}</button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Peso (kg)</label>
                            <input type="number" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 text-xl font-bold outline-none focus:border-[#10c65c]" value={editWeight} onChange={e => setEditWeight(Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Preço (R$/kg)</label>
                            <input type="number" step="0.10" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 text-xl font-bold outline-none focus:border-[#10c65c]" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} />
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
                            <span className="text-2xl font-black text-[#10c65c]">R$ {(editWeight * editPrice).toFixed(2)}</span>
                        </div>
                    </section>

                    <div className="flex gap-4 pb-4">
                        <button onClick={handleDeleteClick} className="flex-1 h-14 bg-red-50 text-red-500 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-100">
                            <span className="material-symbols-outlined">delete</span>
                            EXCLUIR
                        </button>
                        <button onClick={handleSaveEdit} className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-bold shadow-lg shadow-[#10c65c]/20 active:scale-95 transition-all">
                            SALVAR EDIÇÃO
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f6f8f7]">
            <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
                <button onClick={() => navigate('SALE_REG')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="flex-1 text-center pr-10 text-xl font-bold">Histórico de Vendas</h2>
            </header>

            <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="size-10 border-4 border-[#10c65c]/20 border-t-[#10c65c] rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 font-medium">Carregando vendas...</p>
                    </div>
                ) : sales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">receipt_long</span>
                        <p className="text-gray-400 font-bold">Nenhuma venda registrada.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {sales.map(sale => (
                            <div key={sale.id} onClick={() => handleEditClick(sale)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{sale.buyers?.name || 'Comprador Desconhecido'}</h3>
                                        <p className="text-xs text-gray-400 font-medium">{new Date(sale.created_at).toLocaleDateString('pt-BR')} às {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="bg-[#10c65c]/10 text-[#10c65c] px-3 py-1 rounded-full text-xs font-bold">{sale.material}</span>
                                        {sale.subclass && (
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md self-end">{sale.subclass}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Peso</span>
                                            <span className="text-sm font-bold text-gray-700">{sale.weight}kg</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Valor</span>
                                            <span className="text-sm font-bold text-gray-700">R$ {sale.total_value.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300">edit</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SalesHistoryScreen;
