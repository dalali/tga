export type MissionType = 'deliver' | 'kill' | 'escape';
export interface Waypoint { x: number; y: number; label?: string; }
export interface Mission {
  id: string; type: MissionType; title: string; objective: string;
  timerMs: number; reward: number; waypoint: Waypoint;
  targetId?: string; vehicleId?: string;
}
