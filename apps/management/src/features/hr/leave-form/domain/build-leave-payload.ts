import type { PayloadChange } from '@/features/approval-pool/domain/types';
import type { LeaveType } from '@/features/hr/leaves/domain/types';

function formatRange(start: string, end: string): string {
  return start === end ? start : `${start} – ${end}`;
}

function leaveTypeLabel(type: LeaveType): string {
  return type;
}

export function buildCreateLeaveChanges(
  leaveType: LeaveType,
  start: string,
  end: string,
  workingDays: number,
): PayloadChange[] {
  return [
    { field: 'leaveType', label: 'İzin Türü', oldValue: '—', newValue: leaveTypeLabel(leaveType) },
    { field: 'dateRange', label: 'Tarih', oldValue: '—', newValue: formatRange(start, end) },
    { field: 'workingDays', label: 'İşgünü', oldValue: '—', newValue: String(workingDays) },
  ];
}

export function buildCancelLeaveChanges(
  leaveType: LeaveType,
  oldStart: string,
  oldEnd: string,
  newStart: string,
  newEnd: string,
  workingDays: number,
  full: boolean,
): PayloadChange[] {
  return [
    { field: 'leaveType', label: 'İzin Türü', oldValue: leaveTypeLabel(leaveType), newValue: leaveTypeLabel(leaveType) },
    {
      field: 'dateRange',
      label: 'Tarih',
      oldValue: formatRange(oldStart, oldEnd),
      newValue: full ? 'Tam iptal' : formatRange(newStart, newEnd),
    },
    {
      field: 'workingDays',
      label: 'İşgünü',
      oldValue: '—',
      newValue: String(workingDays),
    },
  ];
}
