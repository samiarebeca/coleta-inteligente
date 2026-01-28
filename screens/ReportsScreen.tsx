
import React from 'react';
import { Screen } from '../App';

interface ReportsScreenProps {
  navigate: (screen: Screen) => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigate }) => {
  // Dados para as barras de progresso (Metas)
  const goals = [
    { name: 'Papelão', current: 850, target: 1000, color: 'bg-orange-500' },
    { name: 'Plástico', current: 1200, target: 1500, color: 'bg-green-500' },
    { name: 'Alumínio', current: 300, target: 500, color: 'bg-blue-500' },
    { name: 'Vidro', current: 150, target: 400, color: 'bg-purple-500' },
  ];

  // Dados para o gráfico de pizza (Produção Geral)
  const pieData = [
    { label: 'Plástico', value: 45, color: '#10c65c' },
    { label: 'Papelão', value: 30, color: '#f97316' },
    { label: 'Alumínio', value: 15, color: '#3b82f6' },
    { label: 'Vidro', value: 10, color: '#a855f7' },
  ];

  // Cálculo do gradiente cônico para o gráfico
  let cumulativePercent = 0;
  const gradientString = pieData.map(item => {
    const start = cumulativePercent;
    cumulativePercent += item.value;
    return `${item.color} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center z-20">
        <button onClick={() => navigate('ADMIN_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center pr-10 text-lg font-bold">Relatórios e Metas</h1>
      </header>

      <main className="p-4 space-y-6 overflow-y-auto no-scrollbar pb-24">
        {/* Card de Receita */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase">Receita Total do Mês</p>
            <p className="text-4xl font-black text-gray-800">R$ 15.420,00</p>
            <div className="flex items-center gap-1 text-[#10c65c] text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +8% desde ontem
            </div>
        </section>

        {/* Novo Gráfico de Pizza - Produção Geral */}
        <section className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
            <h3 className="text-lg font-bold mb-6 px-1">Produção Geral</h3>
            <div className="flex flex-col items-center">
                {/* O Gráfico Visual */}
                <div className="size-56 rounded-full relative shadow-inner mb-8" 
                     style={{ background: `conic-gradient(${gradientString})` }}>
                     {/* Círculo interno para criar o efeito de Rosca (Donut) */}
                     <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                        <span className="text-4xl font-black text-gray-800">2.5t</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                     </div>
                </div>

                {/* Legenda */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full px-2">
                    {pieData.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs font-bold text-gray-600 uppercase">{item.label}</span>
                            </div>
                            <span className="text-sm font-black text-gray-800">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Metas Lineares */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold px-1">Progresso das Metas</h3>
          <div className="grid grid-cols-1 gap-3">
            {goals.map(g => {
                const perc = Math.round((g.current / g.target) * 100);
                return (
                    <div key={g.name} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm animate-page">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <h4 className="font-black text-xl">{g.name}</h4>
                                <p className="text-xs text-gray-400 font-bold uppercase">{g.current}kg de {g.target}kg</p>
                            </div>
                            <span className="text-2xl font-black text-gray-800">{perc}%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${g.color} transition-all duration-700`} style={{ width: `${perc}%` }}></div>
                        </div>
                    </div>
                )
            })}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/95 border-t border-gray-100 z-30 flex gap-2">
        <button className="flex-1 h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">download</span> EXCEL
        </button>
        <button className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">picture_as_pdf</span> PDF
        </button>
      </footer>
    </div>
  );
};

export default ReportsScreen;
