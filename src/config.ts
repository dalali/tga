export const CONFIG = {
  TILE_SIZE: 16,
  MAP_WIDTH: 64,
  MAP_HEIGHT: 64,
  PLAYER_SPEED: 120,
  PLAYER_SPRINT: 180,
  VEHICLE: {
    SEDAN:  { speed: 220, accel: 200, turnRate: 120, hp: 300 },
    SPORTS: { speed: 300, accel: 280, turnRate: 100, hp: 200 },
    TRUCK:  { speed: 160, accel: 140, turnRate: 80,  hp: 500 },
  },
  WANTED: {
    COOLDOWN_MS: 30000,
    LOS_CHECK_MS: 500,
  },
  WIN_SCORE: 50000,
  PLAYER_HP: 100,
  DEBUG: import.meta.env.VITE_TGA_DEBUG === '1',
};
