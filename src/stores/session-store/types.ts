import { Context } from '@behrenle/number-cruncher/lib/types';

export interface MathItem {
  type: 'math';
  error: boolean;
  input: string;
  output: string;
}

export interface InfoItem {
  type: 'info';
  info: string;
}

type History = (MathItem | InfoItem)[];

export interface SessionState {
  input: string;
  outputResetted: boolean;
  protocol: History;
  stack: Context['stack'];
  decimalPlaces: number;
  interfaceFontSize: string;
  theme: string;

  evaluate: () => void;
  resetDefinitions: () => void;
  setInput: (input: string) => void;
  resetInput: () => void;
  resetOutput: () => void;
  resetProtocol: () => void;
  setDecimalPlaces: (n: number) => void;
  setInterfaceFontSize: (size: string) => void;
  setTheme: (theme: string) => void;
}