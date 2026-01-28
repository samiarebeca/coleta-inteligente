
import React, { useState } from 'react';
import { Screen } from '../App';

interface CollectionRegistrationProps {
  navigate: (screen: Screen) => void;
  onFinish: () => void;
}

const CollectionRegistration: React.FC<CollectionRegistrationProps> = ({ navigate, onFinish }) => {
  const [point, setPoint] = useState(1);
  const totalPoints = 3;
  const [weight, setWeight] = useState('');

  const handleNext = () => {
    if (point < totalPoints) {
      setPoint(p => p + 1);
      setWeight('');
    } else {
      onFinish();
    }
  };

  const pointsNames = ["Bar do João", "Condomínio Verde", "Mercado Central"];

  return (
    <div className="flex flex-col h-full bg-[#f8fcfa]">
      <header className="sticky top-0 bg-white shadow-sm border-b border-[#cfe7d9] p-4 flex items-center z-20">
        <button onClick={() => navigate('DRIVER_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Ponto {point} de {totalPoints}</p>
          <h1 className="text-xl font-black leading-tight">{pointsNames[point-1]}</h1>
        </div>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-8">
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-400 uppercase mb-4 text-center tracking-widest">Peso coletado neste ponto</label>
          <div className="relative">
            <input type="number" className="w-full h-24 bg-gray-50 border-2 border-[#cfe7d9] rounded-3xl text-5xl font-black text-center focus:border-[#10c65c] outline-none" placeholder="0.0" value={weight} onChange={e => setWeight(e.target.value)} />
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">kg</span>
          </div>
        </section>

        <div className="bg-[#10c65c]/10 p-5 rounded-3xl border border-[#10c65c]/20">
            <h4 className="font-bold text-[#10c65c] mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">info</span> Dica do Operador
            </h4>
            <p className="text-sm text-[#4c9a6c] leading-snug">Verifique se o material está limpo e separado antes de registrar o peso final.</p>
        </div>

        <div className="mt-auto space-y-4">
          <button onClick={handleNext} className="w-full h-16 bg-[#10c65c] text-white rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
            <span className="material-symbols-outlined">{point === totalPoints ? 'check_circle' : 'arrow_forward'}</span>
            {point === totalPoints ? 'FINALIZAR COLETA' : 'PRÓXIMO PONTO'}
          </button>
          <button onClick={() => setPoint(p => Math.min(totalPoints, p+1))} className="w-full h-14 text-red-500 font-bold uppercase text-sm">Pular este ponto</button>
        </div>
      </main>
    </div>
  );
};

export default CollectionRegistration;
