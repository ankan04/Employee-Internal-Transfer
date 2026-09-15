/** employee-internal-transfer.T02 — port owned by the domain. */
export interface MasterRecord { id: string; label: string; active: boolean }
export interface MasterData {
  departments: MasterRecord[];
  locations: MasterRecord[];
  positions: MasterRecord[];
}
export interface MasterDataPort {
  load(): Promise<MasterData>;
  currentPositionOf(subjectRef: string): Promise<string | null>;
}
