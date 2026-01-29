
import React from 'react';
import { Screen } from '../App';

interface HistoryScreenProps {
  navigate: (screen: Screen) => void;
  userRole?: 'admin' | 'associate' | 'driver';
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigate, userRole = 'admin' }) => {

  const handleBack = () => {
    if (userRole === 'associate') navigate('ASSOCIATE_DASHBOARD');
    else if (userRole === 'driver') navigate('DRIVER_DASHBOARD');
    else navigate('ADMIN_DASHBOARD');
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7] pb-24">
      <header className="sticky top-0 bg-[#f6f8f7]/95 backdrop-blur-md p-4 flex items-center justify-between z-20" style={{ touchAction: 'none' }}>
        <button onClick={handleBack} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold">Meu Histórico</h2>
        <button className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </header>

      {/* Filter Tabs - Hide for Driver/Associate to simplify */}
      {userRole === 'admin' && (
        <div className="px-4 py-2 overflow-x-auto no-scrollbar flex gap-3 whitespace-nowrap">
          <button className="px-5 py-2.5 bg-[#10c65c] text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-md">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Este Mês
          </button>
          <button className="px-5 py-2.5 bg-white border border-gray-100 text-gray-500 rounded-full font-bold text-xs">
            Mês Passado
          </button>
        </div>
      )}

      <main className="flex-1 p-4 space-y-8 overscroll-y-none">
        {/* Total Summary */}
        <section className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 size-24 bg-[#10c65c]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 size-24 bg-[#10c65c]/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Total do Período</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-extrabold tracking-tight">1.643</span>
            <span className="text-2xl font-bold text-gray-300">kg</span>
          </div>
          <div className="flex items-center gap-1 bg-[#10c65c]/10 text-[#10c65c] px-3 py-1 rounded-lg text-xs font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            +12% vs mês anterior
          </div>
        </section>

        {/* List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-gray-900">Atividades Recentes</h3>
            <span className="text-[10px] font-bold text-gray-400">42 registros</span>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { date: '12 Set, 14:30', user: 'Carlos M.', weight: '+ 45 kg', type: 'PLÁSTICO', icon: 'recycling', color: 'bg-[#10c65c]/10 text-[#10c65c]' },
              { date: '10 Set, 09:15', user: 'Ana S.', weight: '+ 120 kg', type: 'PAPELÃO', icon: 'inventory_2', color: 'bg-blue-500/10 text-blue-600' },
              { date: '08 Set, 16:45', user: 'Roberto F.', weight: '+ 32 kg', type: 'METAL', icon: 'scale', color: 'bg-orange-500/10 text-orange-600' },
              { date: '05 Set, 11:20', user: 'Maria L.', weight: '+ 210 kg', type: 'PLÁSTICO', icon: 'recycling', color: 'bg-[#10c65c]/10 text-[#10c65c]' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center shadow-sm">
                <div className="flex-1 flex items-center gap-4">
                  <div className={`size-12 rounded-full flex items-center justify-center ${item.color}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{item.date}</p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {userRole === 'admin' ? `Operador: ${item.user}` : 'Registrado com sucesso'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#10c65c] font-bold leading-tight">{item.weight}</p>
                  <p className="text-[9px] font-extrabold text-gray-300 tracking-wider uppercase">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {userRole === 'admin' && (
          <div className="flex flex-col items-center gap-4 pt-4">
            <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#10c65c]">Carregar mais</button>
            <button onClick={() => navigate('REPORTS')} className="w-full h-14 border-2 border-[#10c65c] text-[#10c65c] rounded-2xl font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">bar_chart</span>
              VER GRÁFICOS
            </button>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-between items-center px-6 py-3 z-30" style={{ touchAction: 'none' }}>
        <button onClick={handleBack} className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#10c65c] transition-colors">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-tight">Início</span>
        </button>
        <button onClick={() => navigate('HISTORY')} className="flex flex-col items-center gap-1 text-[#10c65c]">
          <span className="material-symbols-outlined filled-icon">history</span>
          <span className="text-[10px] font-bold uppercase tracking-tight">Histórico</span>
        </button>
        {userRole !== 'driver' && (
          <div className="relative -top-8 bg-[#10c65c] size-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-[#10c65c]/30 border-4 border-[#f6f8f7] cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('ENTRY_REG')}>
            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
          </div>
        )}
        <button onClick={() => navigate('NOTIFICATIONS')} className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#10c65c] transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px] font-bold uppercase tracking-tight">Alertas</span>
        </button>
        <button onClick={() => navigate('PROFILE')} className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#10c65c] transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase tracking-tight">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default HistoryScreen;
