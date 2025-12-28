export const MAX_HEIGHT_MM = 1200;
export const MIN_HEIGHT_MM = 350;
export const MAX_PITCH_DEG = 5;
export const MIN_PITCH_DEG = -5;
export const MAX_ROLL_DEG = 12;
export const MIN_ROLL_DEG = -12;

export const UPDATE_INTERVAL_MS = 100; // 10Hz UI refresh
export const CHART_HISTORY_POINTS = 50;

export const MOTOR_CONFIG = [
  { id: 1, name: 'M1 主升降电机 (PLE60)', type: 'MAIN' },
  { id: 2, name: 'M2 前左辅助电机 (PLE40)', type: 'AUX' },
  { id: 3, name: 'M3 前右辅助电机 (PLE40)', type: 'AUX' },
  { id: 4, name: 'M4 后左辅助电机 (PLE40)', type: 'AUX' },
  { id: 5, name: 'M5 后右辅助电机 (PLE40)', type: 'AUX' },
];