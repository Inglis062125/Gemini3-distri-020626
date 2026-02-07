import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Scale, 
  FileText, 
  Layers, 
  Settings, 
  Globe, 
  Cpu, 
  Menu,
  X,
  Palette,
  Sparkles,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  Upload,
  RefreshCw,
  Eye,
  BarChart2,
  MapPin,
  TrendingUp,
  Grid,
  Filter,
  Search,
  Calendar,
  XCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap,
  ComposedChart,
  Sankey,
  Legend
} from 'recharts';

import { 
  ThemeMode, 
  PainterTheme, 
  Locale, 
  Page, 
  DistributionRecord 
} from './types';
import { 
  TRANSLATIONS, 
  PAINTER_THEMES, 
  MOCK_DISTRIBUTION_DATA,
  MOCK_PARETO_DATA,
  MOCK_TREEMAP_DATA
} from './constants';

// Import Default Dataset
import { DEFAULT_DATASET } from './defaultDataset';

// --- Helper Functions ---

const standardizeData = (input: string): DistributionRecord[] => {
  try {
    // Attempt JSON parse first
    if (input.trim().startsWith('[') || input.trim().startsWith('{')) {
      const parsed = JSON.parse(input);
      const array = Array.isArray(parsed) ? parsed : [parsed];
      // Simple mapping strategy (assigning fields if they match loosely)
      return array.map((item: any) => ({
        supplierId: item.supplierId || item.SupplierID || item.supplier || 'UNKNOWN',
        deliveryDate: item.deliveryDate || item.DeliverDate || item.date || new Date().toISOString(),
        customerId: item.customerId || item.CustomerID || item.customer || 'UNKNOWN',
        licenseNo: item.licenseNo || item.LicenseNo || item.license || 'PENDING',
        category: item.category || item.Category || 'General',
        udid: item.udid || item.UDID || '',
        model: item.model || item.Model || 'Standard',
        lotNo: item.lotNo || item.LotNO || item.lot || '',
        serialNo: item.serialNo || item.SerNo || item.SerialNo || '',
      }));
    }

    // Attempt CSV parse
    const lines = input.trim().split('\n');
    if (lines.length > 1) {
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      return lines.slice(1).map(line => {
        const values = line.split(',');
        const record: any = {};
        headers.forEach((h, i) => {
           // Simple mapping
           if (h.includes('supplier')) record.supplierId = values[i];
           if (h.includes('date')) record.deliveryDate = values[i];
           if (h.includes('customer')) record.customerId = values[i];
           if (h.includes('license')) record.licenseNo = values[i];
           if (h.includes('category')) record.category = values[i];
           if (h.includes('model')) record.model = values[i];
           if (h.includes('lot')) record.lotNo = values[i];
           if (h.includes('ser')) record.serialNo = values[i];
        });
        // Defaults
        return {
          supplierId: record.supplierId || 'UNKNOWN',
          deliveryDate: record.deliveryDate || new Date().toISOString(),
          customerId: record.customerId || 'UNKNOWN',
          licenseNo: record.licenseNo || 'PENDING',
          category: record.category || 'General',
          udid: '',
          model: record.model || 'Standard',
          lotNo: record.lotNo || '',
          serialNo: record.serialNo || '',
        } as DistributionRecord;
      });
    }
    return [];
  } catch (e) {
    console.error("Standardization failed", e);
    return [];
  }
};

// Mock inference for fields not present in simple CSVs (like TimeZone)
const inferTimeZone = (customerId: string) => {
    // Deterministic mock based on ID hash
    const val = customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (val % 3 === 0) return 'UTC+8'; // Asia
    if (val % 3 === 1) return 'UTC-5'; // US Est
    return 'UTC+1'; // Europe
};

// Data Transformers for Charts

