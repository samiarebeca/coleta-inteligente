
import React from 'react';
import { Screen } from '../App';

interface ProfileScreenProps {
  navigate: (screen: Screen) => void;
  onLogout: () => void;
  userRole: 'admin' | 'associate' | 'driver';
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigate, onLogout, userRole }) => {
  const getRoleLabel = () => {
    switch(userRole) {
        case 'admin': return 'Administrador';
        case 'driver': return 'Motorista';
        case 'associate': return 'Associado';
        default: return 'Usuário';
    }
  };

  const menuItems = [
    { label: 'Editar Dados', icon: 'edit', action: () => {} },
    { label: 'Alterar Senha', icon: 'lock', action: () => {} },
    // Apenas mostra histórico se não for associado
    ...(userRole !== 'associate' ? [{ label: 'Histórico de Atividades', icon: 'history', action: () => navigate('HISTORY') }] : []),
    { label: 'Notificações', icon: 'notifications', action: () => navigate('NOTIFICATIONS') },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7] pb-24">
      <header className="sticky top-0 bg-[#f6f8f7]/95 backdrop-blur-sm p-4 flex items-center justify-between z-20">
        <button onClick={() => navigate(userRole === 'admin' ? 'ADMIN_DASHBOARD' : userRole === 'driver' ? 'DRIVER_DASHBOARD' : 'ASSOCIATE_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Meu Perfil</h1>
        <button onClick={() => navigate('SETTINGS')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="p-4 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        {/* Profile Card */}
        <section className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-[#10c65c]/10 to-transparent"></div>
            <div className="relative size-28 rounded-full border-4 border-white shadow-lg mb-4 bg-cover bg-center" 
                 style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150")' }}>
                <div className="absolute bottom-1 right-1 size-5 bg-[#10c65c] rounded-full border-4 border-white"></div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800">Ricardo Silva</h2>
            <p className="text-sm font-bold text-[#10c65c] bg-[#10c65c]/10 px-3 py-1 rounded-full mt-1 uppercase tracking-wider">{getRoleLabel()}</p>
            <p className="text-gray-400 text-sm mt-2">membro desde 2021</p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
            {[
                { label: 'Pontos', val: '1.2k', icon: 'star' },
                { label: 'Coletas', val: '342', icon: 'recycling' },
                { label: 'Horas', val: '450', icon: 'schedule' }
            ].map((s) => (
                <div key={s.label} className="bg-white p-3 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-[#10c65c]">{s.icon}</span>
                    <span className="font-extrabold text-lg">{s.val}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{s.label}</span>
                </div>
            ))}
        </section>

        {/* Menu */}
        <section className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
            {menuItems.map((item, i) => (
                <button key={item.label} onClick={item.action} className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${i !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                        <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="flex-1 text-left font-bold text-gray-700">{item.label}</span>
                    <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                </button>
            ))}
        </section>

        <button onClick={onLogout} className="w-full p-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
            <span className="material-symbols-outlined">logout</span>
            SAIR DA CONTA
        </button>
      </main>
    </div>
  );
};

export default ProfileScreen;
