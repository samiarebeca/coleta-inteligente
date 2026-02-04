import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';

interface EntriesHistoryScreenProps {
    navigate: (screen: Screen) => void;
}

const EntriesHistoryScreen: React.FC<EntriesHistoryScreenProps> = ({ navigate }) => {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEntry, setEditingEntry] = useState<any | null>(null);

    // Edit form states
    const [editWeight, setEditWeight] = useState('');
    const [editMaterialName, setEditMaterialName] = useState('');
    const [editObs, setEditObs] = useState('');

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        setLoading(true);
        // Fetch entries, resolving material name if linked
        const { data, error } = await supabase
            .from('entries')
            .select('*, materials(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching entries:', error);
        } else {
            setEntries(data || []);
        }
        setLoading(false);
    };

    const handleEditClick = (entry: any) => {
        setEditingEntry(entry);
        setEditWeight(entry.weight.toString());
        setEditMaterialName(entry.materials?.name || entry.material_name || '');
        setEditObs(entry.observation || '');
    };

    const handleSaveEdit = async () => {
        if (!editingEntry) return;

        const { error } = await supabase
            .from('entries')
            .update({
                weight: parseFloat(editWeight) || 0,
                observation: editObs
            })
            .eq('id', editingEntry.id);

        if (error) {
            alert('Erro ao atualizar entrada: ' + error.message);
        } else {
            alert('Entrada atualizada com sucesso!');
            setEditingEntry(null);
            fetchEntries();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja excluir esta entrada?")) return;

        const { error } = await supabase.from('entries').delete().eq('id', id);
        if (error) {
            alert("Erro: " + error.message);
        } else {
            fetchEntries();
        }
    }

    if (editingEntry) {
        return (
            <div className="flex flex-col h-full bg-[#f6f8f7]">
                <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
                    <button onClick={() => setEditingEntry(null)} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="flex-1 text-center pr-10 text-xl font-bold">Editar Entrada</h2>
                </header>

                <main className="flex-1 p-4 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Material</label>
                            <div className="text-lg font-bold text-gray-800 p-3 bg-gray-50 rounded-2xl">{editMaterialName}</div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Peso (kg)</label>
                            <input type="number" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 text-xl font-bold outline-none focus:border-[#10c65c]" value={editWeight} onChange={e => setEditWeight(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Observação</label>
                            <textarea className="w-full h-24 bg-gray-50 rounded-2xl border border-gray-100 p-4 font-medium outline-none focus:border-[#10c65c]" value={editObs} onChange={e => setEditObs(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={handleSaveEdit} className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-bold shadow-lg shadow-[#10c65c]/20 active:scale-95 transition-all">Salvar</button>
                    </div>
                    <button onClick={() => handleDelete(editingEntry.id)} className="text-red-500 font-bold text-sm py-4">Excluir Entrada</button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f6f8f7]">
            <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
                <button onClick={() => navigate('ENTRY_REG')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="flex-1 text-center pr-10 text-xl font-bold">Histórico de Entradas</h2>
            </header>

            <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin size-8 border-4 border-[#10c65c] border-t-transparent rounded-full"></div></div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">move_to_inbox</span>
                        <p className="text-gray-400 font-bold">Nenhuma entrada registrada.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {entries.map(e => (
                            <div key={e.id} onClick={() => handleEditClick(e)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{e.source_type === 'associate' ? 'Associado' : 'Avulso'}</h3>
                                        <p className="text-xs text-gray-400 font-medium">{new Date(e.created_at).toLocaleDateString('pt-BR')} às {new Date(e.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <span className="bg-[#10c65c]/10 text-[#10c65c] px-3 py-1 rounded-full text-xs font-bold">{e.materials?.name || e.material_name}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Peso</span>
                                        <span className="text-lg font-black text-gray-800">{e.weight}kg</span>
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
}

export default EntriesHistoryScreen;
