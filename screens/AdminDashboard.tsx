
import React, { useState } from 'react';
import { Screen } from '../App';
import SideMenu from '../components/SideMenu';

interface AdminDashboardProps {
  navigate: (screen: Screen) => void;
  userName?: string;
  userLogo?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, userName, userLogo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems: { label: string; icon: string; screen: Screen }[] = [
    { label: 'Início', icon: 'home', screen: 'ADMIN_DASHBOARD' },
    { label: 'Mapa de Rotas', icon: 'map', screen: 'ROUTES_MAP' },
    { label: 'Relatórios', icon: 'bar_chart', screen: 'REPORTS' },
    { label: 'Notificações', icon: 'notifications', screen: 'NOTIFICATIONS' },
    { label: 'Meu Perfil', icon: 'person', screen: 'PROFILE' },
    { label: 'Configurações', icon: 'settings', screen: 'SETTINGS' },
  ];

  return (
    <div className="fixed inset-0 no-scrollbar flex flex-col overflow-hidden bg-[#f6f8f7]">
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navigate={navigate}
        menuItems={menuItems}
        userName={userName}
        userLogo={userLogo}
        userRole="Administrador"
      />

      {/* Header */}
      <header className="flex-none flex items-center justify-between p-5 pb-2 bg-[#f6f8f7]/95 backdrop-blur-sm z-20" style={{ touchAction: 'none' }}>
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-full border-2 border-[#13ec6d] bg-cover bg-center cursor-pointer"
            onClick={() => navigate('PROFILE')}
            style={{ backgroundImage: `url("${userLogo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYzY1YyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi404IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnpNMCAzYzEuNjYgMCAzIDEuMzQgMyAzcy0xLjM0IDMtMyAzLTMtMS4zNC0zLTMgMS4zNC0zIDMtM3pNMCAxNC4yYy0yLjUgMC00LjcxLTEuMjgtNi0zLjIyLjAzLTEuOTkgNC0zLjA4IDYtMy4wOCAxLjk5IDAgNS45NyAxLjA5IDYgMy4wOC0xLjI5IDEuOTQtMy41IDMuMjItNiAzLjIyWiIvPjwvc3ZnPg=='}")` }}>
          </div>
          <div className="flex flex-col" onClick={() => navigate('PROFILE')}>
            <span className="text-xs text-gray-400">Bem vindo,</span>
            <h2 className="text-lg font-bold leading-tight">{userName?.split(' ')[0] || 'Admin'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMenuOpen(true)} className="p-1 rounded-full active:bg-gray-200 transition-colors">
            <span className="material-symbols-outlined text-gray-800 text-3xl">menu</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-y-none">
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
        <section className="px-5 pb-10">
          <h3 className="text-gray-900 font-bold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'ENTRY_REG', label: 'Registrar Entrada', icon: 'move_to_inbox' },
              { id: 'SALE_REG', label: 'Registrar Venda', icon: 'point_of_sale' },
              { id: 'BUYER_REG', label: 'Cadastrar Compradores', icon: 'person_add' },
              { id: 'MATERIAL_REG', label: 'Cadastrar Materiais', icon: 'recycling' },
              { id: 'ROUTES_MAP', label: 'Rotas de Coleta', icon: 'local_shipping', disabled: true },
              { id: 'REPORTS', label: 'Relatórios', icon: 'bar_chart' },
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => !action.disabled && navigate(action.id as Screen)}
                disabled={action.disabled}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-white shadow-sm border border-gray-100 group transition-all ${action.disabled
                    ? 'opacity-50 cursor-not-allowed grayscale'
                    : 'active:scale-95 hover:border-[#13ec6d]/30'
                  }`}
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
    </div>
  );
};

export default AdminDashboard;
