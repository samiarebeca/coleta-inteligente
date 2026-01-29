
import React from 'react';
import { Screen } from '../App';

interface DriverDashboardProps {
  navigate: (screen: Screen) => void;
  userName?: string;
  userLogo?: string;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ navigate, userName, userLogo }) => {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#f6f8f7]">
      {/* Header */}
      <header className="flex-none p-4 flex items-center justify-between bg-[#f6f8f7]/95 backdrop-blur-sm z-20 border-b border-gray-100" style={{ touchAction: 'none' }}>
        <div className="flex items-center gap-3" onClick={() => navigate('PROFILE')}>
          <div className="size-10 rounded-full border-2 border-[#10c65c] bg-cover bg-center"
            style={{ backgroundImage: `url("${userLogo || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYzY1YyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4='}")` }}>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#4c9a6c] uppercase tracking-wider">Bem-vindo</span>
            <h2 className="text-lg font-bold leading-tight">{userName?.split(' ')[0] || 'Motorista'}</h2>
          </div>
        </div>
        <button onClick={() => navigate('NOTIFICATIONS')} className="relative size-10 flex items-center justify-center active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-[#f6f8f7]"></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-6 pb-24 overflow-y-auto no-scrollbar overscroll-y-none">
        {/* Route Card */}
        <section onClick={() => navigate('ROUTES_MAP')}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-200 relative">
              <img src="https://picsum.photos/seed/route/400/200" alt="Route map" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-3 right-3 bg-[#10c65c] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <span className="size-1.5 bg-white rounded-full animate-pulse"></span>
                ATIVA
              </div>
            </div>
            <div className="p-5">
              <p className="text-[#4c9a6c] text-[10px] font-bold uppercase tracking-widest mb-1">Rota Diária</p>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold leading-tight">ROTA A - CENTRO</h3>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <span className="material-symbols-outlined text-gray-500">local_shipping</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-[#10c65c]">directions_bus</span>
                  <span>Caminhão 04</span>
                </div>
                <div className="size-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-[#10c65c]">location_on</span>
                  <span>12 Pontos</span>
                </div>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-100">
              <div className="h-full bg-[#10c65c]" style={{ width: '35%' }}></div>
            </div>
          </div>
        </section>

        {/* Start Button */}
        <button onClick={() => navigate('COLLECTION_REG')} className="w-full h-14 bg-[#10c65c] text-white rounded-xl shadow-lg shadow-[#10c65c]/30 flex items-center justify-center gap-3 font-bold active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined text-[28px] filled-icon">play_circle</span>
          <span className="text-lg tracking-wide uppercase">Iniciar Coleta</span>
        </button>

        {/* Itinerary */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold">Itinerário</h3>
            <span className="text-sm font-medium text-[#4c9a6c]">4 de 12 concluídos</span>
          </div>

          {/* Completed */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-50 shadow-sm opacity-60">
            <div className="size-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <span className="material-symbols-outlined">check</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-400 line-through">Bar do João</p>
              <p className="text-xs font-bold text-green-600">15.4 kg recolhidos</p>
            </div>
            <span className="text-[10px] font-bold text-gray-400">08:30</span>
          </div>

          {/* Current */}
          <div onClick={() => navigate('COLLECTION_REG')} className="flex items-center gap-4 bg-white p-4 rounded-xl border-l-4 border-l-[#10c65c] shadow-md cursor-pointer border-y border-r border-[#10c65c]/10 active:bg-gray-50 transition-colors">
            <div className="size-10 rounded-full bg-[#10c65c]/10 text-[#10c65c] flex items-center justify-center ring-2 ring-[#10c65c] ring-offset-2 ring-white">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#10c65c] uppercase">Próxima Parada</p>
              <p className="font-bold text-lg">Condomínio Verde</p>
              <p className="text-xs text-gray-400">Rua das Flores, 123</p>
            </div>
            <button className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-600">navigation</span>
            </button>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
            <div className="size-10 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center">
              <span className="material-symbols-outlined">radio_button_unchecked</span>
            </div>
            <div className="flex-1">
              <p className="font-bold">Mercado Central</p>
              <p className="text-xs text-gray-400">Av. Principal, 500</p>
            </div>
            <span className="text-[10px] font-bold text-gray-400">Est. 09:45</span>
          </div>

          {/* Issue */}
          <div className="flex items-center gap-4 bg-red-50 p-4 rounded-xl border border-red-100">
            <div className="size-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div className="flex-1">
              <p className="font-bold">Restaurante Sabor</p>
              <p className="text-xs font-bold text-red-600">Não coletado: Portão fechado</p>
            </div>
          </div>
        </section>
      </main>

      {/* Driver Nav */}
      <nav className="flex-none w-full border-t border-gray-100 bg-white p-4 pb-6 z-30 flex justify-between" style={{ touchAction: 'none' }}>
        <button
          onClick={(e) => { e.preventDefault(); navigate('ROUTES_MAP'); }}
          className="flex flex-col items-center gap-1 px-4 text-[#10c65c]"
        >
          <div className="bg-[#10c65c]/10 rounded-full h-8 w-12 flex items-center justify-center">
            <span className="material-symbols-outlined filled-icon">map</span>
          </div>
          <span className="text-[10px] font-bold">Rotas</span>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); navigate('HISTORY'); }}
          className="flex flex-col items-center gap-1 px-4 text-gray-300 hover:text-[#10c65c] transition-colors"
        >
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] font-medium">Histórico</span>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); navigate('NOTIFICATIONS'); }}
          className="flex flex-col items-center gap-1 px-4 text-gray-300 hover:text-[#10c65c] transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px] font-medium">Avisos</span>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); navigate('PROFILE'); }}
          className="flex flex-col items-center gap-1 px-4 text-gray-300 hover:text-[#10c65c] transition-colors"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default DriverDashboard;
