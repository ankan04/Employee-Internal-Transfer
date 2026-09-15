/** employee-internal-transfer.T02 — in-memory adapter behind MasterDataPort. */
import { MasterData, MasterDataPort } from '../ports/masterDataPort';

export class InMemoryMasterData implements MasterDataPort {
  private readonly data: MasterData = {
    departments: [
      { id: 'D1', label: 'Engineering', active: true },
      { id: 'D2', label: 'Operations', active: true },
      { id: 'D9', label: 'Legacy Unit', active: false },
    ],
    locations: [
      { id: 'L1', label: 'Pune', active: true },
      { id: 'L2', label: 'Bengaluru', active: true },
      { id: 'L9', label: 'Closed Site', active: false },
    ],
    positions: [
      { id: 'P1', label: 'Senior Engineer', active: true },
      { id: 'P2', label: 'Lead Engineer', active: true },
      { id: 'P9', label: 'Retired Role', active: false },
    ],
  };
  async load(): Promise<MasterData> { return this.data; }
  async currentPositionOf(_subjectRef: string): Promise<string | null> { return 'P0'; }
}
