// Theme & Styling
export type ThemeMode = 'light' | 'dark';

export interface PainterTheme {
  id: string;
  name: string;
  description: string;
  fontHeading: string;
  fontBody: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  border: string;
}

// Localization
export type Locale = 'en' | 'zh-TW';

// Navigation
export enum Page {
  DASHBOARD = 'dashboard',
  COMPARISON_LAB = 'comparison_lab',
  DOCUMENT_FACTORY = 'document_factory',
  BATCH_PROCESSOR = 'batch_processor',
  SETTINGS = 'settings'
}

// Data Entities
export interface DistributionRecord {
  supplierId: string;
  category: string;
  licenseNo: string;
  model: string;
  lotNo: string;
  serialNo: string;
  customerId: string;
  deliveryDate: string;
}

// Document
export interface DocumentFile {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  summary?: string;
}

// Agent
export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'success' | 'failed';
  model: string;
}