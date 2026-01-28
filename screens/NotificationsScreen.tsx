
import React from 'react';
import { Screen } from '../App';

interface NotificationsScreenProps {
  navigate: (screen: Screen) => void;
  onBack: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigate, onBack }) => {
  const notifications = [
    { id: 1, title: 'Meta atingida!', msg: 'Você alcançou 100% da meta de papelão.', time: '2 min atrás', type: 'success', icon: 'emoji_events' },
    { id: 2, title: 'Nova rota disponível', msg: 'A Rota Sul foi liberada para coleta.', time: '1h atrás', type: 'info', icon: 'map' },
    { id: 3, title: 'Alerta de estoque', msg: 'O estoque de vidro está atingindo a capacidade máxima.', time: '3h atrás', type: 'warning', icon: 'warning' },
    { id: 4, title: 'Pagamento processado', msg: 'A venda #4932 foi creditada.', time: 'Ontem', type: 'success', icon: 'payments' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md p-4 border-b border-gray-100 flex items-center gap-4 z-20">
        <button onClick={onBack} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Notificações</h1>
        <div className="flex-1 flex justify-end">
            <button className="text-xs font-bold text-[#10c65c]">Ler todas</button>
        </div>
      </header>

      <main className="p-4 space-y-3 overflow-y-auto no-scrollbar pb-10">
        {notifications.map((n) => (
            <div key={n.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex gap-4 animate-page">
                <div className={`size-12 rounded-full flex items-center justify-center flex-shrink-0 
                    ${n.type === 'success' ? 'bg-green-100 text-green-600' : 
                      n.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    <span className="material-symbols-outlined">{n.icon}</span>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800">{n.title}</h3>
                        <span className="text-[10px] font-bold text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-tight mt-1">{n.msg}</p>
                </div>
                {n.id === 1 && <div className="size-2 bg-red-500 rounded-full mt-2"></div>}
            </div>
        ))}
        <p className="text-center text-xs font-bold text-gray-300 pt-4 uppercase tracking-widest">Fim das notificações</p>
      </main>
    </div>
  );
};

export default NotificationsScreen;
