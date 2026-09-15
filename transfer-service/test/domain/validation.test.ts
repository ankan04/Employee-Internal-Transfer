/**
 * employee-internal-transfer.T11 — Validation engine   (Prompt PM11.RED, .UT73)
 * employee-internal-transfer.T12 — Validation rules    (Prompt PM12.RED)
 * AC:    AC2, AC3, AC4, AC5, AC6, AC10, AC11
 * Tests: .UT02–.UT06, .UT11, .UT12, .UT64, .UT66–.UT73, .UT115
 */
import { ValidationEngine, Rule } from '../../src/domain/validation/engine';
import { RULES } from '../../src/domain/validation/rules';
import { MasterData } from '../../src/ports/masterDataPort';

const master: MasterData = {
  departments: [{ id: 'D1', label: 'Engineering', active: true }, { id: 'D9', label: 'Old', active: false }],
  locations: [{ id: 'L1', label: 'Pune', active: true }, { id: 'L9', label: 'Closed', active: false }],
  positions: [{ id: 'P1', label: 'Senior Engineer', active: true }, { id: 'P9', label: 'Retired', active: false }],
};

const future = (days: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const base = {
  subjectRef: 'emp-a',
  currentPositionId: 'P0',
  departmentId: 'D1',
  locationId: 'L1',
  positionId: 'P1',
  effectiveDate: future(20),
  reason: null as string | null,
};

const engine = () => new ValidationEngine(RULES, master);

describe('T11 — validation engine (AC framework)', () => {
  it('.UT73 — an entirely empty draft reports every failure, not the first', () => {
    const r = engine().run({ ...base, departmentId: null, locationId: null, positionId: null, effectiveDate: null });
    expect(r.ok).toBe(false);
    const fields = r.failures.map((f) => f.field).sort();
    expect(fields).toEqual(['departmentId', 'effectiveDate', 'locationId', 'positionId']);
    expect(r.failures.every((f) => f.rule === 'VR01')).toBe(true);
  });

  it('a rule can be registered without modifying the engine', () => {
    const extra: Rule = { id: 'VRX', field: 'reason', check: () => false };
    const r = new ValidationEngine([...RULES, extra], master).run(base);
    expect(r.failures.some((f) => f.rule === 'VRX')).toBe(true);
  });
});

describe('T12 — VR01 mandatory fields (AC2–AC5)', () => {
  it.each([
    ['.UT02 AC2', 'departmentId'],
    ['.UT03 AC3', 'locationId'],
    ['.UT04 AC4', 'positionId'],
    ['.UT05 AC5', 'effectiveDate'],
  ])('%s — %s missing is refused citing VR01', (_label, field) => {
    const r = engine().run({ ...base, [field]: null });
    expect(r.ok).toBe(false);
    expect(r.failures).toContainEqual({ field, rule: 'VR01' });
  });
});

describe('T12 — VR06 reason (AC6)', () => {
  it('.UT06 — a complete draft with no reason is accepted', () => {
    expect(engine().run({ ...base, reason: null }).ok).toBe(true);
  });
  it('.UT67 — reason of exactly 2000 characters is accepted', () => {
    expect(engine().run({ ...base, reason: 'x'.repeat(2000) }).ok).toBe(true);
  });
  it('.UT68 — reason of 2001 characters is refused citing VR06', () => {
    const r = engine().run({ ...base, reason: 'x'.repeat(2001) });
    expect(r.failures).toContainEqual({ field: 'reason', rule: 'VR06' });
  });
  it('.UT69 — a whitespace-only reason is treated as absent', () => {
    const r = engine().run({ ...base, reason: '   \n\t ' });
    expect(r.ok).toBe(true);
    expect(r.normalised.reason).toBeNull();
  });
});

describe('T12 — VR02 active master data (AC8 partial)', () => {
  it('.UT70 — an unknown positionId is refused citing VR02', () => {
    const r = engine().run({ ...base, positionId: 'P-nope' });
    expect(r.failures).toContainEqual({ field: 'positionId', rule: 'VR02' });
  });
  it('.UT71/.UT115 — a deactivated department is refused: active-only, not merely existing', () => {
    const r = engine().run({ ...base, departmentId: 'D9' });
    expect(r.failures).toContainEqual({ field: 'departmentId', rule: 'VR02' });
  });
  it('a deactivated location is refused', () => {
    expect(engine().run({ ...base, locationId: 'L9' }).ok).toBe(false);
  });
});

describe('T12 — VR05 effective date not in the past (AC10)', () => {
  it('.UT11 — yesterday is refused citing VR05', () => {
    const r = engine().run({ ...base, effectiveDate: future(-1) });
    expect(r.failures).toContainEqual({ field: 'effectiveDate', rule: 'VR05' });
  });
  it('.UT66 — today is refused citing VR05', () => {
    const r = engine().run({ ...base, effectiveDate: future(0) });
    expect(r.failures).toContainEqual({ field: 'effectiveDate', rule: 'VR05' });
  });
  it('.UT64 — a malformed date is a schema failure, not a business-rule failure', () => {
    const r = engine().run({ ...base, effectiveDate: 'not-a-date' });
    expect(r.failures).toContainEqual({ field: 'effectiveDate', rule: 'SCHEMA' });
  });
});

describe('T12 — VR08 target differs from current position (AC11)', () => {
  it('.UT12/.UT72 — selecting the current position is refused citing VR08, twice with no state change', () => {
    for (let i = 0; i < 2; i++) {
      const r = engine().run({ ...base, positionId: 'P1', currentPositionId: 'P1' });
      expect(r.failures).toContainEqual({ field: 'positionId', rule: 'VR08' });
    }
  });
});

describe('T12 — gated rules are absent (C3, C7)', () => {
  it('VR03 (open headcount) is not registered — gated on C3', () => {
    expect(RULES.some((r) => r.id === 'VR03')).toBe(false);
  });
  it('no payroll-alignment rule is registered — gated on C7', () => {
    expect(RULES.some((r) => r.id.startsWith('VR-PAYROLL'))).toBe(false);
  });
});
