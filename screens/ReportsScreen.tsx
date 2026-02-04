import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportsScreenProps {
  navigate: (screen: Screen) => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigate }) => {
  const [sales, setSales] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(0);

  // New states for dynamic data
  const [goalsData, setGoalsData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync with dashboard selection
    const m = localStorage.getItem('dashboard_selected_month');
    const y = localStorage.getItem('dashboard_selected_year');
    if (m) setSelectedMonth(Number(m));
    if (y) setSelectedYear(Number(y));
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    setLoading(true);
    const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
    const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString();

    // 1. Fetch Sales
    const { data: salesData, error } = await supabase
      .from('sales')
      .select('*, buyers(name)')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (!error && salesData) {
      setSales(salesData);

      // Revenue
      const totalRev = salesData.reduce((acc, curr) => acc + (curr.total_value || 0), 0);
      setRevenue(totalRev);

      // Calculate Weights per Material
      const weightsByMat: Record<string, number> = {};
      let totalW = 0;
      salesData.forEach(s => {
        const w = Number(s.weight) || 0;
        const mat = s.material;
        if (!weightsByMat[mat]) weightsByMat[mat] = 0;
        weightsByMat[mat] += w;
        totalW += w;
      });
      setTotalWeight(totalW);

      // Pie Data
      const pieColors: Record<string, string> = {
        'Papelão': '#f97316',
        'Plástico': '#10c65c',
        'PET': '#10c65c',
        'Alumínio': '#3b82f6',
        'Vidro': '#a855f7',
        'Cobre': '#eab308',
        'Ferro': '#ef4444'
      };

      const generatedPieData = Object.keys(weightsByMat).map(mat => ({
        label: mat,
        value: weightsByMat[mat],
        // Calculate percentage
        percentage: totalW > 0 ? ((weightsByMat[mat] / totalW) * 100).toFixed(1) : 0,
        color: pieColors[mat] || '#9ca3af'
      }));
      setPieData(generatedPieData);

      // 2. Fetch Goals
      // Defined Materials for Goals: Metal, Vidro, Papel/Papelão, Plástico
      // We map generalized terms to actual DB material names

      const reportCategories = [
        { label: 'Metal', goalName: 'Metal', dbNames: ['Alumínio', 'Cobre', 'Ferro', 'Metal', 'Aço', 'Latão'], color: 'bg-blue-500' },
        { label: 'Vidro', goalName: 'Vidro', dbNames: ['Vidro'], color: 'bg-purple-500' },
        { label: 'Papel/Papelão', goalName: 'Papel/Papelão', dbNames: ['Papelão', 'Papel', 'Papel Branco', 'Jornal', 'Revista'], color: 'bg-orange-500' },
        { label: 'Plástico', goalName: 'Plástico', dbNames: ['Plástico', 'PET', 'Plastico', 'PVC', 'PEAD'], color: 'bg-green-500' }
      ];

      const { data: goalsDB } = await supabase
        .from('goals')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      const mergedGoals = reportCategories.map(cat => {
        // Sum current weights for all materials in this category
        let currentWeight = 0;
        cat.dbNames.forEach(dbName => {
          currentWeight += (weightsByMat[dbName] || 0);
        });

        // Find goal in DB
        // Priority: 1. goalName, 2. label, 3. first dbName
        let g = goalsDB?.find(gx => gx.material_name === cat.goalName);
        if (!g) g = goalsDB?.find(gx => gx.material_name === cat.label);

        const target = g?.target_weight || 0;

        return {
          name: cat.label,
          current: currentWeight,
          target: target,
          color: cat.color
        };
      });

      setGoalsData(mergedGoals);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (sales.length === 0) {
      alert("Sem dados para exportar.");
      return;
    }
    const headers = ["Data", "Material", "Subclasse", "Peso (kg)", "Preço/kg (R$)", "Total (R$)", "Comprador"];
    const rows = sales.map(s => [
      new Date(s.created_at).toLocaleDateString() + ' ' + new Date(s.created_at).toLocaleTimeString(),
      s.material,
      s.subclass || '-',
      s.weight,
      s.price_per_kg,
      s.total_value,
      s.buyers?.name || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_vendas_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    try {
      const input = reportRef.current;
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const widthRatio = pdfWidth / imgWidth;
      const finalHeight = imgHeight * widthRatio;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, finalHeight);
      pdf.save(`relatorio_${selectedMonth}_${selectedYear}.pdf`);
    } catch (e) {
      console.error("PDF Error", e);
      alert("Erro ao gerar PDF.");
    }
  };

  let cumulativePercent = 0;
  const gradientString = pieData.length > 0 ? pieData.map(item => {
    const start = cumulativePercent;
    const pVal = Number(item.percentage);
    cumulativePercent += pVal;
    return `${item.color} ${start}% ${cumulativePercent}%`;
  }).join(', ') : '#e5e7eb 0% 100%';

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7]">
      <header className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center z-20" style={{ touchAction: 'none' }}>
        <button onClick={() => navigate('ADMIN_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center pr-10 text-lg font-bold">Relatórios - {monthNames[selectedMonth - 1]}/{selectedYear}</h1>
      </header>

      <main ref={reportRef} className="p-4 space-y-6 overflow-y-auto no-scrollbar pb-24 overscroll-y-none">

        {loading && (
          <div className="flex justify-center py-4"><div className="animate-spin size-6 border-2 border-[#10c65c] border-t-transparent rounded-full"></div></div>
        )}

        {/* Card de Receita */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col gap-2">
          <p className="text-xs font-bold text-gray-400 uppercase">Receita Total do Mês</p>
          <p className="text-4xl font-black text-gray-800">R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 text-[#10c65c] text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span> {monthNames[selectedMonth - 1]}
          </div>
        </section>

        {/* Gráfico de Pizza - Produção Geral */}
        <section className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
          <h3 className="text-lg font-bold mb-6 px-1">Produção Geral (Vendas)</h3>
          {totalWeight === 0 ? (
            <p className="text-center text-gray-400 py-10 font-bold">Sem vendas registradas neste mês.</p>
          ) : (
            <div className="flex flex-col items-center">
              <div className="size-56 rounded-full relative shadow-inner mb-8"
                style={{ background: `conic-gradient(${gradientString})` }}>
                <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                  <span className="text-3xl font-black text-gray-800">{(totalWeight / 1000).toFixed(1)}t</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                </div>
              </div>

              {/* Legenda */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full px-2">
                {pieData.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-gray-600 uppercase">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-gray-800">{item.value}kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Metas Lineares */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold px-1">Progresso das Metas</h3>
          <div className="grid grid-cols-1 gap-3">
            {goalsData.map(g => {
              const perc = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
              return (
                <div key={g.name} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm animate-page">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h4 className="font-black text-xl">{g.name}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase">{g.current}kg de {g.target}kg</p>
                    </div>
                    <span className="text-2xl font-black text-gray-800">{perc}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${g.color} transition-all duration-700`} style={{ width: `${perc}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 mx-auto p-4 bg-white/95 border-t border-gray-100 z-30 flex gap-2">
        <button onClick={handleExportCSV} className="flex-1 h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">download</span> EXCEL
        </button>
        <button onClick={handleExportPDF} className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">picture_as_pdf</span> PDF
        </button>
      </footer>
    </div>
  );
};

export default ReportsScreen;
