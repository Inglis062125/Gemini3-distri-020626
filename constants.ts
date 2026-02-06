import { PainterTheme, Locale } from './types';

// --- Localization Dictionary ---
export const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Distribution Dashboard',
    'nav.comparison': 'Consistency Lab',
    'nav.documents': 'Document Factory',
    'nav.batch': 'Batch Processor',
    'status.api': 'API Heartbeat',
    'status.tokens': 'Tokens Used',
    'ui.jackpot': 'Style Jackpot',
    'ui.upload': 'Upload Dataset',
    'ui.dragdrop': 'Drag & Drop CSV, JSON',
    'chart.sankey': 'Supply Chain Flow',
    'chart.pulse': 'Shipment Pulse',
    'chart.pareto': 'Pareto Power Wall',
    'doc.preview': 'PDF Preview',
    'doc.structured': 'Structured Markdown',
  },
  'zh-TW': {
    'nav.dashboard': '分銷儀表板',
    'nav.comparison': '一致性實驗室',
    'nav.documents': '智能文檔工廠',
    'nav.batch': '批量處理器',
    'status.api': 'API 連線',
    'status.tokens': '代幣用量',
    'ui.jackpot': '風格輪盤',
    'ui.upload': '上傳數據集',
    'ui.dragdrop': '拖放 CSV, JSON',
    'chart.sankey': '供應鏈流向',
    'chart.pulse': '出貨脈動',
    'chart.pareto': '帕累托分析',
    'doc.preview': 'PDF 預覽',
    'doc.structured': '結構化 Markdown',
  }
};

// --- Painter Themes ---
export const PAINTER_THEMES: PainterTheme[] = [
  {
    id: 'davinci',
    name: 'Da Vinci',
    description: 'Engineering precision, parchment tones.',
    fontHeading: '"Cinzel", serif',
    fontBody: '"Inter", sans-serif',
    colors: {
      light: {
        background: '#e8dcc5',
        surface: 'rgba(255, 252, 245, 0.7)',
        primary: '#8b4513',
        secondary: '#5c4033',
        accent: '#cd853f',
        text: '#2b1b17',
        muted: '#8b7355',
        border: '#a08b70'
      },
      dark: {
        background: '#2b1b17',
        surface: 'rgba(60, 40, 30, 0.7)',
        primary: '#d2b48c',
        secondary: '#a0522d',
        accent: '#e8dcc5',
        text: '#f5deb3',
        muted: '#8b7355',
        border: '#5c4033'
      }
    }
  },
  {
    id: 'vangogh',
    name: 'Van Gogh',
    description: 'Starry nights, vibrant swirls.',
    fontHeading: '"Playfair Display", serif',
    fontBody: '"Inter", sans-serif',
    colors: {
      light: {
        background: '#f4f7f6',
        surface: 'rgba(255, 255, 255, 0.8)',
        primary: '#1a4c8a', // Starry Blue
        secondary: '#f9d71c', // Sunflower Yellow
        accent: '#e67e22',
        text: '#0f172a',
        muted: '#64748b',
        border: '#cbd5e1'
      },
      dark: {
        background: '#0f172a', // Midnight
        surface: 'rgba(30, 41, 59, 0.7)',
        primary: '#f9d71c',
        secondary: '#38bdf8',
        accent: '#facc15',
        text: '#f1f5f9',
        muted: '#94a3b8',
        border: '#334155'
      }
    }
  },
  {
    id: 'monet',
    name: 'Monet',
    description: 'Impressionist pastels, water lilies.',
    fontHeading: '"Playfair Display", serif',
    fontBody: '"Inter", sans-serif',
    colors: {
      light: {
        background: '#e0f7fa',
        surface: 'rgba(255, 255, 255, 0.6)',
        primary: '#00838f',
        secondary: '#2e7d32',
        accent: '#ad1457', // Gentle pink/purple
        text: '#004d40',
        muted: '#546e7a',
        border: '#80cbc4'
      },
      dark: {
        background: '#004d40',
        surface: 'rgba(0, 77, 64, 0.6)',
        primary: '#80cbc4',
        secondary: '#a5d6a7',
        accent: '#f48fb1',
        text: '#e0f2f1',
        muted: '#80cbc4',
        border: '#26a69a'
      }
    }
  },
  {
    id: 'picasso',
    name: 'Picasso',
    description: 'Cubist geometry, terracotta.',
    fontHeading: '"Cinzel", serif',
    fontBody: '"Inter", sans-serif',
    colors: {
      light: {
        background: '#f3e5dc',
        surface: 'rgba(255, 255, 255, 0.8)',
        primary: '#b91c1c', // Bold Red
        secondary: '#ea580c', // Orange
        accent: '#1d4ed8', // Stark Blue
        text: '#1c1917',
        muted: '#78716c',
        border: '#a8a29e'
      },
      dark: {
        background: '#292524',
        surface: 'rgba(68, 64, 60, 0.8)',
        primary: '#ef4444',
        secondary: '#fb923c',
        accent: '#60a5fa',
        text: '#fafaf9',
        muted: '#a8a29e',
        border: '#57534e'
      }
    }
  },
   {
    id: 'kandinsky',
    name: 'Kandinsky',
    description: 'Abstract geometry, sharp contrasts.',
    fontHeading: '"Inter", sans-serif',
    fontBody: '"Inter", sans-serif',
    colors: {
      light: {
        background: '#ffffff',
        surface: 'rgba(240, 240, 240, 0.9)',
        primary: '#000000',
        secondary: '#dc2626',
        accent: '#2563eb',
        text: '#000000',
        muted: '#525252',
        border: '#000000'
      },
      dark: {
        background: '#171717',
        surface: 'rgba(40, 40, 40, 0.9)',
        primary: '#ffffff',
        secondary: '#ef4444',
        accent: '#3b82f6',
        text: '#ffffff',
        muted: '#a3a3a3',
        border: '#ffffff'
      }
    }
  }
];

// --- Mock Data for Visualizations ---

export const MOCK_DISTRIBUTION_DATA = [
  { name: 'Jan', supplier: 4000, customer: 3950, amt: 2400 },
  { name: 'Feb', supplier: 3000, customer: 2800, amt: 2210 },
  { name: 'Mar', supplier: 2000, customer: 1980, amt: 2290 },
  { name: 'Apr', supplier: 2780, customer: 2700, amt: 2000 },
  { name: 'May', supplier: 1890, customer: 1850, amt: 2181 },
  { name: 'Jun', supplier: 2390, customer: 2300, amt: 2500 },
];

export const MOCK_PARETO_DATA = [
  { name: 'Cardio X1', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Neuro Y2', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Ortho Z3', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Derma A1', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Vision B2', uv: 1890, pv: 4800, amt: 2181 },
];

export const MOCK_TREEMAP_DATA = [
  { name: 'Cardiology', size: 1200, fill: '#8884d8' },
  { name: 'Neurology', size: 800, fill: '#83a6ed' },
  { name: 'Orthopedics', size: 600, fill: '#8dd1e1' },
  { name: 'Dermatology', size: 300, fill: '#82ca9d' },
  { name: 'Radiology', size: 200, fill: '#a4de6c' },
];