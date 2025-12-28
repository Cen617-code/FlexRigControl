// Replace Enum with const object + type for better compatibility
export const SystemMode = {
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  CALIBRATING: 'CALIBRATING',
  ERROR: 'ERROR',
  ESTOP: 'ESTOP'
} as const;

export type SystemMode = typeof SystemMode[keyof typeof SystemMode];

export interface MotorState {
  id: number;
  name: string;
  rpm: number;
  current: number; // Amps
  temp: number; // Celsius
  status: 'OK' | 'WARN' | 'ERR';
  type: 'MAIN' | 'AUX'; // PLE60 vs PLE40
}

export interface SensorData {
  height: number; // mm (from Encoder U10)
  pitch: number; // degrees (from Tilt Sensor U12/U15)
  roll: number; // degrees
  batteryVoltage: number; // Volts (from BMS/Power Module)
}

export interface TelemetryPoint {
  time: string;
  height: number;
  pitch: number;
}