const getSankeyData = (data: DistributionRecord[]) => {
  // Nodes must be indexed. Flow: Supplier -> License -> Model -> Customer
  const nodes: { name: string }[] = [];
  const links: { source: number, target: number, value: number }[] = [];

  const getNodeIndex = (name: string) => {
    let idx = nodes.findIndex(n => n.name === name);
    if (idx === -1) {
      nodes.push({ name });
      idx = nodes.length - 1;
    }
    return idx;
  };

  data.forEach(r => {
    // Limit complexity for demo: only process first 50 records to avoid spaghetti graph
    const supplier = `Sup: ${r.supplierId}`;
    const license = `Lic: ${r.licenseNo.substring(0,6)}...`;
    const model = `Mod: ${r.model}`;
    const customer = `Cust: ${r.customerId}`;

    const linkFlows = [
      [supplier, license],
      [license, model],
      [model, customer]
    ];

    linkFlows.forEach(([src, trg]) => {
      const sourceIdx = getNodeIndex(src);
      const targetIdx = getNodeIndex(trg);
      const existingLink = links.find(l => l.source === sourceIdx && l.target === targetIdx);
      if (existingLink) {
        existingLink.value += 1;
      } else {
        links.push({ source: sourceIdx, target: targetIdx, value: 1 });
      }
    });
  });

  return { nodes, links };
};

const getTemporalData = (data: DistributionRecord[]) => {
  // Aggregate by Date
  const agg: Record<string, number> = {};
  data.forEach(r => {
    const date = r.deliveryDate.substring(0, 8); // YYYYMMDD
    agg[date] = (agg[date] || 0) + 1;
  });
  return Object.keys(agg).map(k => ({ date: k, count: agg[k] })).sort((a,b) => a.date.localeCompare(b.date));
};

const getParetoData = (data: DistributionRecord[]) => {
  const counts: Record<string, number> = {};
  data.forEach(r => { counts[r.model] = (counts[r.model] || 0) + 1; });
  
  const sorted = Object.keys(counts)
    .map(k => ({ name: k, count: counts[k] }))
    .sort((a, b) => b.count - a.count);
  
  const total = sorted.reduce((sum, item) => sum + item.count, 0);
  let accumulated = 0;
  return sorted.map(item => {
    accumulated += item.count;
    return {
      ...item,
      cumulative: Math.round((accumulated / total) * 100)
    };
  }).slice(0, 10); // Top 10
};

const getHeatmapData = (data: DistributionRecord[]) => {
  // X: Model, Y: Customer, Z: Count
  const map: Record<string, number> = {};
  data.forEach(r => {
    const key = `${r.model}::${r.customerId}`;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.keys(map).map(key => {
    const [model, customer] = key.split('::');
    return { model, customer, value: map[key] };
  });
};

const getTreemapData = (data: DistributionRecord[]) => {
  // Category -> Model
  const tree: any = { name: 'Root', children: [] };
  const categories: Record<string, Record<string, number>> = {};

  data.forEach(r => {
    if (!categories[r.category]) categories[r.category] = {};
    categories[r.category][r.model] = (categories[r.category][r.model] || 0) + 1;
  });

  Object.keys(categories).forEach(cat => {
    const catNode = { name: cat.substring(0, 15), children: [] as any[] };
    Object.keys(categories[cat]).forEach(mod => {
      catNode.children.push({ name: mod, size: categories[cat][mod] });
    });
    tree.children.push(catNode);
  });
  
  return tree.children;
};

// --- Helper Components ---

// 1. Status Strip
const StatusStrip = ({ locale, tokens }: { locale: Locale, tokens: number }) => (
  <div className="flex items-center space-x-4 text-xs font-mono opacity-80 py-1">
    <div className="flex items-center space-x-1">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>{TRANSLATIONS[locale]['status.api']}</span>
    </div>
    <div className="h-3 w-px bg-[var(--color-border)]" />
    <div className="flex items-center space-x-1">
      <Cpu size={12} />
      <span>{TRANSLATIONS[locale]['status.tokens']}: {tokens.toLocaleString()}</span>
    </div>
    <div className="h-3 w-px bg-[var(--color-border)]" />
    <div className="flex items-center text-orange-400">
      <Zap size={12} className="mr-1" />
      <span>Agent: IDLE</span>
    </div>
  </div>
);

// 2. Dashboard View
const DashboardView = ({ locale, theme }: { locale: Locale, theme: PainterTheme }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 animate-in fade-in duration-700">
      {/* 1. Pulse Chart */}
      <div className="col-span-1 lg:col-span-2 p-6 rounded-2xl border border-[var(--color-border)] glass-panel shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Activity className="mr-2 text-[var(--color-accent)]" />
          {TRANSLATIONS[locale]['chart.pulse']}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DISTRIBUTION_DATA}>
              <defs>
                <linearGradient id="colorSupplier" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--color-text)" tick={{fontSize: 12}} />
              <YAxis stroke="var(--color-text)" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--color-text)' }}
              />
              <Area type="monotone" dataKey="supplier" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorSupplier)" />
              <Area type="monotone" dataKey="customer" stroke="var(--color-secondary)" fillOpacity={0.3} fill="var(--color-secondary)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Pareto Wall */}
      <div className="col-span-1 p-6 rounded-2xl border border-[var(--color-border)] glass-panel shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center">
           <Scale className="mr-2 text-[var(--color-accent)]" />
           {TRANSLATIONS[locale]['chart.pareto']}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={MOCK_PARETO_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--color-text)" tick={{fontSize: 10}} />
              <Tooltip cursor={{fill: 'var(--color-muted)', opacity: 0.1}} contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
              <Bar dataKey="uv" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 3. Comparison Lab (Advanced)
