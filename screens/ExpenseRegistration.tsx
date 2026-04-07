import React, { useState } from 'react';
import { Screen } from '../App';
import { supabase, resolveActiveAssociationId } from '../lib/supabaseClient';

interface ExpenseRegistrationProps {
  navigate: (screen: Screen) => void;
  onSuccess: () => void;
}

const ExpenseRegistration: React.FC<ExpenseRegistrationProps> = ({ navigate, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const expenseTypes = [
    'Operacional',
    'Alimentação',
    'Manutenção',
    'Infraestrutura',
    'Administrativo',
    'Logística',
    'Impostos e Taxas',
    'Equipamentos e EPIs',
    'Outros'
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !type || !description || !amount) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Por favor, insira um valor válido e positivo.");
      return;
    }

    setLoading(true);
    try {
      const assocId = await resolveActiveAssociationId();
      
      const { error } = await supabase
        .from('expenses')
        .insert({
          association_id: assocId,
          expense_date: date,
          expense_type: type,
          description: description,
          amount: numericAmount
        });

      if (error) throw error;

      alert("Despesa registrada com sucesso!");
      
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setType('');
      setDescription('');
      setAmount('');
      
    } catch (err: any) {
      console.error("Erro ao salvar despesa:", err);
      alert("Erro ao registrar despesa: " + (err.message || "Erro desconhecido"));
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
        <h2 className="flex-1 text-center pr-10 text-xl font-bold text-gray-800">Registrar Despesa</h2>
      </header>

      <main className="flex-1 p-4 pb-10 flex flex-col gap-6 overflow-y-auto no-scrollbar md:p-8 animate-page">
        <div className="max-w-2xl mx-auto w-full">
          <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-4">Nova Saída</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Data</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#13ec6d] transition-colors appearance-none"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">calendar_today</span>
                </div>
              </div>

              {/* Tipo de Despesa */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tipo de Despesa</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-4 font-bold outline-none focus:border-[#13ec6d] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Selecione um grupo...</option>
                    {expenseTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                  required
                  className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-2xl font-black outline-none focus:border-[#13ec6d] transition-colors"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Descrição / Observação</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Ex: Pagamento de conta de luz março/2026"
                className="w-full min-h-[120px] bg-gray-50 border border-gray-100 rounded-2xl p-4 font-medium outline-none focus:border-[#13ec6d] transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="h-16 w-full bg-red-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 hover:bg-red-600"
              >
                <span className="material-symbols-outlined">save</span>
                {loading ? 'SALVANDO...' : 'SALVAR DESPESA'}
              </button>

              <button
                type="button"
                onClick={() => navigate('ADMIN_DASHBOARD')}
                className="h-14 w-full bg-white text-gray-500 border-2 border-gray-50 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-gray-50"
              >
                CANCELAR
              </button>
            </div>
          </form>

          {/* Quick Info */}
          <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-center">
            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">info</span>
            </div>
            <p className="text-xs text-blue-800 font-medium leading-relaxed">
              Dica: O registro de despesas ajuda a calcular o saldo líquido da associação nos relatórios mensais.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpenseRegistration;
