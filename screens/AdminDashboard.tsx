
import React from 'react';
import { Screen } from '../App';

interface AdminDashboardProps {
  navigate: (screen: Screen) => void;
  userName?: string;
  userLogo?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, userName, userLogo }) => {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#f6f8f7]">
      {/* Header */}
      <header className="flex-none flex items-center justify-between p-5 pb-2 bg-[#f6f8f7]/95 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3" onClick={() => navigate('PROFILE')}>
          <div className="relative size-12 rounded-full border-2 border-[#13ec6d] bg-cover bg-center cursor-pointer"
            style={{ backgroundImage: `url("${userLogo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYzY1YyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4='}")` }}>
            <div className="absolute bottom-0 right-0 size-3 bg-[#13ec6d] rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col cursor-pointer">
            <span className="text-xs text-gray-400">Bem vindo de volta,</span>
            <h2 className="text-lg font-bold leading-tight">{userName?.split(' ')[0] || 'Admin'}</h2>
          </div>
        </div>
        <button onClick={() => navigate('NOTIFICATIONS')} className="relative size-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-gray-700">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full"></span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Stats */}
        <section className="p-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Entrada', val: '25.4t', color: 'text-green-600', icon: 'arrow_downward' },
            { label: 'Saída', val: '12.1t', color: 'text-red-500', icon: 'arrow_upward' },
            { label: 'Estoque', val: '13.3t', color: 'text-blue-500', icon: 'inventory_2' }
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center gap-1 rounded-2xl p-4 bg-white shadow-sm border border-gray-50">
              <div className="flex items-center gap-1 mb-1">
                <span className={`material-symbols-outlined ${stat.color} text-[18px]`}>{stat.icon}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{stat.label}</p>
              </div>
              <p className="text-xl font-bold tracking-tight">{stat.val}</p>
            </div>
          ))}
        </section>

        {/* Revenue Card */}
        <section className="px-5 pb-5">
          <div className="relative w-full rounded-2xl p-6 shadow-lg shadow-[#13ec6d]/20 overflow-hidden bg-[#13ec6d]">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-white/10 -skew-x-12 translate-x-10"></div>
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 bg-black/5 px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[18px] text-white">monetization_on</span>
                  <span className="text-xs font-bold uppercase text-white">Receita Total</span>
                </div>
                <span className="material-symbols-outlined text-3xl text-white opacity-20">payments</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1 text-white">
                <span className="text-lg font-medium opacity-80">R$</span>
                <span className="text-4xl font-extrabold tracking-tight">19.643,80</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-5">
          <h3 className="text-gray-900 font-bold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'ENTRY_REG', label: 'Registrar Entrada', icon: 'move_to_inbox' },
              { id: 'SALE_REG', label: 'Registrar Venda', icon: 'point_of_sale' },
              { id: 'BUYER_REG', label: 'Cadastrar Compradores', icon: 'person_add' },
              { id: 'MATERIAL_REG', label: 'Cadastrar Materiais', icon: 'recycling' },
              { id: 'ROUTES_MAP', label: 'Rotas de Coleta', icon: 'local_shipping' },
              { id: 'REPORTS', label: 'Relatórios', icon: 'bar_chart' },
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.id as Screen)}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white shadow-sm border border-gray-100 group active:scale-95 transition-all hover:border-[#13ec6d]/30"
              >
                <div className="size-14 rounded-full bg-[#13ec6d]/10 flex items-center justify-center group-hover:bg-[#13ec6d]/20 transition-colors">
                  <span className="material-symbols-outlined text-[#13ec6d] text-[32px]">{action.icon}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      {/* Bottom Nav */}
      <nav className="flex-none w-full border-t border-gray-100 bg-white p-4 pb-6 z-30 flex justify-between">
        <button onClick={() => navigate('ADMIN_DASHBOARD')} className="flex flex-col items-center gap-1 px-4">
          <div className="bg-[#13ec6d]/20 rounded-full h-8 w-12 flex items-center justify-center text-[#0eb553]">
            <span className="material-symbols-outlined filled-icon">home</span>
          </div>
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button onClick={() => navigate('ROUTES_MAP')} className="flex flex-col items-center gap-1 px-4 text-gray-300 hover:text-[#10c65c] transition-colors">
          <span className="material-symbols-outlined">map</span>
          <span className="text-[10px] font-medium">Mapa</span>
        </button>
        <button onClick={() => navigate('PROFILE')} className="flex flex-col items-center gap-1 px-4 text-gray-300 hover:text-[#10c65c] transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
        <button onClick={() => navigate('SETTINGS')} className="flex flex-col items-center gap-1 px-4 text-gray-300 hover:text-[#10c65c] transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-medium">Config</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboard;
