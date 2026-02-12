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
  const [piePieData, setPiePieData] = useState<any[]>([]); // Data for Revenue Pie Chart
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

    // Ensure accurate full-month range
    const start = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0);
    const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

    const startDate = start.toISOString();
    const endDate = end.toISOString();

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

      // Calculate Weights per Material (Aggregation)
      const weightsByMat: Record<string, number> = {};
      let totalW = 0;

      salesData.forEach(s => {
        // Safe number conversion
        const w = parseFloat(s.weight);
        const weight = isNaN(w) ? 0 : w;

        // Normalize material name to avoid duplicates if casing differs slightly? 
        // User requested "use material attribute as id", implying exact match usually.
        // But let's trim whitespace to be safe.
        const mat = s.material ? s.material.trim() : 'Outros';

        if (!weightsByMat[mat]) weightsByMat[mat] = 0;
        weightsByMat[mat] += weight;
        totalW += weight;
      });

      setTotalWeight(totalW);

      // Pie Data (Production by Material)
      // Expanded color palette (uppercase keys for matching)
      // Pie Data (Production by Material)
      // Expanded color palette (uppercase keys for matching)
      // Colors updated: Metal=Yellow, Papel=Blue, Vidro=Green, Plástico=Red
      const pieColors: Record<string, string> = {
        // Papel (Blue)
        'PAPELÃO': '#3b82f6',
        'PAPEL': '#3b82f6',
        'PAPEL/PAPELÃO': '#3b82f6',
        'PAPEL / PAPELÃO': '#3b82f6',
        'PAPEL BRANCO': '#60a5fa',
        'JORNAL': '#93c5fd',
        'REVISTA': '#bfdbfe',

        // Plástico (Red)
        'PLÁSTICO': '#ef4444',
        'PLASTICO': '#ef4444',
        'PET': '#f87171',
        'PVC': '#fca5a5',
        'PEAD': '#fecaca',
        'MP': '#fee2e2',

        // Metal (Yellow)
        'ALUMÍNIO': '#eab308',
        'METAL': '#eab308',
        'FERRO': '#facc15',
        'COBRE': '#fde047',
        'AÇO': '#fef08a',
        'LATÃO': '#fef9c3',

        // Vidro (Green)
        'VIDRO': '#10c65c'
      };

      const generatedPieData = Object.keys(weightsByMat)
        .map(mat => {
          const val = weightsByMat[mat];
          // Try to find color case-insensitively
          const upperMat = mat.toUpperCase();
          const color = pieColors[upperMat] || '#9ca3af';

          return {
            label: mat,
            value: val,
            // Calculate percentage
            percentage: totalW > 0 ? ((val / totalW) * 100).toFixed(1) : "0.0",
            color: color
          };
        })
        .filter(item => item.value > 0) // Only show items with weight
        .sort((a, b) => b.value - a.value); // Sort by weight descending

      setPieData(generatedPieData);

      // Revenue Pie Chart Data
      const revenueByMat: Record<string, number> = {};
      salesData.forEach(s => {
        const val = s.total_value || 0;
        const mat = s.material ? s.material.trim() : 'Outros';
        if (!revenueByMat[mat]) revenueByMat[mat] = 0;
        revenueByMat[mat] += val;
      });

      const generatedRevenuePieData = Object.keys(revenueByMat)
        .map(mat => {
          const val = revenueByMat[mat];
          const upperMat = mat.toUpperCase();
          const color = pieColors[upperMat] || '#9ca3af';

          return {
            label: mat,
            value: val,
            percentage: totalRev > 0 ? ((val / totalRev) * 100).toFixed(1) : "0.0",
            color: color
          };
        })
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

      setPiePieData(generatedRevenuePieData);

      // 2. Fetch Goals - Updated logic
      const reportCategories = [
        { label: 'Metal', goalName: 'METAL', dbNames: ['Alumínio', 'Cobre', 'Ferro', 'Metal', 'Aço', 'Latão'], color: 'bg-yellow-500' },
        { label: 'Vidro', goalName: 'VIDRO', dbNames: ['Vidro'], color: 'bg-green-500' },
        {
          label: 'Papel / Papelão',
          goalName: 'PAPEL',
          // Include all variations of Papel found in sales or desired
          dbNames: ['Papelão', 'Papel', 'Papel Branco', 'Jornal', 'Revista', 'Papel/Papelão', 'PAPEL / PAPELÃO'],
          color: 'bg-blue-500'
        },
        { label: 'Plástico', goalName: 'PLÁSTICO', dbNames: ['Plástico', 'PET', 'Plastico', 'PVC', 'PEAD', 'MP'], color: 'bg-red-500' }
      ];

      const { data: goalsDB } = await supabase
        .from('goals')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      const mergedGoals = reportCategories.map(cat => {
        let currentWeight = 0;

        // Sum weights for matching materials (case-insensitive check)
        cat.dbNames.forEach(dbName => {
          // find matching keys in weightsByMat
          Object.keys(weightsByMat).forEach(key => {
            if (key.trim().toLowerCase() === dbName.trim().toLowerCase()) {
              currentWeight += weightsByMat[key];
            }
          });
        });

        // Find goal in DB
        // Check goalName, label, and variations
        let g = goalsDB?.find(gx => gx.material_name.toUpperCase() === cat.goalName.toUpperCase());

        // If not found by goalName, try label or other known variations
        if (!g) {
          g = goalsDB?.find(gx => gx.material_name.toUpperCase() === cat.label.toUpperCase());
        }

        // Fallback specifically for Papel variations if still not found
        if (!g && cat.goalName === 'PAPEL') {
          g = goalsDB?.find(gx => ['PAPEL/PAPELÃO', 'PAPELÃO'].includes(gx.material_name.toUpperCase()));
        }

        const target = g?.target_weight || 0;

        return {
          name: cat.label,
          current: currentWeight,
          target: target,
          color: cat.color
        };
      });

      setGoalsData(mergedGoals);
    } else {
      // Clear data if error or empty
      setSales([]);
      setRevenue(0);
      setTotalWeight(0);
      setPieData([]);
      setGoalsData([]);
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
    try {
      setLoading(true);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);

      // Header
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text("Relatório de Coleta Inteligente", margin, 20);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Período: ${monthNames[selectedMonth - 1]} de ${selectedYear}`, margin, 28);

      doc.setDrawColor(200);
      doc.line(margin, 35, pageWidth - margin, 35);

      let currentY = 45;

      // Helper to capture and add image
      const addSectionToPDF = async (elementId: string, title?: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Optional: Title for the section in PDF if not in the component
        if (title) {
          doc.setFontSize(14);
          doc.setTextColor(0);
          doc.text(title, margin, currentY);
          currentY += 8;
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (currentY + imgHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin + 10;
        }

        doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      };

      // 1. Revenue Card
      await addSectionToPDF('report-revenue-card');

      // 2. Charts Row (Side by Side if possible, or stacked)
      // For simplicity and readability in A4 vertical, stacking is often safer to avoid tiny text.
      // But let's try to fit them nicely.
      // Actually, users usually prefer larger charts. Let's stack them but maybe cap the height?
      // The current implementation takes the full width.

      await addSectionToPDF('report-revenue-chart');
      await addSectionToPDF('report-volume-chart');

      // Force new page for Goals if not much space left
      if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = 20;
      }

      await addSectionToPDF('report-goals-section');

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages} - Gerado em ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`relatorio_${selectedMonth}_${selectedYear}.pdf`);
    } catch (e) {
      console.error("PDF Error", e);
      alert("Erro ao gerar PDF.");
    } finally {
      setLoading(false);
    }
  };

  let cumulativePercent = 0;
  const gradientString = pieData.length > 0 ? pieData.map(item => {
    const start = cumulativePercent;
    const pVal = Number(item.percentage);
    cumulativePercent += pVal;
    return `${item.color} ${start}% ${cumulativePercent}%`;
  }).join(', ') : '#e5e7eb 0% 100%';

  let cumulativeRevenuePercent = 0;
  const revenuePieSegments = piePieData.map(item => {
    const start = cumulativeRevenuePercent;
    const proportion = revenue > 0 ? item.value / revenue : 0;
    cumulativeRevenuePercent += proportion;
    return {
      color: item.color,
      start,
      end: cumulativeRevenuePercent
    };
  });

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Create array for selector
  const months = monthNames.map((m, i) => ({ name: m, value: i + 1 }));

  return (
    <div className="flex flex-col h-full bg-[#f6f8f7] relative">
      {/* Header with Month Selector */}
      <header className="sticky top-0 bg-white p-4 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4 z-20 shadow-sm">
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          <button onClick={() => navigate('ADMIN_DASHBOARD')} className="size-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg md:text-xl font-bold md:hidden">Relatórios</h1>
          <div className="w-10 md:hidden"></div> {/* Spacer */}
        </div>

        <div className="flex flex-1 items-center justify-center md:justify-start gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
            <span className="material-symbols-outlined text-gray-400 pl-2">calendar_month</span>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                localStorage.setItem('dashboard_selected_month', e.target.value);
              }}
              className="bg-transparent text-gray-800 text-sm font-bold outline-none cursor-pointer py-2 pl-2 pr-1"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                localStorage.setItem('dashboard_selected_year', e.target.value);
              }}
              className="bg-transparent text-gray-800 text-sm font-bold outline-none cursor-pointer py-2 px-2"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <h1 className="hidden md:block flex-1 text-right pr-4 text-gray-400 font-bold text-sm">
          Visão Geral
        </h1>
      </header>

      <main ref={reportRef} className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 pb-48 overscroll-y-none">

        {loading && (
          <div className="flex justify-center py-4"><div className="animate-spin size-6 border-2 border-[#10c65c] border-t-transparent rounded-full"></div></div>
        )}

        <div className="max-w-6xl mx-auto space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 lg:items-start">

          <div className="space-y-6">
            {/* Card de Receita */}
            <section id="report-revenue-card" className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col gap-2 hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-gray-400 uppercase">Receita Total do Mês</p>
              <p className="text-4xl md:text-5xl font-black text-gray-800">R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-1 text-[#10c65c] text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span> {monthNames[selectedMonth - 1]} / {selectedYear}
              </div>
            </section>

            {/* Gráfico de Pizza - Composição da Receita */}
            <section id="report-revenue-chart" className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-lg font-bold">Composição da receita</h3>
                <span className="text-xs font-bold text-gray-400 uppercase">Total: R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {revenue === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <span className="material-symbols-outlined text-4xl text-gray-300">block</span>
                  <p className="text-center text-gray-400 font-bold">Sem vendas registradas neste mês.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="size-56 md:size-64 relative mb-8 transition-all hover:scale-105">
                    <svg viewBox="-1 -1 2 2" className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                      {revenuePieSegments.map((seg, i) => {
                        const isFull = seg.end - seg.start >= 0.999;
                        const x1 = Math.cos(2 * Math.PI * seg.start);
                        const y1 = Math.sin(2 * Math.PI * seg.start);
                        const x2 = Math.cos(2 * Math.PI * seg.end);
                        const y2 = Math.sin(2 * Math.PI * seg.end);
                        const largeArc = (seg.end - seg.start) > 0.5 ? 1 : 0;
                        const d = isFull
                          ? `mx 0 0 r 1` // circle logic is easier with <circle>
                          : `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        return isFull
                          ? <circle key={i} cx="0" cy="0" r="1" fill={seg.color} />
                          : <path key={i} d={d} fill={seg.color} />;
                      })}
                    </svg>
                    <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-sm z-10">
                      <span className="text-2xl md:text-3xl font-black text-gray-800">R${(revenue / 1000).toFixed(1)}k</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Receita</span>
                    </div>
                  </div>

                  {/* Legenda Receita - Lista Vertical Melhorada */}
                  <div className="w-full flex flex-col gap-2 mt-6 px-1">
                    {piePieData.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="size-4 rounded-full shadow-sm ring-2 ring-white" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-bold text-gray-700 uppercase">{item.label}</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-lg font-black text-gray-800">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-lg font-bold text-gray-500">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section id="report-volume-chart" className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-lg font-bold">Volume por material</h3>
                <span className="text-xs font-bold text-gray-400 uppercase">Total: {totalWeight.toLocaleString('pt-BR')}kg</span>
              </div>

              {totalWeight === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <span className="material-symbols-outlined text-4xl text-gray-300">block</span>
                  <p className="text-center text-gray-400 font-bold">Sem vendas registradas neste mês.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Chart Area */}
                  <div className="h-64 flex items-end justify-between gap-2 md:gap-4 w-full px-2 mb-6">
                    {pieData.map((item) => {
                      const maxVal = Math.max(...pieData.map(d => d.value));
                      const heightPerc = maxVal > 0 ? (item.value / maxVal) * 100 : 0;

                      return (
                        <div key={item.label} className="flex flex-col items-center flex-1 h-full justify-end group">
                          {/* Value Label */}
                          <div className="mb-2 text-[10px] md:text-xs font-bold text-gray-600 transition-all opacity-100 transform translate-y-0 text-center">
                            {item.value}<span className="text-[8px] text-gray-400">kg</span>
                          </div>

                          {/* The Bar */}
                          <div
                            className="w-full max-w-[40px] rounded-t-lg transition-all duration-1000 ease-out hover:opacity-80 relative group-hover:scale-105 origin-bottom shadow-sm"
                            style={{ height: `${heightPerc}%`, backgroundColor: item.color, minHeight: '6px' }}
                          >
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  {/* Legend - Updated to match Revenue Chart style */}
                  <div className="w-full flex flex-col gap-2 mt-6 px-1 border-t border-gray-100 pt-6">
                    {pieData.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="size-4 rounded-full shadow-sm ring-2 ring-white" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-bold text-gray-700 uppercase">{item.label}</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-lg font-black text-gray-800">{item.value.toLocaleString('pt-BR')} kg</span>
                          <span className="text-lg font-bold text-gray-500">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6" />
                  <div className="mt-6" />


                </div>



              )}
            </section>
          </div>



          <div className="space-y-6">
            {/* Metas Lineares */}
            <section id="report-goals-section" className="space-y-4">
              <h3 className="text-lg font-bold px-1">Progresso das Metas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                {goalsData.map(g => {
                  const perc = g.target > 0 ? ((g.current / g.target) * 100) : 0;
                  const displayPerc = perc.toFixed(0);
                  const progressWidth = Math.min(perc, 100);

                  return (
                    <div key={g.name} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm animate-page hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <h4 className="font-black text-xl text-gray-800 group-hover:text-black transition-colors">{g.name}</h4>
                          <p className="text-xs text-gray-400 font-bold uppercase">{g.current.toLocaleString('pt-BR')}kg / {g.target.toLocaleString('pt-BR')}kg</p>
                        </div>
                        <div className={`text-2xl font-black ${perc >= 100 ? 'text-[#10c65c]' : 'text-gray-800'}`}>
                          {displayPerc}%
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
                        <div className={`h-full rounded-full ${g.color} transition-all duration-1000 ease-out relative`} style={{ width: `${progressWidth}%` }}>
                          {/* Shine effect */}
                          <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          <button onClick={handleExportCSV} className="flex-1 h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 hover:bg-gray-800 transition-all shadow-lg shadow-black/20">
            <span className="material-symbols-outlined">download</span> <span className="hidden md:inline">EXPORTAR</span> CSV
          </button>
          <button onClick={handleExportPDF} className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 hover:bg-[#0da54b] transition-all shadow-lg shadow-[#10c65c]/20">
            <span className="material-symbols-outlined">picture_as_pdf</span> <span className="hidden md:inline">GERAR</span> PDF
          </button>

        </div>



      </main>



    </div>
  );
};

export default ReportsScreen;
