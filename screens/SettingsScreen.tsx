
import React, { useState } from 'react';
import { Screen } from '../App';

interface SettingsScreenProps {
  navigate: (screen: Screen) => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigate, onBack }) => {
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(false);
  const [dark, setDark] = useState(false);

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-12 h-7 rounded-full transition-colors relative ${active ? 'bg-[#10c65c]' : 'bg-gray-200'}`}>
      <div className={`size-5 bg-white rounded-full shadow-md absolute top-1 transition-all ${active ? 'left-6' : 'left-1'}`}></div>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md p-4 border-b border-gray-100 flex items-center gap-4 z-20" style={{ touchAction: 'none' }}>
        <button onClick={onBack} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Configurações</h1>
      </header>

      <main className="p-4 space-y-6 overflow-y-auto no-scrollbar overscroll-y-none">
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Geral</h2>
          <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">notifications</span>
                <span className="font-bold text-gray-700">Notificações Push</span>
              </div>
              <Toggle active={notif} onClick={() => setNotif(!notif)} />
            </div>
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">volume_up</span>
                <span className="font-bold text-gray-700">Sons do App</span>
              </div>
              <Toggle active={sound} onClick={() => setSound(!sound)} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">dark_mode</span>
                <span className="font-bold text-gray-700">Modo Escuro</span>
              </div>
              <Toggle active={dark} onClick={() => setDark(!dark)} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Suporte</h2>
          <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50">
              <span className="font-bold text-gray-700">Central de Ajuda</span>
              <span className="material-symbols-outlined text-gray-300">open_in_new</span>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
              <span className="font-bold text-gray-700">Política de Privacidade</span>
              <span className="material-symbols-outlined text-gray-300">open_in_new</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Sobre</h2>
          <div className="text-center p-8">
            <div className="size-16 bg-white rounded-2xl border border-gray-100 shadow-sm mx-auto flex items-center justify-center mb-3">
              <div className="size-10 bg-[#10c65c] rounded-lg"></div>
            </div>
            <h3 className="font-extrabold text-gray-800">Coleta Inteligente App</h3>
            <p className="text-xs font-bold text-gray-400">Versão 1.0.0 (Build 2)</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsScreen;
