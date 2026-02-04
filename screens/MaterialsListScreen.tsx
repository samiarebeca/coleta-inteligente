import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';

interface MaterialsListScreenProps {
    navigate: (screen: Screen) => void;
}

const MaterialsListScreen: React.FC<MaterialsListScreenProps> = ({ navigate }) => {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMaterial, setEditingMaterial] = useState<any | null>(null);

    // Edit states
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState(0);
    const [editSubclass, setEditSubclass] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching materials:', error);
        } else {
            setMaterials(data || []);
        }
        setLoading(false);
    };

    const handleEditClick = (mat: any) => {
        setEditingMaterial(mat);
        setEditName(mat.name);
        setEditPrice(mat.price_per_kg);
        setEditSubclass(mat.subclass || '');
    };

    const handleSaveEdit = async () => {
        if (!editingMaterial) return;

        const { error } = await supabase
            .from('materials')
            .update({
                name: editName,
                price_per_kg: editPrice,
                subclass: editSubclass
            })
            .eq('id', editingMaterial.id);

        if (error) {
            alert('Erro ao atualizar material: ' + error.message);
        } else {
            alert('Material atualizado!');
            setEditingMaterial(null);
            fetchMaterials();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir este material?")) return;

        const { error } = await supabase.from('materials').delete().eq('id', id);
        if (error) {
            alert("Erro ao excluir: " + error.message);
        } else {
            fetchMaterials();
        }
    }

    if (editingMaterial) {
        return (
            <div className="flex flex-col h-full bg-[#f6f8f7]">
                <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
                    <button onClick={() => setEditingMaterial(null)} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="flex-1 text-center pr-10 text-xl font-bold">Editar Material</h2>
                </header>

                <main className="flex-1 p-4 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Nome</label>
                            <input type="text" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 font-bold outline-none focus:border-[#10c65c]" value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Subclasse (Opcional)</label>
                            <input type="text" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 font-bold outline-none focus:border-[#10c65c]" placeholder="Ex: Cristal, Verde..." value={editSubclass} onChange={e => setEditSubclass(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Preço (R$/kg)</label>
                            <input type="number" step="0.01" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 font-bold outline-none focus:border-[#10c65c]" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={handleSaveEdit} className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-bold shadow-lg shadow-[#10c65c]/20 active:scale-95 transition-all">Salvar Alterações</button>
                    </div>
                    <button onClick={() => handleDelete(editingMaterial.id)} className="text-red-500 font-bold text-sm py-4">Excluir Material</button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f6f8f7]">
            <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
                <button onClick={() => navigate('MATERIAL_REG')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="flex-1 text-center pr-10 text-xl font-bold">Materiais Cadastrados</h2>
            </header>

            <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin size-8 border-4 border-[#10c65c] border-t-transparent rounded-full"></div></div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {materials.map(m => (
                            <div key={m.id} onClick={() => handleEditClick(m)} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-gray-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-400">recycling</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{m.name}</h3>
                                        {m.subclass && <p className="text-xs font-bold text-[#10c65c] bg-[#10c65c]/5 px-2 py-0.5 rounded-md self-start inline-block">{m.subclass}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-gray-400 uppercase">Preço</span>
                                    <span className="font-black text-gray-800">R$ {m.price_per_kg?.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default MaterialsListScreen;
