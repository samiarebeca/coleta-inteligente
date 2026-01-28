
import React from 'react';
import { Screen } from '../App';

interface AssociateDashboardProps {
  navigate: (screen: Screen) => void;
  userName?: string;
  userLogo?: string;
}

const AssociateDashboard: React.FC<AssociateDashboardProps> = ({ navigate, userName, userLogo }) => {
  const productionData = [
    { label: 'Papel', value: 40, color: '#f97316' },
    { label: 'Plástico', value: 35, color: '#10c65c' },
    { label: 'Vidro', value: 15, color: '#14b8a6' },
    { label: 'Metal', value: 10, color: '#64748b' },
  ];

  // Dados fictícios das metas do associado
  const goals = [
    { name: 'Papelão', current: 450, target: 600, color: 'bg-orange-500' },
    { name: 'Plástico', current: 800, target: 1000, color: 'bg-[#10c65c]' },
  ];

  let cumulativePercent = 0;
  const gradientString = productionData.map(item => {
    const start = cumulativePercent;
    cumulativePercent += item.value;
    return `${item.color} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="p-4 pt-6 flex items-center justify-between sticky top-0 bg-[#f6f8f7]/95 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3" onClick={() => navigate('PROFILE')}>
          <div className="relative size-12 rounded-full border-2 border-[#10c65c] bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url("${userLogo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYzY1YyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4='}")` }}>
            <div className="absolute bottom-0 right-0 size-3 bg-[#10c65c] rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col cursor-pointer">
            <h2 className="text-xl font-bold leading-tight">Olá, {userName?.split(' ')[0] || 'Associado'} 👋</h2>
            <p className="text-sm font-medium text-[#4c9a6c]">Associado Logado</p>
          </div>
        </div>
        <button onClick={() => navigate('NOTIFICATIONS')} className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-gray-700">notifications</span>
        </button>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 pb-24 overflow-y-auto no-scrollbar">
        {/* Gráfico de Produção (Rosca) */}
        <section className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <p className="text-[#4c9a6c] text-[10px] font-bold uppercase tracking-widest mb-4">Produção por Material</p>
          <div className="flex items-center gap-8">
            <div className="size-36 rounded-full flex-shrink-0 relative shadow-inner"
              style={{ background: `conic-gradient(${gradientString})` }}>
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-800">145</span>
                <span className="text-[10px] font-bold text-gray-400">kg total</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 flex-1">
              {productionData.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-bold text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gráficos de Metas (Barra de Progresso) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Metas da Associação</h3>
            <span className="text-xs font-bold text-gray-400 uppercase">Mensal</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {goals.map(g => {
              const perc = Math.round((g.current / g.target) * 100);
              return (
                <div key={g.name} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-700">{g.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{g.current}kg / {g.target}kg</p>
                    </div>
                    <span className="text-sm font-black text-gray-800">{perc}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${g.color} transition-all duration-700`} style={{ width: `${perc}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t border-gray-100 bg-white p-4 pb-6 z-30 flex justify-around">
        <button onClick={() => navigate('ASSOCIATE_DASHBOARD')} className="flex flex-col items-center gap-1 text-[#10c65c]">
          <span className="material-symbols-outlined filled-icon">home</span>
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button onClick={() => navigate('PROFILE')} className="flex flex-col items-center gap-1 text-gray-300">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default AssociateDashboard;
