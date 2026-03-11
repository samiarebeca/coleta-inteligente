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

  const resolveActiveAssociationId = async () => {
    const storedAssociationId = localStorage.getItem('selectedAssoc');
    if (storedAssociationId) return storedAssociationId;

    const preferredRole = localStorage.getItem('preferredRole');
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) return null;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('role, association_id')
      .eq('user_id', session.user.id);

    if (!profiles || profiles.length === 0) return null;

    const activeProfile = profiles.find(profile => profile.role === preferredRole) || profiles[0];
    return activeProfile?.association_id || null;
  };

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

      const associationId = await resolveActiveAssociationId();

      const goalsQuery = supabase
        .from('goals')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      const { data: goalsDB } = associationId
        ? await goalsQuery.eq('association_id', associationId)
        : { data: [] };

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

  const createPdfSnapshot = () => {
    const sectionIds = [
      'report-revenue-card',
      'report-revenue-chart',
      'report-volume-chart',
      'report-goals-section',
    ];

    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) return null;

    const snapshotRoot = document.createElement('div');
    snapshotRoot.setAttribute('data-pdf-snapshot', 'true');
    snapshotRoot.style.position = 'fixed';
    snapshotRoot.style.left = '-20000px';
    snapshotRoot.style.top = '0';
    snapshotRoot.style.width = '1120px';
    snapshotRoot.style.background = '#f8fafc';
    snapshotRoot.style.padding = '20px';
    snapshotRoot.style.zIndex = '-1';

    const style = document.createElement('style');
    style.textContent = `
      [data-pdf-snapshot="true"] * {
        box-sizing: border-box;
        animation: none !important;
        transition: none !important;
      }

      [data-pdf-snapshot="true"] .pdf-shell {
        background: #f8fafc;
        color: #111827;
        font-family: Arial, sans-serif;
      }

      [data-pdf-snapshot="true"] .pdf-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 16px;
        margin-bottom: 16px;
        padding: 0 4px 12px;
        border-bottom: 1px solid #d1d5db;
      }

      [data-pdf-snapshot="true"] .pdf-grid {
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 14px;
        align-items: start;
      }

      [data-pdf-snapshot="true"] .pdf-column {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      [data-pdf-snapshot="true"] section {
        margin: 0 !important;
        border-radius: 18px !important;
        box-shadow: none !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-card,
      [data-pdf-snapshot="true"] #report-revenue-chart,
      [data-pdf-snapshot="true"] #report-volume-chart,
      [data-pdf-snapshot="true"] #report-goals-section > div > div {
        padding: 16px !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-card p:first-child,
      [data-pdf-snapshot="true"] #report-revenue-chart span,
      [data-pdf-snapshot="true"] #report-volume-chart span,
      [data-pdf-snapshot="true"] #report-goals-section p {
        font-size: 11px !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-card p:nth-child(2) {
        font-size: 34px !important;
        line-height: 1.05 !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-chart h3,
      [data-pdf-snapshot="true"] #report-volume-chart h3,
      [data-pdf-snapshot="true"] #report-goals-section h3 {
        font-size: 18px !important;
        margin: 0 !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-chart .size-56,
      [data-pdf-snapshot="true"] #report-revenue-chart .md\\:size-64 {
        width: 150px !important;
        height: 150px !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-chart .absolute.inset-6 {
        inset: 18px !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-chart .text-2xl,
      [data-pdf-snapshot="true"] #report-revenue-chart .md\\:text-3xl {
        font-size: 20px !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-chart .mb-8,
      [data-pdf-snapshot="true"] #report-revenue-chart .mt-6,
      [data-pdf-snapshot="true"] #report-volume-chart .mt-6,
      [data-pdf-snapshot="true"] #report-volume-chart .mb-6 {
        margin-top: 10px !important;
        margin-bottom: 10px !important;
      }

      [data-pdf-snapshot="true"] #report-volume-chart .h-64 {
        height: 140px !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-chart .py-3,
      [data-pdf-snapshot="true"] #report-volume-chart .py-3 {
        padding-top: 8px !important;
        padding-bottom: 8px !important;
      }

      [data-pdf-snapshot="true"] #report-revenue-chart .text-lg,
      [data-pdf-snapshot="true"] #report-volume-chart .text-lg,
      [data-pdf-snapshot="true"] #report-goals-section .text-xl,
      [data-pdf-snapshot="true"] #report-goals-section .text-2xl {
        font-size: 16px !important;
        line-height: 1.2 !important;
      }

      [data-pdf-snapshot="true"] #report-goals-section .grid {
        gap: 10px !important;
      }

      [data-pdf-snapshot="true"] #report-goals-section .mb-3,
      [data-pdf-snapshot="true"] #report-revenue-chart .mb-6,
      [data-pdf-snapshot="true"] #report-volume-chart .mb-6 {
        margin-bottom: 10px !important;
      }

      [data-pdf-snapshot="true"] #report-goals-section .h-4 {
        height: 12px !important;
      }
    `;

    const shell = document.createElement('div');
    shell.className = 'pdf-shell';

    const header = document.createElement('div');
    header.className = 'pdf-header';
    header.innerHTML = `
      <div>
        <div style="font-size: 24px; font-weight: 700;">Relatorio de Coleta Inteligente</div>
        <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Periodo: ${monthNames[selectedMonth - 1]} de ${selectedYear}</div>
      </div>
      <div style="font-size: 11px; color: #9ca3af;">Gerado em ${new Date().toLocaleDateString('pt-BR')}</div>
    `;

    const grid = document.createElement('div');
    grid.className = 'pdf-grid';

    const leftColumn = document.createElement('div');
    leftColumn.className = 'pdf-column';

    const rightColumn = document.createElement('div');
    rightColumn.className = 'pdf-column';

    sections.forEach(section => {
      const clone = section.cloneNode(true) as HTMLElement;
      if (section.id === 'report-goals-section') {
        rightColumn.appendChild(clone);
      } else {
        leftColumn.appendChild(clone);
      }
    });

    grid.appendChild(leftColumn);
    grid.appendChild(rightColumn);
    shell.appendChild(header);
    shell.appendChild(grid);
    snapshotRoot.appendChild(style);
    snapshotRoot.appendChild(shell);

    document.body.appendChild(snapshotRoot);
    return snapshotRoot;
  };

  const handleExportPDF = async () => {
    let snapshotRoot: HTMLDivElement | null = null;
    try {
      setLoading(true);
      snapshotRoot = createPdfSnapshot();
      if (!snapshotRoot) {
        alert("Nao foi possivel montar o relatorio para PDF.");
        return;
      }

      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 8;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      const canvas = await html2canvas(snapshotRoot, {
        scale: 2,
        backgroundColor: '#f8fafc'
      });

      const imgData = canvas.toDataURL('image/png');
      const widthRatio = contentWidth / canvas.width;
      const heightRatio = contentHeight / canvas.height;
      const scale = Math.min(widthRatio, heightRatio);
      const imgWidth = canvas.width * scale;
      const imgHeight = canvas.height * scale;
      const offsetX = (pageWidth - imgWidth) / 2;
      const offsetY = (pageHeight - imgHeight) / 2;

      doc.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight, undefined, 'FAST');
      doc.save(`relatorio_${selectedMonth}_${selectedYear}.pdf`);
    } catch (e) {
      console.error("PDF Error", e);
      alert("Erro ao gerar PDF.");
    } finally {
      snapshotRoot?.remove();
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

          <div className="col-span-1 lg:col-span-2 flex gap-2 w-full mt-4">
            <button onClick={handleExportCSV} className="flex-1 h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 hover:bg-gray-800 transition-all shadow-lg shadow-black/20">
              <span className="material-symbols-outlined">download</span> <span className="hidden md:inline">EXPORTAR</span> CSV
            </button>
            <button onClick={handleExportPDF} className="flex-1 h-14 bg-[#10c65c] text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 hover:bg-[#0da54b] transition-all shadow-lg shadow-[#10c65c]/20">
              <span className="material-symbols-outlined">picture_as_pdf</span> <span className="hidden md:inline">GERAR</span> PDF
            </button>
          </div>

        </div>



      </main>



    </div>
  );
};

export default ReportsScreen;
