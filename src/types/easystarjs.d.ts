declare module 'easystarjs' {
  class js {
    setGrid(grid: number[][]): void;
    setAcceptableTiles(tiles: number[]): void;
    enableDiagonals(): void;
    enableCornerCutting(): void;
    setIterationsPerCalculation(n: number): void;
    findPath(
      sx: number, sy: number,
      ex: number, ey: number,
      callback: (path: { x: number; y: number }[] | null) => void
    ): void;
    calculate(): void;
  }
  export { js };
}
