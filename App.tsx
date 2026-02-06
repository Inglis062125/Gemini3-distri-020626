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
  AlertTriangle
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
  Treemap
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

      {/* 3. Treemap / Portfolio */}
      <div className="col-span-1 lg:col-span-3 p-6 rounded-2xl border border-[var(--color-border)] glass-panel shadow-lg">
        <h3 className="text-lg font-bold mb-4">{TRANSLATIONS[locale]['chart.sankey']} (Portfolio Distribution)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={MOCK_TREEMAP_DATA}
              dataKey="size"
              stroke="var(--color-surface)"
              fill="var(--color-primary)"
              content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                 const fillColor = payload && payload.fill ? payload.fill : 'var(--color-primary)';
                 return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: depth < 2 ? fillColor : 'none',
                        stroke: 'var(--color-surface)',
                        strokeWidth: 2,
                        strokeOpacity: 1,
                      }}
                    />
                    {width > 50 && height > 30 ? (
                      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14}>
                        {name}
                      </text>
                    ) : null}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 3. Comparison Lab
const ComparisonLab = ({ locale }: { locale: Locale }) => {
  return (
    <div className="p-6 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6">{TRANSLATIONS[locale]['nav.comparison']}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload A */}
        <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 flex flex-col items-center justify-center bg-[var(--color-surface)] bg-opacity-30 hover:bg-opacity-50 transition-all cursor-pointer">
          <div className="p-4 rounded-full bg-[var(--color-surface)] mb-4">
             <Layers className="text-[var(--color-primary)]" size={32} />
          </div>
          <h4 className="font-bold">Supplier Dataset (A)</h4>
          <p className="text-sm text-[var(--color-muted)] mt-2">{TRANSLATIONS[locale]['ui.dragdrop']}</p>
        </div>

        {/* Upload B */}
        <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 flex flex-col items-center justify-center bg-[var(--color-surface)] bg-opacity-30 hover:bg-opacity-50 transition-all cursor-pointer">
          <div className="p-4 rounded-full bg-[var(--color-surface)] mb-4">
             <Layers className="text-[var(--color-secondary)]" size={32} />
          </div>
          <h4 className="font-bold">Customer Dataset (B)</h4>
          <p className="text-sm text-[var(--color-muted)] mt-2">{TRANSLATIONS[locale]['ui.dragdrop']}</p>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <h3 className="font-bold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-yellow-500" />
            Inconsistency Simulation
        </h3>
        <div className="space-y-3">
             <div className="flex justify-between items-center p-3 bg-red-500 bg-opacity-10 rounded border border-red-500 border-opacity-20">
                <span>Missing Serial: SN-92938 (Detected in A, missing in B)</span>
                <button className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">Reconcile</button>
             </div>
             <div className="flex justify-between items-center p-3 bg-yellow-500 bg-opacity-10 rounded border border-yellow-500 border-opacity-20">
                <span>Date Mismatch: Lot #402 (Shipped Jan 1, Received Jan 5 - Threshold Exceeded)</span>
                <button className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600">Analyze</button>
             </div>
        </div>
      </div>
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

  // Derived state
  const activeTheme = useMemo(() => 
    PAINTER_THEMES.find(t => t.id === currentThemeId) || PAINTER_THEMES[0], 
    [currentThemeId]
  );

  const colors = activeTheme.colors[themeMode];

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
               {activePage === Page.COMPARISON_LAB && <ComparisonLab locale={locale} />}
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