import { IntakeColumnType } from '@enx/contracts';
import type { IntakeLayoutSpec } from '@enx/contracts';

export const DEFAULT_INTAKE_LAYOUT: IntakeLayoutSpec = {
  columns: [
    { name: 'worker_id', type: IntakeColumnType.STRING, requiredNonEmpty: true },
    { name: 'base_pay', type: IntakeColumnType.NUMBER, requiredNonEmpty: true },
    { name: 'gender', type: IntakeColumnType.STRING, requiredNonEmpty: true },
  ],
};