const ComparisonLab = ({ locale, defaultData }: { locale: Locale, defaultData: DistributionRecord[] }) => {
  const [activeTab, setActiveTab] = useState<'source' | 'visualize'>('source');
  const [sourceType, setSourceType] = useState<'default' | 'custom'>('default');
  const [customInput, setCustomInput] = useState('');
  const [activeDataset, setActiveDataset] = useState<DistributionRecord[]>([]);
  const [previewCount, setPreviewCount] = useState(20);

  // Filter State
  const [filters, setFilters] = useState({
    supplierId: '',
    category: '',
    licenseNo: '',
    model: '',
    lotNo: '',
    serialNo: '',
    customerId: '',
    timeZone: ''
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Initialize with default
  useEffect(() => {
    setActiveDataset(defaultData);
  }, [defaultData]);

  // Handlers
  const handleProcessCustom = () => {
    const standardized = standardizeData(customInput);
    if (standardized.length > 0) {
      setActiveDataset(standardized);
      alert(`Successfully processed ${standardized.length} records.`);
    } else {
      alert("Could not process data. Please ensure CSV or JSON format.");
    }
  };

  const useDefault = () => {
    setActiveDataset(defaultData);
    setSourceType('default');
  };

  const clearFilters = () => {
    setFilters({
      supplierId: '',
      category: '',
      licenseNo: '',
      model: '',
      lotNo: '',
      serialNo: '',
      customerId: '',
      timeZone: ''
    });
  };

  // Filter Logic
  const filteredDataset = useMemo(() => {
    return activeDataset.filter(item => {
      const tz = inferTimeZone(item.customerId);
      return (
        item.supplierId.toLowerCase().includes(filters.supplierId.toLowerCase()) &&
        item.category.toLowerCase().includes(filters.category.toLowerCase()) &&
        item.licenseNo.toLowerCase().includes(filters.licenseNo.toLowerCase()) &&
        item.model.toLowerCase().includes(filters.model.toLowerCase()) &&
        item.lotNo.toLowerCase().includes(filters.lotNo.toLowerCase()) &&
        item.serialNo.toLowerCase().includes(filters.serialNo.toLowerCase()) &&
        item.customerId.toLowerCase().includes(filters.customerId.toLowerCase()) &&
        tz.toLowerCase().includes(filters.timeZone.toLowerCase())
      );
    });
  }, [activeDataset, filters]);

  // Memoized Chart Data (using filtered data)
  const sankeyData = useMemo(() => getSankeyData(filteredDataset.slice(0, 100)), [filteredDataset]);
  const temporalData = useMemo(() => getTemporalData(filteredDataset), [filteredDataset]);
  const paretoData = useMemo(() => getParetoData(filteredDataset), [filteredDataset]);
  const heatmapData = useMemo(() => getHeatmapData(filteredDataset), [filteredDataset]);
  const treemapData = useMemo(() => getTreemapData(filteredDataset), [filteredDataset]);

  // Sub-component for inputs
  const FilterInput = ({ label, field, placeholder }: { label: string, field: keyof typeof filters, placeholder?: string }) => (
    <div className="flex flex-col">
       <label className="text-[10px] uppercase font-bold text-[var(--color-muted)] mb-1">{label}</label>
       <div className="relative">
          <input 
            value={filters[field]} 
            onChange={(e) => setFilters(prev => ({ ...prev, [field]: e.target.value }))}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md py-1 px-2 text-xs focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
            placeholder={placeholder || "All"}
          />
          {filters[field] && (
            <button 
              onClick={() => setFilters(prev => ({ ...prev, [field]: '' }))}
              className="absolute right-1 top-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              <XCircle size={10} />
            </button>
          )}
       </div>
    </div>
  );

  return (
    <div className="p-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">{TRANSLATIONS[locale]['nav.comparison']}</h2>
        <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('source')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'source' ? 'bg-[var(--color-primary)] text-white shadow' : 'hover:bg-[var(--color-border)] hover:bg-opacity-20'}`}
          >
            Data Source
          </button>
          <button 
            onClick={() => setActiveTab('visualize')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'visualize' ? 'bg-[var(--color-primary)] text-white shadow' : 'hover:bg-[var(--color-border)] hover:bg-opacity-20'}`}
          >
            Visualizations
          </button>
        </div>
      </div>

      {/* FILTER BAR - Always Visible */}
      <div className="glass-panel border border-[var(--color-border)] rounded-xl mb-6 overflow-hidden transition-all duration-300">
         <div 
           className="bg-[var(--color-muted)] bg-opacity-10 p-3 flex justify-between items-center cursor-pointer hover:bg-opacity-20"
           onClick={() => setIsFilterExpanded(!isFilterExpanded)}
         >
            <div className="flex items-center font-bold text-sm">
               <Filter className="mr-2 text-[var(--color-primary)]" size={16} />
               Global Dataset Filters
               <span className="ml-3 text-xs font-normal px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white">
                  {filteredDataset.length} / {activeDataset.length} Records
               </span>
            </div>
            <div className="text-xs text-[var(--color-muted)]">
               {isFilterExpanded ? 'Click to collapse' : 'Click to expand'}
            </div>
         </div>
         
         {isFilterExpanded && (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 bg-[var(--color-surface)]">
               <FilterInput label="Supplier ID" field="supplierId" />
               <FilterInput label="Category" field="category" />
               <FilterInput label="License No" field="licenseNo" />
               <FilterInput label="Model" field="model" />
               <FilterInput label="Lot No" field="lotNo" />
               <FilterInput label="Serial No" field="serialNo" />
               <FilterInput label="Customer ID" field="customerId" />
               <FilterInput label="Time Zone (Inf)" field="timeZone" placeholder="e.g. UTC+8" />
               
               <div className="col-span-2 md:col-span-4 lg:col-span-8 flex justify-end pt-2 border-t border-[var(--color-border)] border-opacity-30 mt-2">
                  <button 
                    onClick={clearFilters}
                    className="text-xs flex items-center text-[var(--color-secondary)] hover:underline"
                  >
                    <RefreshCw size={10} className="mr-1" />
                    Reset Filters
                  </button>
               </div>
            </div>
         )}
      </div>

      {activeTab === 'source' && (
        <div className="space-y-6">
          {/* Source Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div 
                onClick={useDefault}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center h-48 ${sourceType === 'default' ? 'border-[var(--color-primary)] bg-[var(--color-surface)] shadow-lg' : 'border-[var(--color-border)] border-dashed opacity-60 hover:opacity-100'}`}
             >
                <CheckCircle size={40} className={`mb-3 ${sourceType === 'default' ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}`} />
                <h3 className="font-bold text-lg">Default Dataset</h3>
                <p className="text-sm text-center mt-2 opacity-70">Pre-loaded clean dataset</p>
             </div>

             <div 
                onClick={() => setSourceType('custom')}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center h-48 ${sourceType === 'custom' ? 'border-[var(--color-secondary)] bg-[var(--color-surface)] shadow-lg' : 'border-[var(--color-border)] border-dashed opacity-60 hover:opacity-100'}`}
             >
                <Upload size={40} className={`mb-3 ${sourceType === 'custom' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-muted)]'}`} />
                <h3 className="font-bold text-lg">Paste / Import</h3>
                <p className="text-sm text-center mt-2 opacity-70">CSV, JSON, or Text</p>
             </div>
          </div>

          {/* Custom Input Area */}
          {sourceType === 'custom' && (
            <div className="glass-panel p-6 rounded-xl border border-[var(--color-border)] animate-in fade-in">
               <label className="block text-sm font-bold mb-2 flex items-center">
                  <FileText className="mr-2" size={16} />
                  Paste Raw Data
               </label>
               <textarea 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full h-48 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4 font-mono text-xs focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                  placeholder="Paste CSV (header required) or JSON array..."
               />
               <div className="flex justify-end mt-4">
                  <button 
                    onClick={handleProcessCustom}
                    className="flex items-center px-6 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:opacity-90 shadow-lg"
                  >
                    <RefreshCw className="mr-2" size={16} />
                    Process & Standardize
                  </button>
               </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="glass-panel p-6 rounded-xl border border-[var(--color-border)]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center">
                   <Eye className="mr-2" size={18} />
                   Dataset Preview
                   {activeDataset.length !== filteredDataset.length && (
                     <span className="ml-2 text-xs font-normal text-[var(--color-secondary)] italic">
                       (Filtered View)
                     </span>
                   )}
                </h3>
                <div className="flex items-center text-sm">
                   <span className="mr-2 opacity-70">Show rows:</span>
                   <input 
                      type="number" 
                      min="5" 
                      max="100" 
                      value={previewCount} 
                      onChange={(e) => setPreviewCount(Number(e.target.value))}
                      className="w-16 p-1 rounded border border-[var(--color-border)] bg-transparent text-center"
                   />
                </div>
             </div>
             
             <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-xs">
                   <thead className="bg-[var(--color-muted)] bg-opacity-20 border-b border-[var(--color-border)]">
                      <tr>
                         <th className="p-3 text-left">Supplier</th>
                         <th className="p-3 text-left">Date</th>
                         <th className="p-3 text-left">Customer</th>
                         <th className="p-3 text-left">License</th>
                         <th className="p-3 text-left">Model</th>
                         <th className="p-3 text-left">Lot</th>
                         <th className="p-3 text-left">Time Zone*</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[var(--color-border)]">
                      {filteredDataset.length === 0 ? (
                        <tr><td colSpan={7} className="p-4 text-center opacity-50">No data matches filters</td></tr>
                      ) : (
                        filteredDataset.slice(0, previewCount).map((row, i) => (
                          <tr key={i} className="hover:bg-[var(--color-surface)]">
                             <td className="p-3 font-mono">{row.supplierId}</td>
                             <td className="p-3">{row.deliveryDate}</td>
                             <td className="p-3 font-mono">{row.customerId}</td>
                             <td className="p-3 truncate max-w-[150px]">{row.licenseNo}</td>
                             <td className="p-3">{row.model}</td>
                             <td className="p-3 font-mono">{row.lotNo}</td>
                             <td className="p-3 opacity-60 italic">{inferTimeZone(row.customerId)}</td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
             <div className="mt-2 text-xs opacity-60 text-right">
                Showing {Math.min(previewCount, filteredDataset.length)} of {filteredDataset.length} filtered records
             </div>
          </div>
        </div>
      )}

      {activeTab === 'visualize' && (
        <div className="space-y-6">
           {/* Graph 1: Sankey Network */}
           <div className="glass-panel p-6 rounded-xl border border-[var(--color-border)] h-[400px]">
              <h3 className="font-bold mb-4 flex items-center text-[var(--color-primary)]">
                 <Grid className="mr-2" size={18} />
                 Distribution Network Flow (Supplier &gt; License &gt; Model &gt; Customer)
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                 <Sankey 
                    data={sankeyData} 
                    node={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
                    nodePadding={50}
                    link={{ stroke: 'var(--color-accent)', opacity: 0.3 }}
                 >
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
                 </Sankey>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Graph 2: Temporal Pulse */}
              <div className="glass-panel p-6 rounded-xl border border-[var(--color-border)] h-[300px]">
                 <h3 className="font-bold mb-4 flex items-center">
                    <Activity className="mr-2 text-[var(--color-secondary)]" size={18} />
                    Temporal Pulse (Shipments over Time)
                 </h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={temporalData}>
                       <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                       <XAxis dataKey="date" hide />
                       <YAxis />
                       <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} />
                       <Area type="monotone" dataKey="count" stroke="var(--color-secondary)" fill="var(--color-secondary)" fillOpacity={0.2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              {/* Graph 3: Pareto Power Wall */}
              <div className="glass-panel p-6 rounded-xl border border-[var(--color-border)] h-[300px]">
                 <h3 className="font-bold mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-[var(--color-accent)]" size={18} />
                    Pareto Power Wall (Top Models)
                 </h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={paretoData}>
                       <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                       <XAxis dataKey="name" tick={{fontSize: 10}} />
                       <YAxis yAxisId="left" />
                       <YAxis yAxisId="right" orientation="right" unit="%" />
                       <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} />
                       <Bar yAxisId="left" dataKey="count" fill="var(--color-primary)" barSize={20} />
                       <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="var(--color-accent)" strokeWidth={2} />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Graph 4: Treemap Landscape */}
           <div className="glass-panel p-6 rounded-xl border border-[var(--color-border)] h-[300px]">
              <h3 className="font-bold mb-4 flex items-center">
                 <Layers className="mr-2" size={18} />
                 Portfolio Landscape (Category &gt; Model)
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                 <Treemap
                    data={treemapData}
                    dataKey="size"
                    stroke="var(--color-bg)"
                    fill="var(--color-primary)"
                    aspectRatio={4/3}
                    content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                       return (
                          <g>
                             <rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                style={{
                                   fill: depth === 1 ? 'var(--color-primary)' : 'var(--color-secondary)',
                                   fillOpacity: 0.1 + (0.1 * (index % 5)),
                                   stroke: 'var(--color-bg)',
                                   strokeWidth: 2,
                                }}
                             />
                             {width > 30 && height > 20 && (
                                <text x={x + 4} y={y + 14} fill="var(--color-text)" fontSize={10} fontWeight="bold">
                                   {name}
                                </text>
                             )}
                          </g>
                       );
                    }}
                 />
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Graph 5: Mosaic Heatmap */}
              <div className="glass-panel p-6 rounded-xl border border-[var(--color-border)] h-[300px]">
                 <h3 className="font-bold mb-4 flex items-center">
                    <Grid className="mr-2" size={18} />
                    Customer-Model Mosaic
                 </h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                       <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                       <XAxis dataKey="model" type="category" name="Model" tick={{fontSize: 10}} />
                       <YAxis dataKey="customer" type="category" name="Customer" tick={{fontSize: 10}} />
                       <ZAxis dataKey="value" range={[50, 400]} name="Volume" />
                       <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} />
                       <Scatter name="Volume" data={heatmapData} fill="var(--color-accent)" shape="circle" />
                    </ScatterChart>
                 </ResponsiveContainer>
              </div>

               {/* Graph 6: Geospatial Proxy (Bar Chart by Region/Timezone) */}
               <div className="glass-panel p-6 rounded-xl border border-[var(--color-border)] h-[300px]">
                 <h3 className="font-bold mb-4 flex items-center">
                    <MapPin className="mr-2" size={18} />
                    Regional Distribution Proxy
                 </h3>
                 {/* 
                     NOTE: using inferred timezones for regional distribution
                 */}
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(filteredDataset.reduce((acc: any, curr) => {
                        const tz = inferTimeZone(curr.customerId);
                        acc[tz] = (acc[tz] || 0) + 1;
                        return acc;
                    }, {})).map(([name, val]) => ({ name, val }))}>
                       <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                       <XAxis dataKey="name" tick={{fontSize: 10}} />
                       <YAxis />
                       <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} />
                       <Bar dataKey="val" fill="var(--color-muted)" name="Shipments" />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// 4. Document Factory
const DocumentFactory = ({ locale }: { locale: Locale }) => {
  return (
    <div className="flex h-[calc(100vh-140px)] p-6 gap-6 animate-in slide-in-from-right-8 duration-500">
        {/* PDF Viewer Placeholder */}
        <div className="flex-1 rounded-2xl border border-[var(--color-border)] glass-panel p-4 flex flex-col">
            <h3 className="font-bold mb-2 flex items-center">
                <FileText className="mr-2" size={18} />
                {TRANSLATIONS[locale]['doc.preview']}
            </h3>
            <div className="flex-1 bg-[var(--color-muted)] bg-opacity-20 rounded-xl flex items-center justify-center">
                <p className="text-[var(--color-muted)]">No PDF loaded</p>
            </div>
        </div>

        {/* Structured Output */}
        <div className="flex-1 rounded-2xl border border-[var(--color-border)] glass-panel p-4 flex flex-col">
             <h3 className="font-bold mb-2 flex items-center">
                <Sparkles className="mr-2 text-[var(--color-accent)]" size={18} />
                {TRANSLATIONS[locale]['doc.structured']}
            </h3>
            <div className="flex-1 bg-[var(--color-surface)] rounded-xl p-6 font-mono text-sm overflow-auto shadow-inner">
                <p className="mb-4"># Regulatory Impact Assessment</p>
                <p className="mb-2">...analysis of <span style={{color: 'coral', fontWeight: 'bold'}}>Class III</span> devices indicates a potential variance in...</p>
                <p className="mb-2 pl-4 border-l-2 border-coral-500">
                    "The supplier failed to provide <span style={{color: 'coral'}}>Lot 992</span> documentation."
                </p>
            </div>
            <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 bg-[var(--color-primary)] text-white rounded-lg shadow hover:opacity-90 transition">
                    Run Risk Agent
                </button>
                <button className="flex-1 py-2 bg-[var(--color-secondary)] text-white rounded-lg shadow hover:opacity-90 transition">
                    Export JSON
                </button>
            </div>
        </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---

const App = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentThemeId, setCurrentThemeId] = useState<string>('davinci');
  const [locale, setLocale] = useState<Locale>('en');
  const [activePage, setActivePage] = useState<Page>(Page.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [tokenCount, setTokenCount] = useState(0);
  
  // State for Real Data
  const [distributionData, setDistributionData] = useState<DistributionRecord[]>([]);

  // Derived state
  const activeTheme = useMemo(() => 
    PAINTER_THEMES.find(t => t.id === currentThemeId) || PAINTER_THEMES[0], 
    [currentThemeId]
  );

  const colors = activeTheme.colors[themeMode];

  // Effect: Load Default Dataset
  useEffect(() => {
    // We cast to DistributionRecord[] because the raw data might have extra fields (like 'number') 
    // or missing optional fields, but we want to treat it as our core type.
    setDistributionData(DEFAULT_DATASET as unknown as DistributionRecord[]);
  }, []);

  // Effect: Apply CSS Variables dynamically
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-muted', colors.muted);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--font-heading', activeTheme.fontHeading);
    root.style.setProperty('--font-body', activeTheme.fontBody);
  }, [activeTheme, themeMode, colors]);

  // Jackpot Function
  const handleJackpot = () => {
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * PAINTER_THEMES.length);
      setCurrentThemeId(PAINTER_THEMES[randomIndex].id);
      count++;
      if (count > 8) clearInterval(interval);
    }, 100);
  };

  return (
    <div 
      className="min-h-screen w-full transition-colors duration-700 ease-in-out"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Mobile Nav Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--color-surface)] shadow-md"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex h-screen overflow-hidden">
        
        {/* --- SIDEBAR --- */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            border-r border-[var(--color-border)] glass-panel flex flex-col
          `}
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {/* Logo Area */}
          <div className="p-6 border-b border-[var(--color-border)]">
             <h1 
               className="text-2xl font-bold tracking-tighter"
               style={{ fontFamily: 'var(--font-heading)' }}
             >
               RCC<span className="text-[var(--color-accent)]">.AI</span>
             </h1>
             <p className="text-xs text-[var(--color-muted)] mt-1 tracking-widest uppercase">Regulatory Command</p>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: Page.DASHBOARD, icon: LayoutDashboard, label: TRANSLATIONS[locale]['nav.dashboard'] },
              { id: Page.COMPARISON_LAB, icon: Scale, label: TRANSLATIONS[locale]['nav.comparison'] },
              { id: Page.DOCUMENT_FACTORY, icon: FileText, label: TRANSLATIONS[locale]['nav.documents'] },
              { id: Page.BATCH_PROCESSOR, icon: Layers, label: TRANSLATIONS[locale]['nav.batch'] },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`
                  w-full flex items-center p-3 rounded-lg transition-all duration-300
                  ${activePage === item.id 
                    ? 'bg-[var(--color-primary)] text-white shadow-lg translate-x-1' 
                    : 'hover:bg-[var(--color-border)] hover:bg-opacity-30'}
                `}
              >
                <item.icon size={18} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Config Area */}
          <div className="p-4 border-t border-[var(--color-border)] space-y-4">
             {/* Jackpot */}
             <button 
                onClick={handleJackpot}
                className="w-full py-2 rounded-lg border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors flex items-center justify-center font-bold text-xs uppercase tracking-wider"
             >
                <Sparkles size={14} className="mr-2" />
                {TRANSLATIONS[locale]['ui.jackpot']}
             </button>

             <div className="flex items-center justify-between">
                <button onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-[var(--color-border)] hover:bg-opacity-40">
                   <Palette size={18} />
                </button>
                <button onClick={() => setLocale(locale === 'en' ? 'zh-TW' : 'en')} className="p-2 rounded-full hover:bg-[var(--color-border)] hover:bg-opacity-40 font-bold text-xs">
                   {locale === 'en' ? 'ZH' : 'EN'}
                </button>
                <div className="text-xs font-mono opacity-50">{activeTheme.name}</div>
             </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] glass-panel shrink-0" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center">
               <h2 
                 className="text-xl font-bold"
                 style={{ fontFamily: 'var(--font-heading)' }}
               >
                 {activePage === Page.DASHBOARD && TRANSLATIONS[locale]['nav.dashboard']}
                 {activePage === Page.COMPARISON_LAB && TRANSLATIONS[locale]['nav.comparison']}
                 {activePage === Page.DOCUMENT_FACTORY && TRANSLATIONS[locale]['nav.documents']}
                 {activePage === Page.BATCH_PROCESSOR && TRANSLATIONS[locale]['nav.batch']}
               </h2>
            </div>
            
            <div className="flex items-center space-x-6">
              <StatusStrip locale={locale} tokens={tokenCount} />
              
              {/* API Key Input (Visual only for demo) */}
              <div className="hidden md:block relative group">
                 <input 
                   type="password" 
                   placeholder="API Key (Env)" 
                   className="pl-3 pr-8 py-1 rounded-full border border-[var(--color-border)] bg-transparent text-xs focus:outline-none focus:border-[var(--color-accent)] w-32 focus:w-48 transition-all" 
                   disabled
                 />
                 <div className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto relative">
             {/* Background decoration */}
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-primary)] blur-[100px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-accent)] blur-[100px]"></div>
             </div>

             <div className="relative z-10">
               {activePage === Page.DASHBOARD && <DashboardView locale={locale} theme={activeTheme} />}
               {activePage === Page.COMPARISON_LAB && <ComparisonLab locale={locale} defaultData={distributionData} />}
               {activePage === Page.DOCUMENT_FACTORY && <DocumentFactory locale={locale} />}
               {activePage === Page.BATCH_PROCESSOR && (
                 <div className="flex items-center justify-center h-64 text-[var(--color-muted)] animate-in fade-in">
                    Batch Processor Module Placeholder
                 </div>
               )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;