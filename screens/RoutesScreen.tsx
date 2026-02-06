
import React, { useState } from 'react';
import { Screen } from '../App';

interface RoutesScreenProps {
  navigate: (screen: Screen) => void;
  userRole?: 'admin' | 'associate' | 'driver';
}

const RoutesScreen: React.FC<RoutesScreenProps> = ({ navigate, userRole = 'admin' }) => {

  // Estado para gerenciar os pontos da rota do motorista
  const [driverPoints, setDriverPoints] = useState([
    { id: 1, name: 'Bar do João', address: 'Rua das Flores, 123', status: 'pending', time: '08:30' },
    { id: 2, name: 'Condomínio Verde', address: 'Av. Central, 450', status: 'pending', time: '09:15' },
    { id: 3, name: 'Mercado Central', address: 'Praça da Sé, 89', status: 'pending', time: '10:00' },
    { id: 4, name: 'Restaurante Sabor', address: 'Rua Augusta, 12', status: 'pending', time: '10:45' },
  ]);

  const handleBack = () => {
    if (userRole === 'driver') navigate('DRIVER_DASHBOARD');
    else navigate('ADMIN_DASHBOARD');
  };

  const togglePointStatus = (id: number, newStatus: 'collected' | 'pending') => {
    setDriverPoints(prev => prev.map(p =>
      p.id === id ? { ...p, status: newStatus } : p
    ));

    // Se marcar como coletado, poderíamos navegar para o registro de peso
    if (newStatus === 'collected') {
      // Opcional: navigate('COLLECTION_REG');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md p-4 border-b border-gray-100 flex items-center justify-between z-20" style={{ touchAction: 'none' }}>
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold">{userRole === 'driver' ? 'Minha Rota' : 'Rotas de Coleta'}</h1>
        </div>
        {userRole === 'admin' && (
          <button className="size-10 bg-[#10c65c]/10 text-[#10c65c] rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 overscroll-y-none md:flex md:flex-row md:overflow-hidden md:pb-0">
        {/* Map Preview */}
        <div className="h-64 w-full bg-gray-200 relative md:h-full md:flex-1">
          <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&h=300" alt="Map" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Mock Markers based on driverPoints status */}
          <div className={`absolute top-1/4 left-1/3 size-6 rounded-full border-2 border-white shadow-lg ${driverPoints[0]?.status === 'collected' ? 'bg-gray-400' : 'bg-[#10c65c] animate-bounce'}`}></div>
          <div className={`absolute bottom-1/3 right-1/4 size-6 rounded-full border-2 border-white shadow-lg ${driverPoints[1]?.status === 'collected' ? 'bg-gray-400' : 'bg-[#10c65c]'}`}></div>
        </div>

        <section className="p-4 space-y-4 md:flex-1 md:overflow-y-auto md:h-full md:pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{userRole === 'driver' ? 'Pontos da Rota' : 'Suas Rotas Ativas'}</h2>
            <span className="text-xs font-bold text-[#10c65c] bg-[#10c65c]/10 px-3 py-1 rounded-full">
              {userRole === 'driver' ? `${driverPoints.length} Pontos` : '3 Rotas'}
            </span>
          </div>

          <div className="space-y-4 md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-4 md:space-y-0">
            {userRole === 'driver' ? (
              // Driver View: Interactive List
              driverPoints.map((point, index) => (
                <div key={point.id} className={`bg-white p-4 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col gap-4 ${point.status === 'collected' ? 'border-[#10c65c] bg-[#10c65c]/5' : 'border-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${point.status === 'collected' ? 'bg-[#10c65c] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {point.status === 'collected' ? <span className="material-symbols-outlined">check</span> : index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${point.status === 'collected' ? 'text-[#10c65c]' : 'text-gray-800'}`}>{point.name}</h3>
                      <p className="text-xs text-gray-400">{point.address}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded-lg">{point.time}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePointStatus(point.id, 'collected')}
                      className={`flex-1 h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${point.status === 'collected'
                        ? 'bg-[#10c65c] text-white shadow-lg shadow-[#10c65c]/20'
                        : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-[#10c65c] hover:text-[#10c65c]'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      COLETADO
                    </button>
                    <button
                      onClick={() => togglePointStatus(point.id, 'pending')}
                      className={`flex-1 h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${point.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200'
                        : 'bg-white border-2 border-gray-100 text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      PENDENTE
                    </button>
                  </div>

                  {point.status === 'collected' && (
                    <div className="text-center animate-page">
                      <button onClick={() => navigate('COLLECTION_REG')} className="text-[10px] font-bold text-[#10c65c] underline">
                        Editar Detalhes da Coleta
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Admin View: List of Routes (Unchanged)
              [
                { id: 'A', name: 'Rota Centro - Matinal', points: 12, status: 'Em andamento', color: 'border-l-[#10c65c]' },
                { id: 'B', name: 'Rota Sul - Industrial', points: 8, status: 'Pendente', color: 'border-l-blue-500' },
                { id: 'C', name: 'Rota Norte - Residencial', points: 15, status: 'Pendente', color: 'border-l-orange-500' },
              ].map((route) => (
                <div key={route.id} className={`bg-white p-4 rounded-2xl border border-gray-50 border-l-4 ${route.color} shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer`}>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Caminhão 0{route.id}</p>
                    <h3 className="text-lg font-bold">{route.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {route.points} Pontos de coleta
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${route.status === 'Em andamento' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {route.status}
                    </span>
                    <button className="size-8 bg-gray-50 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {userRole === 'admin' && (
        <footer className="absolute bottom-0 right-0 p-4 bg-white/95 border-t border-gray-100 z-30 w-full md:w-1/2 backdrop-blur-sm">
          <button className="h-14 w-full bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">navigation</span>
            OTIMIZAR ROTAS
          </button>
        </footer>
      )}
    </div>
  );
};

export default RoutesScreen;
