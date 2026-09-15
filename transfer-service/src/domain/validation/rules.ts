/**
 * employee-internal-transfer.T12 — Validation rules.
 * Implements AC2, AC3, AC4, AC5, AC6, AC10, AC11.
 *
 * ⛔ VR03 (open headcount) is absent — gated on C3.
 * ⛔ No payroll-alignment rule is present — gated on C7.
 * VR04 lives in SUBMISSION_RULES as a replaceable validator (plan §6.2).
 */
import { Rule, Candidate } from './engine';
import { MasterData, MasterRecord } from '../../ports/masterDataPort';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const present = (v: string | null) => v !== null && v !== undefined && String(v).trim() !== '';

function mandatory(field: keyof Candidate): Rule {
  return { id: 'VR01', field, check: (c) => present(c[field] as string | null) };
}

function activeRef(field: keyof Candidate, pick: (m: MasterData) => MasterRecord[]): Rule {
  return {
    id: 'VR02',
    field,
    check: (c, m) => {
      const v = c[field] as string | null;
      if (!present(v)) return true; // VR01 owns absence
      return pick(m).some((r) => r.id === v && r.active);
    },
  };
}

function parseDate(v: string | null): Date | null {
  if (!present(v) || !ISO_DATE.test(v as string)) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const todayUtc = () => new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);

/** .UT64 — malformed input is a SCHEMA failure, distinct from a business rule. */
const dateShape: Rule = {
  id: 'SCHEMA',
  field: 'effectiveDate',
  check: (c) => !present(c.effectiveDate) || parseDate(c.effectiveDate) !== null,
};

/** VR05 — AC10. Not in the past; today is not permitted. */
const notPast: Rule = {
  id: 'VR05',
  field: 'effectiveDate',
  check: (c) => {
    const d = parseDate(c.effectiveDate);
    if (d === null) return true;
    return d.getTime() > todayUtc().getTime();
  },
};

/** VR06 — AC6. */
const reasonLength: Rule = {
  id: 'VR06',
  field: 'reason',
  check: (c) => c.reason === null || c.reason.length <= 2000,
};

/** VR08 — AC11. */
const notCurrentPosition: Rule = {
  id: 'VR08',
  field: 'positionId',
  check: (c) => !present(c.positionId) || c.positionId !== c.currentPositionId,
};

export const RULES: readonly Rule[] = [
  mandatory('departmentId'),
  mandatory('locationId'),
  mandatory('positionId'),
  mandatory('effectiveDate'),
  activeRef('departmentId', (m) => m.departments),
  activeRef('locationId', (m) => m.locations),
  activeRef('positionId', (m) => m.positions),
  dateShape,
  notPast,
  reasonLength,
  notCurrentPosition,
];

/** PD08, provisional: ≥15 days after submission. Replaceable when C7 lifts. */
export const LEAD_TIME_DAYS = 15;

const effectiveDateLeadTime: Rule = {
  id: 'VR04',
  field: 'effectiveDate',
  check: (c) => {
    const d = parseDate(c.effectiveDate);
    if (d === null) return true;
    const min = todayUtc().getTime() + LEAD_TIME_DAYS * 86_400_000;
    return d.getTime() >= min;
  },
};

export const SUBMISSION_RULES: readonly Rule[] = [...RULES, effectiveDateLeadTime];
