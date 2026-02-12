import React, { useState, useEffect } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';

interface BuyersListScreenProps {
    navigate: (screen: Screen) => void;
}

const BuyersListScreen: React.FC<BuyersListScreenProps> = ({ navigate }) => {
    const [buyers, setBuyers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBuyer, setEditingBuyer] = useState<any | null>(null);

    // Edit form states
    const [editCompany, setEditCompany] = useState('');
    const [editContact, setEditContact] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editActive, setEditActive] = useState(true);

    useEffect(() => {
        fetchBuyers();
    }, []);

    const fetchBuyers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('buyers')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching buyers:', error);
        } else {
            setBuyers(data || []);
        }
        setLoading(false);
    };

    const handleEditClick = (buyer: any) => {
        setEditingBuyer(buyer);
        setEditCompany(buyer.name);
        setEditContact(buyer.contact);
        setEditPhone(buyer.phone || '');
        setEditActive(buyer.active);
    };

    const handleSaveEdit = async () => {
        if (!editingBuyer) return;

        if (!editCompany || !editContact) {
            alert("Nome e Contato são obrigatórios.");
            return;
        }

        const { error } = await supabase
            .from('buyers')
            .update({
                name: editCompany,
                contact: editContact,
                phone: editPhone,
                active: editActive
            })
            .eq('id', editingBuyer.id);

        if (error) {
            alert('Erro ao atualizar comprador: ' + error.message);
        } else {
            alert('Comprador atualizado!');
            setEditingBuyer(null);
            fetchBuyers();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir este comprador?")) return;

        const { error } = await supabase.from('buyers').delete().eq('id', id);
        if (error) {
            alert("Erro ao excluir: " + error.message);
        } else {
            alert("Comprador excluído com sucesso!");
            setEditingBuyer(null);
            fetchBuyers();
        }
    }

    if (editingBuyer) {
        return (
            <div className="flex flex-col h-full bg-[#f6f8f7]">
                <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
                    <button onClick={() => setEditingBuyer(null)} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="flex-1 text-center pr-10 text-xl font-bold">Editar Comprador</h2>
                </header>

                <main className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Empresa</label>
                            <input type="text" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 font-bold outline-none focus:border-[#10c65c]" value={editCompany} onChange={e => setEditCompany(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Contato</label>
                            <input type="text" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 font-bold outline-none focus:border-[#10c65c]" value={editContact} onChange={e => setEditContact(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Telefone</label>
                            <input type="text" className="w-full h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 font-bold outline-none focus:border-[#10c65c]" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                        </div>

                        <div onClick={() => setEditActive(!editActive)} className="flex items-center justify-between p-2 cursor-pointer">
                            <span className="font-bold text-gray-700">Comprador Ativo</span>
                            <div className={`w-12 h-7 rounded-full relative transition-colors ${editActive ? 'bg-[#10c65c]' : 'bg-gray-200'}`}>
                                <div className={`size-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${editActive ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={handleSaveEdit} className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-bold shadow-lg shadow-[#10c65c]/20 active:scale-95 transition-all">Salvar Alterações</button>
                    </div>
                    <button onClick={() => handleDelete(editingBuyer.id)} className="text-red-500 font-bold text-sm py-4">Excluir Comprador</button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f6f8f7]">
            <header className="sticky top-0 bg-white p-4 flex items-center shadow-sm z-20">
                <button onClick={() => navigate('BUYER_REG')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="flex-1 text-center pr-10 text-xl font-bold">Compradores</h2>
            </header>

            <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin size-8 border-4 border-[#10c65c] border-t-transparent rounded-full"></div></div>
                ) : buyers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">business</span>
                        <p className="text-gray-400 font-bold">Nenhum comprador cadastrado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {buyers.map(buyer => (
                            <div key={buyer.id} onClick={() => handleEditClick(buyer)} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-gray-50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-400">person</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{buyer.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium">{buyer.contact} • {buyer.phone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {buyer.active ?
                                        <span className="text-[10px] font-bold text-[#10c65c] bg-[#10c65c]/10 px-2 py-1 rounded-md">ATIVO</span>
                                        :
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">INATIVO</span>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default BuyersListScreen;
