const API_URL = (import.meta.env.VITE_API_URL || 'https://f-insight-api.onrender.com').replace(/\/$/, '');

export interface RadarAgentResponse {
  type: string;
  generatedAt: string;
  riskNotice: string;
  query: string;
  normalized: {
    symbol: string;
    horizon: string;
    objective: string;
    mode: string;
    assetClass: string;
  };
  answer: {
    headline: string;
    summary: string;
    whatToCheck: string[];
    simulationPlan: string[];
    guardrails: string[];
    nextQuestions: string[];
  };
}

export interface LifePlanResponse {
  type: string;
  generatedAt: string;
  riskNotice: string;
  diagnosis: {
    persona: string;
    stage: string;
    realTalk: string;
    freedomScore: number;
    monthlyBalance: number;
    savingsRate: number;
    leakPotential: number;
    workHoursRecoverable: number;
  };
  scenarios: {
    conservative: number;
    base: number;
    accelerated: number;
  };
  opportunities: string[];
  missions: {
    sevenDays: string;
    ninetyDays: string[];
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.message || `Erro ${response.status}`);
  return data as T;
}

export function runRadarAgent(input: { query: string; horizon?: string; objective?: string; symbol?: string }) {
  return post<RadarAgentResponse>('/api/agent/radar', input);
}

export function runLifePlan(input: {
  objective: string;
  age?: number;
  dependents?: number;
  income?: number;
  expenses?: number;
  savings?: number;
  debt?: number;
  targetAmount?: number;
  years?: number;
  statementText?: string;
}) {
  return post<LifePlanResponse>('/api/agent/life-plan', input);
}
