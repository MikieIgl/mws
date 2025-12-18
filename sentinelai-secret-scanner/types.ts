export interface Incident {
  id: string;
  type: 'AWS' | 'Slack' | 'DB' | 'Generic' | 'API Key';
  risk_score: number;
  file: string;
  verdict: string;
  ai_reasoning: string;
  snippet: string;
  line_number: number;
}

export type TriageAction = 'confirm' | 'dismiss';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'dismiss' | 'info';
}